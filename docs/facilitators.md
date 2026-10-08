# Any facilitator

402Scope Trust does not depend on a facilitator, and a facilitator does not need 402Scope Trust to keep working. There are three ways to use it, from no change at all to a few lines in a facilitator.

| Who | What they do | Change needed |
| --- | --- | --- |
| Agent with a smart account | Installs the trust policy; the wallet refuses untrusted sellers in `__check_auth` | None on the facilitator side, beyond a fee ceiling that accepts smart-account payments |
| Seller | Publishes delivery terms and signed receipts | None on the facilitator side: extensions travel in the 402 challenge and the response |
| Facilitator | Uses the trust signal: flags or refuses payments, ranks its Bazaar listing; optionally shares its Bazaar and the resources it settles | `withTrustHooks` and `rankResources`, or the discovery proxy in front of it; `shareBazaar` / `resourceSharer` |

Attesters measure through whatever facilitator each seller uses, because they pay as an ordinary x402 client.

## In one call

```ts
import { scopeFacilitator } from '402scope-trust/facilitator';

const scope = scopeFacilitator(facilitator, {
  trust: { chain },                       // or { apiUrl } or { check }
  mode: 'flag',                           // 'block' refuses untrusted sellers
  share: { apiUrl, key },                 // optional: get what you settle measured
  refunds: { contract, rpcUrl, networkPassphrase, token: USDC }, // optional: label refund-backed sellers
});
const listing = await scope.rank(bazaarItems); // trusted and refund-backed sellers first
```

What a facilitator gains:

| Need | What 402Scope gives |
| --- | --- |
| Know which sellers in its network misbehave | A verdict per seller on every verify and settle, flagged or blocked |
| Hear first when a seller degrades | Alerts (`POST /v1/watch` on the observatory) |
| A Bazaar that shows what works | Ranked discovery, with measured scores and a refund-backed label |
| Stand out | Offer "refund if the seller breaks its terms" to buyers, backed by sellers' optional bonds ([refunds](refunds.md)) |
| Prove its own reliability | Settlement latency measured by the observatory |

The building blocks below remain available one by one.

## Trust hooks

`@x402/core` facilitators expose `onBeforeVerify` and `onBeforeSettle` hooks that can abort. `withTrustHooks` uses them:

```ts
import { x402Facilitator } from '@x402/core/facilitator';
import { withTrustHooks, onchainSellerChecker, apiSellerChecker } from '402scope-trust';

const facilitator = withTrustHooks(new x402Facilitator().register('stellar:pubnet', stellarScheme), {
  check: onchainSellerChecker({ contractId, rpcUrl, networkPassphrase, attesters, quorum: 2 }, 80),
  mode: 'flag',            // or 'block'
  onDecision: (d) => metrics.record(d),
});
```

| Mode | Effect |
| --- | --- |
| `flag` (default) | Never interferes. Every payment gets a verdict the facilitator can log, surface or price |
| `block` | Refuses to verify or settle payments to sellers that are not trusted (`untrusted_seller`) |

If the checker fails, the payment goes through and the decision records the error: a trust outage must not become a payments outage. `failClosed: true` reverses that. Verdicts are cached for 60 s per seller.

Checkers:

| Checker | Reads | Networks |
| --- | --- | --- |
| `onchainSellerChecker(cfg, minScore)` | The Soroban registry: `trusted_by` with the facilitator's own attesters and quorum | Stellar |
| `apiSellerChecker(apiUrl, minScore)` | `GET /v1/sellers/:payTo` on a 402Scope Trust API | Any network the API measures |
| `localSellerChecker(store, minScore)` | A local measurement store | Any |

## Ranked discovery

`rankResources(items, check)` adds a `trust` field to each Bazaar item and sorts trusted sellers first, then by score. Unknown sellers keep their order after the scored ones; nothing is removed.

For a facilitator that cannot change its code, `discoveryProxy({ upstream, check })` serves a Bazaar-compatible `GET /discovery/resources` in front of it: the query is forwarded, the items come back ranked.

## Share your Bazaar

Discovery catalogues are partial. The CDP and Binance Bazaars do not overlap, and neither lists providers that never registered with either: on Stellar, one Soroban x402 flow with 719 payments was in no catalogue at all. A facilitator sees more than its catalogue, because it settles every resource its sellers charge for. Partner facilitators can share both, so the observatory measures more of the market.

| How | What is shared | Code |
| --- | --- | --- |
| Push the Bazaar listing | The facilitator's own `GET /discovery/resources` | `shareBazaar({ facilitatorUrl, apiUrl, key })` |
| Share what it settles | Resource URL, network and payTo of each verified payment; never the payer | `withTrustHooks(fac, { check, share: resourceSharer({ apiUrl, key }) })` |
| Any other source | A Bazaar response or `{ resources: [{ url, network, payTo }] }` | `POST /v1/contributions` with `Authorization: Bearer <key>` |

### Log in with your Stellar account (SEP-10)

Instead of a shared key, a facilitator can authenticate with the Stellar account it already runs on, by [SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md) Web Authentication: it signs a challenge transaction (never submitted, no fee) and receives a token valid for an hour. No secret is shared with 402Scope, and a leaked token expires on its own.

```ts
import { sep10Login, shareBazaar } from '402scope-trust';

const token = await sep10Login({ apiUrl: 'https://402scope.org', account: facilitatorKeypair.publicKey(), sign: facilitatorKeypair });
await shareBazaar({ facilitatorUrl, apiUrl: 'https://402scope.org', key: token });
```

`sign` can also be a function that signs transaction XDR, so the key can stay in a wallet or a KMS. The client checks that the challenge is a SEP-10 challenge (sequence 0, only `manageData` operations) before signing it.

| Server setting | Meaning |
| --- | --- |
| `TRUST_SEP10_SECRET` | Server signing key; its public key is the `SIGNING_KEY` in the home domain's `stellar.toml`, next to `WEB_AUTH_ENDPOINT` |
| `TRUST_CONTRIBUTOR_ACCOUNTS` | `name:G…,name2:G…`: the accounts whose tokens may contribute |
| `TRUST_HOME_DOMAIN`, `TRUST_WEB_AUTH_DOMAIN` | Default `402scope.org` |
| `TRUST_SEP10_NETWORK` | `testnet` for testnet challenges; mainnet otherwise |

Rules:

- Contributing is opt-in and needs a contributor key or a registered Stellar account (ask hello@402scope.org).
- A contribution only adds resources to measure. It never changes a score, and a facilitator cannot pay or contribute its way to a better one.
- Each resource keeps the name of the facilitator that contributed it (`source: facilitator:<name>`), so coverage is attributable.
- Sharing runs outside the payment path: batched every 5 minutes, failures dropped.
- Up to 1 MB and 1,000 resources per request; URLs must be public HTTP(S).

## Smart-account payments and the fee ceiling

Agent wallets are OpenZeppelin smart accounts. Their authorization runs `__check_auth` and the trust policy reads the registry, which costs more resources than a classic payment. The Stellar facilitator's default `maxTransactionFeeStroops` (50,000) can reject them; the testnet demo uses 2,000,000. A facilitator that wants to serve agent wallets needs a ceiling in that range. OpenZeppelin's hosted facilitator already settles them: the agent wallet paid through it on testnet.

## Proven on testnet

The [latest run](testnet/README.md) shows:

- a standard `@x402/core` facilitator with `withTrustHooks` in `block` mode settling a plain payment to the good seller and refusing one to the stale seller;
- the same endpoints ranked as a Bazaar listing;
- the same seller code pointed at OpenZeppelin's hosted Built on Stellar facilitator (`channels.openzeppelin.com/x402/testnet`): paid in testnet USDC from a classic account **and from the agent wallet**, with the trust policy running in `__check_auth`. The hosted facilitator accepts USDC only (`unsupported_asset` for the test token), and its fee handling accepted the smart-account payment as it is.

Reference implementation: `src/facilitator.ts`. Tests: `src/test/integration.test.ts`.
