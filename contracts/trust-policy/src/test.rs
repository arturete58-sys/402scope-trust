//! End-to-end tests with a real OpenZeppelin smart account: an ed25519
//! signer signs the authorization for a token transfer exactly as a wallet
//! does for an x402 payment, and the trust policy decides inside
//! `__check_auth`.
extern crate std;

use super::*;
use ed25519_dalek::{Signer as Ed25519Signer, SigningKey};
use scope_attestations::{Attestations, AttestationsClient, SellerAttestation};
use soroban_sdk::{
    auth::CustomAccountInterface,
    contract, contractimpl,
    crypto::Hash,
    map,
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec,
    xdr::{
        Hash as XdrHash, HashIdPreimage, HashIdPreimageSorobanAuthorization, InvokeContractArgs, Limits, ScVal,
        SorobanAddressCredentials, SorobanAuthorizationEntry, SorobanAuthorizedFunction, SorobanAuthorizedInvocation,
        SorobanCredentials, VecM, WriteXdr,
    },
    Bytes, BytesN, IntoVal, Map, String,
};
use stellar_accounts::{
    smart_account::{add_context_rule, do_check_auth, AuthDigestPreimage, AuthPayload, ContextRuleType, SmartAccountError},
    verifiers::{ed25519, Verifier},
};

/// Each authorization needs a fresh nonce, or a reused one would fail for the wrong reason.
static NONCE: std::sync::atomic::AtomicI64 = std::sync::atomic::AtomicI64::new(1);
const AUTH_EXPIRES: u32 = 500;
const SECRET_KEY: [u8; 32] = [
    157, 97, 177, 157, 239, 253, 90, 96, 186, 132, 74, 244, 146, 236, 44, 196, 68, 73, 197, 105, 123, 50, 105, 25,
    112, 59, 172, 3, 28, 174, 127, 96,
];
const MIN_BOND: i128 = 1_000;

#[contract]
struct AgentWallet;

#[contractimpl]
impl CustomAccountInterface for AgentWallet {
    type Error = SmartAccountError;
    type Signature = AuthPayload;

    fn __check_auth(e: Env, signature_payload: Hash<32>, signatures: AuthPayload, auth_contexts: Vec<Context>) -> Result<(), Self::Error> {
        do_check_auth(&e, &signature_payload, &signatures, &auth_contexts)
    }
}

#[contract]
struct Ed25519Verifier;

#[contractimpl]
impl Verifier for Ed25519Verifier {
    type KeyData = BytesN<32>;
    type SigData = BytesN<64>;

    fn verify(e: &Env, hash: Bytes, key_data: BytesN<32>, sig_data: BytesN<64>) -> bool {
        ed25519::verify(e, &hash, &key_data, &sig_data)
    }

    fn canonicalize_key(e: &Env, key_data: BytesN<32>) -> Bytes {
        ed25519::canonicalize_key(e, &key_data)
    }

    fn batch_canonicalize_key(e: &Env, key_data: Vec<BytesN<32>>) -> Vec<Bytes> {
        ed25519::batch_canonicalize_key(e, &key_data)
    }
}

struct World {
    e: Env,
    token: Address,
    registry: AttestationsClient<'static>,
    policy: TrustPolicyClient<'static>,
    a1: Address,
    a2: Address,
    good: Address,
    bad: Address,
    half: Address,
}

fn world() -> World {
    let e = Env::default();
    e.ledger().set_sequence_number(10);
    e.mock_all_auths();
    let token = e.register_stellar_asset_contract_v2(Address::generate(&e)).address();
    let admin = Address::generate(&e);
    let registry = AttestationsClient::new(&e, &e.register(Attestations, (&admin, &token, &MIN_BOND, &100u32)));
    let attester = |e: &Env| {
        let a = Address::generate(e);
        StellarAssetClient::new(e, &token).mint(&a, &MIN_BOND);
        registry.register(&a, &MIN_BOND);
        a
    };
    let (a1, a2) = (attester(&e), attester(&e));
    let (good, bad, half) = (Address::generate(&e), Address::generate(&e), Address::generate(&e));
    let att = |score: u32| SellerAttestation {
        score,
        endpoints: 1,
        calls: 10,
        delivered: score / 10,
        receipts: score / 10,
        measured_at: 1,
        expires_ledger: 10_000,
        method: 2,
        evidence: BytesN::from_array(&e, &[1; 32]),
    };
    registry.attest_seller(&a1, &good, &att(95));
    registry.attest_seller(&a2, &good, &att(90));
    registry.attest_seller(&a1, &bad, &att(30));
    registry.attest_seller(&a2, &bad, &att(20));
    // Trusted by one attester only.
    registry.attest_seller(&a1, &half, &att(88));
    registry.attest_seller(&a2, &half, &att(45));
    let policy = TrustPolicyClient::new(&e, &e.register(TrustPolicy, ()));
    World { e, token, registry, policy, a1, a2, good, bad, half }
}

fn params(w: &World, quorum: u32, max_unverified: i128) -> TrustPolicyParams {
    TrustPolicyParams { registry: w.registry.address.clone(), attesters: vec![&w.e, w.a1.clone(), w.a2.clone()], min_score: 80, quorum, max_unverified }
}

/// Deploys an agent wallet with one ed25519 signer and the trust policy, funded with 1,000 tokens.
fn wallet(w: &World, p: TrustPolicyParams) -> (Address, Signer, SigningKey, u32) {
    let e = &w.e;
    let account = e.register(AgentWallet, ());
    let key = SigningKey::from_bytes(&SECRET_KEY);
    let signer = Signer::External(e.register(Ed25519Verifier, ()), Bytes::from_array(e, key.verifying_key().as_bytes()));
    let policies: Map<Address, Val> = map![e, (w.policy.address.clone(), p.into_val(e))];
    let rule_id = e.as_contract(&account, || {
        add_context_rule(e, &ContextRuleType::Default, &String::from_str(e, "agent payments"), None, &vec![e, signer.clone()], &policies).id
    });
    StellarAssetClient::new(e, &w.token).mint(&account, &1_000);
    (account, signer, key, rule_id)
}

fn to_scval<T: IntoVal<Env, Val>>(e: &Env, v: T) -> ScVal {
    ScVal::try_from_val(e, &v.into_val(e)).unwrap()
}

/// Signs the authorization for `token.transfer(account, to, amount)` the way a wallet does, then submits it.
fn pay(w: &World, account: &Address, signer: &Signer, key: Option<&SigningKey>, rule_id: u32, to: &Address, amount: i128) -> bool {
    let e = &w.e;
    let nonce = NONCE.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
    let invocation = SorobanAuthorizedInvocation {
        function: SorobanAuthorizedFunction::ContractFn(InvokeContractArgs {
            contract_address: w.token.clone().into(),
            function_name: "transfer".try_into().unwrap(),
            args: std::vec![to_scval(e, account.clone()), to_scval(e, to.clone()), to_scval(e, amount)].try_into().unwrap(),
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
    let digest = AuthDigestPreimage { account: account.clone(), signature_payload: payload, context_rule_ids: vec![e, rule_id] }.digest(e);
    let signers = match key {
        Some(k) => map![e, (signer.clone(), Bytes::from_array(e, &k.sign(&digest.to_array()).to_bytes()))],
        None => Map::new(e),
    };
    let auth = AuthPayload { signers, context_rule_ids: vec![e, rule_id] };
    e.set_auths(&[SorobanAuthorizationEntry {
        credentials: SorobanCredentials::Address(SorobanAddressCredentials {
            address: account.into(),
            nonce,
            signature_expiration_ledger: AUTH_EXPIRES,
            signature: to_scval(e, auth),
        }),
        root_invocation: invocation,
    }]);
    let ok = TokenClient::new(e, &w.token).try_transfer(account, to, &amount).is_ok();
    e.mock_all_auths();
    ok
}

fn balance(w: &World, a: &Address) -> i128 {
    TokenClient::new(&w.e, &w.token).balance(a)
}

#[test]
fn wallet_pays_a_seller_trusted_by_the_quorum() {
    let w = world();
    let (acct, signer, key, rule) = wallet(&w, params(&w, 2, 0));
    assert!(pay(&w, &acct, &signer, Some(&key), rule, &w.good, 100));
    assert_eq!(balance(&w, &w.good), 100);
}

#[test]
fn wallet_refuses_a_seller_with_low_scores() {
    let w = world();
    let (acct, signer, key, rule) = wallet(&w, params(&w, 2, 0));
    assert!(!pay(&w, &acct, &signer, Some(&key), rule, &w.bad, 100));
    assert_eq!(balance(&w, &w.bad), 0);
    assert_eq!(balance(&w, &acct), 1_000);
}

#[test]
fn quorum_decides_when_attesters_disagree() {
    let w = world();
    let (strict, signer, key, rule) = wallet(&w, params(&w, 2, 0));
    assert!(!pay(&w, &strict, &signer, Some(&key), rule, &w.half, 100));
    let (lenient, signer, key, rule) = wallet(&w, params(&w, 1, 0));
    assert!(pay(&w, &lenient, &signer, Some(&key), rule, &w.half, 100));
}

#[test]
fn unattested_sellers_only_get_small_payments_if_allowed() {
    let w = world();
    let stranger = Address::generate(&w.e);
    let (acct, signer, key, rule) = wallet(&w, params(&w, 2, 50));
    assert!(!pay(&w, &acct, &signer, Some(&key), rule, &stranger, 51));
    assert!(pay(&w, &acct, &signer, Some(&key), rule, &stranger, 50));
    assert!(pay(&w, &acct, &signer, Some(&key), rule, &stranger, 50));
    assert_eq!(balance(&w, &stranger), 100);
    let (closed, signer, key, rule) = wallet(&w, params(&w, 2, 0));
    assert!(!pay(&w, &closed, &signer, Some(&key), rule, &stranger, 1));
}

#[test]
fn a_bad_signature_is_still_rejected() {
    let w = world();
    let (acct, signer, _key, rule) = wallet(&w, params(&w, 2, 0));
    let wrong = SigningKey::from_bytes(&[3u8; 32]);
    assert!(!pay(&w, &acct, &signer, Some(&wrong), rule, &w.good, 100));
    // And with no signature at all the policy refuses (rules with policies defer signer checks to them).
    assert!(!pay(&w, &acct, &signer, None, rule, &w.good, 100));
}

#[test]
fn slashed_attesters_stop_counting_at_payment_time() {
    let w = world();
    let (acct, signer, key, rule) = wallet(&w, params(&w, 2, 0));
    w.registry.slash(&w.a2, &1, &Address::generate(&w.e));
    assert!(!pay(&w, &acct, &signer, Some(&key), rule, &w.good, 100));
}

#[test]
fn would_allow_previews_the_decision() {
    let w = world();
    let (acct, _, _, rule) = wallet(&w, params(&w, 2, 10));
    assert!(w.policy.would_allow(&acct, &rule, &w.good, &500));
    assert!(!w.policy.would_allow(&acct, &rule, &w.bad, &500));
    assert!(w.policy.would_allow(&acct, &rule, &w.bad, &10));
    assert!(!w.policy.would_allow(&Address::generate(&w.e), &rule, &w.good, &1));
    assert_eq!(w.policy.params(&acct, &rule).unwrap().quorum, 2);
}

#[test]
#[should_panic]
fn invalid_params_cannot_be_installed() {
    let w = world();
    let mut p = params(&w, 3, 0); // quorum larger than the attester list
    p.quorum = 3;
    wallet(&w, p);
}
