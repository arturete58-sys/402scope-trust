"""x402 delivery receipts, the same format as the TypeScript package (docs/receipts.md)."""
from __future__ import annotations

import base64
import hashlib
import json
import time
from typing import Optional, Union

from stellar_sdk import Keypair
from stellar_sdk.exceptions import BadSignatureError

RECEIPT_HEADER = "X-402-Receipt"
RECEIPT_VERSION = "x402-receipt/2"  # SEP-53 Stellar signed message
RECEIPT_VERSION_1 = "x402-receipt/1"  # raw ed25519, still verified
RECEIPT_VERSION_3 = "x402-receipt/3"  # checkable onchain by the refund bond contract
NO_AGE = 0xFFFFFFFF

Bytes = Union[bytes, str]


def _b(x: Bytes) -> bytes:
    return x.encode("utf-8") if isinstance(x, str) else x


def sha256hex(x: Bytes) -> str:
    return hashlib.sha256(_b(x)).hexdigest()


def receipt_message(r: dict) -> bytes:
    """The exact message the seller signs."""
    msg = f"{r.get('v', RECEIPT_VERSION)}\n{r['resource']}\n{r['payment']}\n{r['body']}\n{r['at']}"
    if r.get("decl"):
        msg += f"\n{r['decl']}"
    return msg.encode("utf-8")


def receipt_struct_xdr(r: dict) -> bytes:
    """XDR of the refund bond contract's Receipt struct (Soroban sorts struct fields by name)."""
    from stellar_sdk import scval

    age = NO_AGE if r.get("age") is None else int(r["age"])
    fields = {
        "age": scval.to_uint32(age),
        "amount": scval.to_int128(int(r.get("amount", 0))),
        "asset": scval.to_address(r["asset"]),
        "at": scval.to_uint64(int(r["at"])),
        "body": scval.to_bytes(bytes.fromhex(r["body"])),
        "decl": scval.to_bytes(bytes.fromhex(r.get("decl") or "0" * 64)),
        "max_age": scval.to_uint32(int(r.get("maxAge") or 0)),
        "pay_to": scval.to_address(r["payTo"]),
        "payer": scval.to_address(r["payer"]),
        "payment": scval.to_bytes(bytes.fromhex(r["payment"])),
        "resource": scval.to_bytes(hashlib.sha256(r["resource"].encode("utf-8")).digest()),
        "unusable": scval.to_bool(bool(r.get("unusable"))),
    }
    return scval.to_map({scval.to_symbol(k): fields[k] for k in sorted(fields)}).to_xdr_bytes()


def receipt_message_v3(r: dict) -> bytes:
    return f"{RECEIPT_VERSION_3}\n{hashlib.sha256(receipt_struct_xdr(r)).hexdigest()}".encode("utf-8")


def receipt_shows_breach(r: dict) -> bool:
    """The refund bond contract's rule: the seller broke its own terms."""
    if r.get("v") != RECEIPT_VERSION_3:
        return False
    age = NO_AGE if r.get("age") is None else int(r["age"])
    max_age = int(r.get("maxAge") or 0)
    return bool(r.get("unusable")) or (max_age > 0 and age != NO_AGE and age > max_age)


def decode_receipt(header: Optional[str]) -> Optional[dict]:
    """Parses the base64url JSON of an X-402-Receipt header; None if absent or not a receipt."""
    if not header:
        return None
    try:
        pad = "=" * (-len(header) % 4)
        r = json.loads(base64.urlsafe_b64decode(header + pad))
    except Exception:
        return None
    return r if isinstance(r, dict) and r.get("v") in (RECEIPT_VERSION, RECEIPT_VERSION_1, RECEIPT_VERSION_3) else None


def encode_receipt(r: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(r, separators=(",", ":")).encode()).decode().rstrip("=")


def sign_receipt(secret: str, resource: str, payment_header: str, body: Bytes, at: Optional[int] = None, declaration: Optional[str] = None) -> dict:
    """Signs a receipt as a seller (x402-receipt/2). The key should be the payTo's."""
    kp = Keypair.from_secret(secret)
    r = {"v": RECEIPT_VERSION, "resource": resource, "payment": sha256hex(payment_header), "body": sha256hex(body), "at": int(at if at is not None else time.time())}
    if declaration:
        r["decl"] = sha256hex(declaration)
    r["signer"] = kp.public_key
    r["sig"] = base64.b64encode(kp.sign_message(receipt_message(r))).decode()
    return r


def verify_receipt(r: Optional[dict], payment_header: str, body: Bytes, pay_to: Optional[str] = None, declaration: Optional[str] = None) -> str:
    """'valid' | 'unbound' | 'invalid' | 'missing', as in docs/receipts.md.

    valid: signature and hashes check and the signer is the payTo you paid;
    unbound: they check but the signer is someone else; invalid: they do not.
    """
    if not r:
        return "missing"
    try:
        if r["payment"] != sha256hex(payment_header) or r["body"] != sha256hex(body):
            return "invalid"
        if r.get("decl") != (sha256hex(declaration) if declaration else None):
            return "invalid"
        kp = Keypair.from_public_key(r["signer"])
        sig = base64.b64decode(r["sig"])
        msg = receipt_message_v3(r) if r["v"] == RECEIPT_VERSION_3 else receipt_message(r)
        if r["v"] == RECEIPT_VERSION_1:
            kp.verify(msg, sig)
        else:
            kp.verify_message(msg, sig)
    except (BadSignatureError, KeyError, ValueError, TypeError):
        return "invalid"
    except Exception:
        return "invalid"
    return "valid" if pay_to and pay_to == r["signer"] else "unbound"
