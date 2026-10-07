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
//!
//! It also keeps payment costs flat. OpenZeppelin's policy appends every
//! payment to a list, so each payment grows the stored entry and pays rent
//! on the growth (and extends its TTL). Here the window is a fixed ring of
//! 25 buckets of `ceil(period / 24)` ledgers each: the entry never grows, and
//! a payment only rewrites it. The window counted is the last `period`
//! ledgers plus at most one bucket, so the limit is never looser than
//! OpenZeppelin's, at most 1/24 of a period stricter. Payments never extend
//! the entry's TTL; anyone can with `extend` (the owner, or a keeper). If it
//! ever expires, payments fail closed until it is restored.
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
/// Buckets per period; the ring holds one more, so it always covers a full period.
pub const BUCKETS: u32 = 24;
const SLOTS: u32 = BUCKETS + 1;

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
    /// Unused (kept so error codes stay stable).
    Reserved = 3305,
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

/// The limit and the ring of buckets. Constant size: payments rewrite it, never grow it.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingWindow {
    pub spending_limit: i128,
    pub period_ledgers: u32,
    /// Amount paid per bucket, indexed by (ledger / bucket length) mod 25.
    pub buckets: Vec<i128>,
    /// Bucket index (ledger / bucket length) of the latest update.
    pub last_bucket: u32,
}

/// What `window` returns: the limit, the window and what was paid in it.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingStatus {
    pub spending_limit: i128,
    pub period_ledgers: u32,
    pub spent: i128,
    pub remaining: i128,
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
    e.storage().persistent().set(&Key::Window(account.clone(), rule_id), w);
}

fn extend(e: &Env, account: &Address, rule_id: u32) {
    e.storage().persistent().extend_ttl(&Key::Window(account.clone(), rule_id), EXTEND_BELOW, EXTEND_TO);
}

fn bucket_len(w: &SpendingWindow) -> u32 {
    w.period_ledgers.div_ceil(BUCKETS).max(1)
}

/// Brings the ring up to `now`: empties the buckets that left the window.
fn roll(w: &mut SpendingWindow, now: u32) {
    let current = now / bucket_len(w);
    if current <= w.last_bucket {
        return;
    }
    let steps = current - w.last_bucket;
    if steps >= SLOTS {
        for i in 0..SLOTS {
            w.buckets.set(i, 0);
        }
    } else {
        for b in (w.last_bucket + 1)..=current {
            w.buckets.set(b % SLOTS, 0);
        }
    }
    w.last_bucket = current;
}

fn spent(w: &SpendingWindow) -> i128 {
    w.buckets.iter().sum()
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
        if spent(&w) + amount > w.spending_limit {
            panic_with_error!(e, SpendingLimitError::LimitExceeded)
        }
        let slot = w.last_bucket % SLOTS;
        w.buckets.set(slot, w.buckets.get(slot).unwrap_or(0) + amount);
        save(e, &smart_account, context_rule.id, &w);
        // No event and no TTL extension here: see the module docs (x402 facilitators
        // accept only the transfer event, and a payment's fee should stay flat).
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
        let mut buckets = Vec::new(e);
        for _ in 0..SLOTS {
            buckets.push_back(0i128);
        }
        let mut w = SpendingWindow { spending_limit: install_params.spending_limit, period_ledgers: install_params.period_ledgers, buckets, last_bucket: 0 };
        w.last_bucket = e.ledger().sequence() / bucket_len(&w);
        save(e, &smart_account, context_rule.id, &w);
        extend(e, &smart_account, context_rule.id);
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
    pub fn window(e: Env, smart_account: Address, context_rule_id: u32) -> Option<SpendingStatus> {
        load(&e, &smart_account, context_rule_id).map(|mut w| {
            roll(&mut w, e.ledger().sequence());
            let s = spent(&w);
            SpendingStatus { spending_limit: w.spending_limit, period_ledgers: w.period_ledgers, spent: s, remaining: (w.spending_limit - s).max(0) }
        })
    }

    /// How much more the wallet can pay in the current window.
    pub fn remaining(e: Env, smart_account: Address, context_rule_id: u32) -> i128 {
        Self::window(e, smart_account, context_rule_id).map(|w| w.remaining).unwrap_or(0)
    }

    /// Keeps the wallet's window stored for 30 more days. Anyone may call it
    /// (the caller pays the fee); payments themselves never extend it.
    pub fn extend(e: Env, smart_account: Address, context_rule_id: u32) {
        if load(&e, &smart_account, context_rule_id).is_none() {
            panic_with_error!(&e, SpendingLimitError::NotInstalled)
        }
        extend(&e, &smart_account, context_rule_id);
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
        extend(&e, &smart_account, context_rule_id);
        Changed { smart_account, context_rule_id, spending_limit }.publish(&e);
    }
}
