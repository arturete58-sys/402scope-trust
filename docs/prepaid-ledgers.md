# Prepaid sellers (`batch-settlement`)

Some sellers on Stellar are paid from a prepaid balance instead of one transfer per request: the buyer deposits USDC once, signs a commitment per request, and charges settle on-chain in batches. [Fermah Pay](https://github.com/fermah-xyz/fermah-pay-stellar) serves this as the x402 `batch-settlement` scheme ([binding](https://github.com/fermah-xyz/fermah-pay-stellar/blob/main/docs/api/x402.md)).

402Scope Trust handles these sellers like any other:

| Step | What changes for `batch-settlement` | Where |
| --- | --- | --- |
| Unpaid probe | The scheme is recognised. `payTo` must be the seller's ledger contract (C…); there is no fee-sponsoring flag to check | `checkRequirement` in `probe.ts` |
| Paid measurement | `measurePaid(url, { prepaid: true, … })` signs the commitment (SEP-53) from the measurement wallet. It works where that wallet is a buyer of the seller deployment with a prepaid balance; `exact` is preferred when both are offered | `BatchSettlementStellarScheme` in `prepaid.ts` |
| Delivery receipts | The ledger contract cannot sign, so a receipt signed by the ledger's `seller` role (read from `get_config`) counts as `valid` | `receiptSignersFor`, `prepaidSeller` |
| Scores, attestations, trust checks | Unchanged: they are keyed by `payTo`, which is one ledger per seller deployment | |

Commitments and receipts are both SEP-53 Stellar signed messages, so one wallet signs both and one SDK checks both.

The testnet workflow reads the seller role of Fermah's testnet ledger on each run ([report](testnet/README.md#prepaid-ledgers-batch-settlement)).
