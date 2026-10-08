import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodePaymentRequiredHeader } from '@x402/core/http';
import { USDC_TESTNET_ADDRESS } from '@x402/stellar';
import { Keypair } from '@stellar/stellar-sdk';
import { probe } from '../probe.js';
import { createApi } from '../api.js';
import { Store } from '../store.js';
import { attestationKey } from '../key.js';
import { fromWellKnown } from '../indexer.js';
import { declareDeliveryTerms, readTerms } from '../declarations.js';

const PAY_TO = Keypair.random().publicKey();
let seller: http.Server;
let api: http.Server;
let sellerUrl = '';
let apiUrl = '';
let dir = '';

const challenge = (url: string) => ({
  x402Version: 2,
  resource: { url, description: 'Test data', mimeType: 'application/json' },
  accepts: [{ scheme: 'exact', network: 'stellar:testnet', asset: USDC_TESTNET_ADDRESS, amount: '10000', payTo: PAY_TO, maxTimeoutSeconds: 60, extra: { areFeesSponsored: true } }],
  extensions: declareDeliveryTerms({ version: 1, freshness: { maxAgeSeconds: 60 } }),
});

before(async () => {
  process.env.TRUST_ALLOW_LOCAL = '1';
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trust-'));
  seller = http.createServer((req, res) => {
    const url = `${sellerUrl}${req.url}`;
    if (req.url === '/good') {
      res.writeHead(402, { 'PAYMENT-REQUIRED': encodePaymentRequiredHeader(challenge(url) as never), 'content-type': 'application/json' });
      return res.end('{}');
    }
    if (req.url === '/api/.well-known/x402') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ version: 1, resources: ['GET /api/good', 'POST /api/ignored', 42] }));
    }
    if (req.url === '/body-only') {
      res.writeHead(402, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(challenge(url)));
    }
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('free');
  });
  await new Promise<void>((r) => seller.listen(0, '127.0.0.1', r));
  sellerUrl = `http://127.0.0.1:${(seller.address() as { port: number }).port}`;
  api = createApi(new Store(path.join(dir, 'endpoints.json')));
  await new Promise<void>((r) => api.listen(0, '127.0.0.1', r));
  apiUrl = `http://127.0.0.1:${(api.address() as { port: number }).port}`;
});

after(() => {
  seller.close();
  api.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

test('probe accepts a conformant Stellar challenge', async () => {
  const p = await probe(`${sellerUrl}/good`);
  assert.equal(p.status, 402);
  assert.equal(p.stellar.length, 1);
  assert.deepEqual(p.issues, []);
});

test('probe flags a challenge sent only in the body', async () => {
  const p = await probe(`${sellerUrl}/body-only`);
  assert.deepEqual(p.issues.map((i) => i.code), ['no-header']);
});

test('probe flags an endpoint that does not ask for payment', async () => {
  const p = await probe(`${sellerUrl}/free`);
  assert.deepEqual(p.issues.map((i) => i.code), ['not-402']);
});

test('API check: unmeasured endpoint is unknown, broken one is avoid', async () => {
  const good = await (await fetch(`${apiUrl}/v1/check?url=${encodeURIComponent(`${sellerUrl}/good`)}`)).json();
  assert.equal(good.verdict, 'unknown');
  assert.equal(good.key, attestationKey(PAY_TO, `${sellerUrl}/good`));
  assert.equal(good.payTo, PAY_TO);
  const bad = await (await fetch(`${apiUrl}/v1/check?url=${encodeURIComponent(`${sellerUrl}/free`)}`)).json();
  assert.equal(bad.verdict, 'avoid');
  const list = await (await fetch(`${apiUrl}/v1/endpoints`)).json();
  assert.equal(list.count, 2);
  const one = await fetch(`${apiUrl}/v1/endpoints/${good.key}`);
  assert.equal(one.status, 200);
});

test('API rejects bad input', async () => {
  assert.equal((await fetch(`${apiUrl}/v1/check`)).status, 400);
  assert.equal((await fetch(`${apiUrl}/v1/check?url=notaurl`)).status, 400);
  assert.equal((await fetch(`${apiUrl}/v1/endpoints/xyz`)).status, 404);
  assert.equal((await fetch(`${apiUrl}/v1/endpoints`, { method: 'POST' })).status, 405);
});

test('MCP server lists its tools and answers check_before_pay', async () => {
  const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js');
  const child = spawn(process.execPath, [cli, 'mcp'], { env: { ...process.env, TRUST_DATA_DIR: dir, TRUST_ALLOW_LOCAL: '1' }, stdio: ['pipe', 'pipe', 'inherit'] });
  const replies = new Map<number, any>();
  let buf = '';
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      if (line.trim()) { const m = JSON.parse(line); if (m.id != null) replies.set(m.id, m); }
    }
  });
  const send = (m: object) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...m }) + '\n');
  const wait = async (id: number) => { for (let t = 0; t < 200 && !replies.has(id); t++) await new Promise((r) => setTimeout(r, 25)); return replies.get(id); };
  send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } } });
  await wait(1);
  send({ method: 'notifications/initialized' });
  send({ id: 2, method: 'tools/list' });
  const tools = await wait(2);
  assert.deepEqual(tools.result.tools.map((t: { name: string }) => t.name).sort(), ['check_before_pay', 'list_trusted_endpoints', 'observatory_decision']);
  send({ id: 3, method: 'tools/call', params: { name: 'check_before_pay', arguments: { url: `${sellerUrl}/good` } } });
  const r = await wait(3);
  child.kill();
  assert.equal(r.result.structuredContent.verdict, 'unknown');
  assert.match(r.result.content[0].text, /^UNKNOWN/);
});

test('probe accepts the challenge of the official @x402/express seller with delivery terms, and the trust guard blocks an unmeasured endpoint', async () => {
  const { default: express } = await import('express');
  const { x402Facilitator } = await import('@x402/core/facilitator');
  const { x402Client } = await import('@x402/core/client');
  const { wrapFetchWithPayment } = await import('@x402/fetch');
  const { paymentMiddleware, x402ResourceServer } = await import('@x402/express');
  const { createEd25519Signer } = await import('@x402/stellar');
  const { ExactStellarScheme: F } = await import('@x402/stellar/exact/facilitator');
  const { ExactStellarScheme: S } = await import('@x402/stellar/exact/server');
  const { ExactStellarScheme: C } = await import('@x402/stellar/exact/client');
  const { withTrustGuard, localChecker } = await import('../guard.js');
  const { declarationsResourceServerExtension } = await import('../declarations.js');
  const terms = { version: 1 as const, freshness: { maxAgeSeconds: 30, basis: 'live' as const }, provenance: { source: 'test-feed' }, perResponse: true, onBreach: 'refund' as const };
  const fac = new x402Facilitator().register('stellar:testnet', new F([createEd25519Signer(Keypair.random().secret(), 'stellar:testnet')]));
  const fc = { verify: (p: any, r: any) => fac.verify(p, r), settle: (p: any, r: any) => fac.settle(p, r), getSupported: async () => fac.getSupported() };
  const rs = new x402ResourceServer(fc as never).register('stellar:testnet', new S()).registerExtension(declarationsResourceServerExtension);
  const app = express();
  app.use(paymentMiddleware({ 'GET /data': { accepts: { scheme: 'exact', network: 'stellar:testnet', payTo: PAY_TO, price: { amount: '10000', asset: USDC_TESTNET_ADDRESS } }, description: 'Data', mimeType: 'application/json', extensions: declareDeliveryTerms(terms) } } as never, rs));
  app.get('/data', (_q: any, s: any) => s.json({ ok: true }));
  const h = await new Promise<http.Server>((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
  const url = `http://127.0.0.1:${(h.address() as { port: number }).port}/data`;
  try {
    const p = await probe(url);
    assert.equal(p.status, 402);
    assert.deepEqual(p.issues, []);
    assert.equal(p.stellar[0].payTo, PAY_TO);
    // The official server carries the delivery terms through unchanged.
    assert.deepEqual(readTerms(p.paymentRequired), terms);

    const store = new Store(path.join(dir, 'guard.json'));
    const decisions: { paid: boolean; reason?: string }[] = [];
    const agent = withTrustGuard(
      x402Client.fromConfig({ schemes: [{ network: 'stellar:*', client: new C(createEd25519Signer(Keypair.random().secret(), 'stellar:testnet')) }], spendControls: false }),
      { check: localChecker(store), onDecision: (d) => decisions.push(d) },
    );
    await assert.rejects(wrapFetchWithPayment(fetch, agent)(url), /not measured yet/);
    assert.deepEqual(decisions.map((d) => d.paid), [false]);
  } finally {
    h.close();
  }
});

test('well-known discovery under a path prefix (as on stellar.org/x402-demo/api)', async () => {
  const found = await fromWellKnown(`${sellerUrl}/api`, { query: 'city=Valencia' });
  assert.deepEqual(found.map((d) => d.url), [`${sellerUrl}/api/good?city=Valencia`]);
  assert.equal(found[0].source, `${sellerUrl}/api/.well-known/x402`);
});

test('deliveryReceipts middleware signs exactly the body that was sent', async () => {
  const { default: express } = await import('express');
  const { deliveryReceipts, decodeReceipt, verifyReceipt, RECEIPT_HEADER } = await import('../receipts.js');
  const seller = Keypair.random();
  const app = express();
  app.use(deliveryReceipts({ secret: seller.secret() }));
  app.get('/json', (_q: any, s: any) => s.json({ price: 0.42, pair: 'XLM/USD' }));
  app.get('/chunks', (_q: any, s: any) => { s.type('text/plain'); s.write('hello '); s.end('world'); });
  app.get('/fail', (_q: any, s: any) => s.status(500).json({ error: 'down' }));
  const h = await new Promise<http.Server>((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
  const base = `http://127.0.0.1:${(h.address() as { port: number }).port}`;
  try {
    for (const path of ['/json', '/chunks']) {
      const r = await fetch(`${base}${path}`, { headers: { 'PAYMENT-SIGNATURE': 'PAY-123' } });
      const body = Buffer.from(await r.arrayBuffer());
      const rec = decodeReceipt(r.headers.get(RECEIPT_HEADER));
      assert.equal(verifyReceipt(rec, { paymentHeader: 'PAY-123', body, payTo: seller.publicKey() }), 'valid', path);
    }
    assert.equal(Buffer.from(await (await fetch(`${base}/chunks`, { headers: { 'PAYMENT-SIGNATURE': 'x' } })).arrayBuffer()).toString(), 'hello world');
    // No receipt for unpaid requests or failed responses.
    assert.equal((await fetch(`${base}/json`)).headers.get(RECEIPT_HEADER), null);
    assert.equal((await fetch(`${base}/fail`, { headers: { 'PAYMENT-SIGNATURE': 'PAY' } })).headers.get(RECEIPT_HEADER), null);
  } finally {
    h.close();
  }
});

test('a declaration is signed with the receipt, and a seller breaking its own terms is at fault', async () => {
  const { default: express } = await import('express');
  const { deliveryReceipts, decodeReceipt, verifyReceipt, RECEIPT_HEADER } = await import('../receipts.js');
  const { declare, checkDelivery, DECLARATION_HEADER } = await import('../declarations.js');
  const seller = Keypair.random();
  const terms = { version: 1 as const, freshness: { maxAgeSeconds: 60 }, perResponse: true };
  const app = express();
  app.use(deliveryReceipts({ secret: seller.secret() }));
  app.get('/fresh', (_q: any, s: any) => { declare(s, { freshness: { ageSeconds: 5, isStale: false }, provenance: { source: 'feed' } }); s.json({ price: 1 }); });
  app.get('/stale', (_q: any, s: any) => { declare(s, { freshness: { ageSeconds: 1200, isStale: false } }); s.json({ price: 1 }); });
  app.get('/silent', (_q: any, s: any) => s.json({ price: 1 }));
  const h = await new Promise<http.Server>((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
  const base = `http://127.0.0.1:${(h.address() as { port: number }).port}`;
  const get = async (p: string) => {
    const r = await fetch(`${base}${p}`, { headers: { 'PAYMENT-SIGNATURE': 'PAY-1' } });
    const body = Buffer.from(await r.arrayBuffer());
    return { r, body, decl: r.headers.get(DECLARATION_HEADER), rec: decodeReceipt(r.headers.get(RECEIPT_HEADER)) };
  };
  try {
    const fresh = await get('/fresh');
    assert.ok(fresh.rec?.decl, 'receipt binds the declaration');
    assert.equal(verifyReceipt(fresh.rec, { paymentHeader: 'PAY-1', body: fresh.body, payTo: seller.publicKey(), declaration: fresh.decl }), 'valid');
    // Swapping or dropping the declaration breaks the receipt.
    assert.equal(verifyReceipt(fresh.rec, { paymentHeader: 'PAY-1', body: fresh.body, payTo: seller.publicKey(), declaration: null }), 'invalid');
    const ok = checkDelivery({ url: `${base}/fresh`, terms, header: fresh.decl });
    assert.deepEqual([ok.usable, ok.providerAtFault, ok.basis], [true, false, 'at-source']);

    const stale = await get('/stale');
    assert.equal(verifyReceipt(stale.rec, { paymentHeader: 'PAY-1', body: stale.body, payTo: seller.publicKey(), declaration: stale.decl }), 'valid');
    const bad = checkDelivery({ url: `${base}/stale`, terms, header: stale.decl });
    assert.deepEqual([bad.usable, bad.providerAtFault, bad.codes], [false, true, ['EXCEEDS_DECLARED_MAX']]);

    const silent = await get('/silent');
    assert.equal(silent.rec?.decl, undefined);
    assert.deepEqual(checkDelivery({ url: `${base}/silent`, terms, header: silent.decl, body: { price: 1 } }).codes, ['MISSING_DECLARATION']);
  } finally {
    h.close();
  }
});

test('scopeSeller: terms, declarations and v3 receipts a refund bond can check; only real breaches are claimable', async () => {
  const { default: express } = await import('express');
  const { scopeSeller } = await import('../roles/seller.js');
  const { decodeReceipt, verifyReceipt, RECEIPT_HEADER, RECEIPT_VERSION_3 } = await import('../receipts.js');
  const { claimable } = await import('../refunds.js');
  const { DECLARATION_HEADER, validateTerms } = await import('../declarations.js');
  const seller = Keypair.random();
  const buyer = Keypair.random().publicKey();
  const BOND = 'CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI';
  const scope = scopeSeller({ secret: seller.secret(), terms: { version: 1, freshness: { maxAgeSeconds: 60 }, perResponse: true }, refund: { contract: BOND, rpcUrl: 'http://unused', networkPassphrase: 'Test SDF Network ; September 2015' } });
  assert.deepEqual(scope.terms.refund, { contract: BOND, network: 'stellar:testnet' });
  assert.equal(scope.terms.onBreach, 'refund');
  assert.deepEqual(validateTerms(scope.terms), []);
  assert.ok(scope.bond);
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64');
  const app = express();
  app.use(...scope.middleware);
  // Stands in for the x402 middleware, which reports the settlement.
  app.use((_q: any, s: any, next: any) => { s.setHeader('PAYMENT-RESPONSE', b64({ success: true, payer: buyer, transaction: 'tx' })); next(); });
  app.get('/fresh', (_q: any, s: any) => { s.declare({ freshness: { ageSeconds: 5, isStale: false } }); s.json({ price: 1 }); });
  app.get('/stale', (_q: any, s: any) => { s.declare({ freshness: { ageSeconds: 1200, isStale: false } }); s.json({ price: 1 }); });
  const h = await new Promise<http.Server>((ok) => { const x = app.listen(0, '127.0.0.1', () => ok(x)); });
  const base = `http://127.0.0.1:${(h.address() as { port: number }).port}`;
  const pay = b64({ x402Version: 2, accepted: { scheme: 'exact', network: 'stellar:testnet', payTo: seller.publicKey(), asset: USDC_TESTNET_ADDRESS, amount: '10000' }, payload: {} });
  const get = async (p: string) => {
    const r = await fetch(`${base}${p}`, { headers: { 'PAYMENT-SIGNATURE': pay } });
    const body = Buffer.from(await r.arrayBuffer());
    return { body, decl: r.headers.get(DECLARATION_HEADER), rec: decodeReceipt(r.headers.get(RECEIPT_HEADER)) };
  };
  try {
    const stale = await get('/stale');
    assert.equal(stale.rec?.v, RECEIPT_VERSION_3);
    assert.deepEqual([stale.rec?.payer, stale.rec?.amount, stale.rec?.age, stale.rec?.maxAge, stale.rec?.unusable], [buyer, '10000', 1200, 60, false]);
    assert.equal(verifyReceipt(stale.rec, { paymentHeader: pay, body: stale.body, payTo: seller.publicKey(), declaration: stale.decl }), 'valid');
    assert.ok(claimable(stale.rec));
    const fresh = await get('/fresh');
    assert.equal(verifyReceipt(fresh.rec, { paymentHeader: pay, body: fresh.body, payTo: seller.publicKey(), declaration: fresh.decl }), 'valid');
    assert.ok(!claimable(fresh.rec));
  } finally {
    h.close();
  }
});

test('trust hooks work on a standard @x402/core facilitator, and discovery from any facilitator gets ranked', async () => {
  const { x402Facilitator } = await import('@x402/core/facilitator');
  const { createEd25519Signer } = await import('@x402/stellar');
  const { ExactStellarScheme: F } = await import('@x402/stellar/exact/facilitator');
  const { withTrustHooks, discoveryProxy, apiSellerChecker } = await import('../facilitator.js');
  const GOOD = Keypair.random().publicKey();
  const BAD = Keypair.random().publicKey();
  const check = async (payTo: string) => ({ trusted: payTo === GOOD, score: payTo === GOOD ? 98 : 23, source: 'local' as const });

  const decisions: { payTo: string; action: string }[] = [];
  const fac = withTrustHooks(new x402Facilitator().register('stellar:testnet', new F([createEd25519Signer(Keypair.random().secret(), 'stellar:testnet')])), { check, mode: 'block', onDecision: (d) => decisions.push(d) });
  const req = (payTo: string) => ({ scheme: 'exact', network: 'stellar:testnet', asset: USDC_TESTNET_ADDRESS, amount: '10000', payTo, maxTimeoutSeconds: 60, extra: { areFeesSponsored: true } });
  const payload = (payTo: string) => ({ x402Version: 2, accepted: req(payTo), payload: { transaction: 'AAAA' } });
  const blocked = await fac.verify(payload(BAD) as never, req(BAD) as never).catch((e: Error) => ({ isValid: false, invalidReason: e.message }));
  assert.equal(blocked.isValid, false);
  assert.match(String((blocked as { invalidReason?: string }).invalidReason), /untrusted_seller/);
  // A trusted seller passes the hook and reaches normal verification (which rejects this fake payload on its own).
  await fac.verify(payload(GOOD) as never, req(GOOD) as never).catch(() => null);
  assert.deepEqual(decisions.map((d) => [d.payTo, d.action]), [[BAD, 'blocked'], [GOOD, 'allowed']]);

  // Discovery: any facilitator's Bazaar listing, ranked by trust.
  const upstream = http.createServer((q, s) => {
    s.writeHead(200, { 'content-type': 'application/json' });
    s.end(JSON.stringify({ x402Version: 2, items: [
      { resource: 'https://bad.test/x', accepts: [req(BAD)] },
      { resource: 'https://new.test/x', accepts: [] },
      { resource: 'https://good.test/x', accepts: [req(GOOD)] },
    ], echo: q.url }));
  });
  await new Promise<void>((r) => upstream.listen(0, '127.0.0.1', r));
  const proxy = discoveryProxy({ upstream: `http://127.0.0.1:${(upstream.address() as { port: number }).port}`, check });
  await new Promise<void>((r) => proxy.listen(0, '127.0.0.1', r));
  try {
    const r = await (await fetch(`http://127.0.0.1:${(proxy.address() as { port: number }).port}/discovery/resources?type=http&limit=3`)).json() as any;
    assert.deepEqual(r.items.map((i: any) => i.resource), ['https://good.test/x', 'https://bad.test/x', 'https://new.test/x']);
    assert.equal(r.items[0].trust.trusted, true);
    assert.equal(r.echo, '/discovery/resources?type=http&limit=3');
  } finally {
    upstream.close();
    proxy.close();
  }

  // The public API answers per seller; unknown sellers are not trusted.
  const v = await apiSellerChecker(apiUrl)(GOOD, 'stellar:testnet');
  assert.deepEqual([v.trusted, v.reason], [false, 'seller not measured yet']);
});

test('partner facilitators share their Bazaar and the resources they settle', async () => {
  const { createHash } = await import('node:crypto');
  const { shareBazaar, resourceSharer } = await import('../contributions.js');
  const { withTrustHooks } = await import('../facilitator.js');
  const { x402Facilitator } = await import('@x402/core/facilitator');
  const { createEd25519Signer } = await import('@x402/stellar');
  const { ExactStellarScheme: F } = await import('@x402/stellar/exact/facilitator');
  const KEY = 'partner-key-0123456789abcdef';
  const store = new Store(path.join(dir, 'contrib.json'));
  const api2 = createApi(store, { contributors: new Map([['acme', createHash('sha256').update(KEY).digest()]]) });
  await new Promise<void>((r) => api2.listen(0, '127.0.0.1', r));
  const api2Url = `http://127.0.0.1:${(api2.address() as { port: number }).port}`;
  const bazaar = http.createServer((_q, s) => {
    s.writeHead(200, { 'content-type': 'application/json' });
    s.end(JSON.stringify({ items: [
      { resource: 'https://unlisted.example/a', accepts: [{ network: 'stellar:pubnet', payTo: PAY_TO }] },
      { resource: { url: 'https://unlisted.example/b' }, accepts: [] },
      { resource: 'ftp://not-http.example/c' },
    ] }));
  });
  await new Promise<void>((r) => bazaar.listen(0, '127.0.0.1', r));
  try {
    // Without a key: refused.
    const anon = await fetch(`${api2Url}/v1/contributions`, { method: 'POST', body: '{}' });
    assert.equal(anon.status, 401);
    // Pull the facilitator's own Bazaar and push it.
    const r = await shareBazaar({ facilitatorUrl: `http://127.0.0.1:${(bazaar.address() as { port: number }).port}`, apiUrl: api2Url, key: KEY });
    assert.deepEqual(r, { contributor: 'acme', received: 3, added: 2, known: 0, rejected: 1 });
    assert.equal(store.get('https://unlisted.example/a')?.source, 'facilitator:acme');

    // Resources seen in payments, shared from the facilitator hooks.
    const sharer = resourceSharer({ apiUrl: api2Url, key: KEY });
    const fac = withTrustHooks(new x402Facilitator().register('stellar:testnet', new F([createEd25519Signer(Keypair.random().secret(), 'stellar:testnet')])), {
      check: async () => ({ trusted: true, score: 90, source: 'local' }),
      share: sharer,
    });
    const req = { scheme: 'exact', network: 'stellar:testnet', asset: USDC_TESTNET_ADDRESS, amount: '10000', payTo: PAY_TO, maxTimeoutSeconds: 60, extra: { areFeesSponsored: true } };
    await fac.verify({ x402Version: 2, resource: { url: 'https://settled-only.example/q' }, accepted: req, payload: { transaction: 'AAAA' } } as never, req as never).catch(() => null);
    await sharer.stop();
    assert.equal(store.get('https://settled-only.example/q')?.source, 'facilitator:acme');
  } finally {
    api2.close();
    bazaar.close();
  }
});

test('SEP-10: a facilitator logs in with its Stellar key and contributes with the token', async () => {
  const { Networks } = await import('@stellar/stellar-sdk');
  const { sep10Login, accountFromToken } = await import('../sep10.js');
  const server = Keypair.random();
  const partner = Keypair.random();
  const stranger = Keypair.random();
  const webAuth = { serverSecret: server.secret(), homeDomain: '402scope.org', webAuthDomain: '402scope.org', networkPassphrase: Networks.TESTNET };
  const store = new Store(path.join(dir, 'sep10.json'));
  const api3 = createApi(store, { contributors: new Map(), webAuth, contributorAccounts: new Map([[partner.publicKey(), 'acme']]) });
  await new Promise<void>((r) => api3.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${(api3.address() as { port: number }).port}`;
  const contribute = (tok: string) => fetch(`${url}/v1/contributions`, { method: 'POST', headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: JSON.stringify({ resources: [{ url: 'https://via-sep10.example/a', network: 'stellar:pubnet', payTo: PAY_TO }] }) });
  try {
    const tok = await sep10Login({ apiUrl: url, account: partner.publicKey(), sign: partner });
    assert.equal(accountFromToken(webAuth, `Bearer ${tok}`), partner.publicKey());
    const r = await contribute(tok);
    assert.equal(r.status, 200);
    assert.equal(((await r.json()) as { contributor: string }).contributor, 'acme');
    assert.equal(store.get('https://via-sep10.example/a')?.source, 'facilitator:acme');

    // A valid login from an account that is not a contributor: authenticated, not allowed.
    const tok2 = await sep10Login({ apiUrl: url, account: stranger.publicKey(), sign: stranger });
    assert.equal((await contribute(tok2)).status, 401);

    // A challenge signed by someone else is refused.
    await assert.rejects(sep10Login({ apiUrl: url, account: partner.publicKey(), sign: stranger }), /login/);
    // A tampered or expired token is refused.
    assert.equal((await contribute(tok.slice(0, -2) + 'xx')).status, 401);
    assert.equal(accountFromToken(webAuth, `Bearer ${tok}`, Date.now() + 2 * 3600_000), null);
  } finally {
    api3.close();
  }
});

test('attester identity follows SEP-1 both ways: home_domain and stellar.toml ACCOUNTS', async () => {
  const { attesterIdentity } = await import('../identity.js');
  const listed = Keypair.random().publicKey();
  const other = Keypair.random().publicKey();
  const site = http.createServer((q, s) => {
    if (q.url === '/.well-known/stellar.toml') {
      s.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*' });
      return s.end(`VERSION="2.7.0"\nACCOUNTS=["${listed}"]\n\n[DOCUMENTATION]\nORG_NAME="Example Attester"\nORG_URL="https://attester.example"\n`);
    }
    s.writeHead(404); s.end();
  });
  await new Promise<void>((r) => site.listen(0, '127.0.0.1', r));
  const domain = `127.0.0.1:${(site.address() as { port: number }).port}`;
  try {
    const ok = await attesterIdentity(listed, { homeDomainOf: async () => domain, allowHttp: true });
    assert.deepEqual([ok.verified, ok.domain, ok.orgName], [true, domain, 'Example Attester']);
    // The domain does not list this account: claiming a domain alone is not enough.
    const no = await attesterIdentity(other, { homeDomainOf: async () => domain, allowHttp: true });
    assert.equal(no.verified, false);
    assert.match(String(no.reason), /does not list/);
    const none = await attesterIdentity(other, { homeDomainOf: async () => null });
    assert.equal(none.reason, 'the account sets no home_domain');
  } finally {
    site.close();
  }
});
