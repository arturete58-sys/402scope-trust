# Automatic refunds (optional)

x402 proves that a buyer paid. 402Scope's receipts prove what the seller delivered. A refund bond closes the loop: when a paid response breaks the terms the seller itself published, the buyer gets its money back on Stellar, in one transaction, with no dispute and nobody deciding.

It is **optional**: a seller that does not lock a bond is unaffected, and is still measured and scored like any other.

## How it works

1. **The seller opts in.** It locks a bond (for example 20 USDC) in the refund bond contract, under the key it signs receipts with, and adds `refund: { contract, network }` to the delivery terms in its 402 challenge.
2. **Each paid response carries an `x402-receipt/3`**: the seller's SEP-53 signature over the payment, the body, the payer, the amount, the age of the data it declared and the maximum age it promised (or that it marked the response unusable).
3. **If the receipt shows a breach** (declared age above the promised maximum, or a response the seller marked unusable), the buyer's client submits it to the contract. The contract checks the seller's signature and the rule, and transfers the amount from the bond to the payer, in the same transaction.

Anyone may submit a claim (the buyer, its agent, a facilitator or a relayer), but the refund always goes to the payer named in the seller's receipt. Each payment can be refunded once, within the claim window.

## Who controls the money

Nobody. The contract has no admin and no upgrade:

- money leaves a bond only to its owner, after a notice period (claims are still paid during it, so a seller cannot run with the bond after a bad response), or to a payer whose claim the seller's own signature proves;
- the rule is fixed and reads only fields the seller signed;
- 402Scope publishes the code and counts refunds in its fault rates. It holds no funds and decides no refunds.

## What it covers, and what it does not

| Covered | Not covered |
| --- | --- |
| Data older than the maximum age the seller promised | A response that never arrived (no receipt to prove it) |
| A response the seller declared unusable, or that contradicts its published terms | Quality the seller never declared |
| Partial refund when the bond is smaller than the amount | Sellers without a bond |

A seller could stop signing receipts when a response is bad. Then there is nothing to claim, but the missing receipts count against its score and agents can refuse sellers without them (`scopeFetch` with a check). [Escrow](escrow.md) closes that gap: the payment is held until delivery is shown.

## Use it

**Seller**

```ts
import { scopeSeller } from '402scope-trust/seller';

const scope = scopeSeller({
  secret: PAYTO_SECRET,
  terms: { version: 1, freshness: { maxAgeSeconds: 60 }, perResponse: true },
  refund: { contract: REFUND_BOND, rpcUrl, networkPassphrase }, // optional
});
app.use(...scope.middleware);                     // before the x402 middleware
routes['GET /quote'] = { accepts, extensions: scope.extensions };
await scope.bond!.deposit(ownerKeypair, PAYTO, USDC, 200_000_000n); // 20 USDC
```

**Buyer or agent**

```ts
import { scopeFetch } from '402scope-trust/buyer';

const pay = scopeFetch({ client: myX402Client, refunds: { submitter: agentKeypair }, onReport: console.log });
const res = await pay('https://api.example.com/quote'); // refunded automatically if the seller broke its terms
```

**Facilitator**

```ts
import { scopeFacilitator } from '402scope-trust/facilitator';

const scope = scopeFacilitator(facilitator, { trust: { chain }, refunds: { contract: REFUND_BOND, rpcUrl, networkPassphrase, token: USDC } });
await scope.rank(bazaarItems); // trusted and refund-backed sellers first
```

## Contract

`contracts/refund-bond`: `deposit`, `request_withdraw`, `withdraw`, `claim`, `claim_batch` (up to 50), and reads `bond`, `is_claimed`, `receipt_hash`. Outcomes: `refunded`, `partly_refunded`, `already_claimed`, `no_breach`, `expired`, `no_bond`. A forged receipt fails the transaction, so relayers verify receipts before batching.

The receipt hash is the same in Rust, TypeScript and Python (shared test vector), and the testnet workflow runs the whole flow every day ([report](testnet/README.md#automatic-refunds-optional-seller-bond)).

Before a mainnet deployment: a security review of the contract, and a legal review of offering refunds under the seller's terms.
