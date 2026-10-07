"""402Scope Trust for Python: check what an x402 seller delivered and what attesters say about it.

- ``verify_receipt``: an ``X-402-Receipt`` (x402-receipt/2, a SEP-53 Stellar
  signed message; x402-receipt/1 still verified) against the payment you sent
  and the body you received.
- ``verify_proof`` / ``evidence_leaf``: a piece of evidence against the Merkle
  root an attester wrote onchain.
- ``Registry``: read the attestation contract on Stellar (``trusted_by``,
  ``get_seller``...) by simulation, without a funded account.
- ``decision``: the observatory's sell / sell_and_warn / hold verdict.
"""
from .receipts import RECEIPT_HEADER, RECEIPT_VERSION, RECEIPT_VERSION_1, decode_receipt, receipt_message, sign_receipt, verify_receipt
from .evidence import build_root, evidence_leaf, proof_for, verify_proof
from .chain import Registry
from .observatory import decision

__all__ = [
    "RECEIPT_HEADER", "RECEIPT_VERSION", "RECEIPT_VERSION_1", "decode_receipt", "receipt_message", "sign_receipt", "verify_receipt",
    "build_root", "evidence_leaf", "proof_for", "verify_proof", "Registry", "decision",
]
