#!/usr/bin/env node
import { createApi } from './api.js';
import { checkBeforePay } from './check.js';
import { fromFacilitator, fromSeedFile } from './indexer.js';
import { attestationKey } from './key.js';
import { chainConfigFromEnv, DEFAULT_TTL_LEDGERS, latestLedger, toAttestation, writeAttestation } from './chain.js';
import { measurePaid } from './measure.js';
import { runMcp } from './mcp.js';
import { probe } from './probe.js';
import { scoreEndpoint } from './score.js';
import { Store } from './store.js';

const [cmd, ...args] = process.argv.slice(2);
const flag = (name: string, fallback?: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const flags = (name: string) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const print = (x: unknown) => console.log(JSON.stringify(x, null, 2));

const HELP = `402Scope Trust — measure x402 endpoints on Stellar and check them before paying.

  scope-trust probe <url>                 Unpaid check of the 402 challenge
  scope-trust check <url> [--min 80]      Check-before-pay verdict
  scope-trust key <payTo> <url>           Onchain attestation key
  scope-trust index [--facilitator URL]… [--seeds seeds.txt]
                                          Find Stellar x402 endpoints
  scope-trust run [--paid] [--calls 1]    Probe every endpoint; with --paid also make real paid calls
  scope-trust attest                      Write scores onchain (needs TRUST_CONTRACT_ID, TRUST_SIGNER_SECRET)
  scope-trust serve [--port 8403]         Public read API
  scope-trust mcp                         MCP server over stdio

Paid calls need MEASURE_SECRET (a dedicated low-balance wallet), MEASURE_NETWORK
(stellar:testnet by default), MEASURE_MAX_AMOUNT (token units, default 100000 = 0.01 USDC)
and, on pubnet, STELLAR_RPC_URL. Data lives in TRUST_DATA_DIR (default ./data).`;

async function main(): Promise<void> {
  switch (cmd) {
    case 'probe': {
      if (!args[0]) throw new Error('usage: probe <url>');
      return print(await probe(args[0]));
    }
    case 'check': {
      if (!args[0]) throw new Error('usage: check <url>');
      return print(await checkBeforePay(Store.open(), args[0], Number(flag('min', '80')), { chain: chainConfigFromEnv() }));
    }
    case 'key': {
      if (args.length < 2) throw new Error('usage: key <payTo> <url>');
      return console.log(attestationKey(args[0], args[1]));
    }
    case 'index': {
      const store = Store.open();
      const found = fromSeedFile(flag('seeds', 'seeds.txt') as string);
      for (const f of flags('facilitator')) {
        try { found.push(...(await fromFacilitator(f))); } catch (e) { console.error(`skip ${f}: ${(e as Error).message}`); }
      }
      const added = found.filter((d) => store.add(d.url, d.source)).length;
      store.save();
      return print({ found: found.length, added, total: store.all().length });
    }
    case 'run': {
      const store = Store.open();
      const paid = args.includes('--paid');
      const calls = Number(flag('calls', '1'));
      const secret = process.env.MEASURE_SECRET;
      if (paid && !secret) throw new Error('--paid needs MEASURE_SECRET');
      const network = (process.env.MEASURE_NETWORK ?? 'stellar:testnet') as 'stellar:testnet' | 'stellar:pubnet';
      const maxAmount = BigInt(process.env.MEASURE_MAX_AMOUNT ?? '100000');
      let n = 0;
      for (const rec of store.all()) {
        const p = await probe(rec.url);
        store.setProbe(rec.url, p);
        if (paid && p.stellar.some((s) => s.network === network)) {
          for (let i = 0; i < calls; i++) {
            store.addCall(rec.url, await measurePaid(rec.url, { secret: secret as string, network, maxAmount, rpcUrl: process.env.STELLAR_RPC_URL, declaredMime: p.paymentRequired?.resource?.mimeType }));
          }
        }
        const r = store.get(rec.url);
        if (r) store.setScore(rec.url, scoreEndpoint(p.issues, r.calls));
        store.save();
        n++;
      }
      return print({ endpoints: n, paid });
    }
    case 'attest': {
      const chain = chainConfigFromEnv();
      const secret = process.env.TRUST_SIGNER_SECRET;
      if (!chain || !secret) throw new Error('attest needs TRUST_CONTRACT_ID and TRUST_SIGNER_SECRET');
      const store = Store.open();
      const ledger = await latestLedger(chain);
      const ttl = Number(process.env.TRUST_TTL_LEDGERS ?? DEFAULT_TTL_LEDGERS);
      const done: { url: string; score: number; tx: string }[] = [];
      for (const r of store.all()) {
        if (!r.key || r.score?.score == null) continue;
        const txHash = await writeAttestation(chain, secret, r.key, toAttestation(r, ledger + ttl));
        store.setAttestation(r.url, { tx: txHash, expiresLedger: ledger + ttl, score: r.score.score, at: new Date().toISOString() });
        store.save();
        done.push({ url: r.url, score: r.score.score, tx: txHash });
      }
      return print({ contract: chain.contractId, attested: done });
    }
    case 'serve': {
      const port = Number(flag('port', process.env.PORT ?? '8403'));
      const host = process.env.HOST ?? '127.0.0.1';
      createApi(Store.open(), { chain: chainConfigFromEnv() }).listen(port, host, () => console.log(`402Scope Trust API on http://${host}:${port}`));
      return;
    }
    case 'mcp':
      return runMcp();
    default:
      console.log(HELP);
  }
}

main().catch((e) => {
  console.error(`error: ${(e as Error).message}`);
  process.exit(1);
});
