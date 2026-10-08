# 402Scope Trust

**Check an x402 endpoint on Stellar before you pay it.**

[x402](https://x402.org) lets any API charge per request, and AI agents pay automatically. Discovery catalogs tell an agent what a seller *declares*. 402Scope Trust tells it what the seller *does*: bonded, independent attesters make real paid calls, score them with a public method and publish the scores in a Soroban contract, each one backed by a Merkle root of its evidence. An agent wallet built on OpenZeppelin smart accounts then refuses, inside its own `__check_auth`, to pay sellers its chosen attesters do not trust.

```
Sellers ── X-402-Receipt (signed delivery receipts)
   ↑ paid x402 calls
Attesters (bonded, slashable) ── score + evidence root ──→ Attestation registry (Soroban)
                                                                   ↑ trusted_by(seller, attesters, min_score, quorum)
AI agent → x402 client → Agent wallet (OpenZeppelin smart account) → Trust policy
                                  pays trusted sellers · refuses the rest
```

**Live on Stellar testnet:** the [latest end-to-end run](docs/testnet/README.md) shows two bonded attesters scoring three sellers onchain, a seller caught breaking its own signed declaration, evidence checked by the contract, an agent wallet paying the good seller while its policy refuses the others, a standard facilitator refusing to settle with an untrusted seller, and the agent wallet paying in USDC through OpenZeppelin's hosted Built on Stellar facilitator. Every step is a transaction you can open.

Part of the [402Scope observatory](https://402scope.org).

## Status

| Piece | State |
| --- | --- |
| Unpaid probe of the 402 challenge (x402 v2, Stellar `exact`) | Working, tested against the official `@x402/express` seller and Stellar's x402 demo |
| Paid measurement through the standard x402 client (`@x402/stellar`) | Working |
| Delivery declarations as an x402 extension (`extensions.declarations`, `X-402-Declaration`), in the [x402-declarations](https://github.com/arturete58-sys/x402-declarations) vocabulary | Working, tested with the official `@x402/express` — [docs/declarations.md](docs/declarations.md) |
| Signed delivery receipts (`X-402-Receipt`), binding body and declaration, as SEP-53 Stellar signed messages | Working, tested — [docs/receipts.md](docs/receipts.md) |
| Scoring method v3 (endpoint and seller scores; breaking one's own declaration is a failed delivery) | Working, tested — [docs/scoring.md](docs/scoring.md) |
| Attestation registry: bonded attesters, slashing, quorum reads | Working, 10 tests — [docs/attestation-spec.md](docs/attestation-spec.md) |
| Merkle evidence, verifiable onchain | Working, same test vector in Rust and TypeScript — [docs/evidence.md](docs/evidence.md) |
| Trust policy for OpenZeppelin smart accounts | Working, 8 end-to-end tests — [docs/agent-wallet.md](docs/agent-wallet.md) |
| Agent wallet paying over x402 (`AgentWalletExactScheme`) | Working on testnet with a standard facilitator |
| Who and how much: trust policy plus a spending limit on the same wallet (OpenZeppelin semantics, x402-compatible) | Working, 9 end-to-end tests — [docs/agent-wallet.md](docs/agent-wallet.md#who-and-how-much-trust-policy-plus-spending-limit) |
| Passkey owner for agent wallets (WebAuthn verifier): the owner manages the budget with a passkey, the agent only pays | Working, tested — [docs/agent-wallet.md](docs/agent-wallet.md#the-owner-holds-a-passkey-the-agent-holds-a-key) |
| Prepaid sellers (`batch-settlement`, e.g. Fermah Pay): probe, paid measurement from a prepaid balance, receipts signed by the ledger's seller role | Working, tested; seller role read on testnet each run — [docs/prepaid-ledgers.md](docs/prepaid-ledgers.md) |
| Optional automatic refunds: seller bond, `x402-receipt/3` checked onchain, no admin | Working, 10 contract tests, same receipt hash in Rust, TypeScript and Python — [docs/refunds.md](docs/refunds.md) |
| Escrow (x402 scheme `escrow`): payments held until delivery is shown; confirmed or refunded in seconds; no admin | Working, 8 contract tests, proven on testnet — [docs/escrow.md](docs/escrow.md) |
| One package with an entry point per role (`/facilitator`, `/seller`, `/buyer`) | Working, tested |
| Python verifier: receipts, evidence proofs, onchain quorum reads (`stellar-sdk` for Python) | Working, tested against the TypeScript vectors and each testnet deployment — [python/](python) |
| Typed TypeScript clients for every contract, generated from the deployed wasm | Working — `import { clients } from '402scope-trust'`, [src/clients](src/clients) |
| Any facilitator: trust hooks for `@x402/core` facilitators (flag or block), ranked Bazaar discovery, `/v1/sellers` API | Working, tested — [docs/facilitators.md](docs/facilitators.md) |
| Off-chain trust guard for classic accounts, MCP server, read API | Working, tested |
| Bazaar and `/.well-known/x402` discovery | Working |
| End-to-end testnet demo in CI | [Testnet demo workflow](.github/workflows/testnet-demo.yml), report in [docs/testnet](docs/testnet/README.md) |
| Draft of the declarations extension for the x402 specification | [Draft, not submitted](docs/proposals/x402-extension-declarations.md) |
| Stellar standards: SEP-41 payments and bonds, SEP-53 signed receipts and claims, SEP-10 facilitator login, SEP-1 attester identity, SEP-46/55 verified contract builds | Working — [docs/stellar-standards.md](docs/stellar-standards.md) |
| Contributions from partner facilitators (their Bazaar and the resources they settle), with a contributor key or SEP-10 login | Working, tested — [docs/facilitators.md](docs/facilitators.md#share-your-bazaar) |
| Dispute process for slashing, mainnet, audit | Next |

## One package, three roles

| You are | One call | What you get |
| --- | --- | --- |
| **Facilitator** | `scopeFacilitator(facilitator, { trust, mode, share?, refunds? })` from `402scope-trust/facilitator` | Trust hooks on verify and settle (flag or block), your Bazaar ranked by measured quality, refund-backed sellers labelled and ranked first, optional sharing of what you settle |
| **Seller** | `scopeSeller({ secret, terms, refund? })` from `402scope-trust/seller` | Delivery terms in your 402 challenge, a signed receipt for every paid response, and an optional refund bond that refunds buyers automatically if you break your own terms |
| **Buyer or agent** | `scopeFetch({ client, check?, refunds? })` from `402scope-trust/buyer` | A check before paying, a check of what was delivered after paying, and automatic refunds from sellers that offer them |

Refunds and escrow are optional and run on contracts with no admin: [docs/refunds.md](docs/refunds.md), [docs/escrow.md](docs/escrow.md).

## Quick start

Node 20 or newer.

```bash
npm install
npm run build

# Unpaid check of any x402 endpoint
node dist/cli.js probe https://api.example.com/paid-data

# The agent's question: should I pay this?
node dist/cli.js check https://api.example.com/paid-data --min 80
```

### Typed contract clients

Every contract ships with a typed client, generated from the exact wasm the testnet demo deploys (Stellar JS SDK binding generator, `scripts/gen-clients.mjs`):

```ts
import { Networks } from '@stellar/stellar-sdk';
import { clients } from '402scope-trust';

const registry = new clients.attestations.Client({
  contractId: 'C…', // see docs/testnet/latest.json for the current testnet deployment
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: Networks.TESTNET,
});
const { result } = await registry.trusted_by({ seller: 'G…', attesters: ['G…', 'G…'], min_score: 80, quorum: 2 });
```

Clients: `attestations`, `trustPolicy`, `agentWallet`, `spendingLimit`, `ed25519Verifier`. Each exports its contract's types and the sha256 of the wasm it was generated from (`WASM_SHA256`).

### Use it from an agent (MCP)

```json
{
  "mcpServers": {
    "402scope-trust": {
      "command": "node",
      "args": ["/path/to/402scope-trust/dist/cli.js", "mcp"]
    }
  }
}
```

Set `TRUST_API_URL` to use a hosted 402Scope Trust API instead of measuring locally, or `TRUST_CONTRACT_ID`, `TRUST_ATTESTERS` (comma-separated) and `TRUST_QUORUM` to decide from onchain scores.

The tool returns a verdict:

| Verdict | Agent should |
| --- | --- |
| `trusted` | pay |
| `caution` | ask the user, or pay small amounts |
| `avoid` | not pay |
| `unknown` | ask the user |

### Guard any x402 client

```ts
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { withTrustGuard, apiChecker } from '402scope-trust';

const client = withTrustGuard(x402Client.fromConfig({ schemes: [/* your Stellar scheme */] }), {
  check: apiChecker('https://<402scope-trust-api>'),
  minScore: 80,
});
const pay = wrapFetchWithPayment(fetch, client);
await pay('https://api.example.com/paid-data'); // throws instead of paying an untrusted endpoint
```

The guard also refuses when the `payTo` being paid differs from the one that was measured.

### Run the observatory

```bash
node dist/cli.js index --facilitator https://<facilitator> --seeds seeds.txt
node dist/cli.js run                              # unpaid probes only
MEASURE_SECRET=S... node dist/cli.js run --paid   # plus real paid calls (testnet by default)
node dist/cli.js serve --port 8403                # public read API
TRUST_CONTRACT_ID=C... TRUST_ATTESTER_SECRET=S... node dist/cli.js register-attester --amount 1000000000   # lock a bond
TRUST_CONTRACT_ID=C... TRUST_ATTESTER_SECRET=S... node dist/cli.js attest   # write endpoint and seller scores onchain
```

Paid measurement settings: `MEASURE_SECRET` (a dedicated, low-balance wallet), `MEASURE_NETWORK` (`stellar:testnet` or `stellar:pubnet`), `MEASURE_MAX_AMOUNT` (in token units; default 100000 = 0.01 USDC), `STELLAR_RPC_URL` (required on pubnet).

### API

| Request | Returns |
| --- | --- |
| `GET /v1/check?url=…&min_score=80` | Verdict, score and reasons for one endpoint |
| `GET /v1/endpoints?network=stellar:pubnet&min_score=80` | Measured endpoints, best first |
| `GET /v1/endpoints/{key}` | Full record: probe, paid calls, score |
| `GET /health` | Service status |

### Contracts

| Contract | Path |
| --- | --- |
| Attestation registry | `contracts/attestations` |
| Trust policy (OpenZeppelin `Policy`) | `contracts/trust-policy` |
| Agent wallet (OpenZeppelin smart account) | `contracts/agent-wallet` |
| ed25519 verifier | `contracts/ed25519-verifier` |

```bash
cd contracts
cargo test                              # all contracts
stellar contract build                  # needs the Stellar CLI >= 25.2
bash ../scripts/deploy-testnet.sh       # registry, policy and verifier on testnet
```

The [testnet demo workflow](.github/workflows/testnet-demo.yml) runs the whole flow: it deploys every contract, bonds two attesters, runs two sellers (good and bad) with signed receipts, measures them with real paid calls, writes endpoint and seller scores onchain, checks evidence onchain, and has the agent wallet pay. Run it locally with `node dist/demo/testnet.js --wasm-dir contracts/target/wasm32v1-none/release`.

### Pay from an agent wallet

```ts
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { AgentWalletExactScheme } from '402scope-trust';

const scheme = new AgentWalletExactScheme({ account: 'C…wallet', key: agentKeypair, verifier: 'C…verifier' });
const pay = wrapFetchWithPayment(fetch, x402Client.fromConfig({ schemes: [{ network: 'stellar:testnet', client: scheme }] }));
await pay('https://api.example.com/paid-data'); // the wallet itself refuses untrusted sellers
```

Facilitators need a fee ceiling (`maxTransactionFeeStroops`) above the default 50,000 stroops to accept smart-account payments; see [docs/agent-wallet.md](docs/agent-wallet.md).

### Declare what you deliver (sellers)

```ts
import { declareDeliveryTerms, declare } from '402scope-trust';

app.use(paymentMiddleware({
  'GET /quote': { accepts, mimeType: 'application/json',
    extensions: declareDeliveryTerms({ version: 1, freshness: { maxAgeSeconds: 60 }, perResponse: true, onBreach: 'refund' }) },
}, server));
app.get('/quote', (req, res) => { declare(res, { freshness: { ageSeconds: cache.age() } }); res.json(cache.quote()); });
```

### Use it in a facilitator

```ts
import { withTrustHooks, onchainSellerChecker } from '402scope-trust';
withTrustHooks(facilitator, { check: onchainSellerChecker(cfg, 80), mode: 'flag' }); // or 'block'
```

## Independence

Scores are never for sale. No seller can pay for a score or to change one. The method, every measurement and every attestation are public.

## Development

Every change is tested (`npm test`, `cargo test`) and reviewed before merging. The contracts will be audited before mainnet.

## License

Apache-2.0
