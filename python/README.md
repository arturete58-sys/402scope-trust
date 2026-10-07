# scope-trust (Python)

Python verifier for [402Scope Trust](https://github.com/arturete58-sys/402scope-trust): check what an x402 seller on Stellar delivered, and what independent attesters say about it. Same formats as the TypeScript package, held to it by shared test vectors.

```bash
pip install "git+https://github.com/arturete58-sys/402scope-trust#subdirectory=python"
```

## Check a delivery receipt

A seller that signs receipts sends `X-402-Receipt` with each paid response: a [SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md) Stellar signed message over the payment, the body and the seller's declaration ([format](../docs/receipts.md)).

```python
from scope_trust import decode_receipt, verify_receipt

result = verify_receipt(
    decode_receipt(response.headers.get("X-402-Receipt")),
    payment_header=sent_payment_signature,   # the PAYMENT-SIGNATURE header you sent
    body=response.content,                  # the exact bytes you received
    pay_to=requirements["payTo"],           # who you paid
    declaration=response.headers.get("X-402-Declaration"),
)
# "valid" | "unbound" (signed by someone other than payTo) | "invalid" | "missing"
```

## Ask the attesters, onchain

Reads the attestation registry by simulation: no fees and no funded account.

```python
from scope_trust import Registry

registry = Registry("C…")  # testnet by default; pass rpc_url and network_passphrase for mainnet
registry.trusted_by("G…seller", ["G…attester1", "G…attester2"], min_score=80, quorum=2)
registry.get_seller("G…attester1", "G…seller")  # {'score': 98, 'calls': …, 'evidence': b'…', …}
```

The current testnet deployment is in [docs/testnet/latest.json](../docs/testnet/latest.json). The testnet workflow runs this package against each fresh deployment.

## Evidence proofs

```python
from scope_trust import evidence_leaf, verify_proof
leaf = evidence_leaf(tx_hash, body_hash, delivered=True, receipt="valid")
verify_proof(leaf, proof, root)                                     # offline
registry.verify_seller_evidence(attester, seller, leaf, proof)      # by the contract
```

## The observatory's decision

```python
from scope_trust import decision
decision("https://api.example.com/paid")  # sell | sell_and_warn | hold | unknown, with the bound and sample
```

## Command line

```bash
scope-trust-py verify-receipt --receipt "$HDR" --payment "$PAY" --body body.bin --pay-to G…
scope-trust-py trusted-by --contract C… --seller G… --attesters G…,G… --quorum 2
scope-trust-py decision https://api.example.com/paid
```

Tests: `pytest -q tests` (vectors written by the TypeScript package: `node scripts/py-vectors.mjs`).
