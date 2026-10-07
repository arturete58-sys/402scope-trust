# Draft: x402 extension `declarations` (delivery declarations)

> Draft for a proposal to the x402 specification (`specs/extensions/`). Not submitted. Author: Arturo Ferrándiz Fernández (402Scope). Status: draft for discussion.

## Summary

A standard place for an x402 resource server to declare what a buyer gets: how fresh the data is, how confident the server is in it, and where it comes from. Terms travel in the `PaymentRequired` response; a per-response declaration travels with the paid response.

## Motivation

x402 standardises the input contract of a paid resource well enough that clients can call endpoints generically: in the public catalogue, 98.0% of POST resources declare a body schema. Nothing comparable exists for the output. 99.84% of resources declare the shape of the response, but only 11.1% of providers declare anything about its quality, and those that do use at least six vocabularies for the same three ideas, with four units for age (seconds, milliseconds, hours, absolute timestamps). An agent cannot tell, without a provider-specific adapter, that a 200 response with a valid schema carries data 19 minutes old from a feed sold as real time.

Figures and examples: [x402-declarations](https://github.com/arturete58-sys/x402-declarations), measured over the full catalogue.

## Specification

### Terms (`PaymentRequired.extensions.declarations`)

```json
{
  "info": {
    "version": 1,
    "freshness": { "maxAgeSeconds": 60, "basis": "live" },
    "quality": { "established": true },
    "provenance": { "source": "EIA-930", "verifiable": true },
    "perResponse": true,
    "onBreach": "refund",
    "refundContact": "https://api.example.com/refunds"
  },
  "schema": { "$ref": "JSON Schema of info" }
}
```

All fields except `version` are OPTIONAL. `freshness.maxAgeSeconds` is an integer number of seconds. `freshness.basis` is one of `live`, `cache`, `snapshot`, `multi-source`, `window`. `onBreach` is one of `refund`, `retry`, `none`.

### Per-response declaration (`X-402-Declaration` header)

base64url-encoded JSON:

```json
{
  "freshness": { "ageSeconds": 12, "isStale": false, "basis": "live" },
  "quality": { "confidence": 0.93, "established": true, "sampleSize": 5000, "note": null },
  "provenance": { "source": "EIA-930", "hash": "sha256:ba8870…", "verifiable": true, "servedFrom": null }
}
```

Ages MUST be in seconds. A field the server does not know MUST be omitted or null, never defaulted. If the terms set `perResponse: true`, every successful paid response MUST carry the header.

### Breach

A response breaches the server's own declaration when it declares itself stale, when `ageSeconds` exceeds `maxAgeSeconds`, when it contradicts the terms (for example a different `provenance.source`), or when a promised declaration is missing. Clients SHOULD distinguish a breach from a rejection under the client's own stricter policy: only a breach is attributable to the server, and only a breach is covered by `onBreach`.

### Binding (optional)

A server that signs delivery receipts SHOULD include the hash of the `X-402-Declaration` value in what it signs, so the declaration cannot be disowned later. This composes with the `offer-receipt` extension, which covers the payment but not the content.

## Compatibility

Purely additive. Servers that do not declare are unaffected; clients that do not read the extension ignore it. Works on every network and with every facilitator, because it lives between resource server and client.

## Reference implementation

- Server and client: `src/declarations.ts` in [402scope-trust](https://github.com/arturete58-sys/402scope-trust), as a `ResourceServerExtension` for `@x402/core`, tested with the official `@x402/express` middleware.
- Reading undeclared providers and conformance cases (JavaScript, Python, Rust): [x402-declarations](https://github.com/arturete58-sys/x402-declarations).
- Live on Stellar testnet: [demo report](https://github.com/arturete58-sys/402scope-trust/blob/main/docs/testnet/README.md).

## Open questions

1. Header or `extensions` in the settlement response for the per-response declaration? The header keeps it next to the body it describes; the settlement response is facilitator-shaped.
2. Should `onBreach: "refund"` reference a machine-readable refund flow, once x402 has one?
3. Which further fields have enough adoption to standardise (for example `quality.calibration`)?
