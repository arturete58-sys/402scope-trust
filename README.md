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
| Unpaid probe of the 402 challenge (x402 v2, Stellar `exact`) | Working, tested |
| Paid measurement through the standard x402 client (`@x402/stellar`) | Working, needs a funded testnet wallet |
| Scoring method v1 | Working, tested — [docs/scoring.md](docs/scoring.md) |
| Public read API | Working, tested |
| MCP server (`check_before_pay`, `list_trusted_endpoints`) | Working, tested |
| Bazaar discovery indexer | Working against `GET /discovery/resources` |
| Soroban attestation contract | Working, 9 tests — [docs/attestation-spec.md](docs/attestation-spec.md) |
| Testnet deployment, writing attestations onchain | Next (SCF tranche 2) |
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

### Run the observatory

```bash
node dist/cli.js index --facilitator https://<facilitator> --seeds seeds.txt
node dist/cli.js run                              # unpaid probes only
MEASURE_SECRET=S... node dist/cli.js run --paid   # plus real paid calls (testnet by default)
node dist/cli.js serve --port 8403                # public read API
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
