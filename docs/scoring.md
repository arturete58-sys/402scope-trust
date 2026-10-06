# Scoring method v1

A score answers one question for an agent about to pay an x402 endpoint on Stellar: **if I pay, will I get what was declared, at the declared price?**

Scores are out of 100 and built from four parts.

| Part | Points | How it is measured |
| --- | --- | --- |
| Delivery | 60 | Share of paid calls that were delivered: HTTP 2xx, settled (a `PAYMENT-RESPONSE` with a transaction hash), non-empty body, and the content type declared in `resource.mimeType` |
| Price | 20 | Every paid call settled at the amount declared in the 402 challenge. With the `exact` scheme the client signs the exact amount, so today this mostly checks that settlement happened; it becomes a real comparison with metered schemes such as `upto` |
| Latency | 10 | Median latency of paid calls: up to 7 s = 10, up to 12 s = 5, slower = 0. Paid latency includes onchain settlement, which x402 servers complete before answering (about one ledger, ~5 s on Stellar) |
| Declaration | 10 | The unpaid 402 challenge conforms to x402 v2 for Stellar; minus 2 per issue found |

## Rules

- **No paid calls, no score.** An endpoint that has only been probed without payment gets `score: null` and the verdict `unknown`.
- **Small samples are flagged.** With fewer than 5 paid calls the score is marked `lowSample`, and the verdict can be at most `caution`.
- **Hard failures override the score.** An endpoint that is unreachable, does not return 402 without payment, returns a 402 without a challenge, or offers no Stellar option gets the verdict `avoid`.
- **Identity is the payment address.** A score belongs to the pair (payTo, URL). If an endpoint changes its payTo, its history starts again.
- **Expiry.** Onchain attestations carry an expiry ledger. Expired means unknown, never good.

## Verdicts

| Verdict | Meaning | Suggested agent behaviour |
| --- | --- | --- |
| `trusted` | Score at or above the agent's threshold, enough paid calls | Pay |
| `caution` | Below the threshold but above 40, or too few paid calls | Ask the user or pay small amounts only |
| `avoid` | Score below 40 or a hard failure | Do not pay |
| `unknown` | Not measured with paid calls yet | Ask the user |

## Independence

No seller can pay for a score or to change one. The method, every measurement and every attestation are public. Changes to the method get a new version number; attestations record the version they were computed with.
