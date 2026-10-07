import { createHash, timingSafeEqual } from 'node:crypto';
import { assertPublicUrl, USER_AGENT } from './probe.js';
import type { Store } from './store.js';

/**
 * Facilitators sharing their Bazaar with 402Scope Trust.
 *
 * Discovery catalogues are partial: the CDP and Binance Bazaars do not
 * overlap, and neither lists providers that never registered with either.
 * A facilitator sees more than its catalogue: every resource it settles.
 * Partner facilitators can share both, so the observatory measures more of
 * the market:
 *
 * - push their Bazaar listing (`POST /v1/contributions`, Bazaar format), or
 * - let `withTrustHooks(..., { share })` report the resources it settles
 *   (resource URL, network, payTo; never the payer).
 *
 * A contribution only adds resources to measure. It never changes a score,
 * and every resource keeps the name of the facilitator that contributed it.
 */

export interface ContributedResource {
  url: string;
  network?: string;
  payTo?: string;
}

/** Parses `TRUST_CONTRIBUTOR_KEYS="name:key,name2:key2"` into name -> sha256(key). */
export function contributorKeysFromEnv(env = process.env): Map<string, Buffer> {
  const m = new Map<string, Buffer>();
  for (const pair of (env.TRUST_CONTRIBUTOR_KEYS ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const i = pair.indexOf(':');
    if (i > 0) m.set(pair.slice(0, i), createHash('sha256').update(pair.slice(i + 1)).digest());
  }
  return m;
}

/** The contributor a bearer key belongs to, or null. Constant-time comparison. */
export function contributorFor(keys: Map<string, Buffer>, authorization: string | undefined): string | null {
  const m = /^Bearer\s+(\S{16,256})$/.exec(authorization ?? '');
  if (!m) return null;
  const h = createHash('sha256').update(m[1]).digest();
  for (const [name, k] of keys) if (timingSafeEqual(h, k)) return name;
  return null;
}

/** Accepts a Bazaar response (`items` or `resources`) or a plain `{ resources: [{ url }] }`. */
export function parseContribution(body: unknown, max = 1000): ContributedResource[] {
  const b = body as { items?: unknown[]; resources?: unknown[] } | null;
  const list = (b?.items ?? b?.resources ?? []) as unknown[];
  if (!Array.isArray(list)) return [];
  const out: ContributedResource[] = [];
  for (const it of list.slice(0, max)) {
    const o = it as { url?: unknown; resource?: unknown; network?: unknown; payTo?: unknown; accepts?: { network?: unknown; payTo?: unknown }[] };
    const url = typeof o.url === 'string' ? o.url : typeof o.resource === 'string' ? o.resource : typeof (o.resource as { url?: unknown })?.url === 'string' ? (o.resource as { url: string }).url : null;
    if (!url) continue;
    const opt = Array.isArray(o.accepts) ? o.accepts[0] : undefined;
    const network = typeof o.network === 'string' ? o.network : typeof opt?.network === 'string' ? opt.network : undefined;
    const payTo = typeof o.payTo === 'string' ? o.payTo : typeof opt?.payTo === 'string' ? opt.payTo : undefined;
    out.push({ url, ...(network ? { network } : {}), ...(payTo ? { payTo } : {}) });
  }
  return out;
}

/** Adds contributed resources to the store as `facilitator:<name>`. Unsafe URLs are skipped. */
export function acceptContribution(store: Store, contributor: string, items: ContributedResource[]): { received: number; added: number; known: number; rejected: number } {
  let added = 0, known = 0, rejected = 0;
  for (const it of items) {
    try {
      assertPublicUrl(it.url);
    } catch {
      rejected++;
      continue;
    }
    if (store.add(it.url, `facilitator:${contributor}`)) added++;
    else known++;
  }
  if (added) store.save();
  return { received: items.length, added, known, rejected };
}

/** Facilitator side: sends resources to a 402Scope Trust API. */
export async function shareResources(o: { apiUrl: string; key: string; resources: ContributedResource[]; fetchImpl?: typeof fetch }): Promise<{ contributor: string; received: number; added: number; known: number; rejected: number }> {
  const f = o.fetchImpl ?? fetch;
  const r = await f(`${o.apiUrl.replace(/\/+$/, '')}/v1/contributions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${o.key}`, 'content-type': 'application/json', 'user-agent': USER_AGENT },
    body: JSON.stringify({ resources: o.resources }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!r.ok) throw new Error(`402Scope Trust API returned ${r.status}`);
  return (await r.json()) as { contributor: string; received: number; added: number; known: number; rejected: number };
}

/** Facilitator side: pulls its own Bazaar listing and shares it. */
export async function shareBazaar(o: { facilitatorUrl: string; apiUrl: string; key: string; fetchImpl?: typeof fetch; maxPages?: number }): ReturnType<typeof shareResources> {
  const f = o.fetchImpl ?? fetch;
  const root = o.facilitatorUrl.replace(/\/+$/, '');
  const resources: ContributedResource[] = [];
  for (let page = 0; page < (o.maxPages ?? 20); page++) {
    const r = await f(`${root}/discovery/resources?limit=100&offset=${page * 100}`, { headers: { accept: 'application/json', 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(15_000) });
    if (!r.ok) throw new Error(`${root}/discovery/resources returned ${r.status}`);
    const items = parseContribution(await r.json());
    resources.push(...items);
    if (items.length < 100) break;
  }
  return shareResources({ apiUrl: o.apiUrl, key: o.key, resources, fetchImpl: f });
}

/**
 * Batches resources seen in payments and shares them every `flushMs`
 * (default 5 min). Deduplicated, capped, and failures are dropped: sharing
 * never touches the payment path.
 */
export function resourceSharer(o: { apiUrl: string; key: string; flushMs?: number; fetchImpl?: typeof fetch; onError?: (e: Error) => void }) {
  const seen = new Set<string>();
  let pending: ContributedResource[] = [];
  const flush = async () => {
    if (!pending.length) return;
    const batch = pending;
    pending = [];
    try {
      await shareResources({ apiUrl: o.apiUrl, key: o.key, resources: batch, fetchImpl: o.fetchImpl });
    } catch (e) {
      o.onError?.(e as Error);
    }
  };
  const timer = setInterval(flush, o.flushMs ?? 300_000);
  timer.unref?.();
  return {
    add(r: ContributedResource) {
      if (!r.url || seen.has(r.url) || seen.size > 100_000) return;
      seen.add(r.url);
      pending.push(r);
      if (pending.length >= 500) void flush();
    },
    flush,
    stop() {
      clearInterval(timer);
      return flush();
    },
  };
}
