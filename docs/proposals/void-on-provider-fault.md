# Proposal: void a prepaid charge before settlement when the seller breaks its own declaration

Status: draft for discussion with Fermah Pay. Not implemented by either side.

## The gap

In a prepaid ledger the buyer is protected against being charged without its signature and against being charged twice. It is not protected against paying for a response that breaks what the seller itself declared: stale data served as live, a missing field the seller promised, a response the seller marks as unusable. Today that charge settles like any other.

## Why a prepaid ledger can fix it cheaply

A charge is admitted at `/settle` and moves on-chain in a later batch, within a settlement window (by default 720 ledgers, about an hour). A charge that cannot settle in that window is already refunded to the buyer's available balance. A charge that the seller's own evidence shows was not delivered could take the same path, before it ever reaches the chain. Nothing on-chain changes.

## Evidence, signed by the seller

The seller already signs what it delivered, per paid response:

- `X-402-Declaration`: what the seller states about this response (age, source, whether it is established), in the [x402-declarations](https://github.com/arturete58-sys/x402-declarations) vocabulary, against the terms it published in the 402 challenge (`extensions.declarations`).
- `X-402-Receipt` (`x402-receipt/2`): a SEP-53 signature by the seller over the payment header, the body hash and the declaration hash ([format](../receipts.md)).

From those two, anyone can decide offline, with no trust in the buyer, whether the seller broke its own terms (`providerAtFault` with basis `at-source` or `declared`). A buyer cannot fabricate this: the evidence is the seller's signature.

## The flow

1. The buyer receives the response, checks it (`checkDelivery`), and finds the seller at fault.
2. Within the settlement window, the buyer (or its agent) calls the gateway, e.g. `POST /settlements/{commitment}/void`, with the receipt, the declaration header and the body.
3. The gateway verifies: the receipt's payment hash matches the commitment's payment header; the signer is the ledger's `seller` role; the body and declaration hashes match; the declaration breaks the terms with basis `at-source` or `declared`.
4. If all hold and the charge is still admitted (not batched), the gateway refunds it to the buyer's available balance, as it does for an expired charge, and records why.
5. Heuristic findings, a missing receipt or a charge already on-chain are not voided; they remain a reason to sell-and-warn or hold the seller next time.

## What each side gets

- Buyers and agents: a refund path that needs no dispute and no human, for the one class of failure that can be proven.
- Sellers: unaffected while they keep their own terms; a seller that does not publish terms is never voided, only scored.
- The ledger operator: one extra state transition on charges it already holds, no contract change, and an audit trail.
- 402Scope: counts voids per seller as a measured fault, published with the same bounds as every other rate.

## Open questions

- Should the seller be able to contest within the window (e.g. a clock-skew allowance on `ageSeconds`)?
- Rate of voids above which the operator suspends a seller deployment.
- Whether the `onBreach: "refund"` term in the declaration should be required for a seller to be voidable.
