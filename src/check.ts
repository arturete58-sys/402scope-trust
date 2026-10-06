import { probe } from './probe.js';
import { verdict, type Score, type Verdict } from './score.js';
import type { Store } from './store.js';

export interface CheckResult {
  url: string;
  /** Onchain attestation key, when the endpoint declares a Stellar payTo. */
  key: string | null;
  payTo: string | null;
  network: string | null;
  verdict: Verdict;
  score: number | null;
  minScore: number;
  /** Plain-language reasons, most important first. */
  reasons: string[];
  measuredAt: string | null;
  paidCalls: number;
  method: number | null;
}

/**
 * The question an agent asks before paying: should I pay this endpoint?
 * Uses the stored measurements when there are any; otherwise probes the
 * endpoint (unpaid) and answers "unknown" with what the challenge shows.
 */
export async function checkBeforePay(store: Store, url: string, minScore = 80, opts: { live?: boolean } = {}): Promise<CheckResult> {
  let rec = store.get(url);
  if ((!rec || !rec.probe) && opts.live !== false) {
    const p = await probe(url);
    rec = store.setProbe(url, p);
    store.save();
  }
  const s: Score | null = rec?.score ?? null;
  const reasons: string[] = [];
  const issues = rec?.probe?.issues ?? [];
  let v = verdict(s, minScore);
  const fatal = issues.find((i) => ['unreachable', 'not-402', 'no-challenge', 'no-stellar', 'bad-header'].includes(i.code));
  if (fatal) {
    v = 'avoid';
    reasons.push(fatal.message);
  }
  if (s && s.score != null) {
    reasons.push(`${s.delivered} of ${s.calls} paid calls delivered`);
    reasons.push(s.priceOk ? 'charged the declared price' : 'charged amount did not match the declared price, or no settlement seen');
    if (s.p50Ms != null) reasons.push(`median paid latency ${s.p50Ms} ms`);
    if (s.lowSample) reasons.push(`fewer than 5 paid calls: low confidence`);
  } else if (!fatal) {
    reasons.push('not measured with paid calls yet');
  }
  for (const i of issues) if (i !== fatal) reasons.push(i.message);
  return {
    url: rec?.url ?? url,
    key: rec?.key ?? null,
    payTo: rec?.payTo ?? null,
    network: rec?.network ?? null,
    verdict: v,
    score: s?.score ?? null,
    minScore,
    reasons,
    measuredAt: rec?.calls.at(-1)?.at ?? null,
    paidCalls: s?.calls ?? 0,
    method: s?.method ?? null,
  };
}
