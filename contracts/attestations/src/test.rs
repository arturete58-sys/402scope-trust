extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    BytesN, Env,
};

fn setup() -> (Env, AttestationsClient<'static>, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_sequence_number(1_000);
    let admin = Address::generate(&env);
    let signer = Address::generate(&env);
    let id = env.register(Attestations, (&admin, &signer));
    let client = AttestationsClient::new(&env, &id);
    (env, client, admin, signer)
}

fn key(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

fn att(env: &Env, score: u32, measured_at: u64, expires_ledger: u32) -> Attestation {
    Attestation {
        score,
        calls: 20,
        delivered: 19,
        price_ok: true,
        p50_ms: 420,
        measured_at,
        expires_ledger,
        method: 1,
        report: BytesN::from_array(env, &[7; 32]),
    }
}

#[test]
fn stores_and_reads_an_attestation() {
    let (env, c, _, _) = setup();
    let a = att(&env, 92, 100, 2_000);
    c.attest(&key(&env, 1), &a);
    assert_eq!(c.get(&key(&env, 1)), Some(a));
    assert!(c.is_trusted(&key(&env, 1), &80));
    assert!(!c.is_trusted(&key(&env, 1), &95));
}

#[test]
fn unknown_key_is_not_trusted() {
    let (env, c, _, _) = setup();
    assert_eq!(c.get(&key(&env, 9)), None);
    assert!(!c.is_trusted(&key(&env, 9), &0));
}

#[test]
fn expired_attestation_is_not_trusted() {
    let (env, c, _, _) = setup();
    c.attest(&key(&env, 1), &att(&env, 99, 100, 1_500));
    env.ledger().set_sequence_number(1_500);
    assert!(!c.is_trusted(&key(&env, 1), &0));
    // Still readable, so callers can tell "expired" from "never measured".
    assert!(c.get(&key(&env, 1)).is_some());
}

#[test]
fn rejects_invalid_and_expired_input() {
    let (env, c, _, _) = setup();
    assert_eq!(
        c.try_attest(&key(&env, 1), &att(&env, 101, 100, 2_000)),
        Err(Ok(Error::InvalidAttestation))
    );
    let mut bad = att(&env, 50, 100, 2_000);
    bad.delivered = 21;
    assert_eq!(
        c.try_attest(&key(&env, 1), &bad),
        Err(Ok(Error::InvalidAttestation))
    );
    assert_eq!(
        c.try_attest(&key(&env, 1), &att(&env, 50, 100, 1_000)),
        Err(Ok(Error::AlreadyExpired))
    );
}

#[test]
fn rejects_older_measurement() {
    let (env, c, _, _) = setup();
    c.attest(&key(&env, 1), &att(&env, 80, 200, 2_000));
    assert_eq!(
        c.try_attest(&key(&env, 1), &att(&env, 99, 199, 2_000)),
        Err(Ok(Error::Stale))
    );
    c.attest(&key(&env, 1), &att(&env, 60, 300, 2_000));
    assert_eq!(c.get(&key(&env, 1)).unwrap().score, 60);
}

#[test]
fn attest_requires_the_signer() {
    let (env, c, _, signer) = setup();
    c.attest(&key(&env, 1), &att(&env, 90, 100, 2_000));
    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, signer);
}

#[test]
#[should_panic]
fn attest_fails_without_signer_auth() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let signer = Address::generate(&env);
    let id = env.register(Attestations, (&admin, &signer));
    let c = AttestationsClient::new(&env, &id);
    c.attest(&key(&env, 1), &att(&env, 90, 100, 2_000));
}

#[test]
fn admin_revokes_and_rotates_signer() {
    let (env, c, admin, _) = setup();
    c.attest(&key(&env, 1), &att(&env, 90, 100, 2_000));
    c.revoke(&key(&env, 1));
    assert_eq!(env.auths()[0].0, admin);
    assert_eq!(c.get(&key(&env, 1)), None);
    assert_eq!(c.try_revoke(&key(&env, 1)), Err(Ok(Error::NotFound)));

    let new_signer = Address::generate(&env);
    c.set_signer(&new_signer);
    assert_eq!(c.signer(), new_signer);
    c.attest(&key(&env, 2), &att(&env, 70, 100, 2_000));
    assert_eq!(env.auths()[0].0, new_signer);
}

#[test]
fn anyone_can_extend_an_attestation() {
    let (env, c, _, _) = setup();
    assert_eq!(c.try_extend(&key(&env, 1)), Err(Ok(Error::NotFound)));
    c.attest(&key(&env, 1), &att(&env, 90, 100, 2_000));
    c.extend(&key(&env, 1));
}
