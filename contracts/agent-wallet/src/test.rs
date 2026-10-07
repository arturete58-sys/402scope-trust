extern crate std;
use soroban_sdk::{testutils::Address as _, vec, xdr::ToXdr, Address, BytesN, Env};
use stellar_accounts::smart_account::AuthDigestPreimage;

/// Cross-language test vector: the TypeScript signer (src/smart-account.ts)
/// must produce the same digest for the same inputs.
#[test]
fn auth_digest_test_vector() {
    let e = Env::default();
    let account = Address::from_str(&e, "CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K");
    let pre = AuthDigestPreimage { account, signature_payload: BytesN::from_array(&e, &[7u8; 32]), context_rule_ids: vec![&e, 0u32] };
    let xdr = pre.clone().to_xdr(&e);
    let mut hex = std::string::String::new();
    for b in xdr.iter() { hex.push_str(&std::format!("{:02x}", b)); }
    std::println!("XDR {}", hex);
    let d = pre.digest(&e);
    let mut dh = std::string::String::new();
    for b in d.to_array().iter() { dh.push_str(&std::format!("{:02x}", b)); }
    std::println!("DIGEST {}", dh);
    assert_eq!(dh, "6a9ce79520683bcdd0967da374e1b206090ca458c1fb4a0e2bf737ca2cf74118");
    let _ = Address::generate(&e);
}
