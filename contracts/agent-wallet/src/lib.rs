//! Agent wallet: an OpenZeppelin smart account for AI agents.
//!
//! Deployed with a signer (typically an ed25519 key held by the agent,
//! verified by `scope-ed25519-verifier`) and policies, such as the 402Scope
//! Trust policy and a spending limit, which then run on every payment the
//! wallet authorizes. The owner can add or change rules and policies through
//! the standard `SmartAccount` interface, authorized by the wallet itself.
//!
//! Two shapes:
//! - `token = None`: one Default rule ("agent") for the agent's signers. Its
//!   policies run on every call the wallet authorizes.
//! - `token = Some(t)`: the agent's rule ("payments") covers calls to the
//!   token `t` only, which spending-limit policies require, and `admins`
//!   (if any) get a separate Default rule ("admin") without policies to
//!   manage the wallet. The agent key alone can then do nothing but pay in
//!   `t`, within the limits its policies set.
#![no_std]
use soroban_sdk::{
    auth::{Context, CustomAccountInterface},
    contract, contractimpl,
    crypto::Hash,
    Address, BytesN, Env, Map, String, Val, Vec,
};
#[allow(unused_imports)]
use stellar_accounts::smart_account::{self, AuthDigestPreimage, AuthPayload, ContextRule, ContextRuleType, Signer, SmartAccount, SmartAccountError};

#[contract]
pub struct AgentWallet;

#[contractimpl]
impl AgentWallet {
    /// The agent's rule (id 0) with the given signers and policies (policy
    /// contract address -> its install parameters), scoped to `token` when
    /// set; then, if `admins` is not empty, an "admin" rule (id 1).
    pub fn __constructor(e: &Env, signers: Vec<Signer>, policies: Map<Address, Val>, token: Option<Address>, admins: Vec<Signer>) {
        match token {
            None => {
                smart_account::add_context_rule(e, &ContextRuleType::Default, &String::from_str(e, "agent"), None, &signers, &policies);
            }
            Some(t) => {
                smart_account::add_context_rule(e, &ContextRuleType::CallContract(t), &String::from_str(e, "payments"), None, &signers, &policies);
            }
        }
        if !admins.is_empty() {
            smart_account::add_context_rule(e, &ContextRuleType::Default, &String::from_str(e, "admin"), None, &admins, &Map::new(e));
        }
    }
}

#[contractimpl]
impl CustomAccountInterface for AgentWallet {
    type Error = SmartAccountError;
    type Signature = AuthPayload;

    fn __check_auth(e: Env, signature_payload: Hash<32>, signatures: AuthPayload, auth_contexts: Vec<Context>) -> Result<(), Self::Error> {
        smart_account::do_check_auth(&e, &signature_payload, &signatures, &auth_contexts)
    }
}

#[contractimpl(contracttrait)]
impl SmartAccount for AgentWallet {}

#[cfg(test)]
mod test;
