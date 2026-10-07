# Delivery receipts (`x402-receipt/2`, SEP-53)

x402 proves that a buyer paid. It does not prove what the seller delivered for that payment. A delivery receipt is the seller's signed statement: *for this payment, at this URL, I returned exactly this body.*

Receipts make a seller accountable for what it served, and they give the scoring method something stronger than "the HTTP status was 200". They are optional and add 15 points to a score ([scoring.md](scoring.md)).

## Header

A paid response (2xx) carries:

```
X-402-Receipt: <base64url(JSON)>
```

```json
{
  "v": "x402-receipt/2",
  "resource": "https://api.example.com/paid-data",
  "payment": "<hex sha256 of the PAYMENT-SIGNATURE request header>",
  "body": "<hex sha256 of the response body bytes>",
  "at": 1791360000,
  "decl": "<hex sha256 of the X-402-Declaration header, when the response has one>",
  "signer": "G... (Stellar public key)",
  "sig": "<base64 ed25519 signature>"
}
```

The message is the UTF-8 string

```
x402-receipt/2\n<resource>\n<payment>\n<body>\n<at>
```

followed by `\n<decl>` when the response carried a [declaration](declarations.md). A receipt then binds what the seller stated about the response (its age, source...) as well as the body.

It is signed as a **[SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md) Stellar signed message**: an ed25519 signature by `signer` over `sha256("Stellar Signed Message:\n" + message)`. Any Stellar wallet or SDK that implements SEP-53 can produce or check it (`Keypair.signMessage` / `Keypair.verifyMessage` in `@stellar/stellar-sdk`), and a seller can sign from a wallet that never hands over its secret key (`signReceiptWith`). The SEP-53 prefix also means a receipt signature can never be mistaken for a transaction signature.

Receipts in the earlier `x402-receipt/1` format (raw ed25519 over the message) are still verified.

## Verification

A buyer, or an attester, checks a receipt against the request it sent and the body it received:

| Result | Meaning |
| --- | --- |
| `valid` | The signature checks, `payment` and `body` match, and `signer` is the `payTo` that was paid |
| `unbound` | The signature and hashes check, but the signer is not the `payTo`. It proves nothing about the seller being paid and counts as no receipt |
| `invalid` | Bad signature or a hash mismatch: the seller signed something other than what was delivered, or a declaration was added, removed or changed |
| `missing` | No receipt header |

Only `valid` receipts count. Binding the receipt to the hash of `PAYMENT-SIGNATURE` means it cannot be replayed for another payment; binding it to the body hash means the seller cannot later deny what it returned.

## Relation to the x402 offer-receipt extension

x402 has an official `offer-receipt` extension: a signed receipt that a payment was received for a resource (payer, network, resource, time, optionally the transaction). It does not cover the content. `x402-receipt/2` covers what was delivered: the body hash and the declaration, bound to the exact payment. The two are complementary; a seller can send both.

## For sellers

With Express and `@x402/express`, register the middleware **before** the x402 middleware, so it sees the paid response:

```ts
import { deliveryReceipts } from '402scope-trust';

app.use(deliveryReceipts({ secret: process.env.PAYTO_SECRET! }));
app.use(paymentMiddleware(/* routes, server */));
```

The middleware buffers the body of paid 2xx responses, signs it and adds the header. It never signs unpaid or failed responses. The key must be the one behind the `payTo` address, otherwise receipts verify as `unbound`.

`at` is the signing time in Unix seconds.

Reference implementation and tests: `src/receipts.ts`, `src/test/`. Python: [`python/`](../python) (`verify_receipt`), held to the same test vectors.
