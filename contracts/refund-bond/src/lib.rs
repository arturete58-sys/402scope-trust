//! 402Scope refund bond: optional, automatic refunds for x402 payments.
//!
//! A seller that wants to offer "refund if I break my own terms" locks a bond
//! here, under the ed25519 key it signs its delivery receipts with. If a paid
//! response breaks what the seller declared (data older than the maximum age
//! it published, or a response it marked unusable), the buyer, its agent or
//! anyone on its behalf submits the seller's own signed receipt and the
//! contract refunds the payer from the bond, in the same transaction.
//!
//! - Opt-in: a seller without a bond is unaffected.
//! - No admin: nobody, 402Scope included, can move, freeze or release a
//!   bond. Money leaves only to its owner after a notice period, or to a payer
//!   whose claim the seller's own signature proves.
//! - No judgement: the rule is fixed and only reads fields the seller signed.
//!
//! The receipt is `x402-receipt/3`: a SEP-53 Stellar signed message over
//! "x402-receipt/3\n" + hex(sha256(XDR of `Receipt`)). See docs/refunds.md.
#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, xdr::ToXdr, Address, Bytes, BytesN,
    Env, Vec,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const SEP53_PREFIX: &[u8] = b"Stellar Signed Message:\n";
const RECEIPT_PREFIX: &[u8] = b"x402-receipt/3\n";
/// Age value meaning "not declared".
pub const NO_AGE: u32 = u32::MAX;
/// Most claims in one batch.
pub const MAX_BATCH: u32 = 50;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum BondError {
    InvalidAmount = 1,
    /// This signing key's bond in this token belongs to another owner.
    KeyTaken = 2,
    NoBond = 3,
    NothingToWithdraw = 4,
    /// The notice period has not passed yet.
    StillLocked = 5,
    BatchTooLarge = 6,
}

/// What the seller signs for one paid response. A Soroban struct, so the
/// contract and any SDK compute the same XDR and the same hash.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Receipt {
    /// sha256 of the resource URL.
    pub resource: BytesN<32>,
    /// sha256 of the PAYMENT-SIGNATURE header: identifies the payment.
    pub payment: BytesN<32>,
    /// sha256 of the response body.
    pub body: BytesN<32>,
    /// sha256 of the X-402-Declaration header (zeros if none).
    pub decl: BytesN<32>,
    /// Unix seconds when the seller signed.
    pub at: u64,
    pub payer: Address,
    pub pay_to: Address,
    /// SEP-41 token paid.
    pub asset: Address,
    pub amount: i128,
    /// Age of the data, as the seller declared it, in seconds (NO_AGE if not declared).
    pub age: u32,
    /// Maximum age the seller promised in its terms (0 if none).
    pub max_age: u32,
    /// The seller declared this response unusable (or not established when its terms require it).
    pub unusable: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bond {
    pub owner: Address,
    pub balance: i128,
    /// Amount the owner asked to withdraw, and from which ledger it may.
    pub pending: i128,
    pub unlock_ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    /// Ledgers between asking to withdraw and withdrawing.
    pub notice_ledgers: u32,
    /// Seconds after the receipt during which a refund can be claimed.
    pub claim_window: u64,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Outcome {
    Refunded = 0,
    /// The bond did not cover the whole amount; what it held was refunded.
    PartlyRefunded = 1,
    AlreadyClaimed = 2,
    /// The receipt shows no breach of the seller's own terms.
    NoBreach = 3,
    /// Outside the claim window.
    Expired = 4,
    /// No bond, or an empty one, for this key and token.
    NoBond = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Claim {
    /// The seller's ed25519 public key (the receipt's signer).
    pub key: BytesN<32>,
    pub receipt: Receipt,
    pub signature: BytesN<64>,
}

#[contracttype]
#[derive(Clone)]
enum Key {
    Config,
    Bond(BytesN<32>, Address),
    Claimed(BytesN<32>),
}

#[contractevent(topics = ["scope_bond", "deposit"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Deposited {
    #[topic]
    pub key: BytesN<32>,
    pub token: Address,
    pub owner: Address,
    pub balance: i128,
}

#[contractevent(topics = ["scope_bond", "unlock"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WithdrawRequested {
    #[topic]
    pub key: BytesN<32>,
    pub token: Address,
    pub amount: i128,
    pub unlock_ledger: u32,
}

#[contractevent(topics = ["scope_bond", "withdraw"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Withdrawn {
    #[topic]
    pub key: BytesN<32>,
    pub token: Address,
    pub amount: i128,
}

#[contractevent(topics = ["scope_bond", "refund"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Refunded {
    #[topic]
    pub key: BytesN<32>,
    #[topic]
    pub payer: Address,
    pub payment: BytesN<32>,
    pub token: Address,
    pub amount: i128,
}

fn config(e: &Env) -> Config {
    e.storage().instance().get(&Key::Config).unwrap()
}

fn load(e: &Env, key: &BytesN<32>, token: &Address) -> Option<Bond> {
    e.storage().persistent().get(&Key::Bond(key.clone(), token.clone()))
}

fn save(e: &Env, key: &BytesN<32>, token: &Address, b: &Bond) {
    let k = Key::Bond(key.clone(), token.clone());
    e.storage().persistent().set(&k, b);
    e.storage().persistent().extend_ttl(&k, 29 * DAY_IN_LEDGERS, 30 * DAY_IN_LEDGERS);
}

fn hex(e: &Env, h: &[u8; 32]) -> Bytes {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    let mut out = [0u8; 64];
    for (i, b) in h.iter().enumerate() {
        out[2 * i] = DIGITS[(b >> 4) as usize];
        out[2 * i + 1] = DIGITS[(b & 15) as usize];
    }
    Bytes::from_array(e, &out)
}

/// The SEP-53 hash the seller's key signs for this receipt.
pub fn signed_hash(e: &Env, r: &Receipt) -> BytesN<32> {
    let digest = e.crypto().sha256(&r.clone().to_xdr(e)).to_array();
    let mut msg = Bytes::from_slice(e, SEP53_PREFIX);
    msg.append(&Bytes::from_slice(e, RECEIPT_PREFIX));
    msg.append(&hex(e, &digest));
    e.crypto().sha256(&msg).to_bytes()
}

/// The fixed rule: the seller broke its own terms.
pub fn is_breach(r: &Receipt) -> bool {
    r.unusable || (r.max_age > 0 && r.age != NO_AGE && r.age > r.max_age)
}

fn settle_claim(e: &Env, c: &Claim, cfg: &Config) -> Outcome {
    // A forged receipt fails here (the whole transaction): verify off-chain before batching.
    e.crypto().ed25519_verify(&c.key, &Bytes::from_array(e, &signed_hash(e, &c.receipt).to_array()), &c.signature);
    let r = &c.receipt;
    let now = e.ledger().timestamp();
    if r.at > now + 300 || now > r.at.saturating_add(cfg.claim_window) {
        return Outcome::Expired;
    }
    if !is_breach(r) || r.amount <= 0 {
        return Outcome::NoBreach;
    }
    let claimed = Key::Claimed(r.payment.clone());
    if e.storage().temporary().has(&claimed) {
        return Outcome::AlreadyClaimed;
    }
    let mut bond = match load(e, &c.key, &r.asset) {
        Some(b) if b.balance > 0 => b,
        _ => return Outcome::NoBond,
    };
    let amount = r.amount.min(bond.balance);
    bond.balance -= amount;
    save(e, &c.key, &r.asset, &bond);
    let ttl = (cfg.claim_window / 5) as u32 + DAY_IN_LEDGERS;
    e.storage().temporary().set(&claimed, &true);
    e.storage().temporary().extend_ttl(&claimed, ttl, ttl);
    token::Client::new(e, &r.asset).transfer(&e.current_contract_address(), &r.payer, &amount);
    Refunded { key: c.key.clone(), payer: r.payer.clone(), payment: r.payment.clone(), token: r.asset.clone(), amount }.publish(e);
    if amount < r.amount {
        Outcome::PartlyRefunded
    } else {
        Outcome::Refunded
    }
}

#[contract]
pub struct RefundBond;

#[contractimpl]
impl RefundBond {
    /// Fixed for the life of the contract: there is no admin to change it.
    pub fn __constructor(e: Env, notice_ledgers: u32, claim_window: u64) {
        e.storage().instance().set(&Key::Config, &Config { notice_ledgers, claim_window });
        e.storage().instance().extend_ttl(29 * DAY_IN_LEDGERS, 30 * DAY_IN_LEDGERS);
    }

    /// Locks `amount` of `token` as the bond behind receipts signed by `key`.
    pub fn deposit(e: Env, owner: Address, key: BytesN<32>, token: Address, amount: i128) -> Result<i128, BondError> {
        owner.require_auth();
        if amount <= 0 {
            return Err(BondError::InvalidAmount);
        }
        let mut b = load(&e, &key, &token).unwrap_or(Bond { owner: owner.clone(), balance: 0, pending: 0, unlock_ledger: 0 });
        if b.owner != owner {
            return Err(BondError::KeyTaken);
        }
        token::Client::new(&e, &token).transfer(&owner, &e.current_contract_address(), &amount);
        b.balance += amount;
        save(&e, &key, &token, &b);
        Deposited { key, token, owner, balance: b.balance }.publish(&e);
        Ok(b.balance)
    }

    /// Starts the notice period to withdraw `amount`. Claims can still be paid meanwhile.
    pub fn request_withdraw(e: Env, key: BytesN<32>, token: Address, amount: i128) -> Result<u32, BondError> {
        let mut b = load(&e, &key, &token).ok_or(BondError::NoBond)?;
        b.owner.require_auth();
        if amount <= 0 || amount > b.balance {
            return Err(BondError::InvalidAmount);
        }
        b.pending = amount;
        b.unlock_ledger = e.ledger().sequence() + config(&e).notice_ledgers;
        save(&e, &key, &token, &b);
        WithdrawRequested { key, token, amount, unlock_ledger: b.unlock_ledger }.publish(&e);
        Ok(b.unlock_ledger)
    }

    /// Pays the owner what it asked for (or what is left of it) once the notice has passed.
    pub fn withdraw(e: Env, key: BytesN<32>, token: Address) -> Result<i128, BondError> {
        let mut b = load(&e, &key, &token).ok_or(BondError::NoBond)?;
        b.owner.require_auth();
        if b.pending <= 0 {
            return Err(BondError::NothingToWithdraw);
        }
        if e.ledger().sequence() < b.unlock_ledger {
            return Err(BondError::StillLocked);
        }
        let amount = b.pending.min(b.balance);
        b.balance -= amount;
        b.pending = 0;
        b.unlock_ledger = 0;
        save(&e, &key, &token, &b);
        token::Client::new(&e, &token).transfer(&e.current_contract_address(), &b.owner, &amount);
        Withdrawn { key, token, amount }.publish(&e);
        Ok(amount)
    }

    /// Refunds the payer of one receipt that shows the seller broke its terms. Anyone may submit it.
    pub fn claim(e: Env, claim: Claim) -> Outcome {
        settle_claim(&e, &claim, &config(&e))
    }

    /// Up to MAX_BATCH claims in one transaction (e.g. a facilitator or relayer for many buyers).
    pub fn claim_batch(e: Env, claims: Vec<Claim>) -> Result<Vec<Outcome>, BondError> {
        if claims.len() > MAX_BATCH {
            return Err(BondError::BatchTooLarge);
        }
        let cfg = config(&e);
        let mut out = Vec::new(&e);
        for c in claims.iter() {
            out.push_back(settle_claim(&e, &c, &cfg));
        }
        Ok(out)
    }

    pub fn bond(e: Env, key: BytesN<32>, token: Address) -> Option<Bond> {
        load(&e, &key, &token)
    }

    pub fn is_claimed(e: Env, payment: BytesN<32>) -> bool {
        e.storage().temporary().has(&Key::Claimed(payment))
    }

    pub fn config(e: Env) -> Config {
        config(&e)
    }

    /// The hash a seller's key must sign (SEP-53) for this receipt; for SDKs and tests.
    pub fn receipt_hash(e: Env, receipt: Receipt) -> BytesN<32> {
        signed_hash(&e, &receipt)
    }
}

#[cfg(test)]
mod test;
