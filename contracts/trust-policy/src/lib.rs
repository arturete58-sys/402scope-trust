//! 402Scope Trust policy for OpenZeppelin smart accounts on Stellar.
//!
//! An AI agent's wallet is a smart account. With this policy installed, the
//! wallet itself refuses to authorize a token `transfer` (or `approve`) to a
//! seller that is not trusted by enough of the attesters the owner chose.
//! No cooperation from the agent's code is needed: an x402 payment on
//! Stellar is a signed authorization for `transfer(from, to, amount)`, and
//! the smart account runs this policy before that authorization is valid.
//!
//! Each smart account sets, per context rule:
//! - `registry`: the 402Scope Trust attestation contract;
//! - `attesters`: which attesters it trusts, and `quorum`: how many must agree;
//! - `min_score`: the lowest acceptable score (0-100);
//! - `max_unverified`: payments up to this amount may go to sellers that are
//!   not attested yet (0 blocks them all).
#![no_std]

use soroban_sdk::{
    auth::{Context, ContractContext},
    contract, contractclient, contracterror, contractevent, contractimpl, contracttype, panic_with_error, symbol_short,
    Address, Env, MuxedAddress, TryFromVal, Val, Vec,
};
use stellar_accounts::{
    policies::Policy,
    smart_account::{ContextRule, Signer},
};

/// Most attesters a rule may list (bounds the cost of each check).
pub const MAX_ATTESTERS: u32 = 10;
const DAY_IN_LEDGERS: u32 = 17_280;

/// The part of the attestation contract this policy calls.
#[contractclient(name = "RegistryClient")]
pub trait Registry {
    fn trusted_by(e: Env, seller: Address, attesters: Vec<Address>, min_score: u32, quorum: u32) -> bool;
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum TrustPolicyError {
    /// The destination is not trusted by enough attesters.
    NotTrusted = 1,
    NotInstalled = 2,
    InvalidParams = 3,
    AlreadyInstalled = 4,
    /// No signer of the rule authenticated. OpenZeppelin smart accounts defer
    /// signer checks to policies when a rule has any, so this policy refuses
    /// to authorize anything without at least one authenticated signer.
    NoSigner = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TrustPolicyParams {
    pub registry: Address,
    pub attesters: Vec<Address>,
    pub min_score: u32,
    pub quorum: u32,
    pub max_unverified: i128,
}

#[contracttype]
#[derive(Clone)]
enum Key {
    Params(Address, u32),
}

#[contractevent(topics = ["scope_policy", "installed"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Installed {
    #[topic]
    pub smart_account: Address,
    pub context_rule_id: u32,
    pub params: TrustPolicyParams,
}

#[contractevent(topics = ["scope_policy", "uninstalled"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Uninstalled {
    #[topic]
    pub smart_account: Address,
    pub context_rule_id: u32,
}

#[contract]
pub struct TrustPolicy;

fn validate(e: &Env, p: &TrustPolicyParams) {
    let n = p.attesters.len();
    if n == 0 || n > MAX_ATTESTERS || p.quorum == 0 || p.quorum > n || p.min_score > 100 || p.max_unverified < 0 {
        panic_with_error!(e, TrustPolicyError::InvalidParams)
    }
}

fn load(e: &Env, account: &Address, rule_id: u32) -> Option<TrustPolicyParams> {
    e.storage().persistent().get(&Key::Params(account.clone(), rule_id))
}

fn save(e: &Env, account: &Address, rule_id: u32, p: &TrustPolicyParams) {
    let k = Key::Params(account.clone(), rule_id);
    e.storage().persistent().set(&k, p);
    e.storage().persistent().extend_ttl(&k, 30 * DAY_IN_LEDGERS, e.storage().max_ttl());
}

/// Destination of a token `transfer(from, to, amount)` or the spender of
/// `approve(from, spender, amount, expiration_ledger)`, with the amount.
/// Other calls are not payments and are left to other policies.
fn payment_of(e: &Env, ctx: &ContractContext) -> Option<(Option<Address>, i128)> {
    if ctx.fn_name != symbol_short!("transfer") && ctx.fn_name != symbol_short!("approve") {
        return None;
    }
    let to_val: Val = ctx.args.get(1)?;
    let amount_val: Val = ctx.args.get(2)?;
    let amount = i128::try_from_val(e, &amount_val).ok()?;
    // SEP-41 `to` may be a muxed address; the seller is its underlying address.
    let to = MuxedAddress::try_from_val(e, &to_val).ok().map(|m| m.address());
    Some((to, amount))
}

/// Whether the payment is allowed under `p`. Unknown or unparsable
/// destinations are treated as untrusted (fail closed).
fn allowed(e: &Env, p: &TrustPolicyParams, to: &Option<Address>, amount: i128) -> bool {
    if amount <= 0 {
        return true;
    }
    if let Some(seller) = to {
        if RegistryClient::new(e, &p.registry).trusted_by(seller, &p.attesters, &p.min_score, &p.quorum) {
            return true;
        }
    }
    amount <= p.max_unverified
}

#[contractimpl]
impl Policy for TrustPolicy {
    type AccountParams = TrustPolicyParams;

    fn enforce(e: &Env, context: Context, authenticated_signers: Vec<Signer>, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        if authenticated_signers.is_empty() {
            panic_with_error!(e, TrustPolicyError::NoSigner)
        }
        let p = load(e, &smart_account, context_rule.id).unwrap_or_else(|| panic_with_error!(e, TrustPolicyError::NotInstalled));
        if let Context::Contract(ctx) = context {
            if let Some((to, amount)) = payment_of(e, &ctx) {
                if !allowed(e, &p, &to, amount) {
                    panic_with_error!(e, TrustPolicyError::NotTrusted)
                }
            }
        }
    }

    fn install(e: &Env, install_params: TrustPolicyParams, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        validate(e, &install_params);
        if load(e, &smart_account, context_rule.id).is_some() {
            panic_with_error!(e, TrustPolicyError::AlreadyInstalled)
        }
        save(e, &smart_account, context_rule.id, &install_params);
        Installed { smart_account, context_rule_id: context_rule.id, params: install_params }.publish(e);
    }

    fn uninstall(e: &Env, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        let k = Key::Params(smart_account.clone(), context_rule.id);
        if !e.storage().persistent().has(&k) {
            panic_with_error!(e, TrustPolicyError::NotInstalled)
        }
        e.storage().persistent().remove(&k);
        Uninstalled { smart_account, context_rule_id: context_rule.id }.publish(e);
    }
}

#[contractimpl]
impl TrustPolicy {
    /// The settings a smart account uses for one of its context rules.
    pub fn params(e: Env, smart_account: Address, context_rule_id: u32) -> Option<TrustPolicyParams> {
        load(&e, &smart_account, context_rule_id)
    }

    /// Change the settings. The smart account must authorize it.
    pub fn set_params(e: Env, smart_account: Address, context_rule_id: u32, params: TrustPolicyParams) {
        smart_account.require_auth();
        validate(&e, &params);
        if load(&e, &smart_account, context_rule_id).is_none() {
            panic_with_error!(&e, TrustPolicyError::NotInstalled)
        }
        save(&e, &smart_account, context_rule_id, &params);
        Installed { smart_account, context_rule_id, params }.publish(&e);
    }

    /// Read-only preview: would a payment of `amount` to `to` pass? For
    /// wallets and agents that want to know before building a transaction.
    pub fn would_allow(e: Env, smart_account: Address, context_rule_id: u32, to: Address, amount: i128) -> bool {
        match load(&e, &smart_account, context_rule_id) {
            Some(p) => allowed(&e, &p, &Some(to), amount),
            None => false,
        }
    }
}

#[cfg(test)]
mod test;
