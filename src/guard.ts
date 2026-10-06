import type { x402Client } from '@x402/core/client';
import { checkBeforePay, type CheckResult } from './check.js';
import type { ChainConfig } from './chain.js';
import type { Store } from './store.js';

export type Checker = (url: string, minScore: number) => Promise<CheckResult>;

export interface TrustGuardOptions {
  /** Lowest score the agent accepts (default 80). */
  minScore?: number;
  /** How to get a verdict: `apiChecker(url)` or `localChecker(store, chain)`. */
  check: Checker;
  /** Also pay endpoints marked "caution" (default false). */
  allowCaution?: boolean;
  /** Also pay endpoints not measured yet (default false). */
  allowUnknown?: boolean;
  /** Called with every decision, e.g. for logging. */
  onDecision?: (d: { url: string; paid: boolean; result: CheckResult; reason?: string }) => void;
}

/**
 * Adds a "check before pay" step to any x402 client. Before a payment is
 * created, the guard looks up the endpoint and aborts the payment unless it
 * is trusted, and unless the payTo being paid is the one that was measured
 * (so a copied listing cannot borrow another seller's score).
 */
export function withTrustGuard(client: x402Client, opts: TrustGuardOptions): x402Client {
  const min = opts.minScore ?? 80;
  return client.onBeforePaymentCreation(async ({ paymentRequired, selectedRequirements }) => {
    const url = paymentRequired.resource?.url;
    if (!url) return { abort: true, reason: '402Scope Trust: the challenge has no resource URL' };
    const result = await opts.check(url, min);
    let reason: string | undefined;
    if (result.payTo && result.payTo !== selectedRequirements.payTo) reason = `payTo ${selectedRequirements.payTo} is not the measured ${result.payTo}`;
    else if (result.verdict === 'avoid') reason = `verdict avoid: ${result.reasons[0] ?? 'low score'}`;
    else if (result.verdict === 'unknown' && !opts.allowUnknown) reason = 'endpoint not measured yet';
    else if (result.verdict === 'caution' && !opts.allowCaution) reason = `verdict caution (score ${result.score ?? 'n/a'})`;
    opts.onDecision?.({ url, paid: !reason, result, reason });
    return reason ? { abort: true, reason: `402Scope Trust: ${reason}` } : undefined;
  });
}

/** Asks a 402Scope Trust API (GET /v1/check). */
export function apiChecker(apiUrl: string): Checker {
  const base = apiUrl.replace(/\/+$/, '');
  return async (url, minScore) => {
    const r = await fetch(`${base}/v1/check?url=${encodeURIComponent(url)}&min_score=${minScore}`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) throw new Error(`402Scope API returned ${r.status}`);
    return (await r.json()) as CheckResult;
  };
}

/** Uses a local store and, if given, the onchain contract. */
export function localChecker(store: Store, chain?: ChainConfig | null): Checker {
  return (url, minScore) => checkBeforePay(store, url, minScore, { chain });
}
