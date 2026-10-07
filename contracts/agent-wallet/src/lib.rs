//! Agent wallet: an OpenZeppelin smart account for AI agents.
//!
//! Deployed with a signer (typically an ed25519 key held by the agent,
//! verified by `scope-ed25519-verifier`) and policies, such as the 402Scope
//! Trust policy, which then run on every payment the wallet authorizes.
//! The owner can add or change rules and policies through the standard
//! `SmartAccount` interface, authorized by the wallet itself.
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
    /// One default rule ("agent") with the given signers and policies
    /// (policy contract address -> its install parameters).
    pub fn __constructor(e: &Env, signers: Vec<Signer>, policies: Map<Address, Val>) {
        smart_account::add_context_rule(e, &ContextRuleType::Default, &String::from_str(e, "agent"), None, &signers, &policies);
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
