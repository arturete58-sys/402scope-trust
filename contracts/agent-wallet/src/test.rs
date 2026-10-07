extern crate std;
use super::*;
use ed25519_dalek::{Signer as Ed25519Signer, SigningKey};
use scope_attestations::{Attestations, AttestationsClient, SellerAttestation};
use scope_ed25519_verifier::Ed25519Verifier;
use scope_spending_limit::{SpendingLimitParams, SpendingLimitPolicy, SpendingLimitPolicyClient};
use scope_trust_policy::{TrustPolicy, TrustPolicyParams};
use soroban_sdk::{
    map,
    testutils::{Address as _, Events as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec,
    xdr::{
        Hash as XdrHash, HashIdPreimage, HashIdPreimageSorobanAuthorization, InvokeContractArgs, Limits, ScVal,
        SorobanAddressCredentials, SorobanAuthorizationEntry, SorobanAuthorizedFunction, SorobanAuthorizedInvocation,
        SorobanCredentials, ToXdr, VecM, WriteXdr,
    },
    Bytes, IntoVal, TryFromVal,
};
use p256::{
    ecdsa::{signature::hazmat::PrehashSigner, Signature as P256Signature, SigningKey as P256SigningKey},
    elliptic_curve::sec1::ToEncodedPoint,
    SecretKey as P256Key,
};
use scope_webauthn_verifier::WebAuthnVerifier;
use stellar_accounts::smart_account::AuthDigestPreimage;
use stellar_accounts::verifiers::{
    utils::base64_url_encode,
    webauthn::{WebAuthnSigData, AUTH_DATA_FLAGS_UP, AUTH_DATA_FLAGS_UV},
};

/// Cross-language test vector: the TypeScript signer (src/smart-account.ts)
/// must produce the same digest for the same inputs.
#[test]
fn auth_digest_test_vector() {
    let e = Env::default();
    let account = Address::from_str(&e, "CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K");
    let pre = AuthDigestPreimage { account, signature_payload: BytesN::from_array(&e, &[7u8; 32]), context_rule_ids: vec![&e, 0u32] };
    let _xdr = pre.clone().to_xdr(&e);
    let d = pre.digest(&e);
    let mut dh = std::string::String::new();
    for b in d.to_array().iter() {
        dh.push_str(&std::format!("{:02x}", b));
    }
    assert_eq!(dh, "6a9ce79520683bcdd0967da374e1b206090ca458c1fb4a0e2bf737ca2cf74118");
}

// ---- Trust policy + spending limit on one payment rule ------------------

static NONCE: std::sync::atomic::AtomicI64 = std::sync::atomic::AtomicI64::new(1);
const AUTH_EXPIRES: u32 = 100_000;
const MIN_BOND: i128 = 1_000;
const LIMIT: i128 = 250;
const PERIOD: u32 = 1_000;

struct World {
    e: Env,
    token: Address,
    other_token: Address,
    good: Address,
    bad: Address,
    wallet: Address,
    signer: Signer,
    key: SigningKey,
    owner: Signer,
    passkey: P256Key,
    limit: SpendingLimitPolicyClient<'static>,
}

fn world() -> World {
    let e = Env::default();
    e.ledger().set_sequence_number(10);
    e.mock_all_auths();
    let token = e.register_stellar_asset_contract_v2(Address::generate(&e)).address();
    let other_token = e.register_stellar_asset_contract_v2(Address::generate(&e)).address();
    let admin = Address::generate(&e);
    let registry = AttestationsClient::new(&e, &e.register(Attestations, (&admin, &token, &MIN_BOND, &100u32)));
    let attester = |e: &Env| {
        let a = Address::generate(e);
        StellarAssetClient::new(e, &token).mint(&a, &MIN_BOND);
        registry.register(&a, &MIN_BOND);
        a
    };
    let (a1, a2) = (attester(&e), attester(&e));
    let (good, bad) = (Address::generate(&e), Address::generate(&e));
    let att = |score: u32| SellerAttestation {
        score,
        endpoints: 1,
        calls: 10,
        delivered: score / 10,
        receipts: score / 10,
        measured_at: 1,
        expires_ledger: 100_000,
        method: 3,
        evidence: BytesN::from_array(&e, &[1; 32]),
    };
    for a in [&a1, &a2] {
        registry.attest_seller(a, &good, &att(95));
        registry.attest_seller(a, &bad, &att(20));
    }

    let trust = e.register(TrustPolicy, ());
    let limit = SpendingLimitPolicyClient::new(&e, &e.register(SpendingLimitPolicy, ()));
    let key = SigningKey::from_bytes(&[42u8; 32]);
    let signer = Signer::External(e.register(Ed25519Verifier, ()), Bytes::from_array(&e, key.verifying_key().as_bytes()));
    let trust_params = TrustPolicyParams { registry: registry.address.clone(), attesters: vec![&e, a1, a2], min_score: 80, quorum: 2, max_unverified: 0 };
    let limit_params = SpendingLimitParams { spending_limit: LIMIT, period_ledgers: PERIOD };
    let policies: Map<Address, Val> = map![&e, (trust, trust_params.into_val(&e)), (limit.address.clone(), limit_params.into_val(&e))];
    // The owner holds a passkey (secp256r1, WebAuthn); its rule manages the wallet.
    let passkey = P256Key::from_slice(&[7u8; 32]).unwrap();
    let mut key_data = Bytes::from_slice(&e, &passkey.public_key().to_encoded_point(false).as_bytes());
    key_data.extend_from_array(&[9u8; 16]); // credential id
    let owner = Signer::External(e.register(WebAuthnVerifier, ()), key_data);
    let wallet = e.register(AgentWallet, (vec![&e, signer.clone()], policies, Some(token.clone()), vec![&e, owner.clone()]));
    StellarAssetClient::new(&e, &token).mint(&wallet, &1_000);
    StellarAssetClient::new(&e, &other_token).mint(&wallet, &1_000);
    World { e, token, other_token, good, bad, wallet, signer, key, owner, passkey, limit }
}

fn to_scval<T: IntoVal<Env, Val>>(e: &Env, v: T) -> ScVal {
    ScVal::try_from_val(e, &v.into_val(e)).unwrap()
}

#[derive(Clone, Copy)]
enum Who {
    Agent,
    Owner,
}

/// What a passkey returns for a WebAuthn assertion over `digest`: the client
/// data carries the digest as its challenge, and the device signs
/// sha256(authenticator data || sha256(client data)) with its P-256 key.
fn passkey_sign(w: &World, digest: &[u8; 32]) -> Bytes {
    let e = &w.e;
    let mut challenge = [0u8; 43];
    base64_url_encode(&mut challenge, digest);
    let client_data = std::format!(
        r#"{{"type":"webauthn.get","challenge":"{}","origin":"https://402scope.org","crossOrigin":false}}"#,
        std::str::from_utf8(&challenge).unwrap()
    );
    let client_data = Bytes::from_slice(e, client_data.as_bytes());
    let mut auth_data = [0u8; 37];
    auth_data[32] = AUTH_DATA_FLAGS_UP | AUTH_DATA_FLAGS_UV;
    let authenticator_data = Bytes::from_array(e, &auth_data);
    let mut msg = authenticator_data.clone();
    msg.extend_from_array(&e.crypto().sha256(&client_data).to_array());
    let hash = e.crypto().sha256(&msg).to_array();
    let sig: P256Signature = P256SigningKey::from(&w.passkey).sign_prehash(&hash).unwrap();
    let sig = sig.normalize_s().unwrap_or(sig).to_bytes();
    let mut raw = [0u8; 64];
    raw.copy_from_slice(&sig);
    WebAuthnSigData { authenticator_data, client_data, signature: BytesN::from_array(e, &raw) }.to_xdr(e)
}

/// Sets the wallet's authorization for `contract.function(args)`, signed by
/// the agent key or the owner's passkey, claiming context rule `rule_id`.
fn authorize(w: &World, contract: &Address, function: &str, args: std::vec::Vec<ScVal>, rule_id: u32, who: Who) {
    let e = &w.e;
    let nonce = NONCE.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
    let invocation = SorobanAuthorizedInvocation {
        function: SorobanAuthorizedFunction::ContractFn(InvokeContractArgs {
            contract_address: contract.clone().into(),
            function_name: function.try_into().unwrap(),
            args: args.try_into().unwrap(),
        }),
        sub_invocations: VecM::default(),
    };
    let preimage = HashIdPreimage::SorobanAuthorization(HashIdPreimageSorobanAuthorization {
        network_id: XdrHash(e.ledger().get().network_id),
        nonce,
        signature_expiration_ledger: AUTH_EXPIRES,
        invocation: invocation.clone(),
    });
    let payload: BytesN<32> = e.crypto().sha256(&Bytes::from_slice(e, &preimage.to_xdr(Limits::none()).unwrap())).to_bytes();
    let digest = AuthDigestPreimage { account: w.wallet.clone(), signature_payload: payload, context_rule_ids: vec![e, rule_id] }.digest(e).to_array();
    let (signer, sig) = match who {
        Who::Agent => (w.signer.clone(), Bytes::from_array(e, &w.key.sign(&digest).to_bytes())),
        Who::Owner => (w.owner.clone(), passkey_sign(w, &digest)),
    };
    let auth = AuthPayload { signers: map![e, (signer, sig)], context_rule_ids: vec![e, rule_id] };
    e.set_auths(&[SorobanAuthorizationEntry {
        credentials: SorobanCredentials::Address(SorobanAddressCredentials {
            address: w.wallet.clone().into(),
            nonce,
            signature_expiration_ledger: AUTH_EXPIRES,
            signature: to_scval(e, auth),
        }),
        root_invocation: invocation,
    }]);
}

/// Signs `token.transfer(wallet, to, amount)` with the agent key for rule 0, as a wallet does for an x402 payment.
fn pay(w: &World, token: &Address, to: &Address, amount: i128) -> bool {
    let e = &w.e;
    authorize(w, token, "transfer", std::vec![to_scval(e, w.wallet.clone()), to_scval(e, to.clone()), to_scval(e, amount)], 0, Who::Agent);
    let ok = TokenClient::new(e, token).try_transfer(&w.wallet, to, &amount).is_ok();
    e.mock_all_auths();
    ok
}

/// Asks the spending limit policy to set a new limit, authorized as `who` under `rule_id`.
fn set_limit(w: &World, limit: i128, rule_id: u32, who: Who) -> bool {
    let e = &w.e;
    authorize(w, &w.limit.address, "set_spending_limit", std::vec![to_scval(e, w.wallet.clone()), to_scval(e, 0u32), to_scval(e, limit)], rule_id, who);
    let ok = w.limit.try_set_spending_limit(&w.wallet, &0, &limit).is_ok();
    e.mock_all_auths();
    ok
}

#[test]
fn the_owner_raises_the_budget_with_a_passkey_the_agent_cannot() {
    let w = world();
    assert!(pay(&w, &w.token, &w.good, 250));
    assert!(!pay(&w, &w.token, &w.good, 100));
    // The agent key cannot change its own limit: its rule covers the token only,
    // and it is not a signer of the owner's rule.
    assert!(!set_limit(&w, 1_000, 0, Who::Agent));
    assert!(!set_limit(&w, 1_000, 1, Who::Agent));
    // The owner's passkey can.
    assert!(set_limit(&w, 1_000, 1, Who::Owner));
    assert_eq!(w.limit.window(&w.wallet, &0).unwrap().spending_limit, 1_000);
    assert!(pay(&w, &w.token, &w.good, 100));
}

#[test]
fn a_forged_passkey_signature_is_rejected() {
    let w = world();
    let other = World { passkey: P256Key::from_slice(&[8u8; 32]).unwrap(), ..w };
    assert!(!set_limit(&other, 1_000, 1, Who::Owner));
}

#[test]
fn pays_trusted_sellers_up_to_the_limit_then_refuses() {
    let w = world();
    assert!(pay(&w, &w.token, &w.good, 100));
    assert!(pay(&w, &w.token, &w.good, 100));
    // 200 spent; 100 more would exceed 250 in the window.
    assert!(!pay(&w, &w.token, &w.good, 100));
    assert!(pay(&w, &w.token, &w.good, 50));
    assert_eq!(TokenClient::new(&w.e, &w.token).balance(&w.good), 250);
    let window = w.limit.window(&w.wallet, &0).unwrap();
    assert_eq!(window.spent, 250);
    assert_eq!(window.remaining, 0);
    assert_eq!(w.limit.remaining(&w.wallet, &0), 0);
}

#[test]
fn the_window_rolls() {
    let w = world();
    assert!(pay(&w, &w.token, &w.good, 250));
    assert!(!pay(&w, &w.token, &w.good, 1));
    // Half a period later: still in the window.
    w.e.ledger().set_sequence_number(10 + PERIOD / 2);
    assert!(!pay(&w, &w.token, &w.good, 1));
    // One period plus at most one bucket (period / 24) later: out of it.
    w.e.ledger().set_sequence_number(10 + PERIOD + PERIOD.div_ceil(24) + 1);
    assert!(pay(&w, &w.token, &w.good, 250));
    assert_eq!(w.limit.remaining(&w.wallet, &0), 0);
}

/// The x402 facilitator for Stellar accepts a payment only if its simulation
/// emits exactly one event, the token transfer. Neither policy may emit one.
#[test]
fn a_payment_emits_only_the_transfer_event() {
    let w = world();
    assert!(pay(&w, &w.token, &w.good, 100));
    let events = w.e.events().all();
    let std_events = events.events();
    assert_eq!(std_events.len(), 1, "events: {:?}", std_events);
    let ev = &std_events[0];
    let expected: soroban_sdk::xdr::ScAddress = (&w.token).try_into().unwrap();
    match expected {
        soroban_sdk::xdr::ScAddress::Contract(id) => assert_eq!(ev.contract_id.as_ref(), Some(&id)),
        _ => panic!("token is a contract"),
    }
}

#[test]
fn untrusted_sellers_are_refused_even_within_the_limit() {
    let w = world();
    assert!(!pay(&w, &w.token, &w.bad, 10));
    assert_eq!(TokenClient::new(&w.e, &w.token).balance(&w.bad), 0);
    // A refused payment does not use up the budget.
    assert!(pay(&w, &w.token, &w.good, 250));
}

#[test]
fn the_agent_key_cannot_move_other_tokens() {
    let w = world();
    // Rule 0 covers the payment token only; any other contract call fails.
    assert!(!pay(&w, &w.other_token, &w.good, 1));
    assert_eq!(TokenClient::new(&w.e, &w.other_token).balance(&w.wallet), 1_000);
}

#[test]
fn rules_have_the_expected_shape() {
    let w = world();
    let client = AgentWalletClient::new(&w.e, &w.wallet);
    let r0 = client.get_context_rule(&0);
    assert_eq!(r0.context_type, ContextRuleType::CallContract(w.token.clone()));
    assert_eq!(r0.policies.len(), 2);
    let r1 = client.get_context_rule(&1);
    assert_eq!(r1.context_type, ContextRuleType::Default);
    assert_eq!(r1.policies.len(), 0);

    // Without a token: the single Default rule, as before.
    let e = &w.e;
    let plain = e.register(AgentWallet, (vec![e, w.signer.clone()], Map::<Address, Val>::new(e), Option::<Address>::None, Vec::<Signer>::new(e)));
    let c = AgentWalletClient::new(e, &plain);
    assert_eq!(c.get_context_rule(&0).context_type, ContextRuleType::Default);
    assert_eq!(c.get_context_rules_count(), 1);
}

/// A payment only rewrites the spending window: it must not grow stored
/// state (rent on growth) or extend TTLs, so its fee stays flat.
#[test]
fn payments_pay_no_persistent_rent() {
    let w = world();
    assert!(pay(&w, &w.token, &w.good, 10)); // the first touches entries for the first time
    for _ in 0..5 {
        w.e.ledger().set_sequence_number(w.e.ledger().sequence() + 100);
        assert!(pay(&w, &w.token, &w.good, 10));
        let fee = w.e.cost_estimate().fee();
        assert_eq!(fee.persistent_entry_rent, 0, "{:?}", fee);
    }
}
