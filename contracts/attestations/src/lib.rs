//! 402Scope Trust: attestation registry for x402 sellers on Stellar (v2).
//!
//! Independent *attesters* measure x402 endpoints and publish signed scores
//! here. To attest, an attester locks a bond in a SEP-41 token; the admin
//! (an arbiter, intended to be a multisig) can slash it when an attestation
//! is shown to be false. Each attestation carries the Merkle root of its
//! evidence (settlement transactions and delivery receipts) so anyone can
//! check that a given piece of evidence was counted, onchain.
//!
//! Two kinds of attestation:
//! - per endpoint, keyed by `sha256(payTo | "|" | resource URL)`;
//! - per seller, keyed by the seller's payment address. This is what a
//!   smart-account policy can enforce at payment time, because a token
//!   `transfer` only reveals the destination address.
//!
//! Consumers choose which attesters they trust and how many must agree
//! (`trusted_by`), so no single attester is a point of failure.
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Bytes, BytesN, Env, Vec,
};

/// About one day of ledgers at ~5 seconds per ledger.
pub const DAY_IN_LEDGERS: u32 = 17_280;
const INSTANCE_BUMP: u32 = 30 * DAY_IN_LEDGERS;
const INSTANCE_THRESHOLD: u32 = INSTANCE_BUMP - DAY_IN_LEDGERS;
/// Keep an attestation stored this long after it expires, so late readers
/// get "expired" instead of "never measured".
const GRACE_LEDGERS: u32 = 7 * DAY_IN_LEDGERS;
pub const MAX_SCORE: u32 = 100;
/// Longest Merkle proof accepted (trees of up to 2^32 leaves).
const MAX_PROOF: u32 = 32;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Score above 100, more delivered calls or receipts than calls.
    InvalidAttestation = 1,
    /// `expires_ledger` is not in the future.
    AlreadyExpired = 2,
    NotFound = 3,
    /// The new attestation is older than the one stored.
    Stale = 4,
    /// Bond below the configured minimum.
    BondTooLow = 5,
    /// The attester is not registered or not active.
    NotAttester = 6,
    /// Unbonding has not started or the waiting period has not passed.
    StillBonded = 7,
    InvalidAmount = 8,
    ProofTooLong = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    /// SEP-41 token used for bonds (USDC on mainnet).
    pub bond_token: Address,
    pub min_bond: i128,
    /// Ledgers between `start_unbond` and `withdraw`, so a bad attestation
    /// can still be slashed after the attester leaves.
    pub unbond_ledgers: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AttesterInfo {
    pub bond: i128,
    pub active: bool,
    /// Ledger from which the bond can be withdrawn; 0 while bonded.
    pub unbond_at: u32,
}

/// Attestation for one endpoint (payTo + URL).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation {
    pub score: u32,
    pub calls: u32,
    pub delivered: u32,
    pub price_ok: bool,
    pub p50_ms: u32,
    pub measured_at: u64,
    pub expires_ledger: u32,
    pub method: u32,
    /// Merkle root of the evidence (see docs/evidence.md).
    pub evidence: BytesN<32>,
}

/// Attestation for a seller's payment address, across its endpoints.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SellerAttestation {
    pub score: u32,
    pub endpoints: u32,
    pub calls: u32,
    pub delivered: u32,
    /// Paid calls that came with a valid seller-signed delivery receipt.
    pub receipts: u32,
    pub measured_at: u64,
    pub expires_ledger: u32,
    pub method: u32,
    pub evidence: BytesN<32>,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Config,
    Attester(Address),
    Endpoint(Address, BytesN<32>),
    Seller(Address, Address),
}

#[contractevent(topics = ["scope", "registered"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Registered {
    #[topic]
    pub attester: Address,
    pub bond: i128,
}

#[contractevent(topics = ["scope", "unbonding"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Unbonding {
    #[topic]
    pub attester: Address,
    pub unbond_at: u32,
}

#[contractevent(topics = ["scope", "withdrawn"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Withdrawn {
    #[topic]
    pub attester: Address,
    pub amount: i128,
}

#[contractevent(topics = ["scope", "slashed"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Slashed {
    #[topic]
    pub attester: Address,
    pub amount: i128,
    pub to: Address,
}

#[contractevent(topics = ["scope", "attest"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attested {
    #[topic]
    pub attester: Address,
    #[topic]
    pub key: BytesN<32>,
    pub score: u32,
    pub expires_ledger: u32,
}

#[contractevent(topics = ["scope", "seller"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SellerAttested {
    #[topic]
    pub attester: Address,
    #[topic]
    pub seller: Address,
    pub score: u32,
    pub expires_ledger: u32,
}

#[contract]
pub struct Attestations;

fn bump_instance(e: &Env) {
    e.storage().instance().extend_ttl(INSTANCE_THRESHOLD, INSTANCE_BUMP);
}

fn admin(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap()
}

fn config(e: &Env) -> Config {
    e.storage().instance().get(&DataKey::Config).unwrap()
}

fn attester_info(e: &Env, a: &Address) -> Option<AttesterInfo> {
    e.storage().persistent().get(&DataKey::Attester(a.clone()))
}

fn save_attester(e: &Env, a: &Address, info: &AttesterInfo) {
    let k = DataKey::Attester(a.clone());
    e.storage().persistent().set(&k, info);
    let max = e.storage().max_ttl();
    e.storage().persistent().extend_ttl(&k, max, max);
}

/// An attester counts only while active and bonded at or above the minimum.
fn is_active(e: &Env, a: &Address) -> bool {
    match attester_info(e, a) {
        Some(i) => i.active && i.bond >= config(e).min_bond,
        None => false,
    }
}

fn require_active(e: &Env, a: &Address) -> Result<(), Error> {
    if is_active(e, a) {
        Ok(())
    } else {
        Err(Error::NotAttester)
    }
}

fn entry_ttl(e: &Env, expires_ledger: u32) -> u32 {
    let now = e.ledger().sequence();
    expires_ledger.saturating_sub(now).saturating_add(GRACE_LEDGERS).min(e.storage().max_ttl())
}

fn check_expiry(e: &Env, expires_ledger: u32) -> Result<(), Error> {
    if expires_ledger <= e.ledger().sequence() {
        Err(Error::AlreadyExpired)
    } else {
        Ok(())
    }
}

/// Root of a Merkle tree with sorted-pair SHA-256 hashing, from a leaf and
/// its proof (sibling hashes from the leaf up).
fn merkle_root(e: &Env, leaf: &BytesN<32>, proof: &Vec<BytesN<32>>) -> BytesN<32> {
    let mut node = leaf.clone();
    for sibling in proof.iter() {
        let (a, b) = if node.to_array() <= sibling.to_array() { (node, sibling) } else { (sibling, node) };
        let mut buf = Bytes::from_array(e, &a.to_array());
        buf.append(&Bytes::from_array(e, &b.to_array()));
        node = e.crypto().sha256(&buf).to_bytes();
    }
    node
}

#[contractimpl]
impl Attestations {
    pub fn __constructor(e: Env, admin: Address, bond_token: Address, min_bond: i128, unbond_ledgers: u32) {
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::Config, &Config { bond_token, min_bond, unbond_ledgers });
        bump_instance(&e);
    }

    // ---- Attesters ----------------------------------------------------

    /// Register as an attester, or add to an existing bond. Moves `amount`
    /// of the bond token from the attester into this contract.
    pub fn register(e: Env, attester: Address, amount: i128) -> Result<(), Error> {
        attester.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let cfg = config(&e);
        let mut info = attester_info(&e, &attester).unwrap_or(AttesterInfo { bond: 0, active: false, unbond_at: 0 });
        if info.bond + amount < cfg.min_bond {
            return Err(Error::BondTooLow);
        }
        token::Client::new(&e, &cfg.bond_token).transfer(&attester, &e.current_contract_address(), &amount);
        info.bond += amount;
        info.active = true;
        info.unbond_at = 0;
        save_attester(&e, &attester, &info);
        bump_instance(&e);
        Registered { attester, bond: info.bond }.publish(&e);
        Ok(())
    }

    /// Stop attesting. The bond stays slashable for `unbond_ledgers`.
    pub fn start_unbond(e: Env, attester: Address) -> Result<(), Error> {
        attester.require_auth();
        let mut info = attester_info(&e, &attester).ok_or(Error::NotAttester)?;
        info.active = false;
        info.unbond_at = e.ledger().sequence() + config(&e).unbond_ledgers;
        save_attester(&e, &attester, &info);
        Unbonding { attester, unbond_at: info.unbond_at }.publish(&e);
        Ok(())
    }

    /// Take the bond back after the unbonding period.
    pub fn withdraw(e: Env, attester: Address) -> Result<i128, Error> {
        attester.require_auth();
        let info = attester_info(&e, &attester).ok_or(Error::NotAttester)?;
        if info.active || info.unbond_at == 0 || e.ledger().sequence() < info.unbond_at {
            return Err(Error::StillBonded);
        }
        let amount = info.bond;
        e.storage().persistent().remove(&DataKey::Attester(attester.clone()));
        if amount > 0 {
            token::Client::new(&e, &config(&e).bond_token).transfer(&e.current_contract_address(), &attester, &amount);
        }
        Withdrawn { attester, amount }.publish(&e);
        Ok(amount)
    }

    /// Arbiter only: take part of a bond, e.g. to compensate buyers after a
    /// false attestation is proven. An attester below the minimum bond stops
    /// counting until it tops up.
    pub fn slash(e: Env, attester: Address, amount: i128, to: Address) -> Result<(), Error> {
        admin(&e).require_auth();
        let mut info = attester_info(&e, &attester).ok_or(Error::NotAttester)?;
        if amount <= 0 || amount > info.bond {
            return Err(Error::InvalidAmount);
        }
        info.bond -= amount;
        if info.bond < config(&e).min_bond {
            info.active = false;
        }
        save_attester(&e, &attester, &info);
        token::Client::new(&e, &config(&e).bond_token).transfer(&e.current_contract_address(), &to, &amount);
        Slashed { attester, amount, to }.publish(&e);
        Ok(())
    }

    // ---- Attestations -------------------------------------------------

    /// Attest one endpoint. Active attesters only.
    pub fn attest(e: Env, attester: Address, key: BytesN<32>, att: Attestation) -> Result<(), Error> {
        attester.require_auth();
        require_active(&e, &attester)?;
        if att.score > MAX_SCORE || att.delivered > att.calls {
            return Err(Error::InvalidAttestation);
        }
        check_expiry(&e, att.expires_ledger)?;
        let k = DataKey::Endpoint(attester.clone(), key.clone());
        let store = e.storage().persistent();
        if let Some(old) = store.get::<_, Attestation>(&k) {
            if att.measured_at < old.measured_at {
                return Err(Error::Stale);
            }
        }
        store.set(&k, &att);
        let ttl = entry_ttl(&e, att.expires_ledger);
        store.extend_ttl(&k, ttl, ttl);
        bump_instance(&e);
        Attested { attester, key, score: att.score, expires_ledger: att.expires_ledger }.publish(&e);
        Ok(())
    }

    /// Attest a seller (its payment address). Active attesters only.
    pub fn attest_seller(e: Env, attester: Address, seller: Address, att: SellerAttestation) -> Result<(), Error> {
        attester.require_auth();
        require_active(&e, &attester)?;
        if att.score > MAX_SCORE || att.delivered > att.calls || att.receipts > att.calls {
            return Err(Error::InvalidAttestation);
        }
        check_expiry(&e, att.expires_ledger)?;
        let k = DataKey::Seller(attester.clone(), seller.clone());
        let store = e.storage().persistent();
        if let Some(old) = store.get::<_, SellerAttestation>(&k) {
            if att.measured_at < old.measured_at {
                return Err(Error::Stale);
            }
        }
        store.set(&k, &att);
        let ttl = entry_ttl(&e, att.expires_ledger);
        store.extend_ttl(&k, ttl, ttl);
        bump_instance(&e);
        SellerAttested { attester, seller, score: att.score, expires_ledger: att.expires_ledger }.publish(&e);
        Ok(())
    }

    pub fn get(e: Env, attester: Address, key: BytesN<32>) -> Option<Attestation> {
        e.storage().persistent().get(&DataKey::Endpoint(attester, key))
    }

    pub fn get_seller(e: Env, attester: Address, seller: Address) -> Option<SellerAttestation> {
        e.storage().persistent().get(&DataKey::Seller(attester, seller))
    }

    /// True if the attester is active and has a current endpoint attestation
    /// with `score >= min_score`. Missing or expired means false.
    pub fn is_trusted(e: Env, attester: Address, key: BytesN<32>, min_score: u32) -> bool {
        if !is_active(&e, &attester) {
            return false;
        }
        match e.storage().persistent().get::<_, Attestation>(&DataKey::Endpoint(attester, key)) {
            Some(a) => a.expires_ledger > e.ledger().sequence() && a.score >= min_score,
            None => false,
        }
    }

    /// Same as `is_trusted`, for a seller.
    pub fn is_trusted_seller(e: Env, attester: Address, seller: Address, min_score: u32) -> bool {
        if !is_active(&e, &attester) {
            return false;
        }
        match e.storage().persistent().get::<_, SellerAttestation>(&DataKey::Seller(attester, seller)) {
            Some(a) => a.expires_ledger > e.ledger().sequence() && a.score >= min_score,
            None => false,
        }
    }

    /// How many of `attesters` currently trust `seller` at `min_score`.
    pub fn count_trusted(e: Env, seller: Address, attesters: Vec<Address>, min_score: u32) -> u32 {
        let mut n = 0;
        for a in attesters.iter() {
            if Self::is_trusted_seller(e.clone(), a, seller.clone(), min_score) {
                n += 1;
            }
        }
        n
    }

    /// True when at least `quorum` of the given attesters trust `seller`.
    /// This is the call a smart-account policy makes before a payment.
    pub fn trusted_by(e: Env, seller: Address, attesters: Vec<Address>, min_score: u32, quorum: u32) -> bool {
        quorum > 0 && Self::count_trusted(e, seller, attesters, min_score) >= quorum
    }

    /// Checks onchain that `leaf` is part of the evidence a seller
    /// attestation was computed from.
    pub fn verify_seller_evidence(e: Env, attester: Address, seller: Address, leaf: BytesN<32>, proof: Vec<BytesN<32>>) -> Result<bool, Error> {
        if proof.len() > MAX_PROOF {
            return Err(Error::ProofTooLong);
        }
        let att: SellerAttestation = e.storage().persistent().get(&DataKey::Seller(attester, seller)).ok_or(Error::NotFound)?;
        Ok(merkle_root(&e, &leaf, &proof) == att.evidence)
    }

    /// Same as `verify_seller_evidence`, for an endpoint attestation.
    pub fn verify_evidence(e: Env, attester: Address, key: BytesN<32>, leaf: BytesN<32>, proof: Vec<BytesN<32>>) -> Result<bool, Error> {
        if proof.len() > MAX_PROOF {
            return Err(Error::ProofTooLong);
        }
        let att: Attestation = e.storage().persistent().get(&DataKey::Endpoint(attester, key)).ok_or(Error::NotFound)?;
        Ok(merkle_root(&e, &leaf, &proof) == att.evidence)
    }

    /// Anyone may pay rent to keep a seller attestation readable until it expires.
    pub fn extend_seller(e: Env, attester: Address, seller: Address) -> Result<(), Error> {
        let k = DataKey::Seller(attester, seller);
        let att: SellerAttestation = e.storage().persistent().get(&k).ok_or(Error::NotFound)?;
        let ttl = entry_ttl(&e, att.expires_ledger);
        e.storage().persistent().extend_ttl(&k, ttl, ttl);
        bump_instance(&e);
        Ok(())
    }

    // ---- Administration ----------------------------------------------

    pub fn set_admin(e: Env, new_admin: Address) {
        admin(&e).require_auth();
        e.storage().instance().set(&DataKey::Admin, &new_admin);
        bump_instance(&e);
    }

    /// Change the minimum bond or unbonding period. The bond token is fixed.
    pub fn set_bond_rules(e: Env, min_bond: i128, unbond_ledgers: u32) {
        admin(&e).require_auth();
        let mut cfg = config(&e);
        cfg.min_bond = min_bond;
        cfg.unbond_ledgers = unbond_ledgers;
        e.storage().instance().set(&DataKey::Config, &cfg);
        bump_instance(&e);
    }

    pub fn admin(e: Env) -> Address {
        admin(&e)
    }

    pub fn config(e: Env) -> Config {
        config(&e)
    }

    pub fn attester(e: Env, attester: Address) -> Option<AttesterInfo> {
        attester_info(&e, &attester)
    }
}

#[cfg(test)]
mod test;
