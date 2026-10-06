/**
 * End-to-end demo on Stellar testnet. Everything is real and verifiable on a
 * block explorer:
 *   1. creates and funds fresh accounts with friendbot,
 *   2. deploys the 402Scope Trust attestation contract,
 *   3. issues a test token (SCOPE) and wraps it as a SEP-41 Soroban token,
 *   4. runs a local x402 facilitator and a seller with four endpoints
 *      (good, slow, wrong content type, broken),
 *   5. measures each endpoint with real paid calls,
 *   6. scores them and writes signed attestations to the contract,
 *   7. reads them back with check_before_pay, and shows an agent whose
 *      x402 client pays the good endpoint and refuses the broken one.
 *
 * Usage: node dist/demo/testnet.js --wasm path/to/scope_attestations.wasm [--calls 5] [--out demo-result.json]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { Asset, Keypair, Networks, Operation, rpc, TransactionBuilder, BASE_FEE, type xdr } from '@stellar/stellar-sdk';
import { x402Facilitator } from '@x402/core/facilitator';
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { createEd25519Signer } from '@x402/stellar';
import { ExactStellarScheme as FacilitatorScheme } from '@x402/stellar/exact/facilitator';
import { ExactStellarScheme as ServerScheme } from '@x402/stellar/exact/server';
import { ExactStellarScheme as ClientScheme } from '@x402/stellar/exact/client';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import { DEFAULT_TTL_LEDGERS, deployContract, latestLedger, submit, toAttestation, writeAttestation, TESTNET_RPC, type ChainConfig } from '../chain.js';
import { checkBeforePay } from '../check.js';
import { withTrustGuard, localChecker } from '../guard.js';
import { measurePaid } from '../measure.js';
import { probe } from '../probe.js';
import { scoreEndpoint } from '../score.js';
import { Store } from '../store.js';

const args = process.argv.slice(2);
const flag = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const NETWORK = 'stellar:testnet' as const;
const PASS = Networks.TESTNET;
const RPC = process.env.STELLAR_RPC_URL ?? TESTNET_RPC;
const PRICE = '10000'; // 0.001 SCOPE (7 decimals)
const tx = (h: string) => `https://stellar.expert/explorer/testnet/tx/${h}`;
const log = (...a: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function fund(pub: string): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(`https://friendbot.stellar.org?addr=${pub}`);
    if (r.ok) return;
    await new Promise((s) => setTimeout(s, 2000));
  }
  throw new Error(`friendbot could not fund ${pub}`);
}

/** Classic (non-Soroban) operations do not need simulation. */
async function submitClassic(server: rpc.Server, source: Keypair, ops: xdr.Operation[], extraSigners: Keypair[] = []): Promise<string> {
  const account = await server.getAccount(source.publicKey());
  const b = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: PASS });
  ops.forEach((o) => b.addOperation(o));
  const t = b.setTimeout(60).build();
  t.sign(source, ...extraSigners);
  const sent = await server.sendTransaction(t);
  if (sent.status === 'ERROR') throw new Error(`classic tx failed: ${JSON.stringify(sent.errorResult)}`);
  const done = await server.pollTransaction(sent.hash, { attempts: 30 });
  if (done.status !== 'SUCCESS') throw new Error(`classic tx ${sent.hash} ${done.status}`);
  return sent.hash;
}

async function main(): Promise<void> {
  const wasmPath = flag('wasm');
  if (!wasmPath) throw new Error('usage: --wasm path/to/scope_attestations.wasm');
  const calls = Number(flag('calls', '5'));
  const server = new rpc.Server(RPC);
  const result: Record<string, unknown> = { network: NETWORK, startedAt: new Date().toISOString() };

  // 1. Accounts
  const k = { admin: Keypair.random(), signer: Keypair.random(), issuer: Keypair.random(), seller: Keypair.random(), buyer: Keypair.random(), facilitator: Keypair.random() };
  log('funding accounts with friendbot');
  for (const kp of Object.values(k)) await fund(kp.publicKey());
  result.accounts = Object.fromEntries(Object.entries(k).map(([n, kp]) => [n, kp.publicKey()]));

  // 2. Contract
  log('deploying the attestation contract');
  const contractId = await deployContract({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: fs.readFileSync(wasmPath), admin: k.admin.publicKey(), signer: k.signer.publicKey() });
  const chain: ChainConfig = { contractId, rpcUrl: RPC, networkPassphrase: PASS };
  result.contractId = contractId;
  result.contractUrl = `https://stellar.expert/explorer/testnet/contract/${contractId}`;
  log('contract', contractId);

  // 3. Test token
  log('issuing the SCOPE test token');
  const asset = new Asset('SCOPE', k.issuer.publicKey());
  await submitClassic(server, k.seller, [Operation.changeTrust({ asset })]);
  await submitClassic(server, k.buyer, [Operation.changeTrust({ asset })]);
  await submitClassic(server, k.issuer, [Operation.payment({ destination: k.buyer.publicKey(), asset, amount: '1000' })]);
  await submit(server, PASS, k.issuer, Operation.createStellarAssetContract({ asset }));
  const token = asset.contractId(PASS);
  result.token = token;
  log('token contract', token);

  // 4. Local facilitator + seller
  const facilitator = new x402Facilitator().register(NETWORK, new FacilitatorScheme([createEd25519Signer(k.facilitator.secret(), NETWORK)]));
  const facClient = {
    verify: (p: PaymentPayload, r: PaymentRequirements) => facilitator.verify(p, r),
    settle: (p: PaymentPayload, r: PaymentRequirements) => facilitator.settle(p, r),
    getSupported: async () => facilitator.getSupported(),
  };
  const resourceServer = new x402ResourceServer(facClient as never).register(NETWORK, new ServerScheme());
  const accepts = { scheme: 'exact', network: NETWORK, payTo: k.seller.publicKey(), price: { amount: PRICE, asset: token } };
  const routes = {
    'GET /good': { accepts, description: 'Fast JSON quote', mimeType: 'application/json' },
    'GET /slow': { accepts, description: 'Slow JSON quote', mimeType: 'application/json' },
    'GET /wrong-type': { accepts, description: 'Declares JSON, returns HTML', mimeType: 'application/json' },
    'GET /broken': { accepts, description: 'Always fails', mimeType: 'application/json' },
  };
  const app = express();
  app.use(paymentMiddleware(routes as never, resourceServer));
  app.get('/good', (_q, s) => { s.json({ pair: 'XLM/USD', price: 0.42, at: new Date().toISOString() }); });
  app.get('/slow', (_q, s) => { setTimeout(() => s.json({ pair: 'XLM/USD', price: 0.42 }), 3500); });
  app.get('/wrong-type', (_q, s) => { s.type('text/html').send('<html><body>not what you paid for</body></html>'); });
  app.get('/broken', (_q, s) => { s.status(500).json({ error: 'upstream down' }); });
  const http = await new Promise<import('node:http').Server>((ok) => { const h = app.listen(0, '127.0.0.1', () => ok(h)); });
  const base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;
  log('seller on', base);

  // 5-6. Measure, score, attest
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scope-demo-'));
  const store = new Store(path.join(dir, 'endpoints.json'));
  const endpoints: Record<string, unknown>[] = [];
  for (const name of ['good', 'slow', 'wrong-type', 'broken']) {
    const url = `${base}/${name}`;
    store.add(url, 'demo');
    const p = await probe(url);
    store.setProbe(url, p);
    log(`measuring /${name}: ${calls} paid calls`);
    for (let i = 0; i < calls; i++) {
      store.addCall(url, await measurePaid(url, { secret: k.buyer.secret(), network: NETWORK, maxAmount: 100_000n, declaredMime: p.paymentRequired?.resource?.mimeType }));
    }
    const rec = store.get(url)!;
    store.setScore(url, scoreEndpoint(p.issues, rec.calls));
    const scored = store.get(url)!;
    const ledger = await latestLedger(chain);
    const attTx = await writeAttestation(chain, k.signer.secret(), scored.key!, toAttestation(scored, ledger + DEFAULT_TTL_LEDGERS));
    store.setAttestation(url, { tx: attTx, expiresLedger: ledger + DEFAULT_TTL_LEDGERS, score: scored.score!.score!, at: new Date().toISOString() });
    store.save();
    log(`/${name}: score ${scored.score?.score}, attestation ${tx(attTx)}`);
    endpoints.push({
      endpoint: `/${name}`,
      key: scored.key,
      score: scored.score,
      settlements: scored.calls.filter((c) => c.transaction).map((c) => tx(c.transaction as string)),
      errors: [...new Set(scored.calls.map((c) => c.error).filter(Boolean))],
      attestationTx: tx(attTx),
    });
  }

  // 7. Read back from the contract
  for (const e of endpoints) {
    const c = await checkBeforePay(store, `${base}${e.endpoint}`, 80, { chain });
    e.verdict = c.verdict;
    e.onchain = c.onchain;
    log(`check_before_pay ${e.endpoint}: ${c.verdict.toUpperCase()} (onchain score ${c.onchain?.score})`);
  }

  // Agent with the trust guard
  const decisions: unknown[] = [];
  const agent = withTrustGuard(
    x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new ClientScheme(createEd25519Signer(k.buyer.secret(), NETWORK)) }], spendControls: false }),
    { check: localChecker(store, chain), minScore: 80, onDecision: (d) => decisions.push({ url: d.url.replace(base, ''), paid: d.paid, reason: d.reason }) },
  );
  const agentFetch = wrapFetchWithPayment(fetch, agent);
  for (const name of ['good', 'broken']) {
    try {
      const r = await agentFetch(`${base}/${name}`);
      log(`agent /${name}: HTTP ${r.status}`);
    } catch (e) {
      log(`agent /${name}: refused (${(e as Error).message})`);
    }
  }
  result.endpoints = endpoints;
  result.agentDecisions = decisions;
  result.finishedAt = new Date().toISOString();
  http.close();
  const out = flag('out', 'demo-result.json') as string;
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  log('result written to', out);
}

main().catch((e) => {
  console.error('demo failed:', e);
  process.exit(1);
});
