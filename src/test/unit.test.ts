import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attestationKey, normalizeUrl } from '../key.js';
import { scoreEndpoint, verdict, median } from '../score.js';
import { assertPublicUrl, checkRequirement } from '../probe.js';
import type { PaidCall } from '../measure.js';
import { mimeMatches } from '../measure.js';

const call = (o: Partial<PaidCall>): PaidCall => ({ at: '2026-10-06T00:00:00Z', ok: true, status: 200, latencyMs: 400, declaredAmount: '10000', transaction: 'abc', contentType: 'application/json', bytes: 10, delivered: true, ...o });

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
  // Median latency 9000 ms -> 5 points; 3 of 5 delivered -> 36 points.
  const calls = [call({ latencyMs: 9500 }), call({ delivered: false, latencyMs: 15000 }), call({ latencyMs: 8000 }), call({ delivered: false, latencyMs: 9000 }), call({})];
  const s = scoreEndpoint([{ code: 'fees', message: 'x' }], calls);
  assert.deepEqual(s.parts, { delivery: 36, price: 20, latency: 5, declaration: 8 });
  assert.equal(s.score, 69);
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
