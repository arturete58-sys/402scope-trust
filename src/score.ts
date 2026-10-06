import type { Issue } from './probe.js';
import type { PaidCall } from './measure.js';

/** Version of the published scoring method (docs/scoring.md). */
export const METHOD_VERSION = 1;
/** Fewer paid calls than this and the score is marked low-confidence. */
export const MIN_SAMPLE = 5;

export interface Score {
  method: number;
  /** 0-100, or null when no paid call was made yet. */
  score: number | null;
  calls: number;
  delivered: number;
  priceOk: boolean;
  p50Ms: number | null;
  lowSample: boolean;
  parts: { delivery: number; price: number; latency: number; declaration: number };
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/**
 * Method v1, out of 100:
 *  - delivery 60: share of paid calls that delivered
 *  - price 20: every settled call charged the declared amount
 *  - latency 10: median paid-call latency <= 1 s gets 10, <= 3 s gets 5
 *  - declaration 10: minus 2 per issue in the unpaid 402 challenge
 */
export function scoreEndpoint(issues: Issue[], calls: PaidCall[], charged: (c: PaidCall) => string | null = (c) => c.declaredAmount): Score {
  const declaration = Math.max(0, 10 - 2 * issues.length);
  const n = calls.length;
  const delivered = calls.filter((c) => c.delivered).length;
  const settled = calls.filter((c) => c.transaction);
  const priceOk = settled.length > 0 && settled.every((c) => charged(c) === c.declaredAmount);
  const p50 = median(calls.filter((c) => c.ok && c.latencyMs != null).map((c) => c.latencyMs as number));
  if (!n) {
    return { method: METHOD_VERSION, score: null, calls: 0, delivered: 0, priceOk: false, p50Ms: null, lowSample: true, parts: { delivery: 0, price: 0, latency: 0, declaration } };
  }
  const parts = {
    delivery: Math.round((60 * delivered) / n),
    price: priceOk ? 20 : 0,
    latency: p50 == null ? 0 : p50 <= 1000 ? 10 : p50 <= 3000 ? 5 : 0,
    declaration,
  };
  return { method: METHOD_VERSION, score: parts.delivery + parts.price + parts.latency + parts.declaration, calls: n, delivered, priceOk, p50Ms: p50, lowSample: n < MIN_SAMPLE, parts };
}

export type Verdict = 'trusted' | 'caution' | 'avoid' | 'unknown';

/** What an agent should do with a score, given its own threshold. */
export function verdict(s: Score | null, minScore: number): Verdict {
  if (!s || s.score == null) return 'unknown';
  if (s.score >= minScore && !s.lowSample) return 'trusted';
  if (s.score >= minScore) return 'caution';
  return s.score < 40 ? 'avoid' : 'caution';
}
