# Scoring method v3

A score answers one question for an agent about to pay an x402 endpoint on Stellar: **if I pay, will I get what was declared, at the declared price?**

Scores are out of 100 and built from five parts. Reference implementation: `src/score.ts` (`METHOD_VERSION = 3`).

| Part | Points | How it is measured |
| --- | --- | --- |
| Delivery | 50 | Share of paid calls that were delivered: HTTP 2xx, settled (a `PAYMENT-RESPONSE` with a transaction hash), non-empty body, the content type declared in `resource.mimeType`, and not breaking the seller's own [declaration](declarations.md) |
| Signed receipts | 15 | Share of paid calls that came with a valid [delivery receipt](receipts.md) signed by the `payTo` key, bound to that payment and that body |
| Price | 15 | Every paid call settled at the amount declared in the 402 challenge. With the `exact` scheme the client signs the exact amount, so today this mostly checks that settlement happened; it becomes a real comparison with metered schemes such as `upto` |
| Latency | 10 | Median latency of paid calls: up to 7 s = 10, up to 12 s = 5, slower = 0. Paid latency includes onchain settlement, which x402 servers complete before answering (about one ledger, ~5 s on Stellar) |
| Declaration | 10 | 5 for publishing delivery terms (`extensions.declarations`); 5 for an unpaid 402 challenge that conforms to x402 v2 for Stellar, minus 1 per issue found |

Receipts and terms are optional for sellers. A seller with neither can still reach 80; one with both shows, call by call, that it stands behind what it delivered and what it said about it.

A seller is only held to what it declared itself, at source or in fields an exact x402-declarations adapter reads. Declarations inferred from field names (`heuristic`) are recorded but never count against it.

## Seller score

An attestation is also published per seller (its `payTo` address), because that is what a wallet sees when it signs a payment. The seller score is the average of its endpoint scores weighted by paid calls; calls, deliveries and receipts are summed. Reference: `src/seller.ts`.

## Rules

- **No paid calls, no score.** An endpoint that has only been probed without payment gets `score: null` and the verdict `unknown`.
- **Small samples are flagged.** With fewer than 5 paid calls the score is marked `lowSample`, and the verdict can be at most `caution`.
- **Hard failures override the score.** An endpoint that is unreachable, does not return 402 without payment, returns a 402 without a challenge, or offers no Stellar option gets the verdict `avoid`.
- **Identity is the payment address.** An endpoint score belongs to the pair (payTo, URL); a seller score to the payTo. If an endpoint changes its payTo, its history starts again.
- **Every score has evidence.** Each attestation commits to the Merkle root of the paid calls behind it ([evidence.md](evidence.md)), so anyone can check that a given call was counted, and how.
- **Expiry.** Onchain attestations carry an expiry ledger. Expired means unknown, never good.

## Verdicts

| Verdict | Meaning | Suggested agent behaviour |
| --- | --- | --- |
| `trusted` | Score at or above the agent's threshold, enough paid calls (onchain: the agent's attester quorum agrees) | Pay |
| `caution` | Below the threshold but above 40, or too few paid calls | Ask the user or pay small amounts only |
| `avoid` | Score below 40 or a hard failure | Do not pay |
| `unknown` | Not measured with paid calls yet | Ask the user |

## Changes

- v1: delivery 60, price 20, latency 10, declaration 10.
- v2: 10 points from delivery and 5 from price move to signed receipts.
- v3: a call that breaks the seller's own declaration is not delivered; half of the declaration points reward publishing delivery terms. Attestations record the method version they were computed with.

## Independence

No seller can pay for a score or to change one. The method, every measurement and every attestation are public. Changes to the method get a new version number.
