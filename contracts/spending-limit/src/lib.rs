//! Spending limit policy for agent wallets (OpenZeppelin smart accounts).
//!
//! Installed next to the 402Scope Trust policy on the same context rule, it
//! gives an agent two independent limits on every x402 payment: *who* it may
//! pay (the trust policy: sellers the chosen attesters trust) and *how much*
//! (this policy: at most `spending_limit` in any rolling window of
//! `period_ledgers`). Both run inside the wallet's `__check_auth`, so a
//! compromised or buggy agent cannot go around either one.
//!
//! Same rolling-window semantics and parameters as OpenZeppelin's
//! `spending_limit` policy, with one difference that matters for x402: it
//! emits no event when it lets a payment through. The x402 `exact` scheme
//! facilitator for Stellar accepts a payment only if simulating it emits
//! exactly one event, the token transfer; OpenZeppelin's policy emits
//! `SpendingLimitEnforced` on every payment, so a wallet using it cannot pay
//! over x402. Installing and changing the limit still emit events.
//!
//! Like OpenZeppelin's, it only accepts `CallContract(token)` rules: amounts
//! of different tokens are never added together.
#![no_std]
use soroban_sdk::{
    auth::{Context, ContractContext},
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, symbol_short, Address, Env, TryFromVal,
    Vec,
};
use stellar_accounts::{
    policies::Policy,
    smart_account::{ContextRule, ContextRuleType, Signer},
};

const DAY_IN_LEDGERS: u32 = 17_280;
const EXTEND_TO: u32 = 30 * DAY_IN_LEDGERS;
const EXTEND_BELOW: u32 = EXTEND_TO - DAY_IN_LEDGERS;
/// Most payments kept in one window (bounds the cost of each check).
pub const MAX_HISTORY: u32 = 500;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum SpendingLimitError {
    NotInstalled = 3301,
    /// This payment would take the window's total over the limit.
    LimitExceeded = 3302,
    InvalidParams = 3303,
    /// Only token transfers are allowed under a rule with a spending limit.
    NotAllowed = 3304,
    /// Too many payments in the window; wait for older ones to leave it.
    HistoryFull = 3305,
    AlreadyInstalled = 3306,
    /// Only `CallContract(token)` rules can have a spending limit.
    OnlyCallContract = 3307,
    NegativeAmount = 3308,
}

/// Install parameters, the same as OpenZeppelin's `SpendingLimitAccountParams`.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingLimitParams {
    /// Most the wallet may pay in any window (token base units).
    pub spending_limit: i128,
    /// Window length in ledgers (17,280 is about a day).
    pub period_ledgers: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingEntry {
    pub amount: i128,
    pub ledger: u32,
}

/// The limit and what was paid in the current window.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingWindow {
    pub spending_limit: i128,
    pub period_ledgers: u32,
    pub history: Vec<SpendingEntry>,
    pub spent: i128,
}

#[contracttype]
#[derive(Clone)]
enum Key {
    Window(Address, u32),
}

#[contractevent(topics = ["scope_limit", "installed"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Installed {
    #[topic]
    pub smart_account: Address,
    pub context_rule_id: u32,
    pub spending_limit: i128,
    pub period_ledgers: u32,
}

#[contractevent(topics = ["scope_limit", "changed"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Changed {
    #[topic]
    pub smart_account: Address,
    pub context_rule_id: u32,
    pub spending_limit: i128,
}

#[contractevent(topics = ["scope_limit", "uninstalled"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Uninstalled {
    #[topic]
    pub smart_account: Address,
    pub context_rule_id: u32,
}

fn load(e: &Env, account: &Address, rule_id: u32) -> Option<SpendingWindow> {
    e.storage().persistent().get(&Key::Window(account.clone(), rule_id))
}

fn save(e: &Env, account: &Address, rule_id: u32, w: &SpendingWindow) {
    let k = Key::Window(account.clone(), rule_id);
    e.storage().persistent().set(&k, w);
    e.storage().persistent().extend_ttl(&k, EXTEND_BELOW, EXTEND_TO);
}

/// Drops payments that left the window: those at or before `now - period`.
fn roll(w: &mut SpendingWindow, now: u32) {
    if now <= w.period_ledgers {
        return;
    }
    let cutoff = now - w.period_ledgers;
    let mut kept = Vec::new(w.history.env());
    let mut spent = 0i128;
    for entry in w.history.iter() {
        if entry.ledger > cutoff {
            spent += entry.amount;
            kept.push_back(entry);
        }
    }
    w.history = kept;
    w.spent = spent;
}

fn transfer_amount(e: &Env, ctx: &ContractContext) -> Option<i128> {
    if ctx.fn_name != symbol_short!("transfer") {
        return None;
    }
    i128::try_from_val(e, &ctx.args.get(2)?).ok()
}

#[contract]
pub struct SpendingLimitPolicy;

#[contractimpl]
impl Policy for SpendingLimitPolicy {
    type AccountParams = SpendingLimitParams;

    fn enforce(e: &Env, context: Context, authenticated_signers: Vec<Signer>, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        if authenticated_signers.is_empty() {
            panic_with_error!(e, SpendingLimitError::NotAllowed)
        }
        let mut w = load(e, &smart_account, context_rule.id).unwrap_or_else(|| panic_with_error!(e, SpendingLimitError::NotInstalled));
        let amount = match &context {
            Context::Contract(ctx) => transfer_amount(e, ctx).unwrap_or_else(|| panic_with_error!(e, SpendingLimitError::NotAllowed)),
            _ => panic_with_error!(e, SpendingLimitError::NotAllowed),
        };
        if amount < 0 {
            panic_with_error!(e, SpendingLimitError::NegativeAmount)
        }
        if amount == 0 {
            return;
        }
        roll(&mut w, e.ledger().sequence());
        if w.spent + amount > w.spending_limit {
            panic_with_error!(e, SpendingLimitError::LimitExceeded)
        }
        if w.history.len() >= MAX_HISTORY {
            panic_with_error!(e, SpendingLimitError::HistoryFull)
        }
        w.history.push_back(SpendingEntry { amount, ledger: e.ledger().sequence() });
        w.spent += amount;
        save(e, &smart_account, context_rule.id, &w);
        // No event here: see the module docs (x402 facilitators accept only the transfer event).
    }

    fn install(e: &Env, install_params: SpendingLimitParams, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        if !matches!(context_rule.context_type, ContextRuleType::CallContract(_)) {
            panic_with_error!(e, SpendingLimitError::OnlyCallContract)
        }
        if install_params.spending_limit <= 0 || install_params.period_ledgers == 0 {
            panic_with_error!(e, SpendingLimitError::InvalidParams)
        }
        if load(e, &smart_account, context_rule.id).is_some() {
            panic_with_error!(e, SpendingLimitError::AlreadyInstalled)
        }
        let w = SpendingWindow { spending_limit: install_params.spending_limit, period_ledgers: install_params.period_ledgers, history: Vec::new(e), spent: 0 };
        save(e, &smart_account, context_rule.id, &w);
        Installed { smart_account, context_rule_id: context_rule.id, spending_limit: w.spending_limit, period_ledgers: w.period_ledgers }.publish(e);
    }

    fn uninstall(e: &Env, context_rule: ContextRule, smart_account: Address) {
        smart_account.require_auth();
        let k = Key::Window(smart_account.clone(), context_rule.id);
        if !e.storage().persistent().has(&k) {
            panic_with_error!(e, SpendingLimitError::NotInstalled)
        }
        e.storage().persistent().remove(&k);
        Uninstalled { smart_account, context_rule_id: context_rule.id }.publish(e);
    }
}

#[contractimpl]
impl SpendingLimitPolicy {
    /// The limit, the window and what was paid in it, as of now.
    pub fn window(e: Env, smart_account: Address, context_rule_id: u32) -> Option<SpendingWindow> {
        load(&e, &smart_account, context_rule_id).map(|mut w| {
            roll(&mut w, e.ledger().sequence());
            w
        })
    }

    /// How much more the wallet can pay in the current window.
    pub fn remaining(e: Env, smart_account: Address, context_rule_id: u32) -> i128 {
        match Self::window(e, smart_account, context_rule_id) {
            Some(w) => (w.spending_limit - w.spent).max(0),
            None => 0,
        }
    }

    /// Change the limit (the window length stays). The smart account must authorize it.
    pub fn set_spending_limit(e: Env, smart_account: Address, context_rule_id: u32, spending_limit: i128) {
        smart_account.require_auth();
        if spending_limit <= 0 {
            panic_with_error!(&e, SpendingLimitError::InvalidParams)
        }
        let mut w = load(&e, &smart_account, context_rule_id).unwrap_or_else(|| panic_with_error!(&e, SpendingLimitError::NotInstalled));
        w.spending_limit = spending_limit;
        save(&e, &smart_account, context_rule_id, &w);
        Changed { smart_account, context_rule_id, spending_limit }.publish(&e);
    }
}
