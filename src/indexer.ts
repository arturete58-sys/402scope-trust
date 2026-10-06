import fs from 'node:fs';
import { USER_AGENT } from './probe.js';

export interface Discovered {
  url: string;
  source: string;
}

interface DiscoveryItem {
  resource?: string | { url?: string };
  type?: string;
  accepts?: { network?: string }[];
}

/**
 * Lists x402 resources from a facilitator's Bazaar endpoint
 * (`GET /discovery/resources`) and keeps those that accept a Stellar network.
 * Pages through `offset` until the facilitator returns fewer than `limit`.
 */
export async function fromFacilitator(base: string, opts: { maxPages?: number; fetchImpl?: typeof fetch } = {}): Promise<Discovered[]> {
  const f = opts.fetchImpl ?? fetch;
  const out: Discovered[] = [];
  const limit = 100;
  const root = base.replace(/\/+$/, '');
  for (let page = 0; page < (opts.maxPages ?? 20); page++) {
    const u = `${root}/discovery/resources?type=http&limit=${limit}&offset=${page * limit}`;
    const r = await f(u, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) throw new Error(`${u} returned ${r.status}`);
    const body = (await r.json()) as { items?: DiscoveryItem[]; resources?: DiscoveryItem[] };
    const items = body.items ?? body.resources ?? [];
    for (const it of items) {
      const url = typeof it.resource === 'string' ? it.resource : it.resource?.url;
      const stellar = (it.accepts ?? []).some((a) => String(a.network ?? '').startsWith('stellar:'));
      if (url && stellar) out.push({ url, source: `${root}/discovery/resources` });
    }
    if (items.length < limit) break;
  }
  return out;
}

/**
 * Reads an origin's x402 discovery manifest (`GET /.well-known/x402`), as
 * served by Stellar's official x402 demo: `{ version, resources: ["GET /path", ...] }`.
 * Resource paths are absolute from the host root. Only GET resources are returned.
 */
export async function fromWellKnown(origin: string, opts: { fetchImpl?: typeof fetch; query?: string } = {}): Promise<Discovered[]> {
  const f = opts.fetchImpl ?? fetch;
  const base = new URL(origin);
  // Behind a path prefix (e.g. https://stellar.org/x402-demo/api) the manifest lives under that prefix.
  const u = new URL(`${base.pathname.replace(/\/+$/, '')}/.well-known/x402`, base);
  const r = await f(u, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
  if (!r.ok) throw new Error(`${u} returned ${r.status}`);
  const body = (await r.json()) as { resources?: unknown[] };
  const out: Discovered[] = [];
  for (const item of body.resources ?? []) {
    if (typeof item !== 'string') continue;
    const m = item.trim().match(/^(GET\s+)?(\/\S*)$/i);
    if (!m) continue;
    const url = new URL(m[2], base);
    if (opts.query) url.search = opts.query;
    out.push({ url: url.toString(), source: u.toString() });
  }
  return out;
}

/** One URL per line; blank lines and lines starting with # are ignored. */
export function fromSeedFile(file: string): Discovered[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((url) => ({ url, source: 'seed' }));
}
