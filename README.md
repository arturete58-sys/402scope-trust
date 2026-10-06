# 402Scope Trust

**Check an x402 endpoint on Stellar before you pay it.**

[x402](https://x402.org) lets any API charge per request, and AI agents pay automatically. Discovery catalogs tell an agent what a seller *declares*. 402Scope Trust tells it what the seller *does*: independent paid measurements, scored with a public method and published as signed attestations in a Soroban contract.

```
Indexer → Measurer → Scorer + signer → Soroban contract
                                              ↓
            AI agent → check_before_pay (MCP / SDK) → pay only if trusted
```

Part of the [402Scope observatory](https://402scope.org). Applying to the Stellar Community Fund (SCF #46, Open Track).

## Status

| Piece | State |
| --- | --- |
| Unpaid probe of the 402 challenge (x402 v2, Stellar `exact`) | Working, tested against the official `@x402/express` seller |
| Paid measurement through the standard x402 client (`@x402/stellar`) | Working |
| Scoring method v1 | Working, tested — [docs/scoring.md](docs/scoring.md) |
| Soroban attestation contract | Working, 9 tests — [docs/attestation-spec.md](docs/attestation-spec.md) |
| Writing and reading attestations onchain | Working (`scope-trust attest`, `check_before_pay`) |
| Trust guard for any x402 client | Working, tested — aborts payments to untrusted endpoints |
| MCP server (`check_before_pay`, `list_trusted_endpoints`) | Working, tested |
| Public read API | Working, tested |
| Bazaar discovery indexer | Working against `GET /discovery/resources` |
| End-to-end testnet demo in CI | [Testnet demo workflow](.github/workflows/testnet-demo.yml) |
| Smart-account spending policy example | Next (SCF tranche 2) |
| Mainnet, audit, provider passport | SCF tranche 3 |

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

Set `TRUST_API_URL` to use a hosted 402Scope Trust API instead of measuring locally.

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
TRUST_CONTRACT_ID=C... TRUST_SIGNER_SECRET=S... node dist/cli.js attest   # write scores onchain
```

Paid measurement settings: `MEASURE_SECRET` (a dedicated, low-balance wallet), `MEASURE_NETWORK` (`stellar:testnet` or `stellar:pubnet`), `MEASURE_MAX_AMOUNT` (in token units; default 100000 = 0.01 USDC), `STELLAR_RPC_URL` (required on pubnet).

### API

| Request | Returns |
| --- | --- |
| `GET /v1/check?url=…&min_score=80` | Verdict, score and reasons for one endpoint |
| `GET /v1/endpoints?network=stellar:pubnet&min_score=80` | Measured endpoints, best first |
| `GET /v1/endpoints/{key}` | Full record: probe, paid calls, score |
| `GET /health` | Service status |

### Contract

The [testnet demo workflow](.github/workflows/testnet-demo.yml) deploys the contract, runs a seller with four endpoints (good, slow, wrong content type, broken), measures them with real paid calls, writes the attestations onchain and reads them back. Each run lists the contract ID and every transaction in its summary.

```bash
cd contracts/attestations
cargo test
bash ../../scripts/deploy-testnet.sh   # needs the Stellar CLI
```

## Independence

Scores are never for sale. No seller can pay for a score or to change one. The method, every measurement and every attestation are public.

## Development

Built with [Claude Code](https://claude.com/claude-code). Every change is tested (`npm test`, `cargo test`) and reviewed before merging; the contract will be audited through the SCF Audit Bank before mainnet.

## License

Apache-2.0
