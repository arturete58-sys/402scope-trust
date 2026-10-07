import http from 'node:http';
import { checkBeforePay } from './check.js';
import { assertPublicUrl } from './probe.js';
import { METHOD_VERSION } from './score.js';
import type { EndpointRecord, Store } from './store.js';
import type { ChainConfig } from './chain.js';
import { sellerScores } from './seller.js';
import { acceptContribution, contributorFor, contributorKeysFromEnv, parseContribution } from './contributions.js';
import { accountFromToken, challenge, contributorAccountsFromEnv, token, webAuthFromEnv, type WebAuthConfig } from './sep10.js';

const hits = new Map<string, number[]>();
function limited(ip: string, perMinute: number): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear();
  return list.length > perMinute;
}

function summary(r: EndpointRecord) {
  return {
    url: r.url,
    key: r.key,
    payTo: r.payTo,
    network: r.network,
    score: r.score?.score ?? null,
    paidCalls: r.score?.calls ?? 0,
    lowSample: r.score?.lowSample ?? true,
    attestation: r.attestation ?? null,
    issues: r.probe?.issues.length ?? null,
    updatedAt: r.updatedAt,
  };
}

function send(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': status === 200 ? 'public, max-age=60' : 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(JSON.stringify(body, null, 1));
}

/**
 * Public read API.
 *   GET /health
 *   GET /v1/endpoints[?network=stellar:pubnet&min_score=80]
 *   GET /v1/endpoints/:key           full record, including paid calls
 *   GET /v1/check?url=...&min_score= the check-before-pay answer (probes unknown URLs, rate-limited)
 *   GET /v1/sellers/:payTo          seller score across its endpoints (used by facilitators)
 *   GET/POST /v1/auth               SEP-10 login for partner facilitators (when TRUST_SEP10_SECRET is set)
 *   POST /v1/contributions          partner facilitators share resources (Bearer contributor key or SEP-10 token)
 */
export function createApi(store: Store, opts: { checksPerMinute?: number; chain?: ChainConfig | null; contributors?: Map<string, Buffer>; webAuth?: WebAuthConfig | null; contributorAccounts?: Map<string, string> } = {}): http.Server {
  const contributors = opts.contributors ?? contributorKeysFromEnv();
  const webAuth = opts.webAuth === undefined ? webAuthFromEnv() : opts.webAuth;
  const accounts = opts.contributorAccounts ?? contributorAccountsFromEnv();
  const readJson = async (req: http.IncomingMessage, max: number): Promise<unknown> => {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const c of req) {
      size += (c as Buffer).length;
      if (size > max) throw Object.assign(new Error('too large'), { status: 413 });
      chunks.push(c as Buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  };
  return http.createServer(async (req, res) => {
    // Trust X-Forwarded-For only from a reverse proxy on the same machine.
    const direct = req.socket.remoteAddress ?? '';
    const fwd = req.headers['x-forwarded-for'];
    const ip = fwd && /^(::ffff:)?127\.0\.0\.1$|^::1$/.test(direct) ? String(fwd).split(',')[0].trim() : direct;
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'authorization, content-type' }); return res.end(); }
    const u = new URL(req.url ?? '/', 'http://x');
    if (u.pathname === '/v1/auth') {
      // SEP-10: a facilitator proves it controls its Stellar account and gets a token.
      if (!webAuth) return send(res, 404, { error: 'SEP-10 login is not enabled on this server.' });
      if (limited(`auth:${ip}`, 20)) return send(res, 429, { error: 'Too many requests. Try again in a minute.' });
      try {
        if (req.method === 'GET') return send(res, 200, challenge(webAuth, u.searchParams.get('account') ?? ''));
        if (req.method === 'POST') {
          const body = (await readJson(req, 20_000)) as { transaction?: string };
          const t = token(webAuth, String(body?.transaction ?? ''));
          return send(res, 200, { token: t.token, account: t.account, expires_at: t.expiresAt, contributor: accounts.get(t.account) ?? null });
        }
      } catch (e) {
        return send(res, 400, { error: (e as Error).message });
      }
    }
    if (req.method === 'POST' && u.pathname === '/v1/contributions') {
      // Partner facilitators share resources from their Bazaar or from the payments they settle.
      const account = webAuth ? accountFromToken(webAuth, req.headers.authorization) : null;
      const who = contributorFor(contributors, req.headers.authorization) ?? (account ? accounts.get(account) ?? null : null);
      if (!who) return send(res, 401, { error: account ? 'This Stellar account is not a registered contributor; ask hello@402scope.org.' : 'A contributor key or a SEP-10 token is required. Contributions are open to facilitators; ask hello@402scope.org.' });
      if (limited(`contrib:${who}`, 30)) return send(res, 429, { error: 'Too many contributions. Try again in a minute.' });
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const c of req) {
        size += (c as Buffer).length;
        if (size > 1_000_000) return send(res, 413, { error: 'Up to 1 MB per contribution.' });
        chunks.push(c as Buffer);
      }
      let body: unknown;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return send(res, 400, { error: 'Send JSON: a Bazaar response or { resources: [{ url, network, payTo }] }.' }); }
      return send(res, 200, { contributor: who, ...acceptContribution(store, who, parseContribution(body)) });
    }
    if (req.method !== 'GET') return send(res, 405, { error: 'Use GET (or POST /v1/contributions with a contributor key).' });
    try {
      if (u.pathname === '/health') return send(res, 200, { ok: true, endpoints: store.all().length, method: METHOD_VERSION, contract: opts.chain?.contractId ?? null });
      if (u.pathname === '/v1/endpoints') {
        const net = u.searchParams.get('network');
        const min = Number(u.searchParams.get('min_score') ?? 0);
        const list = store.all()
          .filter((r) => !net || r.network === net)
          .filter((r) => (r.score?.score ?? 0) >= min)
          .sort((a, b) => (b.score?.score ?? -1) - (a.score?.score ?? -1))
          .map(summary);
        return send(res, 200, { method: METHOD_VERSION, count: list.length, endpoints: list });
      }
      const m = u.pathname.match(/^\/v1\/endpoints\/([0-9a-f]{64})$/);
      if (m) {
        const r = store.byKey(m[1]);
        return r ? send(res, 200, r) : send(res, 404, { error: 'No endpoint with this key.' });
      }
      const sm = u.pathname.match(/^\/v1\/sellers\/([A-Za-z0-9:._-]{1,128})$/);
      if (sm) {
        const s = sellerScores(store.all()).find((x) => x.seller === decodeURIComponent(sm[1]));
        if (!s) return send(res, 404, { error: 'Seller not measured yet.' });
        const { evidence, ...rest } = s;
        return send(res, 200, { ...rest, evidenceCalls: evidence.length });
      }
      if (u.pathname === '/v1/check') {
        const target = u.searchParams.get('url');
        if (!target) return send(res, 400, { error: 'Add ?url=' });
        try { assertPublicUrl(target); } catch (e) { return send(res, 400, { error: (e as Error).message }); }
        const known = !!store.get(target)?.probe;
        if (!known && limited(ip, opts.checksPerMinute ?? 20)) return send(res, 429, { error: 'Too many new checks. Try again in a minute.' });
        const min = Math.min(100, Math.max(0, Number(u.searchParams.get('min_score') ?? 80) || 0));
        return send(res, 200, await checkBeforePay(store, target, min, { chain: opts.chain }));
      }
      return send(res, 404, { error: 'Not found. See /v1/endpoints, /v1/sellers and /v1/check.' });
    } catch {
      return send(res, 500, { error: 'Something went wrong.' });
    }
  });
}
