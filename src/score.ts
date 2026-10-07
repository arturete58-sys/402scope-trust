import type { Issue } from './probe.js';
import type { PaidCall } from './measure.js';

/** Version of the published scoring method (docs/scoring.md). */
export const METHOD_VERSION = 2;
/** Fewer paid calls than this and the score is marked low-confidence. */
export const MIN_SAMPLE = 5;
/** Paid-call latency thresholds; they include settlement (~5 s on Stellar). */
export const LATENCY_FULL_MS = 7_000;
export const LATENCY_HALF_MS = 12_000;

export interface Score {
  method: number;
  /** 0-100, or null when no paid call was made yet. */
  score: number | null;
  calls: number;
  delivered: number;
  /** Paid calls that came with a valid receipt signed by the payTo. */
  receipts: number;
  priceOk: boolean;
  p50Ms: number | null;
  lowSample: boolean;
  parts: { delivery: number; receipts: number; price: number; latency: number; declaration: number };
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/**
 * Method v2, out of 100:
 *  - delivery 50: share of paid calls that delivered
 *  - receipts 15: share of paid calls with a valid delivery receipt signed by the payTo
 *  - price 15: every settled call charged the declared amount
 *  - latency 10: median paid-call latency <= 7 s gets 10, <= 12 s gets 5. Paid latency
 *    includes onchain settlement, which x402 servers finish before answering
 *    (about one ledger, ~5 s on Stellar)
 *  - declaration 10: minus 2 per issue in the unpaid 402 challenge
 */
export function scoreEndpoint(issues: Issue[], calls: PaidCall[], charged: (c: PaidCall) => string | null = (c) => c.declaredAmount): Score {
  const declaration = Math.max(0, 10 - 2 * issues.length);
  const n = calls.length;
  const delivered = calls.filter((c) => c.delivered).length;
  const receipts = calls.filter((c) => c.receipt === 'valid').length;
  const settled = calls.filter((c) => c.transaction);
  const priceOk = settled.length > 0 && settled.every((c) => charged(c) === c.declaredAmount);
  const p50 = median(calls.filter((c) => c.ok && c.latencyMs != null).map((c) => c.latencyMs as number));
  if (!n) {
    return { method: METHOD_VERSION, score: null, calls: 0, delivered: 0, receipts: 0, priceOk: false, p50Ms: null, lowSample: true, parts: { delivery: 0, receipts: 0, price: 0, latency: 0, declaration } };
  }
  const parts = {
    delivery: Math.round((50 * delivered) / n),
    receipts: Math.round((15 * receipts) / n),
    price: priceOk ? 15 : 0,
    latency: p50 == null ? 0 : p50 <= LATENCY_FULL_MS ? 10 : p50 <= LATENCY_HALF_MS ? 5 : 0,
    declaration,
  };
  return { method: METHOD_VERSION, score: parts.delivery + parts.receipts + parts.price + parts.latency + parts.declaration, calls: n, delivered, receipts, priceOk, p50Ms: p50, lowSample: n < MIN_SAMPLE, parts };
}

export type Verdict = 'trusted' | 'caution' | 'avoid' | 'unknown';

/** What an agent should do with a score, given its own threshold. */
export function verdict(s: Score | null, minScore: number): Verdict {
  if (!s || s.score == null) return 'unknown';
  if (s.score >= minScore && !s.lowSample) return 'trusted';
  if (s.score >= minScore) return 'caution';
  return s.score < 40 ? 'avoid' : 'caution';
}
