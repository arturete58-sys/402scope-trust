# Attestation registry (v2)

`contracts/attestations` is a Soroban contract where independent **attesters** publish scores for x402 endpoints and sellers on Stellar. Anyone can read them. Only attesters that have locked a bond can write, and a bond can be slashed.

v1 had a single signer chosen by the admin. v2 opens the role: anyone who locks the minimum bond can attest, and each wallet decides which attesters it trusts and how many must agree (its quorum).

## Attesters and bonds

| Function | Who | Effect |
| --- | --- | --- |
| `register(attester, amount)` | attester | Transfers `amount` of the bond token into the contract; the total bond must reach `min_bond`. Call it again to top up or to come back after a slash |
| `start_unbond(attester)` | attester | Stops attesting; the bond can be withdrawn after `unbond_ledgers` |
| `withdraw(attester)` | attester | Returns what is left of the bond once the unbonding period is over |
| `slash(attester, amount, to)` | admin | Moves part of a bond to `to` (for example the agent that was misled). Below `min_bond` the attester is deactivated and its attestations stop counting |
| `attester(addr)` | anyone | Bond, active flag, unbonding ledger |

A bond stays slashable during unbonding, so an attester cannot publish a false score and leave at once. Constructor: `__constructor(admin, bond_token, min_bond, unbond_ledgers)`.

The admin can only slash, rotate itself (`set_admin`) and change the bond rules (`set_bond_rules`). It cannot write, edit or delete anyone's attestation. Before mainnet, slashing moves from a single admin to a dispute process; see the SCF proposal.

## Endpoint attestation

Key: `sha256(payTo + "|" + normalizedUrl)`, 32 bytes. `normalizedUrl`: lowercase scheme and host, default port removed, fragment removed, trailing slash removed from the path (except the root), query kept as given. Reference: `src/key.ts`.

| Field | Type | Meaning |
| --- | --- | --- |
| `score` | u32 | 0 to 100, see [scoring.md](scoring.md) |
| `calls` | u32 | Paid calls in the measurement window |
| `delivered` | u32 | Paid calls that delivered (never more than `calls`) |
| `price_ok` | bool | Every settled call charged the declared amount |
| `p50_ms` | u32 | Median paid-call latency in milliseconds |
| `measured_at` | u64 | Unix time of the last measurement; must not go backwards |
| `expires_ledger` | u32 | Do not rely on the attestation from this ledger on |
| `method` | u32 | Scoring method version |
| `evidence` | BytesN<32> | Merkle root of the paid calls behind the score ([evidence.md](evidence.md)) |

## Seller attestation

Key: the seller's `payTo` address.

| Field | Type | Meaning |
| --- | --- | --- |
| `score` | u32 | Call-weighted average of its endpoint scores |
| `endpoints` | u32 | Endpoints measured |
| `calls`, `delivered`, `receipts` | u32 | Summed over its endpoints; `delivered` and `receipts` never exceed `calls` |
| `measured_at`, `expires_ledger`, `method`, `evidence` | | As above |

## Writing and reading

| Function | Who | Effect |
| --- | --- | --- |
| `attest(attester, key, att)` | active attester | Store or replace its own endpoint attestation |
| `attest_seller(attester, seller, att)` | active attester | Store or replace its own seller attestation |
| `get(attester, key)` / `get_seller(attester, seller)` | anyone | The stored attestation, expired or not |
| `is_trusted(attester, key, min_score)` / `is_trusted_seller(attester, seller, min_score)` | anyone | `true` only if the attester is active, the attestation is current and `score >= min_score` |
| `count_trusted(seller, attesters, min_score)` | anyone | How many of the given attesters trust the seller |
| `trusted_by(seller, attesters, min_score, quorum)` | anyone | At least `quorum` of them do (`quorum` 0 is always false). This is what the [trust policy](agent-wallet.md) calls |
| `verify_evidence(attester, key, leaf, proof)` / `verify_seller_evidence(attester, seller, leaf, proof)` | anyone | Whether `leaf` is in the attestation's evidence tree (proofs up to 32 steps) |
| `extend_seller(attester, seller)` | anyone | Pay rent to keep a seller attestation readable until it expires |

Writes are rejected when the score is over 100, counts are inconsistent, the expiry is in the past, or `measured_at` is older than the stored one.

Errors: `InvalidAttestation`=1, `AlreadyExpired`=2, `NotFound`=3, `Stale`=4, `BondTooLow`=5, `NotAttester`=6, `StillBonded`=7, `InvalidAmount`=8, `ProofTooLong`=9.

Events (topic `scope`): `registered`, `unbonding`, `withdrawn`, `slashed`, `attest`, `seller`.

## Storage and rent

Attestations are persistent entries kept alive until `expires_ledger` plus 7 days, capped at the network maximum TTL. Configuration lives in instance storage, extended by 30 days on each write.
