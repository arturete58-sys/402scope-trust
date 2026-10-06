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
