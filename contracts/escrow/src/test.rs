extern crate std;
use super::*;
use ed25519_dalek::{Signer as _, SigningKey};
use scope_refund_bond::{RefundBond, RefundBondClient};
use sha2::{Digest, Sha256};
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec, xdr,
};

const NOW: u64 = 1_800_000_000;
const DEADLINE: u64 = 60;
const WINDOW: u64 = 120;
const PRICE: i128 = 10;

struct World {
    e: Env,
    c: EscrowClient<'static>,
    bond: RefundBondClient<'static>,
    token: Address,
    payer: Address,
    seller: Address,
    key: SigningKey,
}

fn account(e: &Env, key: &SigningKey) -> Address {
    Address::from_str(e, &stellar_strkey::ed25519::PublicKey(key.verifying_key().to_bytes()).to_string())
}

fn add_entry(e: &Env, key: xdr::LedgerKey, data: xdr::LedgerEntryData) {
    let entry = xdr::LedgerEntry { data, last_modified_ledger_seq: 0, ext: xdr::LedgerEntryExt::V0 };
    e.host().add_ledger_entry(&std::rc::Rc::new(key), &std::rc::Rc::new(entry), None).unwrap();
}

fn add_trustline(e: &Env, a: &Address, asset: &xdr::Asset) {
    let account_id = match xdr::ScAddress::from(a) {
        xdr::ScAddress::Account(id) => id,
        _ => panic!("not an account"),
    };
    add_entry(e, xdr::LedgerKey::Account(xdr::LedgerKeyAccount { account_id: account_id.clone() }), xdr::LedgerEntryData::Account(xdr::AccountEntry {
        account_id: account_id.clone(), balance: 0, flags: 0, home_domain: Default::default(), inflation_dest: None, num_sub_entries: 0,
        seq_num: xdr::SequenceNumber(0), thresholds: xdr::Thresholds([1; 4]), signers: xdr::VecM::default(), ext: xdr::AccountEntryExt::V0,
    }));
    let tl = match asset.clone() {
        xdr::Asset::CreditAlphanum4(x) => xdr::TrustLineAsset::CreditAlphanum4(x),
        xdr::Asset::CreditAlphanum12(x) => xdr::TrustLineAsset::CreditAlphanum12(x),
        xdr::Asset::Native => xdr::TrustLineAsset::Native,
    };
    add_entry(e, xdr::LedgerKey::Trustline(xdr::LedgerKeyTrustLine { account_id: account_id.clone(), asset: tl.clone() }), xdr::LedgerEntryData::Trustline(xdr::TrustLineEntry {
        account_id, asset: tl, balance: 0, limit: i64::MAX, flags: xdr::TrustLineFlags::AuthorizedFlag as u32, ext: xdr::TrustLineEntryExt::V0,
    }));
}

fn world() -> World {
    let e = Env::default();
    e.mock_all_auths();
    e.ledger().set_timestamp(NOW);
    e.ledger().set_sequence_number(1_000);
    let sac = e.register_stellar_asset_contract_v2(Address::generate(&e));
    let sac_asset = sac.asset();
    let token = sac.address();
    let bond = RefundBondClient::new(&e, &e.register(RefundBond, (100u32, 3_600u64)));
    let c = EscrowClient::new(&e, &e.register(Escrow, (DEADLINE, WINDOW, Some(bond.address.clone()))));
    let payer = Address::generate(&e);
    StellarAssetClient::new(&e, &token).mint(&payer, &1_000);
    let key = SigningKey::from_bytes(&[11u8; 32]);
    let seller = account(&e, &key);
    // A G account needs an account entry and a trustline to hold a Stellar asset.
    add_trustline(&e, &seller, &sac_asset);
    World { e, c, bond, token, payer, seller, key }
}

fn id(w: &World, n: u8) -> BytesN<32> {
    BytesN::from_array(&w.e, &[n; 32])
}

fn pay(w: &World, n: u8) -> BytesN<32> {
    let i = id(w, n);
    w.c.pay(&w.payer, &w.seller, &w.token, &PRICE, &i);
    i
}

fn receipt(w: &World, n: u8, age: u32) -> Receipt {
    let e = &w.e;
    Receipt {
        resource: BytesN::from_array(e, &[1; 32]),
        payment: id(w, n),
        body: BytesN::from_array(e, &[3; 32]),
        decl: BytesN::from_array(e, &[0; 32]),
        at: NOW,
        payer: w.payer.clone(),
        pay_to: w.seller.clone(),
        asset: w.token.clone(),
        amount: PRICE,
        age,
        max_age: 60,
        unusable: false,
    }
}

/// SEP-53 over "x402-receipt/3\n" + hex(sha256(XDR)), computed independently of the contract.
fn sign(w: &World, r: &Receipt, key: &SigningKey) -> BytesN<64> {
    let xdr = r.clone().to_xdr(&w.e);
    let mut buf = std::vec::Vec::new();
    for b in xdr.iter() {
        buf.push(b);
    }
    let mut msg = std::string::String::from("Stellar Signed Message:\nx402-receipt/3\n");
    for b in Sha256::digest(&buf).iter() {
        msg.push_str(&std::format!("{:02x}", b));
    }
    BytesN::from_array(&w.e, &key.sign(&Sha256::digest(msg.as_bytes())).to_bytes())
}

fn bal(w: &World, a: &Address) -> i128 {
    TokenClient::new(&w.e, &w.token).balance(a)
}

#[test]
fn the_buyer_confirms_and_the_seller_is_paid_at_once() {
    let w = world();
    let i = pay(&w, 1);
    assert_eq!(bal(&w, &w.payer), 990);
    assert_eq!(bal(&w, &w.c.address), PRICE);
    w.c.confirm(&i);
    assert_eq!(bal(&w, &w.seller), PRICE);
    assert_eq!(w.c.hold(&i).unwrap().status, Status::Released);
    assert!(w.c.try_confirm(&i).is_err());
}

#[test]
fn a_breach_receipt_refunds_the_payer_at_once() {
    let w = world();
    let i = pay(&w, 2);
    let r = receipt(&w, 2, 1_200);
    assert_eq!(w.c.submit_receipt(&i, &r, &sign(&w, &r, &w.key)), Status::Refunded);
    assert_eq!(bal(&w, &w.payer), 1_000);
    assert_eq!(bal(&w, &w.seller), 0);
}

#[test]
fn an_unbonded_seller_is_paid_after_the_window_unless_contested() {
    let w = world();
    let i = pay(&w, 3);
    let ok = receipt(&w, 3, 5);
    assert_eq!(w.c.submit_receipt(&i, &ok, &sign(&w, &ok, &w.key)), Status::Delivered);
    assert!(w.c.try_release(&i).is_err());
    w.e.ledger().set_timestamp(NOW + WINDOW);
    w.c.release(&i);
    assert_eq!(bal(&w, &w.seller), PRICE);

    // Contested: the seller signed a second receipt for the same payment showing the breach.
    let j = pay(&w, 4);
    let ok = receipt(&w, 4, 5);
    w.c.submit_receipt(&j, &ok, &sign(&w, &ok, &w.key));
    let bad = receipt(&w, 4, 1_200);
    assert_eq!(w.c.submit_receipt(&j, &bad, &sign(&w, &bad, &w.key)), Status::Refunded);
    assert_eq!(bal(&w, &w.payer), 990);
}

#[test]
fn a_bonded_seller_is_paid_as_soon_as_it_posts_its_receipt() {
    let w = world();
    let owner = Address::generate(&w.e);
    StellarAssetClient::new(&w.e, &w.token).mint(&owner, &100);
    w.bond.deposit(&owner, &BytesN::from_array(&w.e, &w.key.verifying_key().to_bytes()), &w.token, &100);
    let i = pay(&w, 5);
    let ok = receipt(&w, 5, 5);
    assert_eq!(w.c.submit_receipt(&i, &ok, &sign(&w, &ok, &w.key)), Status::Released);
    assert_eq!(bal(&w, &w.seller), PRICE);
}

#[test]
fn no_receipt_by_the_deadline_refunds_the_payer() {
    let w = world();
    let i = pay(&w, 6);
    assert!(w.c.try_expire(&i).is_err());
    w.e.ledger().set_timestamp(NOW + DEADLINE);
    w.c.expire(&i);
    assert_eq!(bal(&w, &w.payer), 1_000);
}

#[test]
fn receipts_must_be_the_sellers_and_for_this_payment() {
    let w = world();
    let i = pay(&w, 7);
    let r = receipt(&w, 7, 1_200);
    // Signed by someone else.
    assert!(w.c.try_submit_receipt(&i, &r, &sign(&w, &r, &SigningKey::from_bytes(&[12u8; 32]))).is_err());
    // For another payment, or another amount.
    let other = receipt(&w, 8, 1_200);
    assert!(w.c.try_submit_receipt(&i, &other, &sign(&w, &other, &w.key)).is_err());
    let mut more = receipt(&w, 7, 1_200);
    more.amount = 999;
    assert!(w.c.try_submit_receipt(&i, &more, &sign(&w, &more, &w.key)).is_err());
    assert_eq!(bal(&w, &w.payer), 990);
}

#[test]
fn a_keeper_settles_what_is_due() {
    let w = world();
    let a = pay(&w, 9);
    let b = pay(&w, 10);
    let c = pay(&w, 11);
    let ok = receipt(&w, 9, 5);
    w.c.submit_receipt(&a, &ok, &sign(&w, &ok, &w.key));
    w.e.ledger().set_timestamp(NOW + WINDOW);
    w.c.confirm(&c);
    assert_eq!(w.c.settle_due(&vec![&w.e, a.clone(), b.clone(), c.clone()]), vec![&w.e, Status::Released, Status::Refunded, Status::Released]);
    assert_eq!(bal(&w, &w.seller), 2 * PRICE);
    assert_eq!(bal(&w, &w.payer), 1_000 - 2 * PRICE);
}

#[test]
fn the_same_receipt_hash_as_the_refund_bond() {
    let w = world();
    let r = receipt(&w, 1, 1_200);
    let as_bond = scope_refund_bond::Receipt {
        resource: r.resource.clone(), payment: r.payment.clone(), body: r.body.clone(), decl: r.decl.clone(), at: r.at,
        payer: r.payer.clone(), pay_to: r.pay_to.clone(), asset: r.asset.clone(), amount: r.amount, age: r.age, max_age: r.max_age, unusable: r.unusable,
    };
    assert_eq!(w.c.receipt_hash(&r), w.bond.receipt_hash(&as_bond));
}
