import { decodePaymentRequiredHeader } from '@x402/core/http';
import type { PaymentRequired, PaymentRequirements } from '@x402/core/types';
import { DECLARATIONS, validateTerms } from './declarations.js';

/** Issue code for a challenge without delivery terms; scored apart from conformance issues. */
export const NO_DECLARATIONS = 'no-declarations';

export const USER_AGENT = '402ScopeTrust/0.1 (+https://402scope.org)';

/** A problem found in what the endpoint declares, before any payment. */
export interface Issue {
  code: string;
  message: string;
}

export interface ProbeResult {
  url: string;
  checkedAt: string;
  status: number | null;
  latencyMs: number | null;
  /** The decoded 402 challenge, if one was returned. */
  paymentRequired: PaymentRequired | null;
  /** Payment options for Stellar networks only. */
  stellar: PaymentRequirements[];
  issues: Issue[];
}

/**
 * Rejects URLs the public API must not fetch on a caller's behalf:
 * non-HTTP schemes, credentials, localhost, IP literals and odd ports.
 * Set TRUST_ALLOW_LOCAL=1 for tests and local development only.
 */
export function assertPublicUrl(input: string): URL {
  let u: URL;
  try { u = new URL(input); } catch { throw new Error('not a valid URL'); }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('only http and https URLs');
  if (process.env.TRUST_ALLOW_LOCAL === '1') return u;
  if (u.username || u.password) throw new Error('URLs with credentials are not allowed');
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) throw new Error('local hosts are not allowed');
  if (/^[\d.]+$/.test(h) || h.includes(':') || h.startsWith('[')) throw new Error('IP addresses are not allowed; use a domain name');
  if (u.port && u.port !== '443' && u.port !== '80') throw new Error('only ports 80 and 443');
  return u;
}

const G_OR_C =/^[GCM][A-Z2-7]{55}$|^M[A-Z2-7]{68}$/;
const C_ADDR = /^C[A-Z2-7]{55}$/;

/**
 * Checks one Stellar payment option against the x402 v2 rules of its scheme:
 * `exact`, or `batch-settlement` (prepaid ledgers such as Fermah Pay, whose
 * payTo is the seller's ledger contract and whose fees are not the buyer's).
 */
export function checkRequirement(r: PaymentRequirements, i: number): Issue[] {
  const out: Issue[] = [];
  const at = `accepts[${i}]`;
  const batch = r.scheme === 'batch-settlement';
  if (r.scheme !== 'exact' && !batch) out.push({ code: 'scheme', message: `${at}: scheme "${r.scheme}" is not "exact" or "batch-settlement"` });
  if (r.network !== 'stellar:pubnet' && r.network !== 'stellar:testnet')
    out.push({ code: 'network', message: `${at}: unknown Stellar network "${r.network}"` });
  if (!C_ADDR.test(r.asset ?? '')) out.push({ code: 'asset', message: `${at}: asset is not a Soroban contract address` });
  if (!G_OR_C.test(r.payTo ?? '')) out.push({ code: 'payTo', message: `${at}: payTo is not a Stellar address` });
  else if (batch && !C_ADDR.test(r.payTo)) out.push({ code: 'payTo', message: `${at}: batch-settlement payTo must be the seller's ledger contract (C...)` });
  if (!/^\d+$/.test(r.amount ?? '') || BigInt(r.amount) === 0n)
    out.push({ code: 'amount', message: `${at}: amount must be a positive integer in token units` });
  if (!Number.isInteger(r.maxTimeoutSeconds) || r.maxTimeoutSeconds <= 0)
    out.push({ code: 'timeout', message: `${at}: maxTimeoutSeconds must be a positive integer` });
  if (!batch && r.extra?.areFeesSponsored === undefined)
    out.push({ code: 'fees', message: `${at}: extra.areFeesSponsored is missing` });
  return out;
}

/**
 * Calls the endpoint without paying and checks the 402 challenge it returns.
 * This is free and safe to run often; it measures what the seller declares,
 * not whether a paid call delivers (that is `measurePaid`).
 */
export async function probe(url: string, opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}): Promise<ProbeResult> {
  const f = opts.fetchImpl ?? fetch;
  const res: ProbeResult = { url, checkedAt: new Date().toISOString(), status: null, latencyMs: null, paymentRequired: null, stellar: [], issues: [] };
  const t0 = performance.now();
  let r: Response;
  try {
    r = await f(url, { headers: { 'user-agent': USER_AGENT, accept: 'application/json' }, signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000), redirect: 'follow' });
  } catch (e) {
    res.issues.push({ code: 'unreachable', message: `request failed: ${(e as Error).message}` });
    return res;
  }
  res.latencyMs = Math.round(performance.now() - t0);
  res.status = r.status;
  if (r.status !== 402) {
    res.issues.push({ code: 'not-402', message: `expected HTTP 402 without payment, got ${r.status}` });
    return res;
  }
  const header = r.headers.get('PAYMENT-REQUIRED');
  let body: unknown = null;
  try { body = await r.json(); } catch { /* body is optional in v2 */ }
  try {
    if (header) res.paymentRequired = decodePaymentRequiredHeader(header);
    else if (body && typeof body === 'object' && 'accepts' in body) {
      res.paymentRequired = body as PaymentRequired;
      res.issues.push({ code: 'no-header', message: 'challenge only in the body; x402 v2 sends it in the PAYMENT-REQUIRED header' });
    }
  } catch {
    res.issues.push({ code: 'bad-header', message: 'PAYMENT-REQUIRED header is not valid base64 JSON' });
  }
  const pr = res.paymentRequired;
  if (!pr) {
    if (!res.issues.length) res.issues.push({ code: 'no-challenge', message: '402 returned without a payment challenge' });
    return res;
  }
  if (pr.x402Version !== 2) res.issues.push({ code: 'version', message: `x402Version is ${pr.x402Version}, expected 2` });
  if (!pr.resource?.url) res.issues.push({ code: 'resource', message: 'resource.url is missing' });
  res.stellar = (pr.accepts ?? []).filter((a) => String(a.network).startsWith('stellar:'));
  if (!res.stellar.length) res.issues.push({ code: 'no-stellar', message: 'no Stellar payment option offered' });
  res.stellar.forEach((a, i) => res.issues.push(...checkRequirement(a, i)));
  const decl = (pr.extensions as Record<string, { info?: unknown }> | undefined)?.[DECLARATIONS];
  if (!decl) res.issues.push({ code: NO_DECLARATIONS, message: 'no extensions.declarations: nothing is declared about freshness, quality or provenance' });
  else {
    const problems = validateTerms(decl.info);
    if (problems.length) res.issues.push({ code: 'bad-declarations', message: `extensions.declarations: ${problems.join('; ')}` });
  }
  return res;
}
