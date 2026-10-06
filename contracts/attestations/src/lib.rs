//! 402Scope Trust: attestation registry for x402 endpoints on Stellar.
//!
//! The 402Scope observatory measures x402 endpoints and writes one signed
//! attestation per endpoint here. Agents, facilitators and smart-account
//! policies read it before paying. An attestation is keyed by
//! `sha256(payTo | "|" | resource URL)` and expires at a ledger chosen by the
//! signer; an expired attestation is treated as unknown, never as good.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, BytesN, Env,
};

/// About one day of ledgers at ~5 seconds per ledger.
pub const DAY_IN_LEDGERS: u32 = 17_280;
/// Keep instance storage (admin, signer) alive for at least this long.
const INSTANCE_BUMP: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_THRESHOLD: u32 = INSTANCE_BUMP - DAY_IN_LEDGERS;
/// Keep an attestation entry stored this long after it expires, so that
/// late readers get "expired" instead of "never measured".
const GRACE_LEDGERS: u32 = 7 * DAY_IN_LEDGERS;
/// Scores are percentages.
pub const MAX_SCORE: u32 = 100;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Score above 100, or more delivered calls than calls made.
    InvalidAttestation = 1,
    /// `expires_ledger` is not in the future.
    AlreadyExpired = 2,
    /// No attestation stored for this key.
    NotFound = 3,
    /// The new attestation is older than the one stored.
    Stale = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation {
    /// Overall score, 0 to 100.
    pub score: u32,
    /// Paid calls made in the measurement window.
    pub calls: u32,
    /// Paid calls that returned what the endpoint declared.
    pub delivered: u32,
    /// Charged amount matched the declared amount on every call.
    pub price_ok: bool,
    /// Median latency of paid calls, in milliseconds.
    pub p50_ms: u32,
    /// Unix time (seconds) of the last measurement.
    pub measured_at: u64,
    /// Ledger after which the attestation must not be relied on.
    pub expires_ledger: u32,
    /// Version of the published scoring method.
    pub method: u32,
    /// sha256 of the full public report, served by the 402Scope API.
    pub report: BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Signer,
    Att(BytesN<32>),
}

#[contractevent(topics = ["scope", "attest"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attested {
    #[topic]
    pub key: BytesN<32>,
    pub score: u32,
    pub expires_ledger: u32,
}

#[contractevent(topics = ["scope", "revoke"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Revoked {
    #[topic]
    pub key: BytesN<32>,
}

#[contractevent(topics = ["scope", "signer"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SignerChanged {
    pub signer: Address,
}

#[contract]
pub struct Attestations;

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_BUMP);
}

fn admin(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Admin).unwrap()
}

fn signer(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Signer).unwrap()
}

/// Ledgers to keep an attestation stored: until it expires plus a grace
/// period, capped at the network maximum.
fn entry_ttl(env: &Env, expires_ledger: u32) -> u32 {
    let now = env.ledger().sequence();
    let wanted = expires_ledger.saturating_sub(now).saturating_add(GRACE_LEDGERS);
    wanted.min(env.storage().max_ttl())
}

#[contractimpl]
impl Attestations {
    /// `admin` can rotate the signer and revoke; `signer` writes attestations.
    pub fn __constructor(env: Env, admin: Address, signer: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Signer, &signer);
        bump_instance(&env);
    }

    /// Store or replace the attestation for `key`. Signer only.
    pub fn attest(env: Env, key: BytesN<32>, att: Attestation) -> Result<(), Error> {
        signer(&env).require_auth();
        if att.score > MAX_SCORE || att.delivered > att.calls {
            return Err(Error::InvalidAttestation);
        }
        if att.expires_ledger <= env.ledger().sequence() {
            return Err(Error::AlreadyExpired);
        }
        let k = DataKey::Att(key.clone());
        let store = env.storage().persistent();
        if let Some(old) = store.get::<_, Attestation>(&k) {
            if att.measured_at < old.measured_at {
                return Err(Error::Stale);
            }
        }
        store.set(&k, &att);
        let ttl = entry_ttl(&env, att.expires_ledger);
        store.extend_ttl(&k, ttl, ttl);
        bump_instance(&env);
        Attested {
            key,
            score: att.score,
            expires_ledger: att.expires_ledger,
        }
        .publish(&env);
        Ok(())
    }

    /// The stored attestation, expired or not. Use `is_trusted` to decide.
    pub fn get(env: Env, key: BytesN<32>) -> Option<Attestation> {
        env.storage().persistent().get(&DataKey::Att(key))
    }

    /// True only if a current (unexpired) attestation exists with
    /// `score >= min_score`. Missing or expired means false.
    pub fn is_trusted(env: Env, key: BytesN<32>, min_score: u32) -> bool {
        match env
            .storage()
            .persistent()
            .get::<_, Attestation>(&DataKey::Att(key))
        {
            Some(a) => a.expires_ledger > env.ledger().sequence() && a.score >= min_score,
            None => false,
        }
    }

    /// Remove an attestation, e.g. after a measurement error. Admin only.
    pub fn revoke(env: Env, key: BytesN<32>) -> Result<(), Error> {
        admin(&env).require_auth();
        let k = DataKey::Att(key.clone());
        if !env.storage().persistent().has(&k) {
            return Err(Error::NotFound);
        }
        env.storage().persistent().remove(&k);
        Revoked { key }.publish(&env);
        Ok(())
    }

    /// Rotate the signing key. Admin only.
    pub fn set_signer(env: Env, new_signer: Address) {
        admin(&env).require_auth();
        env.storage().instance().set(&DataKey::Signer, &new_signer);
        bump_instance(&env);
        SignerChanged { signer: new_signer }.publish(&env);
    }

    /// Hand over administration. Admin only.
    pub fn set_admin(env: Env, new_admin: Address) {
        admin(&env).require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        bump_instance(&env);
    }

    /// Anyone may pay rent to keep an attestation readable until it expires.
    pub fn extend(env: Env, key: BytesN<32>) -> Result<(), Error> {
        let k = DataKey::Att(key);
        let store = env.storage().persistent();
        let att: Attestation = store.get(&k).ok_or(Error::NotFound)?;
        let ttl = entry_ttl(&env, att.expires_ledger);
        store.extend_ttl(&k, ttl, ttl);
        bump_instance(&env);
        Ok(())
    }

    pub fn admin(env: Env) -> Address {
        admin(&env)
    }

    pub fn signer(env: Env) -> Address {
        signer(&env)
    }
}

#[cfg(test)]
mod test;
