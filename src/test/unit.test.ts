import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attestationKey, normalizeUrl } from '../key.js';
import { scoreEndpoint, verdict, median } from '../score.js';
import { assertPublicUrl, checkRequirement } from '../probe.js';
import type { PaidCall } from '../measure.js';
import { mimeMatches } from '../measure.js';

const call = (o: Partial<PaidCall>): PaidCall => ({ at: '2026-10-06T00:00:00Z', ok: true, status: 200, latencyMs: 400, declaredAmount: '10000', transaction: 'abc', contentType: 'application/json', bytes: 10, delivered: true, receipt: 'valid', bodyHash: 'ab', ...o });

test('normalizeUrl folds equivalent forms', () => {
  assert.equal(normalizeUrl('HTTPS://Api.Example.com:443/v1/data/#x'), 'https://api.example.com/v1/data');
  assert.equal(normalizeUrl('https://api.example.com/'), 'https://api.example.com/');
  assert.equal(normalizeUrl('https://api.example.com/q?a=1'), 'https://api.example.com/q?a=1');
});

test('attestation key binds payTo and URL', () => {
  const a = attestationKey('GA', 'https://api.example.com/v1/');
  assert.equal(a, attestationKey('GA', 'https://API.example.com/v1'));
  assert.notEqual(a, attestationKey('GB', 'https://api.example.com/v1'));
  assert.match(a, /^[0-9a-f]{64}$/);
});

test('score: no paid calls means no score', () => {
  const s = scoreEndpoint([], []);
  assert.equal(s.score, null);
  assert.equal(verdict(s, 80), 'unknown');
});

test('score: perfect endpoint gets 100', () => {
  const s = scoreEndpoint([], Array.from({ length: 5 }, () => call({})));
  assert.equal(s.score, 100);
  assert.equal(s.lowSample, false);
  assert.equal(verdict(s, 80), 'trusted');
});

test('score: failed deliveries and slow responses cost points', () => {
  // Median latency 9000 ms -> 5 points.
  const calls = [call({ latencyMs: 9500 }), call({ delivered: false, receipt: 'missing', latencyMs: 15000 }), call({ latencyMs: 8000 }), call({ delivered: false, receipt: 'invalid', latencyMs: 9000 }), call({})];
  const s = scoreEndpoint([{ code: 'fees', message: 'x' }], calls);
  // Delivery 3/5 of 50, receipts 3/5 of 15, price 15, latency 5, declaration 5 (terms) + 5 - 1.
  assert.deepEqual(s.parts, { delivery: 30, receipts: 9, price: 15, latency: 5, declaration: 9 });
  assert.equal(s.score, 68);
  assert.equal(s.receipts, 3);
  assert.equal(verdict(s, 80), 'caution');
});

test('score: wrong charge drops the price part', () => {
  const s = scoreEndpoint([], [call({}), call({})], (c) => (c === undefined ? null : '99999'));
  assert.equal(s.parts.price, 0);
  assert.equal(s.lowSample, true);
});

test('median', () => {
  assert.equal(median([]), null);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 10]), 3);
});

test('checkRequirement flags a bad Stellar option', () => {
  const issues = checkRequirement({ scheme: 'upto', network: 'stellar:mars' as never, asset: 'USDC', payTo: 'nope', amount: '0', maxTimeoutSeconds: 0, extra: {} }, 0);
  assert.deepEqual(issues.map((i) => i.code), ['scheme', 'network', 'asset', 'payTo', 'amount', 'timeout', 'fees']);
});

test('assertPublicUrl blocks local targets', () => {
  delete process.env.TRUST_ALLOW_LOCAL;
  for (const bad of ['http://localhost/x', 'http://127.0.0.1/', 'http://[::1]/', 'ftp://example.com', 'https://a:b@example.com/', 'https://example.com:8080/', 'http://db.internal/'])
    assert.throws(() => assertPublicUrl(bad), bad);
  assert.equal(assertPublicUrl('https://api.example.com/v1').hostname, 'api.example.com');
});

test('mimeMatches ignores parameters', () => {
  assert.equal(mimeMatches('application/json', 'application/json; charset=utf-8'), true);
  assert.equal(mimeMatches('application/json', 'text/html'), false);
  assert.equal(mimeMatches(undefined, null), true);
});

import { Keypair } from '@stellar/stellar-sdk';
import { signReceipt, verifyReceipt, encodeReceipt, decodeReceipt } from '../receipts.js';
import { buildTree, proofFor, verifyProof, evidenceLeaf } from '../evidence.js';
import { authDigest } from '../smart-account.js';
import { sellerScores } from '../seller.js';
import type { EndpointRecord } from '../store.js';

test('receipts: valid when signed by the payTo, unbound otherwise, invalid when tampered', () => {
  const seller = Keypair.random();
  const r = decodeReceipt(encodeReceipt(signReceipt(seller.secret(), { resource: 'https://a.example/x', paymentHeader: 'PAY', body: '{"ok":1}' })));
  assert.equal(verifyReceipt(r, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: seller.publicKey() }), 'valid');
  assert.equal(verifyReceipt(r, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: Keypair.random().publicKey() }), 'unbound');
  assert.equal(verifyReceipt(r, { paymentHeader: 'PAY', body: '{"ok":2}', payTo: seller.publicKey() }), 'invalid');
  assert.equal(verifyReceipt(r, { paymentHeader: 'OTHER', body: '{"ok":1}', payTo: seller.publicKey() }), 'invalid');
  assert.equal(verifyReceipt({ ...r!, sig: Keypair.random().sign(Buffer.from('x')).toString('base64') }, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: seller.publicKey() }), 'invalid');
  assert.equal(verifyReceipt(null, { paymentHeader: 'PAY', body: '' }), 'missing');
  assert.equal(decodeReceipt('not base64 json'), null);
});

test('evidence: every leaf proves into the root, including odd trees', () => {
  for (const n of [1, 2, 3, 5, 8, 13]) {
    const leaves = Array.from({ length: n }, (_, i) => evidenceLeaf(call({ transaction: `tx${i}`, bodyHash: `b${i}` })));
    const t = buildTree(leaves);
    leaves.forEach((l, i) => assert.ok(verifyProof(l, proofFor(t, i), t.root), `n=${n} i=${i}`));
    assert.ok(!verifyProof(evidenceLeaf(call({ transaction: 'other' })), proofFor(t, 0), t.root) || n === 0);
  }
});

test('smart account digest matches the Rust test vector', () => {
  // Same inputs as contracts/agent-wallet/src/test.rs.
  const d = authDigest('CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K', Buffer.alloc(32, 7), [0]);
  assert.equal(d.toString('hex'), '6a9ce79520683bcdd0967da374e1b206090ca458c1fb4a0e2bf737ca2cf74118');
});

test('seller score is the call-weighted average of its endpoints', () => {
  const rec = (payTo: string, score: number, calls: number) => ({ url: `https://x/${score}`, payTo, score: { score, calls, delivered: calls, receipts: calls }, calls: [call({ at: `2026-10-0${calls}T00:00:00Z` })] }) as unknown as EndpointRecord;
  const [s] = sellerScores([rec('GA', 100, 8), rec('GA', 20, 2)]);
  assert.equal(s.score, 84);
  assert.equal(s.endpoints, 2);
  assert.equal(s.calls, 10);
});

import { checkDelivery, validateTerms, declareDeliveryTerms } from '../declarations.js';
import { NO_DECLARATIONS } from '../probe.js';

test('score: publishing no delivery terms costs 5 points', () => {
  const s = scoreEndpoint([{ code: NO_DECLARATIONS, message: 'x' }], Array.from({ length: 5 }, () => call({})));
  assert.equal(s.parts.declaration, 5);
  assert.equal(s.score, 95);
});

test('declarations: fault is the provider\'s only when it breaks what it declared', () => {
  const terms = { version: 1 as const, freshness: { maxAgeSeconds: 600 } };
  const enc = (d: object) => Buffer.from(JSON.stringify(d)).toString('base64url');
  // Within its own terms but above the caller's limit: unusable, not the provider's fault.
  const c = checkDelivery({ url: 'https://a.test/x', terms, header: enc({ freshness: { ageSeconds: 120 } }), maxAgeSeconds: 60 });
  assert.deepEqual([c.usable, c.providerAtFault, c.codes], [false, false, ['EXCEEDS_CALLER_LIMIT']]);
  // Declares itself stale.
  assert.equal(checkDelivery({ url: 'https://a.test/x', header: enc({ freshness: { isStale: true } }) }).providerAtFault, true);
  // Contradicts the source it published.
  const src = checkDelivery({ url: 'https://a.test/x', terms: { version: 1, provenance: { source: 'EIA-930' } }, header: enc({ provenance: { source: 'scraped' } }) });
  assert.deepEqual(src.codes, ['BREAKS_TERMS']);
});

test('declarations: without a header, the x402-declarations vocabulary is read from the body', () => {
  // Same input as the x402-declarations conformance case "fault-is-providers".
  const c = checkDelivery({ url: 'https://example.test/hugen', body: { quality_state: 'stale', quote_age_ms: 1140535 }, maxAgeSeconds: 60 });
  assert.equal(c.usable, false);
  assert.equal(c.providerAtFault, true);
  assert.equal(c.declaration.freshness?.ageSeconds, 1141);
  assert.notEqual(c.basis, 'at-source');
  // Nothing recognisable: no invented values.
  const none = checkDelivery({ url: 'https://nobody.test/x', body: { a: 1 } });
  assert.deepEqual([none.basis, none.usable, none.declaration.freshness?.ageSeconds ?? null], ['none', true, null]);
});

test('declarations: terms are validated', () => {
  assert.deepEqual(validateTerms({ version: 1, freshness: { maxAgeSeconds: 60, basis: 'live' }, onBreach: 'refund' }), []);
  assert.equal(validateTerms({ version: 2 }).length, 1);
  assert.throws(() => declareDeliveryTerms({ version: 1, freshness: { maxAgeSeconds: -1 } }));
});

import { observatoryDecision } from '../mcp.js';
test('observatory decision follows the seller policy on the bound', () => {
  const d = (p: object) => observatoryDecision(p as never, 0.15, 0.3).decision;
  assert.equal(d({ status: 'published', faultRateUpperBound: 0.06, n: 142 }), 'sell');
  assert.equal(d({ status: 'published', faultRateUpperBound: 0.2, n: 142 }), 'sell_and_warn');
  assert.equal(d({ status: 'provisional', faultRateUpperBound: 0.102, n: 34 }), 'sell_and_warn');
  assert.equal(d({ status: 'provisional', faultRateUpperBound: 0.301, n: 34 }), 'hold');
  assert.equal(d({ status: 'published', faultRateUpperBound: 0.02, liveness: { outcome: 'gone' } }), 'hold');
  assert.equal(d({ status: 'no_data' }), 'unknown');
});

import { createHash } from 'node:crypto';
import { receiptMessage, signReceiptWith, RECEIPT_VERSION_1 } from '../receipts.js';
test('receipts are SEP-53 signed messages: any Stellar SDK can check them, and v1 still verifies', async () => {
  const seller = Keypair.random();
  const r = signReceipt(seller.secret(), { resource: 'https://a.example/x', paymentHeader: 'PAY', body: '{"ok":1}' });
  assert.equal(r.v, 'x402-receipt/2');
  // Independent SEP-53 check: ed25519 over sha256("Stellar Signed Message:\n" + message).
  const digest = createHash('sha256').update(Buffer.concat([Buffer.from('Stellar Signed Message:\n'), receiptMessage(r)])).digest();
  assert.ok(Keypair.fromPublicKey(r.signer).verify(digest, Buffer.from(r.sig, 'base64')));
  assert.ok(Keypair.fromPublicKey(r.signer).verifyMessage(receiptMessage(r), Buffer.from(r.sig, 'base64')));
  // A wallet-style signer that only exposes signMessage gives the same result.
  const w = await signReceiptWith({ publicKey: seller.publicKey(), signMessage: (m) => seller.signMessage(m).toString('base64') }, { resource: 'https://a.example/x', paymentHeader: 'PAY', body: '{"ok":1}', at: r.at });
  assert.equal(w.sig, r.sig);
  assert.equal(verifyReceipt(w, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: seller.publicKey() }), 'valid');
  // Legacy v1 (raw signature over the message) is still accepted.
  const base = { resource: 'https://a.example/x', payment: createHash('sha256').update('PAY').digest('hex'), body: createHash('sha256').update('{"ok":1}').digest('hex'), at: 1 };
  const v1 = { v: RECEIPT_VERSION_1, ...base, signer: seller.publicKey(), sig: seller.sign(receiptMessage({ ...base, v: RECEIPT_VERSION_1 })).toString('base64') } as never;
  assert.equal(verifyReceipt(v1, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: seller.publicKey() }), 'valid');
  // A v1 signature relabelled as v2 does not verify.
  assert.equal(verifyReceipt({ ...(v1 as object), v: 'x402-receipt/2' } as never, { paymentHeader: 'PAY', body: '{"ok":1}', payTo: seller.publicKey() }), 'invalid');
});

test('passkeys: assertions verify as WebAuthn expects, DER converts to raw, signatures are low-S', async () => {
  const { createHash, createPublicKey, sign, verify } = await import('node:crypto');
  const { softwarePasskey, derToRaw, lowS } = await import('../smart-account.js');
  const pk = softwarePasskey();
  assert.equal(pk.publicKey.length, 65);
  const challenge = createHash('sha256').update('auth digest').digest();
  const a = await pk.assert(challenge);
  assert.equal(JSON.parse(Buffer.from(a.clientDataJSON).toString()).challenge, challenge.toString('base64url'));
  const pub = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: pk.publicKey.subarray(1, 33).toString('base64url'), y: pk.publicKey.subarray(33).toString('base64url') }, format: 'jwk' });
  const signed = Buffer.concat([Buffer.from(a.authenticatorData), createHash('sha256').update(a.clientDataJSON).digest()]);
  const n = BigInt('0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551');
  for (let i = 0; i < 8; i++) {
    const der = sign('sha256', signed, { key: pk.privateKey, dsaEncoding: 'der' });
    const raw = lowS(derToRaw(der));
    assert.ok(BigInt('0x' + raw.subarray(32).toString('hex')) <= n / 2n);
    assert.ok(verify('sha256', signed, { key: pub, dsaEncoding: 'ieee-p1363' }, raw));
  }
});
