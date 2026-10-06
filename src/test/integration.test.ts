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
  assert.deepEqual(tools.result.tools.map((t: { name: string }) => t.name).sort(), ['check_before_pay', 'list_trusted_endpoints']);
  send({ id: 3, method: 'tools/call', params: { name: 'check_before_pay', arguments: { url: `${sellerUrl}/good` } } });
  const r = await wait(3);
  child.kill();
  assert.equal(r.result.structuredContent.verdict, 'unknown');
  assert.match(r.result.content[0].text, /^UNKNOWN/);
});
