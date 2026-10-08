# Escrow (x402 scheme `escrow`)

A refund bond refunds buyers from a seller's deposit. Escrow goes further: the buyer's payment itself is held until delivery is shown, so it also covers a response that never arrived and a seller that stopped signing receipts. Both are optional and can be combined.

## Instant for the buyer, seconds for the seller

The data reaches the buyer at once, exactly as with `exact`. Only the money is held:

| What happens | Who acts | Result | When |
| --- | --- | --- | --- |
| The response is good | The buyer's agent checks it and confirms | Seller paid | Next ledger (about 5 s) |
| The seller's own receipt shows a breach of its terms | The buyer's agent (or anyone) posts it | Buyer refunded | Next ledger |
| The seller posts a receipt with no breach, and its refund bond covers the amount | The seller | Seller paid | Next ledger |
| The seller posts a receipt with no breach, without a covering bond | The seller | Seller paid after the contest window, unless a breach receipt for the same payment appears | Window (e.g. 2 min) |
| Nobody confirms and the seller posts no receipt | Anyone (a facilitator's keeper) | Buyer refunded | After the receipt deadline (e.g. 1 min) |

A seller that signs two contradicting receipts for one payment loses: the breach receipt refunds the buyer, from the escrow before release, or from the seller's refund bond after it.

## The scheme

- Requirements: `scheme: "escrow"`, `payTo` the escrow contract, `extra.seller` the seller's account (G...), `extra.areFeesSponsored: true`.
- Payload: `{ transaction, id }`: a transaction calling `escrow.pay(payer, seller, asset, amount, id)`, signed by the payer (auth entry), and the 32-byte escrow id it chose. The facilitator pays the fee, as with `exact`.
- The seller's receipts (`x402-receipt/3`) carry the escrow id as `payment`, and name the seller as `payTo`. The same receipt is valid in the refund bond contract.

The facilitator verifies that the transaction is exactly that call, for these requirements, signed by the payer (simulation enforces the signatures), under its fee ceiling; then settles it with its own account paying the fee.

## Use it

**Seller**: same route, scheme `escrow`.

```ts
const scope = scopeSeller({ secret, terms, escrow: { contract: ESCROW, rpcUrl, networkPassphrase, postReceipts: true } });
resourceServer.register('stellar:pubnet', scope.escrowScheme!);
routes['GET /quote'] = { accepts: { scheme: 'escrow', network: 'stellar:pubnet', payTo: SELLER, price }, extensions: scope.extensions };
```

With `postReceipts`, the seller posts each receipt after responding, so it is paid even if the buyer never confirms.

**Buyer or agent**

```ts
const pay = scopeFetch({
  client: x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new EscrowStellarClientScheme(agentKey) }] }),
  escrow: { payer: agentKey },   // confirm good deliveries, post breach receipts
});
```

**Facilitator**

```ts
const scope = scopeFacilitator(facilitator, { trust, escrow: { submitter: keeperKey, rpcUrl, networkPassphrase } });
facilitator.register('stellar:pubnet', scope.escrowScheme(facilitatorKey)); // its keeper releases and refunds what is due
```

## Contract

`contracts/escrow`: `pay`, `confirm`, `submit_receipt`, `release`, `expire`, `settle_due` (up to 50), and reads `hold`, `config`, `receipt_hash`. No admin: the receipt deadline, the contest window and the refund bond contract are fixed at deployment. 8 tests, including the same receipt hash as the refund bond.

Before mainnet: a security review, and a legal review of holding buyers' payments in a contract, even one nobody controls.
