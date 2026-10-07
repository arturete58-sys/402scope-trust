extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec, Bytes, BytesN, Env,
};

const MIN_BOND: i128 = 1_000_0000000; // 1,000 tokens (7 decimals)
const UNBOND: u32 = 100;

struct T {
    env: Env,
    c: AttestationsClient<'static>,
    admin: Address,
    token: Address,
}

fn setup() -> T {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_sequence_number(1_000);
    let admin = Address::generate(&env);
    let token = env.register_stellar_asset_contract_v2(Address::generate(&env)).address();
    let id = env.register(Attestations, (&admin, &token, &MIN_BOND, &UNBOND));
    let c = AttestationsClient::new(&env, &id);
    T { env, c, admin, token }
}

fn funded_attester(t: &T, amount: i128) -> Address {
    let a = Address::generate(&t.env);
    StellarAssetClient::new(&t.env, &t.token).mint(&a, &amount);
    a
}

fn bonded(t: &T) -> Address {
    let a = funded_attester(t, MIN_BOND);
    t.c.register(&a, &MIN_BOND);
    a
}

fn key(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

fn seller_att(env: &Env, score: u32, measured_at: u64, expires_ledger: u32) -> SellerAttestation {
    SellerAttestation { score, endpoints: 2, calls: 10, delivered: 9, receipts: 9, measured_at, expires_ledger, method: 2, evidence: BytesN::from_array(env, &[7; 32]) }
}

fn endpoint_att(env: &Env, score: u32, expires_ledger: u32) -> Attestation {
    Attestation { score, calls: 5, delivered: 5, price_ok: true, p50_ms: 4000, measured_at: 100, expires_ledger, method: 2, evidence: BytesN::from_array(env, &[7; 32]) }
}

#[test]
fn register_moves_the_bond_into_the_contract() {
    let t = setup();
    let a = funded_attester(&t, MIN_BOND * 2);
    t.c.register(&a, &MIN_BOND);
    let tok = TokenClient::new(&t.env, &t.token);
    assert_eq!(tok.balance(&a), MIN_BOND);
    assert_eq!(tok.balance(&t.c.address), MIN_BOND);
    assert_eq!(t.c.attester(&a).unwrap(), AttesterInfo { bond: MIN_BOND, active: true, unbond_at: 0 });
}

#[test]
fn bond_below_minimum_is_rejected() {
    let t = setup();
    let a = funded_attester(&t, MIN_BOND);
    assert_eq!(t.c.try_register(&a, &(MIN_BOND - 1)), Err(Ok(Error::BondTooLow)));
    assert_eq!(t.c.try_register(&a, &0), Err(Ok(Error::InvalidAmount)));
}

#[test]
fn only_bonded_attesters_can_attest() {
    let t = setup();
    let stranger = Address::generate(&t.env);
    let seller = Address::generate(&t.env);
    assert_eq!(t.c.try_attest_seller(&stranger, &seller, &seller_att(&t.env, 90, 100, 2_000)), Err(Ok(Error::NotAttester)));
    let a = bonded(&t);
    t.c.attest_seller(&a, &seller, &seller_att(&t.env, 90, 100, 2_000));
    assert!(t.c.is_trusted_seller(&a, &seller, &80));
    assert!(!t.c.is_trusted_seller(&a, &seller, &95));
}

#[test]
fn endpoint_attestations_still_work() {
    let t = setup();
    let a = bonded(&t);
    t.c.attest(&a, &key(&t.env, 1), &endpoint_att(&t.env, 85, 2_000));
    assert!(t.c.is_trusted(&a, &key(&t.env, 1), &80));
    assert_eq!(t.c.get(&a, &key(&t.env, 1)).unwrap().score, 85);
    assert_eq!(t.c.try_attest(&a, &key(&t.env, 1), &endpoint_att(&t.env, 101, 2_000)), Err(Ok(Error::InvalidAttestation)));
    assert_eq!(t.c.try_attest(&a, &key(&t.env, 1), &endpoint_att(&t.env, 50, 1_000)), Err(Ok(Error::AlreadyExpired)));
}

#[test]
fn invalid_seller_attestations_are_rejected() {
    let t = setup();
    let a = bonded(&t);
    let s = Address::generate(&t.env);
    let mut bad = seller_att(&t.env, 90, 100, 2_000);
    bad.receipts = 11;
    assert_eq!(t.c.try_attest_seller(&a, &s, &bad), Err(Ok(Error::InvalidAttestation)));
    t.c.attest_seller(&a, &s, &seller_att(&t.env, 90, 200, 2_000));
    assert_eq!(t.c.try_attest_seller(&a, &s, &seller_att(&t.env, 95, 199, 2_000)), Err(Ok(Error::Stale)));
}

#[test]
fn quorum_of_chosen_attesters() {
    let t = setup();
    let (a1, a2, a3) = (bonded(&t), bonded(&t), bonded(&t));
    let seller = Address::generate(&t.env);
    t.c.attest_seller(&a1, &seller, &seller_att(&t.env, 92, 100, 2_000));
    t.c.attest_seller(&a2, &seller, &seller_att(&t.env, 85, 100, 2_000));
    t.c.attest_seller(&a3, &seller, &seller_att(&t.env, 40, 100, 2_000));
    let all = vec![&t.env, a1.clone(), a2.clone(), a3.clone()];
    assert_eq!(t.c.count_trusted(&seller, &all, &80), 2);
    assert!(t.c.trusted_by(&seller, &all, &80, &2));
    assert!(!t.c.trusted_by(&seller, &all, &80, &3));
    assert!(!t.c.trusted_by(&seller, &all, &80, &0));
    // An unknown seller is never trusted.
    assert!(!t.c.trusted_by(&Address::generate(&t.env), &all, &0, &1));
}

#[test]
fn expired_attestations_do_not_count() {
    let t = setup();
    let a = bonded(&t);
    let seller = Address::generate(&t.env);
    t.c.attest_seller(&a, &seller, &seller_att(&t.env, 99, 100, 1_500));
    t.env.ledger().set_sequence_number(1_500);
    assert!(!t.c.is_trusted_seller(&a, &seller, &0));
    assert!(t.c.get_seller(&a, &seller).is_some());
}

#[test]
fn slashing_pays_out_and_deactivates_below_minimum() {
    let t = setup();
    let a = bonded(&t);
    let seller = Address::generate(&t.env);
    let victim = Address::generate(&t.env);
    t.c.attest_seller(&a, &seller, &seller_att(&t.env, 99, 100, 2_000));
    t.c.slash(&a, &100, &victim);
    assert_eq!(t.env.auths()[0].0, t.admin);
    assert_eq!(TokenClient::new(&t.env, &t.token).balance(&victim), 100);
    let info = t.c.attester(&a).unwrap();
    assert_eq!(info.bond, MIN_BOND - 100);
    assert!(!info.active);
    // Its attestations stop counting until it tops up.
    assert!(!t.c.is_trusted_seller(&a, &seller, &0));
    assert_eq!(t.c.try_slash(&a, &MIN_BOND, &victim), Err(Ok(Error::InvalidAmount)));
}

#[test]
fn unbonding_waits_before_withdrawal_and_stays_slashable() {
    let t = setup();
    let a = bonded(&t);
    assert_eq!(t.c.try_withdraw(&a), Err(Ok(Error::StillBonded)));
    t.c.start_unbond(&a);
    assert_eq!(t.c.try_withdraw(&a), Err(Ok(Error::StillBonded)));
    t.c.slash(&a, &10, &t.admin);
    t.env.ledger().set_sequence_number(1_000 + UNBOND);
    assert_eq!(t.c.withdraw(&a), MIN_BOND - 10);
    assert_eq!(TokenClient::new(&t.env, &t.token).balance(&a), MIN_BOND - 10);
    assert_eq!(t.c.attester(&a), None);
}

fn h(env: &Env, a: &BytesN<32>, b: &BytesN<32>) -> BytesN<32> {
    let (x, y) = if a.to_array() <= b.to_array() { (a, b) } else { (b, a) };
    let mut buf = Bytes::from_array(env, &x.to_array());
    buf.append(&Bytes::from_array(env, &y.to_array()));
    env.crypto().sha256(&buf).to_bytes()
}

#[test]
fn evidence_proofs_are_checked_onchain() {
    let t = setup();
    let a = bonded(&t);
    let seller = Address::generate(&t.env);
    let leaves: std::vec::Vec<BytesN<32>> = (1u8..=4).map(|i| BytesN::from_array(&t.env, &[i; 32])).collect();
    let n01 = h(&t.env, &leaves[0], &leaves[1]);
    let n23 = h(&t.env, &leaves[2], &leaves[3]);
    let root = h(&t.env, &n01, &n23);
    // Same root as the TypeScript builder (src/evidence.ts) for leaves [1;32]..[4;32].
    let mut hex = std::string::String::new();
    for b in root.to_array().iter() { hex.push_str(&std::format!("{:02x}", b)); }
    assert_eq!(hex, "1d0cafe12ca55e5e8d0903a1847cffae908539b86fee1c52418b2cd453479e7c");
    let mut att = seller_att(&t.env, 90, 100, 2_000);
    att.evidence = root;
    t.c.attest_seller(&a, &seller, &att);
    // Leaf 2 with its proof [leaf 3, n01] is in the tree.
    assert!(t.c.verify_seller_evidence(&a, &seller, &leaves[2], &vec![&t.env, leaves[3].clone(), n01.clone()]));
    // A leaf that was not counted is not.
    let other = BytesN::from_array(&t.env, &[9; 32]);
    assert!(!t.c.verify_seller_evidence(&a, &seller, &other, &vec![&t.env, leaves[3].clone(), n01]));
}
