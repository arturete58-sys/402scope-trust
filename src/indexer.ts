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

/** One URL per line; blank lines and lines starting with # are ignored. */
export function fromSeedFile(file: string): Discovered[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((url) => ({ url, source: 'seed' }));
}
