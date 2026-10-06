# Attestation format (draft v1)

402Scope Trust publishes one attestation per x402 endpoint in a Soroban contract on Stellar. Anyone can read it; only the signer can write it.

## Key

```
key = sha256( payTo + "|" + normalizedUrl )      32 bytes
```

`normalizedUrl`: lowercase scheme and host, default port removed, fragment removed, trailing slash removed from the path (except the root), query kept as given. Reference implementation: `src/key.ts`.

## Value

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
| `report` | BytesN<32> | sha256 of the full JSON report served at `/v1/endpoints/{key}` |

## Contract interface

| Function | Who | Effect |
| --- | --- | --- |
| `attest(key, att)` | signer | Store or replace; rejects score > 100, `delivered > calls`, past expiry, or an older `measured_at` |
| `get(key)` | anyone | The stored attestation, expired or not |
| `is_trusted(key, min_score)` | anyone | `true` only if current and `score >= min_score` |
| `revoke(key)` | admin | Remove an attestation |
| `set_signer(addr)` / `set_admin(addr)` | admin | Rotate keys |
| `extend(key)` | anyone | Pay rent to keep an attestation readable until it expires |

Events: `["scope","attest", key]` with score and expiry, `["scope","revoke", key]`, `["scope","signer"]`.

## Storage and rent

Attestations are persistent entries kept alive until `expires_ledger` plus 7 days, capped at the network maximum TTL. Admin and signer live in instance storage, extended by 30 days on each write.
