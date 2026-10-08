extern crate std;
use super::*;
use ed25519_dalek::{Signer as _, SigningKey};
use sha2::{Digest, Sha256};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec,
};

const NOTICE: u32 = 100;
const WINDOW: u64 = 3_600;
const NOW: u64 = 1_800_000_000;

struct World {
    e: Env,
    c: RefundBondClient<'static>,
    token: Address,
    owner: Address,
    payer: Address,
    seller: SigningKey,
    key: BytesN<32>,
}

fn world() -> World {
    let e = Env::default();
    e.mock_all_auths();
    e.ledger().set_timestamp(NOW);
    e.ledger().set_sequence_number(1_000);
    let token = e.register_stellar_asset_contract_v2(Address::generate(&e)).address();
    let c = RefundBondClient::new(&e, &e.register(RefundBond, (NOTICE, WINDOW)));
    let owner = Address::generate(&e);
    StellarAssetClient::new(&e, &token).mint(&owner, &1_000);
    let seller = SigningKey::from_bytes(&[5u8; 32]);
    let key = BytesN::from_array(&e, seller.verifying_key().as_bytes());
    let payer = Address::generate(&e);
    World { e, c, token, owner, payer, seller, key }
}

fn receipt(w: &World, n: u8, age: u32, max_age: u32, unusable: bool) -> Receipt {
    let e = &w.e;
    Receipt {
        resource: BytesN::from_array(e, &[1; 32]),
        payment: BytesN::from_array(e, &[n; 32]),
        body: BytesN::from_array(e, &[3; 32]),
        decl: BytesN::from_array(e, &[4; 32]),
        at: NOW,
        payer: w.payer.clone(),
        pay_to: Address::generate(e),
        asset: w.token.clone(),
        amount: 10,
        age,
        max_age,
        unusable,
    }
}

/// Signs as a seller's SDK does, computed here independently of the contract:
/// SEP-53 over "x402-receipt/3\n" + hex(sha256(XDR(receipt))).
fn sign(w: &World, r: &Receipt, key: &SigningKey) -> BytesN<64> {
    let xdr = r.clone().to_xdr(&w.e);
    let mut buf = std::vec::Vec::new();
    for b in xdr.iter() {
        buf.push(b);
    }
    let digest = Sha256::digest(&buf);
    let mut msg = std::string::String::from("Stellar Signed Message:\nx402-receipt/3\n");
    for b in digest.iter() {
        msg.push_str(&std::format!("{:02x}", b));
    }
    let hash = Sha256::digest(msg.as_bytes());
    BytesN::from_array(&w.e, &key.sign(&hash).to_bytes())
}

fn claim(w: &World, r: Receipt) -> Claim {
    let signature = sign(w, &r, &w.seller);
    Claim { key: w.key.clone(), receipt: r, signature }
}

fn bal(w: &World, a: &Address) -> i128 {
    TokenClient::new(&w.e, &w.token).balance(a)
}

#[test]
fn a_stale_response_is_refunded_from_the_bond() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 9, 1_200, 60, false))), Outcome::Refunded);
    assert_eq!(bal(&w, &w.payer), 10);
    assert_eq!(w.c.bond(&w.key, &w.token).unwrap().balance, 90);
    // Once only.
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 9, 1_200, 60, false))), Outcome::AlreadyClaimed);
    assert_eq!(bal(&w, &w.payer), 10);
    assert!(w.c.is_claimed(&BytesN::from_array(&w.e, &[9; 32])));
}

#[test]
fn a_response_declared_unusable_is_refunded() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 7, NO_AGE, 0, true))), Outcome::Refunded);
}

#[test]
fn kept_terms_are_not_refunded() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 1, 30, 60, false))), Outcome::NoBreach);
    // No terms, or no declared age: nothing to hold the seller to.
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 2, 9_999, 0, false))), Outcome::NoBreach);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 3, NO_AGE, 60, false))), Outcome::NoBreach);
    assert_eq!(bal(&w, &w.payer), 0);
}

#[test]
fn a_forged_receipt_is_rejected() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    let r = receipt(&w, 9, 1_200, 60, false);
    let forged = Claim { key: w.key.clone(), receipt: r.clone(), signature: sign(&w, &r, &SigningKey::from_bytes(&[6u8; 32])) };
    assert!(w.c.try_claim(&forged).is_err());
    // A receipt changed after signing (a higher amount) is rejected too.
    let mut c = claim(&w, r);
    c.receipt.amount = 90;
    assert!(w.c.try_claim(&c).is_err());
    assert_eq!(bal(&w, &w.payer), 0);
}

#[test]
fn claims_have_a_window() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    let c = claim(&w, receipt(&w, 9, 1_200, 60, false));
    w.e.ledger().set_timestamp(NOW + WINDOW + 1);
    assert_eq!(w.c.claim(&c), Outcome::Expired);
}

#[test]
fn without_a_bond_nothing_is_paid_and_a_small_bond_pays_what_it_has() {
    let w = world();
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 9, 1_200, 60, false))), Outcome::NoBond);
    w.c.deposit(&w.owner, &w.key, &w.token, &4);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 8, 1_200, 60, false))), Outcome::PartlyRefunded);
    assert_eq!(bal(&w, &w.payer), 4);
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 7, 1_200, 60, false))), Outcome::NoBond);
}

#[test]
fn withdrawing_needs_notice_and_claims_are_still_paid_meanwhile() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &100);
    w.c.request_withdraw(&w.key, &w.token, &100);
    assert!(w.c.try_withdraw(&w.key, &w.token).is_err());
    // The seller cannot run with the bond: a claim during the notice is paid.
    assert_eq!(w.c.claim(&claim(&w, receipt(&w, 9, 1_200, 60, false))), Outcome::Refunded);
    w.e.ledger().set_sequence_number(1_000 + NOTICE);
    assert_eq!(w.c.withdraw(&w.key, &w.token), 90);
    assert_eq!(bal(&w, &w.owner), 990);
}

#[test]
fn a_key_belongs_to_one_owner() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &10);
    let other = Address::generate(&w.e);
    StellarAssetClient::new(&w.e, &w.token).mint(&other, &10);
    assert!(w.c.try_deposit(&other, &w.key, &w.token, &10).is_err());
}

#[test]
fn claims_in_a_batch() {
    let w = world();
    w.c.deposit(&w.owner, &w.key, &w.token, &25);
    let out = w.c.claim_batch(&vec![
        &w.e,
        claim(&w, receipt(&w, 1, 1_200, 60, false)),
        claim(&w, receipt(&w, 2, 10, 60, false)),
        claim(&w, receipt(&w, 3, NO_AGE, 0, true)),
        claim(&w, receipt(&w, 1, 1_200, 60, false)),
        claim(&w, receipt(&w, 4, 1_200, 60, false)),
    ]);
    assert_eq!(
        out,
        vec![&w.e, Outcome::Refunded, Outcome::NoBreach, Outcome::Refunded, Outcome::AlreadyClaimed, Outcome::PartlyRefunded]
    );
    assert_eq!(bal(&w, &w.payer), 25);
}

/// Cross-language vector: the TypeScript and Python signers must produce this hash.
#[test]
fn receipt_hash_test_vector() {
    let e = Env::default();
    let resource: [u8; 32] = Sha256::digest(b"https://api.example.com/paid").into();
    let r = Receipt {
        resource: BytesN::from_array(&e, &resource),
        payment: BytesN::from_array(&e, &[2; 32]),
        body: BytesN::from_array(&e, &[3; 32]),
        decl: BytesN::from_array(&e, &[0; 32]),
        at: 1_800_000_000,
        payer: Address::from_str(&e, "GD3YDFNZ5XWLBEGSYMKVU645MPEB3W67ORQUUBROZYYAI47KRBJQHF34"),
        pay_to: Address::from_str(&e, "GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN"),
        asset: Address::from_str(&e, "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"),
        amount: 10_000,
        age: 1_200,
        max_age: 60,
        unusable: false,
    };
    let h = signed_hash(&e, &r).to_array();
    let mut s = std::string::String::new();
    for b in h.iter() {
        s.push_str(&std::format!("{:02x}", b));
    }
    std::println!("RECEIPT3 {}", s);
    assert_eq!(s, "9a208ff86120877882e0e34cd68b79ccd86b32a2c73ec9d2acb961b49bbbff8c");
}
