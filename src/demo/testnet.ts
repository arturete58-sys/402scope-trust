/**
 * End-to-end demo on Stellar testnet (v3). Every step is a real transaction:
 *
 *   1. fresh accounts (friendbot) and a SEP-41 test token (SCOPE);
 *   2. contracts: attestation registry (bonds in SCOPE), trust policy,
 *      ed25519 verifier and an agent wallet (OpenZeppelin smart account)
 *      with the trust policy installed: 2 of 2 attesters, score >= 80;
 *   3. three sellers behind a local x402 facilitator: "good" (fast + slow
 *      endpoints, delivery terms, per-response declarations, signed
 *      receipts), "bad" (wrong content type, broken endpoint) and "stale"
 *      (publishes the same terms, then serves data older than it promised
 *      and signs that declaration itself);
 *   4. two bonded attesters measure independently with real paid calls,
 *      then write endpoint and seller attestations with Merkle evidence roots;
 *   5. a piece of evidence is checked onchain (and a forged one rejected);
 *   6. the agent wallet pays the good seller over x402 and its own policy
 *      refuses to pay the bad and stale ones;
 *   7. the facilitator, with 402Scope trust hooks, refuses to settle a plain
 *      (unguarded) payment to the stale seller; a Bazaar listing is ranked;
 *   8. OpenZeppelin's "Built on Stellar" facilitator is tried as a drop-in;
 *   9. Stellar's official x402 demo is checked for conformance (unpaid).
 *
 * Usage: node dist/demo/testnet.js --wasm-dir contracts/target/wasm32v1-none/release [--calls 5] [--out demo-result.json]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { Address, Asset, BASE_FEE, Keypair, nativeToScVal, Networks, Operation, rpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { x402Facilitator } from '@x402/core/facilitator';
import { x402Client } from '@x402/core/client';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { wrapFetchWithPayment } from '@x402/fetch';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { createEd25519Signer } from '@x402/stellar';
import { ExactStellarScheme as FacilitatorScheme } from '@x402/stellar/exact/facilitator';
import { ExactStellarScheme as ServerScheme } from '@x402/stellar/exact/server';
import { ExactStellarScheme as ClientScheme } from '@x402/stellar/exact/client';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import {
  DEFAULT_TTL_LEDGERS, deployRegistry, deployWasm, latestLedger, registerAttester, submit, toAttestation, toSellerAttestation,
  TESTNET_RPC, trustedBy, verifySellerEvidence, writeAttestation, writeSellerAttestation, type ChainConfig,
} from '../chain.js';
import { checkBeforePay } from '../check.js';
import { evidenceLeaf, evidenceTree, proofFor } from '../evidence.js';
import { withTrustGuard, localChecker } from '../guard.js';
import { fromWellKnown } from '../indexer.js';
import { measurePaid } from '../measure.js';
import { probe } from '../probe.js';
import { deliveryReceipts } from '../receipts.js';
import { declare, declareDeliveryTerms, declarationsResourceServerExtension, readTerms, type DeliveryTerms } from '../declarations.js';
import { onchainSellerChecker, rankResources, withTrustHooks, type TrustDecision } from '../facilitator.js';
import { prepaidSeller } from '../prepaid.js';
import { NO_DECLARATIONS } from '../probe.js';
import { scoreEndpoint } from '../score.js';
import { sellerScores } from '../seller.js';
import { AgentWalletExactScheme, deployAgentWallet, invokeWithPasskey, passkeySigner, softwarePasskey, uploadWasm } from '../smart-account.js';
import { Store } from '../store.js';

const args = process.argv.slice(2);
const flag = (n: string, d?: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const NETWORK = 'stellar:testnet' as const;
const PASS = Networks.TESTNET;
const RPC = process.env.STELLAR_RPC_URL ?? TESTNET_RPC;
const PRICE = '10000'; // 0.001 SCOPE (7 decimals)
const BUDGET = 25_000n; // the budgeted wallet may spend 0.0025 SCOPE a day: two calls, not three
const UNIT = 10_000_000n; // 1 SCOPE
const txUrl = (h: string) => `https://stellar.expert/explorer/testnet/tx/${h}`;
const log = (...a: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function fund(pub: string): Promise<void> {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://friendbot.stellar.org?addr=${pub}`);
    if (r.ok) return;
    await new Promise((s) => setTimeout(s, 2500));
  }
  throw new Error(`friendbot could not fund ${pub}`);
}

async function classic(server: rpc.Server, source: Keypair, ops: xdr.Operation[]): Promise<string> {
  const account = await server.getAccount(source.publicKey());
  const b = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: PASS });
  ops.forEach((o) => b.addOperation(o));
  const t = b.setTimeout(60).build();
  t.sign(source);
  const sent = await server.sendTransaction(t);
  if (sent.status === 'ERROR') throw new Error(`classic tx failed: ${JSON.stringify(sent.errorResult)}`);
  const done = await server.pollTransaction(sent.hash, { attempts: 30 });
  if (done.status !== 'SUCCESS') throw new Error(`classic tx ${sent.hash} ${done.status}`);
  return sent.hash;
}

async function main(): Promise<void> {
  const dir = flag('wasm-dir', 'contracts/target/wasm32v1-none/release') as string;
  const wasm = (n: string) => fs.readFileSync(path.join(dir, `${n}.wasm`));
  const calls1 = Number(flag('calls', '5'));
  const calls2 = Math.max(3, Math.ceil(calls1 / 2));
  const server = new rpc.Server(RPC);
  const out: Record<string, unknown> = { version: 3, network: NETWORK, startedAt: new Date().toISOString() };

  // 1. Accounts and test token
  const k = {
    admin: Keypair.random(), issuer: Keypair.random(), sellerGood: Keypair.random(), sellerBad: Keypair.random(), sellerStale: Keypair.random(),
    buyer1: Keypair.random(), buyer2: Keypair.random(), facilitator: Keypair.random(),
    attester1: Keypair.random(), attester2: Keypair.random(),
  };
  const agentKey = Keypair.random(); // signs for the agent wallet; holds no funds itself
  log('funding accounts with friendbot');
  for (const kp of Object.values(k)) await fund(kp.publicKey());
  out.accounts = Object.fromEntries(Object.entries(k).map(([n, kp]) => [n, kp.publicKey()]));

  log('issuing the SCOPE test token');
  const asset = new Asset('SCOPE', k.issuer.publicKey());
  for (const kp of [k.sellerGood, k.sellerBad, k.sellerStale, k.buyer1, k.buyer2, k.attester1, k.attester2]) await classic(server, kp, [Operation.changeTrust({ asset })]);
  await classic(server, k.issuer, [
    Operation.payment({ destination: k.buyer1.publicKey(), asset, amount: '100' }),
    Operation.payment({ destination: k.buyer2.publicKey(), asset, amount: '100' }),
    Operation.payment({ destination: k.attester1.publicKey(), asset, amount: '1000' }),
    Operation.payment({ destination: k.attester2.publicKey(), asset, amount: '1000' }),
  ]);
  await submit(server, PASS, k.issuer, Operation.createStellarAssetContract({ asset }));
  const token = asset.contractId(PASS);

  // 2. Contracts
  log('deploying the attestation registry');
  const registry = await deployRegistry({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_attestations'), admin: k.admin.publicKey(), bondToken: token, minBond: 500n * UNIT, unbondLedgers: 17_280 });
  log('deploying the trust policy and the ed25519 verifier');
  const policy = await deployWasm({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_trust_policy'), args: null });
  const verifier = await deployWasm({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_ed25519_verifier'), args: null });
  const attesters = [k.attester1.publicKey(), k.attester2.publicKey()];
  const policyParams = { registry, attesters, minScore: 80, quorum: 2, maxUnverified: 0n };
  log('deploying the agent wallet with the trust policy installed');
  const walletHash = await uploadWasm({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_agent_wallet') });
  const wallet = await deployAgentWallet({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, walletWasmHash: walletHash, verifier, signerKey: agentKey, policy, params: policyParams });
  await submit(server, PASS, k.issuer, Operation.invokeContractFunction({ contract: token, function: 'mint', args: [new Address(wallet).toScVal(), nativeToScVal(10n * UNIT, { type: 'i128' })] }));
  // A second wallet with a budget: the trust policy decides who, the spending limit how much.
  log('deploying a budgeted agent wallet (trust policy + spending limit)');
  const limitPolicy = await deployWasm({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_spending_limit'), args: null });
  // The owner manages the budgeted wallet with a passkey (a software one here; a browser's in real use).
  const webauthnVerifier = await deployWasm({ rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, wasm: wasm('scope_webauthn_verifier'), args: null });
  const ownerPasskey = softwarePasskey();
  const budget = { spendingLimit: BUDGET, periodLedgers: 17_280 };
  const budgetWallet = await deployAgentWallet({
    rpcUrl: RPC, networkPassphrase: PASS, deployer: k.admin, walletWasmHash: walletHash, verifier, signerKey: agentKey, policy, params: policyParams,
    token, spendingLimit: { policy: limitPolicy, ...budget }, admins: [passkeySigner(webauthnVerifier, ownerPasskey.publicKey, ownerPasskey.credentialId)],
  });
  await submit(server, PASS, k.issuer, Operation.invokeContractFunction({ contract: token, function: 'mint', args: [new Address(budgetWallet).toScVal(), nativeToScVal(10n * UNIT, { type: 'i128' })] }));
  const c = (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`;
  out.contracts = { registry, policy, verifier, wallet, token, spendingLimit: limitPolicy, budgetWallet, webauthnVerifier, links: { registry: c(registry), policy: c(policy), wallet: c(wallet), token: c(token), spendingLimit: c(limitPolicy), budgetWallet: c(budgetWallet), webauthnVerifier: c(webauthnVerifier) } };
  out.policy = { attesters, minScore: 80, quorum: 2, maxUnverified: '0' };
  log('registry', registry, 'policy', policy, 'wallet', wallet);

  const chain: ChainConfig = { contractId: registry, rpcUrl: RPC, networkPassphrase: PASS, attesters, quorum: 2 };
  out.attesters = [];
  for (const a of [k.attester1, k.attester2]) {
    const bondTx = await registerAttester(chain, a.secret(), 500n * UNIT);
    (out.attesters as unknown[]).push({ address: a.publicKey(), bond: '500 SCOPE', tx: txUrl(bondTx) });
  }

  // 3. Local facilitator and two sellers
  // Smart-account payments run __check_auth and the policy (cross-contract reads), so they cost more
  // than a classic transfer; the facilitator's default fee ceiling (50,000 stroops) is raised here.
  const facilitator = new x402Facilitator().register(NETWORK, new FacilitatorScheme([createEd25519Signer(k.facilitator.secret(), NETWORK)], { maxTransactionFeeStroops: 2_000_000 }));
  // 402Scope trust hooks on a standard facilitator. Off while attesters measure; enforced from step 7.
  let enforce = false;
  const onchainCheck = onchainSellerChecker({ contractId: registry, rpcUrl: RPC, networkPassphrase: PASS, attesters, quorum: 2 }, 80);
  const facilitatorDecisions: TrustDecision[] = [];
  withTrustHooks(facilitator, {
    mode: 'block',
    cacheMs: 0,
    check: async (payTo, net) => (enforce ? onchainCheck(payTo, net) : { trusted: true, score: null, source: 'onchain', reason: 'hooks off during measurement' }),
    onDecision: (d) => { if (enforce) facilitatorDecisions.push(d); },
  });
  // What the facilitator said when it refused (onAfterVerify does not run for invalid payments).
  const verifyLog: unknown[] = [];
  const facClient = {
    verify: async (p: PaymentPayload, r: PaymentRequirements) => {
      const res = await facilitator.verify(p, r).catch((e: Error) => { verifyLog.push({ step: 'verify', error: e.message }); throw e; });
      if (!res.isValid) verifyLog.push({ step: 'verify', reason: res.invalidReason, message: (res as { invalidMessage?: string }).invalidMessage });
      return res;
    },
    settle: async (p: PaymentPayload, r: PaymentRequirements) => {
      const res = await facilitator.settle(p, r).catch((e: Error) => { verifyLog.push({ step: 'settle', error: e.message }); throw e; });
      if (!res.success) verifyLog.push({ step: 'settle', reason: res.errorReason, transaction: res.transaction });
      return res;
    },
    getSupported: async () => facilitator.getSupported(),
  };
  const resourceServer = new x402ResourceServer(facClient as never).register(NETWORK, new ServerScheme()).registerExtension(declarationsResourceServerExtension);
  const terms: DeliveryTerms = { version: 1, freshness: { maxAgeSeconds: 60, basis: 'live' }, provenance: { source: 'demo-feed' }, perResponse: true, onBreach: 'refund' };
  const accepts = (payTo: Keypair) => ({ scheme: 'exact', network: NETWORK, payTo: payTo.publicKey(), price: { amount: PRICE, asset: token } });
  const routes = {
    'GET /good': { accepts: accepts(k.sellerGood), description: 'Fast JSON quote', mimeType: 'application/json', extensions: declareDeliveryTerms(terms) },
    'GET /slow': { accepts: accepts(k.sellerGood), description: 'Slow JSON quote', mimeType: 'application/json', extensions: declareDeliveryTerms(terms) },
    'GET /stale': { accepts: accepts(k.sellerStale), description: 'Promises data under 60 s old, serves 20-minute-old data', mimeType: 'application/json', extensions: declareDeliveryTerms(terms) },
    'GET /wrong-type': { accepts: accepts(k.sellerBad), description: 'Declares JSON, returns HTML', mimeType: 'application/json' },
    'GET /broken': { accepts: accepts(k.sellerBad), description: 'Always fails', mimeType: 'application/json' },
  };
  const app = express();
  app.use(['/good', '/slow'], deliveryReceipts({ secret: k.sellerGood.secret(), resourceUrl: (req) => `${base}${req.originalUrl}` }));
  app.use('/stale', deliveryReceipts({ secret: k.sellerStale.secret(), resourceUrl: (req) => `${base}${req.originalUrl}` }));
  app.use(paymentMiddleware(routes as never, resourceServer));
  const fresh = { freshness: { ageSeconds: 2, isStale: false, basis: 'live' as const }, provenance: { source: 'demo-feed' } };
  app.get('/good', (_q, s) => { declare(s, fresh); s.json({ pair: 'XLM/USD', price: 0.42, at: new Date().toISOString() }); });
  app.get('/slow', (_q, s) => { setTimeout(() => { declare(s, fresh); s.json({ pair: 'XLM/USD', price: 0.42 }); }, 3500); });
  // Honest about its age, but the age breaks the terms it published: signed by its own key.
  app.get('/stale', (_q, s) => { declare(s, { freshness: { ageSeconds: 1200, isStale: false, basis: 'cache' }, provenance: { source: 'demo-feed' } }); s.json({ pair: 'XLM/USD', price: 0.39 }); });
  app.get('/wrong-type', (_q, s) => { s.type('text/html').send('<html><body>not what you paid for</body></html>'); });
  app.get('/broken', (_q, s) => { s.status(500).json({ error: 'upstream down' }); });
  const http = await new Promise<import('node:http').Server>((ok) => { const h = app.listen(0, '127.0.0.1', () => ok(h)); });
  const base = `http://127.0.0.1:${(http.address() as AddressInfo).port}`;
  const names = ['good', 'slow', 'wrong-type', 'broken', 'stale'];

  // 4. Two attesters measure independently and attest
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scope-demo-'));
  async function measureAll(label: string, buyer: Keypair, n: number): Promise<Store> {
    const store = new Store(path.join(tmp, `${label}.json`));
    for (const name of names) {
      const url = `${base}/${name}`;
      store.add(url, 'demo');
      const p = await probe(url);
      store.setProbe(url, p);
      log(`${label} measuring /${name}: ${n} paid calls`);
      for (let i = 0; i < n; i++) store.addCall(url, await measurePaid(url, { secret: buyer.secret(), network: NETWORK, maxAmount: 100_000n, declaredMime: p.paymentRequired?.resource?.mimeType, terms: readTerms(p.paymentRequired) }));
      store.setScore(url, scoreEndpoint(p.issues, store.get(url)!.calls));
      store.save();
    }
    return store;
  }
  const stores = [await measureAll('attester1', k.buyer1, calls1), await measureAll('attester2', k.buyer2, calls2)];
  const ledger = await latestLedger(chain);
  const expires = ledger + DEFAULT_TTL_LEDGERS;
  const sellerLabel = (s: string) => (s === k.sellerGood.publicKey() ? 'good seller' : s === k.sellerStale.publicKey() ? 'stale seller' : 'bad seller');
  const endpoints: Record<string, unknown>[] = [];
  const sellers: Record<string, Record<string, unknown>> = {};
  for (const [i, store] of stores.entries()) {
    const secret = [k.attester1, k.attester2][i].secret();
    for (const name of names) {
      const r = store.get(`${base}/${name}`)!;
      const t = await writeAttestation(chain, secret, r.key!, toAttestation(r, expires));
      if (i === 0) {
        endpoints.push({
          endpoint: `/${name}`,
          seller: sellerLabel(r.payTo!),
          score: r.score,
          receipts: r.calls.map((x) => x.receipt),
          terms: readTerms(r.probe?.paymentRequired) !== null,
          declarations: r.calls.map((x) => x.declaration ?? null),
          settlements: r.calls.filter((x) => x.transaction).map((x) => txUrl(x.transaction as string)),
          errors: [...new Set(r.calls.map((x) => x.error).filter(Boolean))],
          attestationTx: txUrl(t),
        });
      }
    }
    for (const s of sellerScores(store.all())) {
      const t = await writeSellerAttestation(chain, secret, s.seller, toSellerAttestation(s, expires));
      const row = (sellers[s.seller] ??= { seller: s.seller, label: sellerLabel(s.seller), attestations: [] });
      (row.attestations as unknown[]).push({ attester: attesters[i], score: s.score, calls: s.calls, delivered: s.delivered, receipts: s.receipts, tx: txUrl(t) });
      log(`attester${i + 1} -> ${sellerLabel(s.seller)}: ${s.score}`);
    }
  }
  for (const s of Object.values(sellers)) s.trustedBy2of2 = await trustedBy(chain, s.seller as string, attesters, 80, 2);
  out.endpoints = endpoints;
  out.sellers = Object.values(sellers);

  // 5. Evidence checked onchain
  const goodScore = sellerScores(stores[0].all()).find((s) => s.seller === k.sellerGood.publicKey())!;
  const tree = evidenceTree(goodScore.evidence);
  const leaf = evidenceLeaf(goodScore.evidence[0]);
  const forged = evidenceLeaf({ ...goodScore.evidence[0], delivered: !goodScore.evidence[0].delivered });
  out.evidence = {
    attester: attesters[0],
    seller: 'good seller',
    leaves: goodScore.evidence.length,
    root: tree.root.toString('hex'),
    realLeafVerifiedOnchain: await verifySellerEvidence(chain, attesters[0], k.sellerGood.publicKey(), leaf, proofFor(tree, 0)),
    forgedLeafVerifiedOnchain: await verifySellerEvidence(chain, attesters[0], k.sellerGood.publicKey(), forged, proofFor(tree, 0)),
  };
  log('evidence', out.evidence);

  // 6. The agent wallet pays over x402; its own policy decides
  const agent = wrapFetchWithPayment(fetch, x402Client.fromConfig({
    schemes: [{ network: 'stellar:*', client: new AgentWalletExactScheme({ account: wallet, key: agentKey, verifier, contextRuleId: 0 }, { url: RPC }) }],
    spendControls: false,
  }));
  const walletPayments: Record<string, unknown>[] = [];
  for (const name of ['good', 'broken', 'wrong-type', 'stale']) {
    try {
      const r = await agent(`${base}/${name}`);
      const settle = r.headers.get('PAYMENT-RESPONSE');
      const txh = settle ? JSON.parse(Buffer.from(settle, 'base64').toString()).transaction : null;
      const detail = r.ok ? undefined : (await r.text()).slice(0, 300);
      walletPayments.push({ endpoint: `/${name}`, outcome: r.ok ? 'paid' : `HTTP ${r.status}`, tx: txh ? txUrl(txh) : null, reason: detail, facilitator: r.ok ? undefined : verifyLog.at(-1) });
      log(`agent wallet /${name}: HTTP ${r.status}`);
    } catch (e) {
      const msg = (e as Error).message;
      walletPayments.push({ endpoint: `/${name}`, outcome: 'refused by the wallet policy', reason: msg.slice(0, 300) });
      log(`agent wallet /${name}: refused (${msg.slice(0, 120)})`);
    }
  }
  out.walletPayments = walletPayments;

  // 6b. The budgeted wallet: same trust policy, plus a spending limit. The bad seller first (trust policy),
  // then the trusted seller three times in a row (spending limit).
  const budgeted = wrapFetchWithPayment(fetch, x402Client.fromConfig({
    schemes: [{ network: 'stellar:*', client: new AgentWalletExactScheme({ account: budgetWallet, key: agentKey, verifier, contextRuleId: 0 }, { url: RPC }) }],
    spendControls: false,
  }));
  const budgetPayments: Record<string, unknown>[] = [];
  for (const name of ['broken', 'good', 'good', 'good']) {
    try {
      const r = await budgeted(`${base}/${name}`);
      const settle = r.headers.get('PAYMENT-RESPONSE');
      const txh = settle ? JSON.parse(Buffer.from(settle, 'base64').toString()).transaction : null;
      budgetPayments.push({ endpoint: `/${name}`, outcome: r.ok ? 'paid' : `HTTP ${r.status}`, tx: txh ? txUrl(txh) : null, reason: r.ok ? undefined : (await r.text()).slice(0, 300), facilitator: r.ok ? undefined : verifyLog.at(-1) });
    } catch (e) {
      const msg = (e as Error).message;
      const why = /#3302\b|LimitExceeded/.test(msg) ? 'over the spending limit' : /#1\b|NotTrusted/.test(msg) ? 'seller not trusted' : 'refused';
      budgetPayments.push({ endpoint: `/${name}`, outcome: `refused by the wallet: ${why}`, reason: msg.slice(0, 300) });
    }
    log(`budgeted wallet /${name}: ${budgetPayments.at(-1)!.outcome}`);
  }
  // The owner raises the budget with the passkey (rule 1); the agent key could not. Then the agent pays again.
  const owner: Record<string, unknown> = { newLimit: (BUDGET * 2n).toString() };
  try {
    const passkey = { account: budgetWallet, verifier: webauthnVerifier, publicKey: ownerPasskey.publicKey, credentialId: ownerPasskey.credentialId, contextRuleId: 1, assert: ownerPasskey.assert };
    const args = [new Address(budgetWallet).toScVal(), xdr.ScVal.scvU32(0), nativeToScVal(BUDGET * 2n, { type: 'i128' })];
    const h = await invokeWithPasskey({ rpcUrl: RPC, networkPassphrase: PASS, source: k.admin, contractId: limitPolicy, method: 'set_spending_limit', args, passkey });
    owner.tx = h ? txUrl(h) : null;
    owner.raised = true;
    const r = await budgeted(`${base}/good`);
    const settle = r.headers.get('PAYMENT-RESPONSE');
    const txh = settle ? JSON.parse(Buffer.from(settle, 'base64').toString()).transaction : null;
    owner.paymentAfter = { endpoint: '/good', outcome: r.ok ? 'paid' : `HTTP ${r.status}`, tx: txh ? txUrl(txh) : null };
  } catch (e) {
    owner.raised = false;
    owner.error = (e as Error).message.slice(0, 300);
  }
  log('owner passkey', owner);
  out.budgetWallet = { wallet: budgetWallet, price: PRICE, limit: BUDGET.toString(), periodLedgers: budget.periodLedgers, payments: budgetPayments, owner };

  // check_before_pay with the onchain quorum, and the off-chain guard for classic accounts
  out.checks = [];
  for (const name of names) {
    const r = await checkBeforePay(stores[0], `${base}/${name}`, 80, { chain });
    (out.checks as unknown[]).push({ endpoint: `/${name}`, verdict: r.verdict, score: r.score, trusted: r.onchain?.trusted ?? null });
  }
  const decisions: unknown[] = [];
  const guarded = wrapFetchWithPayment(fetch, withTrustGuard(
    x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new ClientScheme(createEd25519Signer(k.buyer1.secret(), NETWORK)) }], spendControls: false }),
    { check: localChecker(stores[0], chain), minScore: 80, onDecision: (d) => decisions.push({ url: d.url.replace(base, ''), paid: d.paid, reason: d.reason }) },
  ));
  for (const name of ['good', 'broken']) { try { await guarded(`${base}/${name}`); } catch { /* refused */ } }
  out.guardDecisions = decisions;

  // 7. Any facilitator: trust hooks on the facilitator, and a ranked Bazaar listing
  enforce = true;
  const plain = wrapFetchWithPayment(fetch, x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new ClientScheme(createEd25519Signer(k.buyer2.secret(), NETWORK)) }], spendControls: false }));
  const facilitatorPayments: Record<string, unknown>[] = [];
  for (const name of ['good', 'stale']) {
    try {
      const r = await plain(`${base}/${name}`);
      facilitatorPayments.push({ endpoint: `/${name}`, outcome: r.ok ? 'paid' : `HTTP ${r.status}`, reason: r.ok ? undefined : verifyLog.at(-1) });
    } catch (e) {
      facilitatorPayments.push({ endpoint: `/${name}`, outcome: 'error', reason: (e as Error).message.slice(0, 200) });
    }
  }
  out.facilitatorHooks = { mode: 'block', payments: facilitatorPayments, decisions: facilitatorDecisions.map((d) => ({ seller: sellerLabel(d.payTo), action: d.action, score: d.verdict?.score ?? null, reason: d.verdict?.reason ?? d.error })) };
  const listing = names.map((name) => ({ resource: `${base}/${name}`, accepts: [{ network: NETWORK, payTo: stores[0].get(`${base}/${name}`)!.payTo! }] }));
  out.rankedDiscovery = (await rankResources(listing, onchainCheck)).map((it) => ({ endpoint: String(it.resource).replace(base, ''), trusted: it.trust?.trusted ?? null, score: it.trust?.score ?? null }));

  // 8. OpenZeppelin's Built on Stellar facilitator as a drop-in (testnet key from its public generator)
  out.openzeppelin = await tryOpenZeppelin({ server, token, sellerGood: k.sellerGood, buyer: k.buyer1, wallet, agentKey, verifier });

  // 8b. Prepaid ledgers (Fermah Pay, batch-settlement): read the seller role a receipt must be signed by.
  try {
    const ledger = 'CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI';
    const seller = await prepaidSeller(ledger, NETWORK, RPC);
    out.prepaidLedger = { contract: ledger, seller, readable: !!seller };
  } catch (e) {
    out.prepaidLedger = { error: (e as Error).message.slice(0, 200) };
  }

  // 9. Stellar's official demo (unpaid conformance check)
  try {
    const found = await fromWellKnown('https://stellar.org/x402-demo/api', { query: 'city=Valencia' });
    const probes = [];
    for (const d of found) {
      const p = await probe(d.url);
      probes.push({ url: d.url, status: p.status, networks: p.stellar.map((a) => a.network), terms: readTerms(p.paymentRequired) !== null, issues: p.issues.filter((i) => i.code !== NO_DECLARATIONS).map((i) => i.message) });
    }
    out.officialDemo = { manifest: 'https://stellar.org/x402-demo/api/.well-known/x402', probes };
  } catch (e) {
    out.officialDemo = { error: (e as Error).message };
  }

  out.finishedAt = new Date().toISOString();
  http.close();
  const file = flag('out', 'demo-result.json') as string;
  fs.writeFileSync(file, JSON.stringify(out, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
  log('result written to', file);
  const goodPaid = walletPayments[0]?.outcome === 'paid';
  const badRefused = walletPayments.slice(1).every((p) => String(p.outcome).startsWith('refused'));
  const facOk = facilitatorPayments[0]?.outcome === 'paid' && facilitatorPayments[1]?.outcome !== 'paid';
  const o = budgetPayments.map((p) => String(p.outcome));
  const budgetOk = o[0] === 'refused by the wallet: seller not trusted' && o[1] === 'paid' && o[2] === 'paid' && o[3] === 'refused by the wallet: over the spending limit' && owner.raised === true && (owner.paymentAfter as { outcome?: string } | undefined)?.outcome === 'paid';
  if (!budgetOk) log('budgeted wallet expectations not met', JSON.stringify(budgetPayments.map((p) => ({ outcome: p.outcome, facilitator: p.facilitator, reason: String(p.reason ?? '').slice(0, 160) }))));
  if (!goodPaid || !badRefused || !facOk || !budgetOk || !(out.evidence as { realLeafVerifiedOnchain: boolean }).realLeafVerifiedOnchain) {
    throw new Error(`demo expectations not met: goodPaid=${goodPaid} badRefused=${badRefused} facilitatorHooks=${facOk} budget=${o.join(',')}`);
  }
}

/**
 * Pays the good seller through OpenZeppelin's hosted facilitator, from a
 * classic account and from the agent wallet, first in the SCOPE test token
 * and then in testnet USDC (bought on the testnet DEX, if there is liquidity).
 * Never fails the demo: what the hosted facilitator accepts is recorded,
 * with its own verify/settle answers, as a finding.
 */
async function tryOpenZeppelin(o: { server: rpc.Server; token: string; sellerGood: Keypair; buyer: Keypair; wallet: string; agentKey: Keypair; verifier: string }): Promise<Record<string, unknown>> {
  const url = 'https://channels.openzeppelin.com/x402/testnet';
  const res: Record<string, unknown> = { facilitator: url };
  try {
    const g = await fetch('https://channels.openzeppelin.com/testnet/gen', { signal: AbortSignal.timeout(20_000) });
    const text = await g.text();
    let key = text.trim();
    try { const j = JSON.parse(text); key = j.apiKey ?? j.api_key ?? j.key ?? j.token ?? j.data?.apiKey ?? j.data?.api_key ?? key; } catch { /* plain text */ }
    if (!g.ok || !key || key.length > 512) return { ...res, error: `testnet key generator returned ${g.status}` };
    const auth = { Authorization: `Bearer ${key}` };
    const client = new HTTPFacilitatorClient({ url, createAuthHeaders: async () => ({ verify: auth, settle: auth, supported: auth }) });
    const supported = await client.getSupported();
    res.supported = (supported.kinds ?? []).map((x: { scheme: string; network: string }) => `${x.scheme} ${x.network}`);
    // Record the facilitator's own answers.
    let last: unknown = null;
    const logged = {
      verify: async (p: PaymentPayload, r: PaymentRequirements) => { try { const v = await client.verify(p, r); last = { step: 'verify', ...v }; return v; } catch (e) { last = { step: 'verify', error: (e as Error).message.slice(0, 200) }; throw e; } },
      settle: async (p: PaymentPayload, r: PaymentRequirements) => { try { const v = await client.settle(p, r); last = { step: 'settle', ...v }; return v; } catch (e) { last = { step: 'settle', error: (e as Error).message.slice(0, 200) }; throw e; } },
      getSupported: () => client.getSupported(),
    };
    const rs = new x402ResourceServer(logged as never).register(NETWORK, new ServerScheme());

    // USDC on the testnet DEX for the buyer, and some for the agent wallet.
    let usdc: string | null = null;
    try {
      const USDC = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
      // The seller needs a USDC trustline to receive (SAC error #13 otherwise).
      await classic(o.server, o.buyer, [Operation.changeTrust({ asset: USDC })]);
      await classic(o.server, o.sellerGood, [Operation.changeTrust({ asset: USDC })]);
      await classic(o.server, o.buyer, [Operation.pathPaymentStrictSend({ sendAsset: Asset.native(), sendAmount: '500', destination: o.buyer.publicKey(), destAsset: USDC, destMin: '0.05', path: [] })]);
      usdc = USDC.contractId(PASS);
      await submit(o.server, PASS, o.buyer, Operation.invokeContractFunction({ contract: usdc, function: 'transfer', args: [new Address(o.buyer.publicKey()).toScVal(), new Address(o.wallet).toScVal(), nativeToScVal(200_000n, { type: 'i128' })] }));
      res.usdc = 'bought on the testnet DEX';
    } catch (e) {
      res.usdc = `not available: ${(e as Error).message.slice(0, 160)}`;
    }

    const app = express();
    const route = (asset: string) => ({ accepts: { scheme: 'exact', network: NETWORK, payTo: o.sellerGood.publicKey(), price: { amount: PRICE, asset } }, description: 'Quote via OpenZeppelin', mimeType: 'application/json' });
    app.use(paymentMiddleware({ 'GET /oz-scope': route(o.token), ...(usdc ? { 'GET /oz-usdc': route(usdc) } : {}) } as never, rs));
    app.get(['/oz-scope', '/oz-usdc'], (_q, s) => { s.json({ pair: 'XLM/USD', price: 0.42 }); });
    const h = await new Promise<import('node:http').Server>((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
    const base = `http://127.0.0.1:${(h.address() as AddressInfo).port}`;
    const payers = {
      'classic account': wrapFetchWithPayment(fetch, x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new ClientScheme(createEd25519Signer(o.buyer.secret(), NETWORK)) }], spendControls: false })),
      'agent wallet': wrapFetchWithPayment(fetch, x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new AgentWalletExactScheme({ account: o.wallet, key: o.agentKey, verifier: o.verifier, contextRuleId: 0 }, { url: RPC }) }], spendControls: false })),
    };
    const payments: Record<string, unknown>[] = [];
    for (const [asset, path] of [['SCOPE', '/oz-scope'], ...(usdc ? [['USDC', '/oz-usdc']] : [])]) {
      for (const [payer, f] of Object.entries(payers)) {
        last = null;
        try {
          const r = await f(`${base}${path}`, { signal: AbortSignal.timeout(90_000) });
          const settle = r.headers.get('PAYMENT-RESPONSE');
          const txh = settle ? JSON.parse(Buffer.from(settle, 'base64').toString()).transaction : null;
          let challengeError: string | undefined;
          const pr = r.headers.get('PAYMENT-REQUIRED');
          if (!r.ok && pr) { try { challengeError = JSON.parse(Buffer.from(pr, 'base64').toString()).error; } catch { /* ignore */ } }
          payments.push({ asset, payer, outcome: r.ok ? 'paid' : `HTTP ${r.status}`, tx: txh ? txUrl(txh) : null, facilitator: r.ok ? undefined : last, error: challengeError });
        } catch (e) {
          payments.push({ asset, payer, outcome: 'error', detail: (e as Error).message.slice(0, 200), facilitator: last });
        }
      }
    }
    res.payments = payments;
    h.close();
  } catch (e) {
    res.error = (e as Error).message.slice(0, 300);
  }
  return res;
}

main().catch((e) => {
  console.error('demo failed:', e);
  process.exit(1);
});
