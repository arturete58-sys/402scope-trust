import http from 'node:http';
import type { PaymentRequirements } from '@x402/core/types';
import { readSellerAttestation, trustedBy, type ChainConfig } from './chain.js';
import { USER_AGENT } from './probe.js';
import { sellerScores } from './seller.js';
import type { Store } from './store.js';
import type { ContributedResource } from './contributions.js';

/**
 * 402Scope Trust for any facilitator.
 *
 * Nothing in 402Scope Trust requires a particular facilitator: attesters
 * measure through whatever facilitator each seller uses, and an agent wallet
 * pays through any facilitator that settles Stellar `exact` payments. This
 * module is for facilitators that want to use the trust signal themselves:
 *
 * - `withTrustHooks` plugs into any `x402Facilitator` from @x402/core through
 *   its standard hooks. In `flag` mode it records a verdict for every payment;
 *   in `block` mode it refuses to verify payments to untrusted sellers.
 *   With `share`, it also contributes the resources it settles to the
 *   observatory (see contributions.ts).
 * - `rankResources` / `discoveryProxy` add trust scores to any facilitator's
 *   Bazaar listing (`GET /discovery/resources`) and rank it by them.
 *
 * Verdicts come from a `SellerChecker`: the onchain registry (Stellar), the
 * public 402Scope API (any network), or a local store.
 */

export interface SellerVerdict {
  trusted: boolean;
  /** Lowest current score among the attesters consulted, if known. */
  score: number | null;
  source: 'onchain' | 'api' | 'local';
  reason?: string;
}

export type SellerChecker = (payTo: string, network: string) => Promise<SellerVerdict>;

/** Caches verdicts for `ttlMs` (default 60 s) so a busy facilitator does not query per payment. */
export function cached(check: SellerChecker, ttlMs = 60_000): SellerChecker {
  const memo = new Map<string, { at: number; v: Promise<SellerVerdict> }>();
  return (payTo, network) => {
    const k = `${network}|${payTo}`;
    const hit = memo.get(k);
    if (hit && Date.now() - hit.at < ttlMs) return hit.v;
    const v = check(payTo, network).catch((e) => {
      memo.delete(k);
      throw e;
    });
    memo.set(k, { at: Date.now(), v });
    if (memo.size > 50_000) memo.clear();
    return v;
  };
}

/** Reads the onchain registry: trusted when the configured quorum of attesters agrees. Stellar sellers only. */
export function onchainSellerChecker(cfg: ChainConfig, minScore = 80): SellerChecker {
  const attesters = cfg.attesters ?? [];
  const quorum = cfg.quorum ?? 1;
  return async (payTo, network) => {
    if (!network.startsWith('stellar:')) return { trusted: false, score: null, source: 'onchain', reason: `no onchain registry for ${network}` };
    if (!attesters.length) return { trusted: false, score: null, source: 'onchain', reason: 'no attesters configured' };
    const [trusted, ...atts] = await Promise.all([
      trustedBy(cfg, payTo, attesters, minScore, quorum),
      ...attesters.map((a) => readSellerAttestation(cfg, a, payTo).catch(() => null)),
    ]);
    const scores = atts.filter(Boolean).map((a) => Number((a as { score: number }).score));
    return {
      trusted: trusted === true,
      score: scores.length ? Math.min(...scores) : null,
      source: 'onchain',
      reason: trusted ? undefined : `fewer than ${quorum} of ${attesters.length} attesters trust this seller at ${minScore}`,
    };
  };
}

/** Asks a 402Scope Trust API (`GET /v1/sellers/:payTo`). Works for sellers on any network the API measures. */
export function apiSellerChecker(apiUrl: string, minScore = 80, fetchImpl: typeof fetch = fetch): SellerChecker {
  const base = apiUrl.replace(/\/+$/, '');
  return async (payTo) => {
    const r = await fetchImpl(`${base}/v1/sellers/${encodeURIComponent(payTo)}`, { headers: { accept: 'application/json', 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(5_000) });
    if (r.status === 404) return { trusted: false, score: null, source: 'api', reason: 'seller not measured yet' };
    if (!r.ok) throw new Error(`402Scope Trust API returned ${r.status}`);
    const s = (await r.json()) as { score?: number | null; calls?: number };
    const score = typeof s.score === 'number' ? s.score : null;
    return { trusted: score !== null && score >= minScore, score, source: 'api', reason: score === null || score >= minScore ? undefined : `score ${score} below ${minScore}` };
  };
}

/** Seller scores from a local store (the observatory's own data). */
export function localSellerChecker(store: Store, minScore = 80): SellerChecker {
  return async (payTo) => {
    const s = sellerScores(store.all()).find((x) => x.seller === payTo);
    if (!s) return { trusted: false, score: null, source: 'local', reason: 'seller not measured yet' };
    return { trusted: s.score >= minScore, score: s.score, source: 'local', reason: s.score >= minScore ? undefined : `score ${s.score} below ${minScore}` };
  };
}

export interface TrustDecision {
  payTo: string;
  network: string;
  verdict: SellerVerdict | null;
  action: 'allowed' | 'flagged' | 'blocked';
  error?: string;
}

type Hook<C> = (ctx: C) => Promise<void | { abort: true; reason: string }>;
type Ctx = { requirements: PaymentRequirements; paymentPayload?: { resource?: { url?: string } } };
/** The part of @x402/core's `x402Facilitator` this module uses. */
export interface HookableFacilitator {
  onBeforeVerify(hook: Hook<Ctx>): unknown;
  onBeforeSettle(hook: Hook<Ctx>): unknown;
}

/**
 * Adds 402Scope Trust to a facilitator through its standard hooks.
 *
 *   withTrustHooks(new x402Facilitator().register(...), { check: onchainSellerChecker(cfg), mode: 'block' })
 *
 * - `flag` (default): never interferes; `onDecision` sees every verdict.
 * - `block`: refuses to verify or settle payments to sellers that are not trusted.
 *
 * If the checker fails, the payment goes through and the decision carries
 * the error: a trust outage must not become a payments outage. Set
 * `failClosed: true` to refuse instead.
 */
export function withTrustHooks<F extends HookableFacilitator>(fac: F, o: {
  check: SellerChecker;
  mode?: 'flag' | 'block';
  failClosed?: boolean;
  onDecision?: (d: TrustDecision) => void;
  cacheMs?: number;
  /** Opt-in: share the resources this facilitator verifies (URL, network, payTo; never the payer). See `resourceSharer`. */
  share?: { add(r: ContributedResource): void };
}): F {
  const check = cached(o.check, o.cacheMs);
  const mode = o.mode ?? 'flag';
  const decide: Hook<Ctx> = async ({ requirements, paymentPayload }) => {
    const { payTo, network } = requirements;
    const url = paymentPayload?.resource?.url;
    if (o.share && url) { try { o.share.add({ url, network: String(network), payTo }); } catch { /* never in the payment path */ } }
    let verdict: SellerVerdict | null = null;
    let error: string | undefined;
    try {
      verdict = await check(payTo, String(network));
    } catch (e) {
      error = (e as Error).message;
    }
    const refuse = mode === 'block' && (verdict ? !verdict.trusted : !!o.failClosed);
    o.onDecision?.({ payTo, network: String(network), verdict, action: refuse ? 'blocked' : verdict && !verdict.trusted ? 'flagged' : 'allowed', ...(error ? { error } : {}) });
    if (refuse) return { abort: true, reason: 'untrusted_seller' };
  };
  fac.onBeforeVerify(decide);
  fac.onBeforeSettle(decide);
  return fac;
}

// ---- Discovery ----------------------------------------------------------

interface DiscoveryItem {
  resource?: string | { url?: string };
  accepts?: { network?: string; payTo?: string }[];
  [k: string]: unknown;
}

/**
 * Adds `trust` to each Bazaar item (per payment option's payTo) and sorts:
 * trusted first, then by score. Unknown sellers keep their place after the
 * scored ones; nothing is removed.
 */
export async function rankResources<T extends DiscoveryItem>(items: T[], check: SellerChecker): Promise<(T & { trust: SellerVerdict | null })[]> {
  const out = await Promise.all(items.map(async (it, i) => {
    const opt = (it.accepts ?? []).find((a) => a.payTo && a.network);
    let trust: SellerVerdict | null = null;
    if (opt) trust = await check(opt.payTo!, opt.network!).catch(() => null);
    return { it: { ...it, trust }, i };
  }));
  const rank = (t: SellerVerdict | null) => (t?.trusted ? 2 : t?.score != null ? 1 : 0);
  out.sort((a, b) => rank(b.it.trust) - rank(a.it.trust) || (b.it.trust?.score ?? -1) - (a.it.trust?.score ?? -1) || a.i - b.i);
  return out.map((x) => x.it);
}

/**
 * A Bazaar-compatible discovery endpoint in front of any facilitator:
 * `GET /discovery/resources?...` is forwarded upstream and the items come
 * back with trust scores, ranked. Everything else returns 404.
 */
export function discoveryProxy(o: { upstream: string; check: SellerChecker; fetchImpl?: typeof fetch }): http.Server {
  const f = o.fetchImpl ?? fetch;
  const upstream = o.upstream.replace(/\/+$/, '');
  const check = cached(o.check);
  return http.createServer(async (req, res) => {
    const u = new URL(req.url ?? '/', 'http://x');
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'GET' || u.pathname !== '/discovery/resources') return send(404, { error: 'Only GET /discovery/resources is served here.' });
    try {
      const r = await f(`${upstream}/discovery/resources${u.search}`, { headers: { accept: 'application/json', 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(15_000) });
      if (!r.ok) return send(502, { error: `upstream returned ${r.status}` });
      const body = (await r.json()) as { items?: DiscoveryItem[]; resources?: DiscoveryItem[]; [k: string]: unknown };
      const field = body.items ? 'items' : 'resources';
      const ranked = await rankResources(body[field] ?? [], check);
      return send(200, { ...body, [field]: ranked, trust: { rankedBy: '402Scope Trust', note: 'trusted sellers first, then by score; unknown sellers are kept' } });
    } catch (e) {
      return send(502, { error: (e as Error).message });
    }
  });
}
