import { x402Client, x402HTTPClient } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { createEd25519Signer } from '@x402/stellar';
import { ExactStellarScheme } from '@x402/stellar/exact/client';
import type { PaymentRequirements } from '@x402/core/types';
import { USER_AGENT } from './probe.js';
import { decodeReceipt, RECEIPT_HEADER, sha256hex, verifyReceipt, type ReceiptCheck } from './receipts.js';

/** One paid call made by the measurer. */
export interface PaidCall {
  at: string;
  ok: boolean;
  status: number | null;
  latencyMs: number | null;
  /** Amount the seller declared for the option we paid. */
  declaredAmount: string | null;
  /** Settlement transaction hash returned in PAYMENT-RESPONSE. */
  transaction: string | null;
  contentType: string | null;
  bytes: number;
  /** Delivered = paid, 2xx, settled, non-empty, and matching the declared MIME type. */
  delivered: boolean;
  /** sha256 (hex) of the body received. */
  bodyHash?: string;
  /** Delivery receipt check (see receipts.ts). */
  receipt?: ReceiptCheck;
  /** The payTo that was paid. */
  payTo?: string;
  error?: string;
}

export interface MeasureOptions {
  /** Secret key (S...) of the measurement wallet. Use a dedicated, low-balance wallet. */
  secret: string;
  network: 'stellar:testnet' | 'stellar:pubnet';
  /** Required for pubnet (see Stellar RPC providers). */
  rpcUrl?: string;
  /** Refuse to pay more than this, in token units (7 decimals for USDC). */
  maxAmount: bigint;
  /** MIME type declared in the 402 challenge (resource.mimeType). */
  declaredMime?: string;
  timeoutMs?: number;
}

/**
 * Makes one real paid call through the standard x402 client and records
 * what came back. The client refuses any option above `maxAmount`.
 */
export async function measurePaid(url: string, opts: MeasureOptions): Promise<PaidCall> {
  const signer = createEd25519Signer(opts.secret, opts.network);
  let chosen: PaymentRequirements | null = null;
  // Spend limits are ours: only the configured network, never above maxAmount.
  // Built-in spend controls are off so test tokens (not only USDC) can be measured.
  const client = x402Client.fromConfig({
    schemes: [{ network: 'stellar:*', client: new ExactStellarScheme(signer, opts.rpcUrl ? { url: opts.rpcUrl } : undefined) }],
    spendControls: false,
    policies: [(_v: number, reqs: PaymentRequirements[]) => reqs.filter((a) => a.network === opts.network && BigInt(a.amount) <= opts.maxAmount)],
    paymentRequirementsSelector: (_v: number, reqs: PaymentRequirements[]) => {
      if (!reqs.length) throw new Error(`no ${opts.network} option at or below ${opts.maxAmount}`);
      chosen = [...reqs].sort((a, b) => (BigInt(a.amount) < BigInt(b.amount) ? -1 : 1))[0];
      return chosen;
    },
  });
  // Remember the payment header we send, to check the seller's receipt against it.
  let paymentHeader: string | null = null;
  const spyFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    paymentHeader = req.headers.get('PAYMENT-SIGNATURE') ?? req.headers.get('X-PAYMENT') ?? paymentHeader;
    return fetch(req);
  }) as typeof fetch;
  const paidFetch = wrapFetchWithPayment(spyFetch, client);
  const http = new x402HTTPClient(client);
  const call: PaidCall = { at: new Date().toISOString(), ok: false, status: null, latencyMs: null, declaredAmount: null, transaction: null, contentType: null, bytes: 0, delivered: false };
  const t0 = performance.now();
  try {
    const r = await paidFetch(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000) });
    call.latencyMs = Math.round(performance.now() - t0);
    call.status = r.status;
    call.contentType = r.headers.get('content-type');
    const buf = new Uint8Array(await r.arrayBuffer());
    call.bytes = buf.byteLength;
    call.bodyHash = sha256hex(buf);
    const paid = chosen as PaymentRequirements | null;
    call.declaredAmount = paid?.amount ?? null;
    call.payTo = paid?.payTo;
    call.receipt = paymentHeader ? verifyReceipt(decodeReceipt(r.headers.get(RECEIPT_HEADER)), { paymentHeader, body: buf, payTo: paid?.payTo }) : 'missing';
    try {
      const settle = http.getPaymentSettleResponse((n: string) => r.headers.get(n));
      call.transaction = settle.transaction ?? null;
      if (!settle.success) call.error = `settlement failed: ${settle.errorReason ?? 'unknown'}`;
    } catch {
      call.error = 'no PAYMENT-RESPONSE header';
    }
    call.ok = r.ok;
    if (r.ok && !mimeMatches(opts.declaredMime, call.contentType)) call.error = `declared ${opts.declaredMime}, got ${call.contentType}`;
    call.delivered = r.ok && !!call.transaction && call.bytes > 0 && !call.error;
  } catch (e) {
    call.latencyMs = Math.round(performance.now() - t0);
    call.error = (e as Error).message;
  }
  return call;
}

/** Checks that the delivered content type matches what the challenge declared. */
export function mimeMatches(declared: string | undefined, got: string | null): boolean {
  if (!declared) return true;
  if (!got) return false;
  const base = (s: string) => s.split(';')[0].trim().toLowerCase();
  return base(declared) === base(got);
}
