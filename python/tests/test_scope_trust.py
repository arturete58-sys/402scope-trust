"""Cross-language tests: vectors.json is written by the TypeScript package (scripts/py-vectors.mjs)."""
import json
import pathlib

from stellar_sdk import scval

from scope_trust import build_root, decode_receipt, evidence_leaf, proof_for, sign_receipt, verify_proof, verify_receipt
from scope_trust.chain import _native
from scope_trust.receipts import encode_receipt

V = json.loads((pathlib.Path(__file__).parent / "vectors.json").read_text())


def test_typescript_receipt_v2_verifies():
    r = decode_receipt(V["receipts"]["v2"])
    assert verify_receipt(r, V["paymentHeader"], V["body"], V["signer"]) == "valid"


def test_signer_must_be_the_pay_to():
    r = decode_receipt(V["receipts"]["v2"])
    assert verify_receipt(r, V["paymentHeader"], V["body"], "GB" + "A" * 54) == "unbound"
    assert verify_receipt(r, V["paymentHeader"], V["body"]) == "unbound"


def test_tampering_is_caught():
    r = decode_receipt(V["receipts"]["v2"])
    assert verify_receipt(r, V["paymentHeader"], V["body"] + " ", V["signer"]) == "invalid"
    assert verify_receipt(r, "another payment", V["body"], V["signer"]) == "invalid"
    forged = dict(r, at=r["at"] + 1)
    assert verify_receipt(forged, V["paymentHeader"], V["body"], V["signer"]) == "invalid"
    assert verify_receipt(None, V["paymentHeader"], V["body"], V["signer"]) == "missing"


def test_declaration_is_bound():
    r = decode_receipt(V["receipts"]["v2decl"])
    assert verify_receipt(r, V["paymentHeader"], V["body"], V["signer"], V["declaration"]) == "valid"
    assert verify_receipt(r, V["paymentHeader"], V["body"], V["signer"]) == "invalid"
    assert verify_receipt(r, V["paymentHeader"], V["body"], V["signer"], "eyJvdGhlciI6MX0") == "invalid"


def test_v1_receipts_still_verify():
    r = decode_receipt(V["receipts"]["v1"])
    assert verify_receipt(r, V["paymentHeader"], V["body"], V["signer"]) == "valid"


def test_python_signs_exactly_like_typescript():
    # ed25519 is deterministic: same key and fields give the same signature.
    mine = sign_receipt(V["secret"], V["resource"], V["paymentHeader"], V["body"], at=V["at"])
    assert mine == decode_receipt(V["receipts"]["v2"])
    assert decode_receipt(encode_receipt(mine)) == mine


def test_evidence_matches_typescript():
    leaves = [evidence_leaf(c["transaction"], c["bodyHash"], c["delivered"], c["receipt"]) for c in V["evidence"]["calls"]]
    assert [l.hex() for l in leaves] == V["evidence"]["leaves"]
    root = build_root(leaves)
    assert root.hex() == V["evidence"]["root"]
    proof = proof_for(leaves, 2)
    assert [p.hex() for p in proof] == V["evidence"]["proof2"]
    assert verify_proof(leaves[2], proof, root)
    flipped = evidence_leaf("tx2", "b2", False, "missing")
    assert not verify_proof(flipped, proof, root)


def test_registry_values_decode():
    assert _native(scval.to_bool(True)) is True
    att = scval.to_map({scval.to_symbol("score"): scval.to_uint32(95), scval.to_symbol("evidence"): scval.to_bytes(b"\x01" * 32)})
    out = _native(att)
    assert out["score"] == 95 and out["evidence"] == b"\x01" * 32
