//! WebAuthn (passkey) signature verifier for OpenZeppelin smart accounts:
//! OpenZeppelin's `webauthn` verifier, deployable once and shared by many
//! wallets. With it, a wallet signer can be a passkey (secp256r1 key held by
//! the owner's device, unlocked with a fingerprint or face), for example the
//! owner's "admin" rule of an agent wallet, while the agent pays with its own
//! ed25519 key under the trust policy and the spending limit.
//!
//! Key data: the 65-byte uncompressed public key, followed by the credential
//! id. Signature data: XDR of `WebAuthnSigData { authenticator_data,
//! client_data, signature }`, where the client data's `challenge` is the
//! base64url of the smart account's auth digest.
#![no_std]
use soroban_sdk::{contract, contractimpl, xdr::FromXdr, Bytes, BytesN, Env, Vec};
use stellar_accounts::verifiers::{
    utils::extract_from_bytes,
    webauthn::{self, WebAuthnSigData},
    Verifier,
};

#[contract]
pub struct WebAuthnVerifier;

#[contractimpl]
impl Verifier for WebAuthnVerifier {
    type KeyData = Bytes;
    type SigData = Bytes;

    fn verify(e: &Env, signature_payload: Bytes, key_data: Bytes, sig_data: Bytes) -> bool {
        let sig = WebAuthnSigData::from_xdr(e, &sig_data).expect("WebAuthnSigData with correct format");
        let pub_key: BytesN<65> = extract_from_bytes(e, &key_data, 0..65).expect("65-byte public key to be extracted");
        webauthn::verify(e, &signature_payload, &pub_key, &sig)
    }

    fn canonicalize_key(e: &Env, key_data: Bytes) -> Bytes {
        webauthn::canonicalize_key(e, &key_data)
    }

    fn batch_canonicalize_key(e: &Env, keys_data: Vec<Bytes>) -> Vec<Bytes> {
        webauthn::batch_canonicalize_key(e, &keys_data)
    }
}
