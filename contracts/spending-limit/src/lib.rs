//! Spending limit policy for agent wallets: OpenZeppelin's audited
//! `spending_limit` module, deployed as its own policy contract.
//!
//! Installed next to the 402Scope Trust policy on the same context rule, it
//! gives an agent two independent limits on every x402 payment: *who* it may
//! pay (the trust policy: sellers the chosen attesters trust) and *how much*
//! (this policy: at most `spending_limit` in any rolling window of
//! `period_ledgers`). Both run inside the wallet's `__check_auth`, so a
//! compromised or buggy agent cannot go around either one.
//!
//! The OpenZeppelin module only accepts `CallContract(token)` rules, so the
//! agent wallet scopes its payment rule to one token when this policy is used.
#![no_std]
use soroban_sdk::{auth::Context, contract, contractimpl, Address, Env, Vec};
use stellar_accounts::{
    policies::{spending_limit, Policy},
    smart_account::{ContextRule, Signer},
};

pub use stellar_accounts::policies::spending_limit::{SpendingLimitAccountParams, SpendingLimitData};

#[contract]
pub struct SpendingLimitPolicy;

#[contractimpl]
impl Policy for SpendingLimitPolicy {
    type AccountParams = SpendingLimitAccountParams;

    fn enforce(e: &Env, context: Context, authenticated_signers: Vec<Signer>, context_rule: ContextRule, smart_account: Address) {
        spending_limit::enforce(e, &context, &authenticated_signers, &context_rule, &smart_account)
    }

    fn install(e: &Env, install_params: SpendingLimitAccountParams, context_rule: ContextRule, smart_account: Address) {
        spending_limit::install(e, &install_params, &context_rule, &smart_account)
    }

    fn uninstall(e: &Env, context_rule: ContextRule, smart_account: Address) {
        spending_limit::uninstall(e, &context_rule, &smart_account)
    }
}

#[contractimpl]
impl SpendingLimitPolicy {
    /// The limit, the window and what was spent in it, for one rule of a wallet.
    pub fn get_spending_limit_data(e: Env, context_rule_id: u32, smart_account: Address) -> SpendingLimitData {
        spending_limit::get_spending_limit_data(&e, context_rule_id, &smart_account)
    }

    /// Change the limit. The smart account must authorize it.
    pub fn set_spending_limit(e: Env, spending_limit: i128, context_rule: ContextRule, smart_account: Address) {
        spending_limit::set_spending_limit(&e, spending_limit, &context_rule, &smart_account)
    }
}
