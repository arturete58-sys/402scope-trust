# Delivery receipts (`x402-receipt/1`)

x402 proves that a buyer paid. It does not prove what the seller delivered for that payment. A delivery receipt is the seller's signed statement: *for this payment, at this URL, I returned exactly this body.*

Receipts make a seller accountable for what it served, and they give the scoring method something stronger than "the HTTP status was 200". They are optional and add 15 points to a score ([scoring.md](scoring.md)).

## Header

A paid response (2xx) carries:

```
X-402-Receipt: <base64url(JSON)>
```

```json
{
  "v": "x402-receipt/1",
  "resource": "https://api.example.com/paid-data",
  "payment": "<hex sha256 of the PAYMENT-SIGNATURE request header>",
  "body": "<hex sha256 of the response body bytes>",
  "at": "2026-10-07T07:40:12.345Z",
  "signer": "G... (Stellar public key)",
  "sig": "<base64 ed25519 signature>"
}
```

The signed message is the UTF-8 string

```
x402-receipt/1\n<resource>\n<payment>\n<body>\n<at>
```

signed with the ed25519 key of `signer`.

## Verification

A buyer, or an attester, checks a receipt against the request it sent and the body it received:

| Result | Meaning |
| --- | --- |
| `valid` | The signature checks, `payment` and `body` match, and `signer` is the `payTo` that was paid |
| `unbound` | The signature and hashes check, but the signer is not the `payTo`. It proves nothing about the seller being paid and counts as no receipt |
| `invalid` | Bad signature or a hash mismatch: the seller signed something other than what was delivered |
| `missing` | No receipt header |

Only `valid` receipts count. Binding the receipt to the hash of `PAYMENT-SIGNATURE` means it cannot be replayed for another payment; binding it to the body hash means the seller cannot later deny what it returned.

## For sellers

With Express and `@x402/express`, register the middleware **before** the x402 middleware, so it sees the paid response:

```ts
import { deliveryReceipts } from '402scope-trust';

app.use(deliveryReceipts({ secret: process.env.PAYTO_SECRET! }));
app.use(paymentMiddleware(/* routes, server */));
```

The middleware buffers the body of paid 2xx responses, signs it and adds the header. It never signs unpaid or failed responses. The key must be the one behind the `payTo` address, otherwise receipts verify as `unbound`.

Reference implementation and tests: `src/receipts.ts`, `src/test/`.
