# Evidence (`x402-evidence/1`)

Every attestation commits to the paid calls behind its score with a Merkle root, stored onchain in the `evidence` field. Anyone holding the measurement report can check that a call was counted, and counted the way the report says, with one contract call.

## Leaf

One leaf per paid call:

```
leaf = sha256( "x402-evidence/1|" + tx + "|" + bodyHash + "|" + delivered + "|" + receipt )
```

| Field | Value |
| --- | --- |
| `tx` | Settlement transaction hash from `PAYMENT-RESPONSE` (empty if none) |
| `bodyHash` | Hex sha256 of the response body (empty if none) |
| `delivered` | `1` or `0`, as defined in [scoring.md](scoring.md) |
| `receipt` | `valid`, `unbound`, `invalid` or `missing` ([receipts.md](receipts.md)) |

Leaves are ordered by call time, oldest first. For a seller attestation, the calls of all its endpoints are merged and ordered the same way.

## Tree

- Each parent is `sha256(min(a, b) || max(a, b))`: the two children sorted bytewise, so a proof needs no left/right flags.
- A level with an odd number of nodes promotes the last node unchanged.
- A tree with one leaf has that leaf as its root.

Test vector (both implementations): leaves `[0x01;32]`, `[0x02;32]`, `[0x03;32]`, `[0x04;32]` give the root `1d0cafe12ca55e5e8d0903a1847cffae908539b86fee1c52418b2cd453479e7c`.

## Checking onchain

```
verify_seller_evidence(attester, seller, leaf, proof) -> bool
verify_evidence(attester, key, leaf, proof) -> bool
```

`proof` is the list of sibling hashes from the leaf up to the root (at most 32). The contract recomputes the root and compares it with the stored attestation.

In the [latest testnet run](testnet/README.md) a real call verified as `true`, and the same call with its delivery result flipped verified as `false`.

Reference implementation: `src/evidence.ts` (`buildTree`, `proofFor`, `verifyProof`) and `merkle_root` in `contracts/attestations/src/lib.rs`.
