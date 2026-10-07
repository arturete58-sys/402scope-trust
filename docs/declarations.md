# Delivery declarations (`extensions.declarations`, v1)

x402 standardised how a seller asks to be paid. It says nothing about what the buyer gets. Across the x402 catalogue, 99.84% of resources declare the shape of their response, but only 11.1% of providers declare anything about its quality (freshness, confidence or provenance), and those that do use six different vocabularies with four different units for age ([x402-declarations](https://github.com/arturete58-sys/x402-declarations)).

This extension gives sellers one vocabulary, carried by x402 itself. It is the normalised schema of x402-declarations, moved from a client-side library to the source:

| Concept | Field |
| --- | --- |
| How old the data is | `freshness.ageSeconds` (always seconds) |
| Whether to rely on it | `freshness.isStale` |
| How it was produced | `freshness.basis`: `live`, `cache`, `snapshot`, `multi-source`, `window` |
| How sure the seller is | `quality.confidence`, `quality.established`, `quality.sampleSize`, `quality.note` |
| Where it comes from | `provenance.source`, `provenance.hash`, `provenance.verifiable`, `provenance.servedFrom` |

Every field is optional. Absence of a declaration is information, not an error.

## 1. Terms, in the 402 challenge

What the seller commits to before the buyer pays. It travels in `extensions.declarations` of the `PAYMENT-REQUIRED` challenge, as `{ info, schema }` like the other x402 extensions.

```json
"extensions": {
  "declarations": {
    "info": {
      "version": 1,
      "freshness": { "maxAgeSeconds": 60, "basis": "live" },
      "provenance": { "source": "EIA-930", "verifiable": true },
      "perResponse": true,
      "onBreach": "refund",
      "refundContact": "https://api.example.com/refunds"
    },
    "schema": { "…": "JSON Schema of info" }
  }
}
```

| Field | Meaning |
| --- | --- |
| `version` | `1` |
| `freshness.maxAgeSeconds` | No response is older than this |
| `freshness.basis` | How responses are produced |
| `quality.established` | `true`: only statistically established results are served |
| `provenance.source` | The upstream source every response comes from |
| `provenance.verifiable` | Responses carry a hash or record id the buyer can check upstream |
| `perResponse` | Every paid response carries an `X-402-Declaration` header |
| `onBreach` | What the seller does if it breaks its own declaration: `refund`, `retry` or `none` |
| `refundContact` | Where a buyer claims it |

## 2. Per-response declaration

What the seller states about one response, in the response header:

```
X-402-Declaration: base64url({"freshness":{"ageSeconds":12,"isStale":false,"basis":"live"},"provenance":{"source":"EIA-930","hash":"sha256:ba88…"}})
```

When the seller also sends a [delivery receipt](receipts.md), the receipt signs the hash of this header together with the payment and the body. A seller cannot later deny what it declared about what it delivered.

## Who is at fault

A buyer, a facilitator or an attester checks a response against two things, kept apart:

| Code | At fault | When |
| --- | --- | --- |
| `DECLARED_UNUSABLE` | seller | The seller declares the response stale |
| `EXCEEDS_DECLARED_MAX` | seller | `ageSeconds` is above the maximum the seller declared |
| `BREAKS_TERMS` | seller | The response contradicts the published terms (for example another `source`) |
| `MISSING_DECLARATION` | seller | The terms promise a per-response declaration (or an age) and none was sent |
| `NOT_ESTABLISHED` | seller | The seller states the result is not statistically established and the caller requires that it be |
| `EXCEEDS_CALLER_LIMIT` | caller | Older than the caller's own limit, but within what the seller declared |

`providerAtFault` is true only for the first group: the seller broke something it said itself. That is the case that justifies not charging, refunding, or counting the call as not delivered. A caller with a stricter policy is free to skip the data, but the charge stands.

Each check also reports its `basis`: `at-source` (this extension), `declared` (an exact x402-declarations adapter read the seller's own fields), `heuristic` (inferred from field names) or `none`. Nothing acts on `heuristic` without verification.

## How 402Scope Trust uses it

- **Scoring (method v3).** A paid call where the seller broke its own declaration (`at-source` or `declared`) counts as not delivered. Publishing terms is worth 5 of the 10 declaration points. See [scoring.md](scoring.md).
- **Evidence.** The broken call is a leaf in the attestation's Merkle tree, and the seller's signed receipt binds the declaration that proves it.
- **Testnet demo.** The stale seller in the [latest run](testnet/README.md) publishes `maxAgeSeconds: 60`, serves 1,200-second-old data, declares that age and signs it. Its score falls below every wallet's threshold and the agent wallet refuses to pay it.

## Using it

Seller, with `@x402/express` (any network, any facilitator):

```ts
import { declareDeliveryTerms, declarationsResourceServerExtension, declare, deliveryReceipts } from '402scope-trust';

const server = new x402ResourceServer(facilitator).register(network, scheme).registerExtension(declarationsResourceServerExtension);
app.use('/quote', deliveryReceipts({ secret: PAYTO_SECRET }));   // optional, signs the declaration too
app.use(paymentMiddleware({
  'GET /quote': { accepts, mimeType: 'application/json',
    extensions: declareDeliveryTerms({ version: 1, freshness: { maxAgeSeconds: 60 }, perResponse: true, onBreach: 'refund' }) },
}, server));
app.get('/quote', (req, res) => {
  declare(res, { freshness: { ageSeconds: cache.ageSeconds(), isStale: false } });
  res.json(cache.quote());
});
```

Buyer:

```ts
import { readTerms, checkDelivery, DECLARATION_HEADER } from '402scope-trust';

const check = checkDelivery({ url, terms: readTerms(paymentRequired), header: res.headers.get(DECLARATION_HEADER), body, maxAgeSeconds: 120 });
if (check.providerAtFault) { /* the seller broke its own word: claim under terms.onBreach */ }
```

Sellers that do not adopt the extension are still read through the x402-declarations adapters, so the same checks apply to them with `basis: declared` or `heuristic`.

## Conformance

The [x402-declarations conformance cases](https://github.com/arturete58-sys/x402-declarations/tree/main/conformance) pin down unit conversion, absence, heuristic labelling and fault attribution in JavaScript, Python and Rust. `checkDelivery` reads bodies through that library, and its tests run the same "fault is the provider's" case.

Reference implementation: `src/declarations.ts`. Tests: `src/test/`.
