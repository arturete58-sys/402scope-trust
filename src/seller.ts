import type { PaidCall } from './measure.js';
import { METHOD_VERSION } from './score.js';
import type { EndpointRecord } from './store.js';

/** Score for one seller (payment address), across its measured endpoints. */
export interface SellerScore {
  seller: string;
  score: number;
  endpoints: number;
  calls: number;
  delivered: number;
  receipts: number;
  method: number;
  /** Last paid call, ISO time. */
  measuredAt: string;
  /** All paid calls behind the score, oldest first (evidence). */
  evidence: PaidCall[];
}

/**
 * Groups scored endpoints by payTo. The seller score is the average of its
 * endpoint scores weighted by paid calls, so a seller cannot hide a broken
 * endpoint behind a good one.
 */
export function sellerScores(records: EndpointRecord[]): SellerScore[] {
  const by = new Map<string, EndpointRecord[]>();
  for (const r of records) {
    if (!r.payTo || r.score?.score == null || !r.score.calls) continue;
    by.set(r.payTo, [...(by.get(r.payTo) ?? []), r]);
  }
  return [...by.entries()].map(([seller, rs]) => {
    const calls = rs.reduce((n, r) => n + (r.score?.calls ?? 0), 0);
    const weighted = rs.reduce((n, r) => n + (r.score?.score ?? 0) * (r.score?.calls ?? 0), 0);
    const evidence = rs.flatMap((r) => r.calls).sort((a, b) => a.at.localeCompare(b.at));
    return {
      seller,
      score: Math.round(weighted / calls),
      endpoints: rs.length,
      calls,
      delivered: rs.reduce((n, r) => n + (r.score?.delivered ?? 0), 0),
      receipts: rs.reduce((n, r) => n + (r.score?.receipts ?? 0), 0),
      method: METHOD_VERSION,
      measuredAt: evidence.at(-1)?.at ?? new Date().toISOString(),
      evidence,
    };
  });
}
