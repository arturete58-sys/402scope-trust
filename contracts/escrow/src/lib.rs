//! 402Scope escrow: x402 payments held until delivery is shown, released or
//! refunded in seconds.
//!
//! The buyer pays this contract instead of the seller (x402 scheme `escrow`).
//! The data still reaches the buyer at once; only the seller's money waits,
//! and in the normal case for one ledger (about 5 seconds):
//!
//! - **The buyer's agent confirms** (`confirm`): it checked the response and
//!   the seller is paid at once.
//! - **The seller posts its receipt** (`submit_receipt`): if the seller backs
//!   its terms with a refund bond covering the amount, it is paid at once
//!   (a contradicting receipt later is refunded from that bond); otherwise
//!   after a short contest window.
//! - **A receipt shows a breach** of the seller's own terms: the payer is
//!   refunded at once, before or after delivery, until the money is released.
//! - **No receipt by the deadline**: anyone can refund the payer (`expire`).
//!   This covers what a bond cannot: a response that never arrived.
//!
//! No admin. Receipts are `x402-receipt/3`, whose `payment` field is the
//! escrow id; the same receipt is valid in the refund bond contract.
#![no_std]
use soroban_sdk::{
    contract, contractclient, contracterror, contractevent, contractimpl, contracttype, token, xdr::ToXdr, Address, Bytes,
    BytesN, Env, Vec,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const SEP53_PREFIX: &[u8] = b"Stellar Signed Message:\n";
const RECEIPT_PREFIX: &[u8] = b"x402-receipt/3\n";
pub const NO_AGE: u32 = u32::MAX;
pub const MAX_BATCH: u32 = 50;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    InvalidAmount = 1,
    /// A payment with this id already exists.
    Exists = 2,
    NotFound = 3,
    /// The payment is already released or refunded.
    Closed = 4,
    /// The receipt is for another payment, payer, seller, token or amount.
    WrongReceipt = 5,
    /// The receipt is not signed by the seller's key.
    WrongSigner = 6,
    /// Too early: the deadline or the contest window has not passed.
    TooEarly = 7,
    BatchTooLarge = 8,
}

/// Same struct as the refund bond's: one signature is valid in both contracts.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Receipt {
    pub resource: BytesN<32>,
    /// For escrow payments: the escrow id.
    pub payment: BytesN<32>,
    pub body: BytesN<32>,
    pub decl: BytesN<32>,
    pub at: u64,
    pub payer: Address,
    pub pay_to: Address,
    pub asset: Address,
    pub amount: i128,
    pub age: u32,
    pub max_age: u32,
    pub unusable: bool,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Status {
    Held = 0,
    /// The seller posted a receipt with no breach; released after `release_at`.
    Delivered = 1,
    Released = 2,
    Refunded = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Hold {
    pub payer: Address,
    pub seller: Address,
    pub asset: Address,
    pub amount: i128,
    /// Unix seconds when paid.
    pub paid_at: u64,
    pub status: Status,
    /// Unix seconds after which a delivered payment can be released.
    pub release_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Config {
    /// Seconds the seller has to post a receipt before the payer can be refunded.
    pub receipt_deadline: u64,
    /// Seconds a posted receipt can be contested before release (sellers without a covering bond).
    pub contest_window: u64,
    /// Refund bond contract whose bonds let sellers be paid at once.
    pub bond_contract: Option<Address>,
}

/// The part of the refund bond contract read here.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BondView {
    pub owner: Address,
    pub balance: i128,
    pub pending: i128,
    pub unlock_ledger: u32,
}

#[contractclient(name = "BondClient")]
pub trait BondReader {
    fn bond(e: Env, key: BytesN<32>, token: Address) -> Option<BondView>;
}

#[contracttype]
#[derive(Clone)]
enum Key {
    Config,
    Hold(BytesN<32>),
}

#[contractevent(topics = ["scope_escrow", "paid"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Paid {
    #[topic]
    pub id: BytesN<32>,
    pub payer: Address,
    pub seller: Address,
    pub asset: Address,
    pub amount: i128,
}

#[contractevent(topics = ["scope_escrow", "released"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Released {
    #[topic]
    pub id: BytesN<32>,
    pub seller: Address,
    pub amount: i128,
    /// 0 confirmed by the payer, 1 bonded seller's receipt, 2 after the contest window.
    pub how: u32,
}

#[contractevent(topics = ["scope_escrow", "refunded"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Refunded {
    #[topic]
    pub id: BytesN<32>,
    pub payer: Address,
    pub amount: i128,
    /// 0 a receipt showed a breach, 1 no receipt by the deadline.
    pub why: u32,
}

#[contractevent(topics = ["scope_escrow", "delivered"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Delivered {
    #[topic]
    pub id: BytesN<32>,
    pub release_at: u64,
}

fn config(e: &Env) -> Config {
    e.storage().instance().get(&Key::Config).unwrap()
}

fn load(e: &Env, id: &BytesN<32>) -> Result<Hold, EscrowError> {
    e.storage().persistent().get(&Key::Hold(id.clone())).ok_or(EscrowError::NotFound)
}

fn save(e: &Env, id: &BytesN<32>, h: &Hold) {
    let k = Key::Hold(id.clone());
    e.storage().persistent().set(&k, h);
    e.storage().persistent().extend_ttl(&k, 7 * DAY_IN_LEDGERS, 8 * DAY_IN_LEDGERS);
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

/// The SEP-53 hash the seller's key signs (identical to the refund bond's).
pub fn signed_hash(e: &Env, r: &Receipt) -> BytesN<32> {
    let digest = e.crypto().sha256(&r.clone().to_xdr(e)).to_array();
    let mut msg = Bytes::from_slice(e, SEP53_PREFIX);
    msg.append(&Bytes::from_slice(e, RECEIPT_PREFIX));
    msg.append(&hex(e, &digest));
    e.crypto().sha256(&msg).to_bytes()
}

pub fn is_breach(r: &Receipt) -> bool {
    r.unusable || (r.max_age > 0 && r.age != NO_AGE && r.age > r.max_age)
}

/// The ed25519 key inside a G... account address (strkey: base32 of version, key, checksum).
fn account_key(e: &Env, a: &Address) -> Option<BytesN<32>> {
    let s = a.to_string();
    if s.len() != 56 {
        return None;
    }
    let mut buf = [0u8; 56];
    s.copy_into_slice(&mut buf);
    if buf[0] != b'G' {
        return None;
    }
    let mut out = [0u8; 35];
    let (mut acc, mut bits, mut n) = (0u64, 0u32, 0usize);
    for c in buf.iter() {
        let v = match c {
            b'A'..=b'Z' => c - b'A',
            b'2'..=b'7' => c - b'2' + 26,
            _ => return None,
        } as u64;
        acc = (acc << 5) | v;
        bits += 5;
        if bits >= 8 {
            bits -= 8;
            if n < 35 {
                out[n] = (acc >> bits) as u8;
            }
            n += 1;
            acc &= (1 << bits) - 1;
        }
    }
    let mut key = [0u8; 32];
    key.copy_from_slice(&out[1..33]);
    Some(BytesN::from_array(e, &key))
}

fn release(e: &Env, id: &BytesN<32>, h: &mut Hold, how: u32) {
    h.status = Status::Released;
    save(e, id, h);
    token::Client::new(e, &h.asset).transfer(&e.current_contract_address(), &h.seller, &h.amount);
    Released { id: id.clone(), seller: h.seller.clone(), amount: h.amount, how }.publish(e);
}

fn refund(e: &Env, id: &BytesN<32>, h: &mut Hold, why: u32) {
    h.status = Status::Refunded;
    save(e, id, h);
    token::Client::new(e, &h.asset).transfer(&e.current_contract_address(), &h.payer, &h.amount);
    Refunded { id: id.clone(), payer: h.payer.clone(), amount: h.amount, why }.publish(e);
}

fn seller_bond_covers(e: &Env, cfg: &Config, key: &BytesN<32>, h: &Hold) -> bool {
    match &cfg.bond_contract {
        Some(c) => match BondClient::new(e, c).bond(key, &h.asset) {
            Some(b) => b.balance - b.pending >= h.amount,
            None => false,
        },
        None => false,
    }
}

#[contract]
pub struct Escrow;

#[contractimpl]
impl Escrow {
    /// Fixed for the life of the contract: there is no admin.
    pub fn __constructor(e: Env, receipt_deadline: u64, contest_window: u64, bond_contract: Option<Address>) {
        e.storage().instance().set(&Key::Config, &Config { receipt_deadline, contest_window, bond_contract });
        e.storage().instance().extend_ttl(29 * DAY_IN_LEDGERS, 30 * DAY_IN_LEDGERS);
    }

    /// The x402 payment: the payer moves `amount` here, held for `seller` under `id`.
    pub fn pay(e: Env, payer: Address, seller: Address, asset: Address, amount: i128, id: BytesN<32>) -> Result<(), EscrowError> {
        payer.require_auth();
        if amount <= 0 {
            return Err(EscrowError::InvalidAmount);
        }
        if e.storage().persistent().has(&Key::Hold(id.clone())) {
            return Err(EscrowError::Exists);
        }
        token::Client::new(&e, &asset).transfer(&payer, &e.current_contract_address(), &amount);
        let h = Hold { payer: payer.clone(), seller: seller.clone(), asset: asset.clone(), amount, paid_at: e.ledger().timestamp(), status: Status::Held, release_at: 0 };
        save(&e, &id, &h);
        Paid { id, payer, seller, asset, amount }.publish(&e);
        Ok(())
    }

    /// The payer (its agent) checked the response: the seller is paid at once.
    pub fn confirm(e: Env, id: BytesN<32>) -> Result<(), EscrowError> {
        let mut h = load(&e, &id)?;
        h.payer.require_auth();
        if h.status == Status::Released || h.status == Status::Refunded {
            return Err(EscrowError::Closed);
        }
        release(&e, &id, &mut h, 0);
        Ok(())
    }

    /// A receipt signed by the seller for this payment, posted by anyone.
    /// Breach: the payer is refunded at once. No breach: delivered, and the
    /// seller is paid at once if its refund bond covers the amount.
    pub fn submit_receipt(e: Env, id: BytesN<32>, receipt: Receipt, signature: BytesN<64>) -> Result<Status, EscrowError> {
        let mut h = load(&e, &id)?;
        if h.status == Status::Released || h.status == Status::Refunded {
            return Err(EscrowError::Closed);
        }
        if receipt.payment != id || receipt.payer != h.payer || receipt.pay_to != h.seller || receipt.asset != h.asset || receipt.amount != h.amount {
            return Err(EscrowError::WrongReceipt);
        }
        let key = account_key(&e, &h.seller).ok_or(EscrowError::WrongSigner)?;
        e.crypto().ed25519_verify(&key, &Bytes::from_array(&e, &signed_hash(&e, &receipt).to_array()), &signature);
        if is_breach(&receipt) {
            refund(&e, &id, &mut h, 0);
            return Ok(Status::Refunded);
        }
        if h.status == Status::Delivered {
            return Ok(Status::Delivered);
        }
        let cfg = config(&e);
        if seller_bond_covers(&e, &cfg, &key, &h) {
            release(&e, &id, &mut h, 1);
            return Ok(Status::Released);
        }
        h.status = Status::Delivered;
        h.release_at = e.ledger().timestamp() + cfg.contest_window;
        save(&e, &id, &h);
        Delivered { id, release_at: h.release_at }.publish(&e);
        Ok(Status::Delivered)
    }

    /// After the contest window: pays a delivered payment to the seller. Anyone may call.
    pub fn release(e: Env, id: BytesN<32>) -> Result<(), EscrowError> {
        let mut h = load(&e, &id)?;
        if h.status != Status::Delivered {
            return Err(EscrowError::Closed);
        }
        if e.ledger().timestamp() < h.release_at {
            return Err(EscrowError::TooEarly);
        }
        release(&e, &id, &mut h, 2);
        Ok(())
    }

    /// No receipt by the deadline: the payer is refunded. Anyone may call.
    pub fn expire(e: Env, id: BytesN<32>) -> Result<(), EscrowError> {
        let mut h = load(&e, &id)?;
        if h.status != Status::Held {
            return Err(EscrowError::Closed);
        }
        if e.ledger().timestamp() < h.paid_at + config(&e).receipt_deadline {
            return Err(EscrowError::TooEarly);
        }
        refund(&e, &id, &mut h, 1);
        Ok(())
    }

    /// For a facilitator or keeper: releases or expires every id that is due; the rest are left.
    pub fn settle_due(e: Env, ids: Vec<BytesN<32>>) -> Result<Vec<Status>, EscrowError> {
        if ids.len() > MAX_BATCH {
            return Err(EscrowError::BatchTooLarge);
        }
        let cfg = config(&e);
        let now = e.ledger().timestamp();
        let mut out = Vec::new(&e);
        for id in ids.iter() {
            let Ok(mut h) = load(&e, &id) else {
                out.push_back(Status::Held);
                continue;
            };
            if h.status == Status::Delivered && now >= h.release_at {
                release(&e, &id, &mut h, 2);
            } else if h.status == Status::Held && now >= h.paid_at + cfg.receipt_deadline {
                refund(&e, &id, &mut h, 1);
            }
            out.push_back(h.status);
        }
        Ok(out)
    }

    pub fn hold(e: Env, id: BytesN<32>) -> Option<Hold> {
        load(&e, &id).ok()
    }

    pub fn config(e: Env) -> Config {
        config(&e)
    }

    pub fn receipt_hash(e: Env, receipt: Receipt) -> BytesN<32> {
        signed_hash(&e, &receipt)
    }
}

#[cfg(test)]
mod test;
