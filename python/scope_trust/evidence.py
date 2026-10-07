"""Evidence Merkle trees, byte-for-byte the same as src/evidence.ts and the contract's verify_seller_evidence."""
from __future__ import annotations

import hashlib
from typing import List, Optional


def _sha(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()


def _pair(a: bytes, b: bytes) -> bytes:
    return _sha(a + b) if a <= b else _sha(b + a)


def evidence_leaf(transaction: Optional[str], body_hash: Optional[str], delivered: bool, receipt: Optional[str]) -> bytes:
    """Leaf for one paid call: transaction hash, body hash, delivered, receipt check result."""
    return _sha("|".join(["x402-evidence/1", transaction or "", body_hash or "", "1" if delivered else "0", receipt or "missing"]).encode())


def _levels(leaves: List[bytes]) -> List[List[bytes]]:
    levels = [list(leaves)]
    while len(levels[-1]) > 1:
        cur = levels[-1]
        levels.append([_pair(cur[i], cur[i + 1]) if i + 1 < len(cur) else cur[i] for i in range(0, len(cur), 2)])
    return levels


def build_root(leaves: List[bytes]) -> bytes:
    return _levels(leaves)[-1][0] if leaves else bytes(32)


def proof_for(leaves: List[bytes], index: int) -> List[bytes]:
    proof, i = [], index
    levels = _levels(leaves)
    for level in levels[:-1]:
        sib = i - 1 if i % 2 else i + 1
        if sib < len(level):
            proof.append(level[sib])
        i //= 2
    return proof


def verify_proof(leaf: bytes, proof: List[bytes], root: bytes) -> bool:
    node = leaf
    for sib in proof:
        node = _pair(node, sib)
    return node == root
