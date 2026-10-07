import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { checkBeforePay, type CheckResult } from './check.js';
import { Store } from './store.js';
import { chainConfigFromEnv } from './chain.js';

/**
 * MCP server for agents. With TRUST_API_URL set (e.g. the public 402Scope
 * API) it asks the API; otherwise it uses the local store and probes live.
 */
export async function runMcp(): Promise<void> {
  const api = process.env.TRUST_API_URL?.replace(/\/+$/, '');
  const store = api ? null : Store.open();
  const chain = chainConfigFromEnv();

  const check = async (url: string, minScore: number): Promise<CheckResult> => {
    if (!api) return checkBeforePay(store as Store, url, minScore, { chain });
    const r = await fetch(`${api}/v1/check?url=${encodeURIComponent(url)}&min_score=${minScore}`, { signal: AbortSignal.timeout(20_000) });
    if (!r.ok) throw new Error(`402Scope API returned ${r.status}`);
    return (await r.json()) as CheckResult;
  };

  const server = new McpServer({ name: '402scope-trust', version: '0.1.0' });

  server.registerTool(
    'check_before_pay',
    {
      title: 'Check an x402 endpoint before paying',
      description:
        'Call this before paying any x402 endpoint on Stellar. Returns a verdict (trusted, caution, avoid, unknown), ' +
        'the 0-100 score from independent paid measurements, and the reasons. Pay only on "trusted"; ask the user on "caution" or "unknown"; never pay on "avoid".',
      inputSchema: {
        url: z.string().url().describe('Full URL of the x402 resource you are about to pay'),
        min_score: z.number().int().min(0).max(100).default(80).describe('Lowest score you accept'),
      },
    },
    async ({ url, min_score }) => {
      try {
        const r = await check(url, min_score);
        const line = `${r.verdict.toUpperCase()} — score ${r.score ?? 'n/a'} (minimum ${r.minScore}). ${r.reasons.join('; ')}.`;
        return { content: [{ type: 'text', text: line }], structuredContent: { ...r } };
      } catch (e) {
        return { isError: true, content: [{ type: 'text', text: `error: check_failed: ${(e as Error).message}` }] };
      }
    },
  );

  // The observatory's own measurements (any network it measures), as a
  // sell / sell_and_warn / hold decision on the caller's thresholds: the
  // seller policy agreed with settlement partners, on the fault rate upper bound.
  const observatory = (process.env.OBSERVATORY_URL ?? 'https://402scope.org').replace(/\/+$/, '');
  server.registerTool(
    'observatory_decision',
    {
      title: 'Decide whether to pay or resell an x402 endpoint',
      description:
        'Reads the 402Scope observatory\'s signed aggregate for an x402 endpoint (paid measurements on Base, Solana, XRPL and Stellar) ' +
        'and returns sell, sell_and_warn, hold or unknown on your two thresholds of the fault rate upper bound. ' +
        'On hold, do not pay. On sell_and_warn, pay small amounts or tell the user. On unknown, the endpoint is not measured.',
      inputSchema: {
        url: z.string().url().describe('Full URL of the x402 resource'),
        warn_max: z.number().min(0).max(1).default(0.15).describe('Warn above this fault rate upper bound (0.15 = 15%)'),
        hold_max: z.number().min(0).max(1).default(0.3).describe('Hold above this fault rate upper bound (0.30 = 30%)'),
      },
    },
    async ({ url, warn_max, hold_max }) => {
      try {
        const r = await fetch(`${observatory}/v1/provider?endpoint=${encodeURIComponent(url)}`, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
        if (!r.ok) throw new Error(`402Scope observatory returned ${r.status}`);
        const d = observatoryDecision((await r.json()) as ProviderState, warn_max, Math.max(warn_max, hold_max));
        const line = `${d.decision.toUpperCase()} — ${d.reason} Record: ${observatory}/p/?endpoint=${encodeURIComponent(url)}`;
        return { content: [{ type: 'text', text: line }], structuredContent: { url, ...d } };
      } catch (e) {
        return { isError: true, content: [{ type: 'text', text: `error: observatory_unreachable: ${(e as Error).message}` }] };
      }
    },
  );

  server.registerTool(
    'list_trusted_endpoints',
    {
      title: 'List measured x402 endpoints on Stellar',
      description: 'Lists x402 endpoints the 402Scope observatory has measured, best score first.',
      inputSchema: {
        min_score: z.number().int().min(0).max(100).default(80),
        network: z.enum(['stellar:pubnet', 'stellar:testnet']).optional(),
      },
    },
    async ({ min_score, network }) => {
      let list: unknown[];
      if (api) {
        const q = new URLSearchParams({ min_score: String(min_score), ...(network ? { network } : {}) });
        const r = await fetch(`${api}/v1/endpoints?${q}`, { signal: AbortSignal.timeout(20_000) });
        list = ((await r.json()) as { endpoints: unknown[] }).endpoints;
      } else {
        list = (store as Store).all()
          .filter((e) => (e.score?.score ?? 0) >= min_score && (!network || e.network === network))
          .sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0))
          .map((e) => ({ url: e.url, score: e.score?.score, paidCalls: e.score?.calls, network: e.network }));
      }
      return { content: [{ type: 'text', text: JSON.stringify(list, null, 1) }], structuredContent: { endpoints: list } };
    },
  );

  await server.connect(new StdioServerTransport());
}

export interface ProviderState {
  status?: string;
  n?: number | null;
  faultsObserved?: number | null;
  faultRateUpperBound?: number | null;
  liveness?: { outcome?: string } | null;
}

/** Same rules as the observatory's /v1/decision and the 402scope.org checker. */
export function observatoryDecision(p: ProviderState, warnMax: number, holdMax: number) {
  const bound = typeof p.faultRateUpperBound === 'number' ? p.faultRateUpperBound : null;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const base = { status: p.status ?? 'no_data', faultRateUpperBound: bound, n: p.n ?? null, faultsObserved: p.faultsObserved ?? null, warnMax, holdMax };
  const out = p.liveness?.outcome;
  if (out === 'gone' || out === 'unreachable') return { ...base, decision: 'hold' as const, reason: `The endpoint is ${out} at the last liveness check.` };
  if (!p.status || p.status === 'no_data' || bound === null) return { ...base, decision: 'unknown' as const, reason: 'Not measured yet: no fault rate bound exists for this endpoint.' };
  if (bound > holdMax) return { ...base, decision: 'hold' as const, reason: `Fault rate upper bound ${pct(bound)} is above ${pct(holdMax)}.` };
  if (p.status !== 'published') return { ...base, decision: 'sell_and_warn' as const, reason: `State is ${p.status} (n=${p.n ?? 0}); bound ${pct(bound)} is within ${pct(holdMax)}.` };
  if (bound >= warnMax) return { ...base, decision: 'sell_and_warn' as const, reason: `Bound ${pct(bound)} is between ${pct(warnMax)} and ${pct(holdMax)}.` };
  return { ...base, decision: 'sell' as const, reason: `Published, and bound ${pct(bound)} is within ${pct(warnMax)}.` };
}
