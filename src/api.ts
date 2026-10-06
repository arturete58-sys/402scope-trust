import http from 'node:http';
import { checkBeforePay } from './check.js';
import { assertPublicUrl } from './probe.js';
import { METHOD_VERSION } from './score.js';
import type { EndpointRecord, Store } from './store.js';

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
 */
export function createApi(store: Store, opts: { checksPerMinute?: number } = {}): http.Server {
  return http.createServer(async (req, res) => {
    // Trust X-Forwarded-For only from a reverse proxy on the same machine.
    const direct = req.socket.remoteAddress ?? '';
    const fwd = req.headers['x-forwarded-for'];
    const ip = fwd && /^(::ffff:)?127\.0\.0\.1$|^::1$/.test(direct) ? String(fwd).split(',')[0].trim() : direct;
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET' }); return res.end(); }
    if (req.method !== 'GET') return send(res, 405, { error: 'Use GET.' });
    const u = new URL(req.url ?? '/', 'http://x');
    try {
      if (u.pathname === '/health') return send(res, 200, { ok: true, endpoints: store.all().length, method: METHOD_VERSION });
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
      if (u.pathname === '/v1/check') {
        const target = u.searchParams.get('url');
        if (!target) return send(res, 400, { error: 'Add ?url=' });
        try { assertPublicUrl(target); } catch (e) { return send(res, 400, { error: (e as Error).message }); }
        const known = !!store.get(target)?.probe;
        if (!known && limited(ip, opts.checksPerMinute ?? 20)) return send(res, 429, { error: 'Too many new checks. Try again in a minute.' });
        const min = Math.min(100, Math.max(0, Number(u.searchParams.get('min_score') ?? 80) || 0));
        return send(res, 200, await checkBeforePay(store, target, min));
      }
      return send(res, 404, { error: 'Not found. See /v1/endpoints and /v1/check.' });
    } catch {
      return send(res, 500, { error: 'Something went wrong.' });
    }
  });
}
