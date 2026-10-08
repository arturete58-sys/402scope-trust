import type { Keypair } from '@stellar/stellar-sdk';
import { Networks } from '@stellar/stellar-sdk';
import type { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import type { PaymentRequired } from '@x402/core/types';
import { checkDelivery, DECLARATION_HEADER, readTerms, type DeliveryTerms } from '../declarations.js';
import { apiChecker, withTrustGuard, type Checker } from '../guard.js';
import { decodeReceipt, RECEIPT_HEADER, verifyReceipt, type ReceiptCheck } from '../receipts.js';
import { claimable, claimRefund, type RefundOutcome } from '../refunds.js';
import { receiptSignersFor } from '../prepaid.js';
import { escrowConfirm, escrowSubmitReceipt } from '../escrow.js';

/** What happened to one paid call, after the fact. */
export interface DeliveryReport {
  url: string;
  status: number;
  /** The seller's receipt: valid, unbound, invalid or missing. */
  receipt: ReceiptCheck | 'unpaid';
  /** The seller broke its own declared terms. */
  providerAtFault: boolean;
  codes: string[];
  /** Present when the seller offers refunds and the response broke its terms. */
  refund?: { outcome: RefundOutcome | 'failed'; tx?: string; contract: string; error?: string };
  /** Escrow payments: what the agent did with the held money. */
  escrow?: { id: string; contract: string; action: 'confirmed' | 'refunded' | 'held' | 'failed'; tx?: string; error?: string };
  /** responseMs: until the paid response arrived (includes the x402 payment itself); settledMs: until the escrow or refund step finished. */
  timings?: { responseMs: number; settledMs: number };
}

/**
 * 402Scope for buyers and agents, in one call:
 *
 *   const pay = scopeFetch({ client, refunds: { submitter: agentKey } });
 *   const r = await pay('https://api.example.com/quote');
 *
 * - Before paying (optional `check`): refuses sellers that are not trusted.
 * - After paying: checks the seller's signed receipt and declaration against the terms it published.
 * - If the seller offers refunds and broke its terms: claims the refund on Stellar, at once, to the payer.
 * Every call ends in `onReport`; the response also carries it in `X-402Scope-Delivery`.
 */
export interface BuyerOptions {
  /** Your x402 client, with your payment schemes registered. */
  client: x402Client;
  fetch?: typeof fetch;
  /** Check before paying: a checker, or a 402Scope Trust API URL. Omit to skip. */
  check?: Checker | string;
  minScore?: number;
  allowUnknown?: boolean;
  allowCaution?: boolean;
  /** Claim refunds automatically. `submitter` pays the claim's fee; the refund goes to the payer. */
  refunds?: { submitter: Keypair; rpcUrl?: string; networkPassphrase?: string };
  /**
   * Escrow payments: the payer's key, to confirm a good delivery (the seller
   * is paid at once) or post the seller's breach receipt (refunded at once).
   * Without it, held payments are released or refunded by the deadlines.
   */
  escrow?: { payer: Keypair; rpcUrl?: string; networkPassphrase?: string; confirmWithoutReceipt?: boolean };
  /** Called once per paid call, after the escrow or refund step (which runs in the background). */
  onReport?: (r: DeliveryReport) => void;
  /** Wait for the escrow or refund step before returning the response (default false: return at once). */
  waitForSettlement?: boolean;
}

const RPC: Record<string, string> = { 'stellar:testnet': 'https://soroban-testnet.stellar.org' };
const PASS: Record<string, string> = { 'stellar:testnet': Networks.TESTNET, 'stellar:pubnet': Networks.PUBLIC };

export function scopeFetch(o: BuyerOptions): typeof fetch {
  const base = o.fetch ?? fetch;
  let client = o.client;
  if (o.check) {
    const check = typeof o.check === 'string' ? apiChecker(o.check) : o.check;
    client = withTrustGuard(client, { check, minScore: o.minScore, allowUnknown: o.allowUnknown, allowCaution: o.allowCaution });
  }
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    let terms: DeliveryTerms | null = null;
    let paymentHeader: string | null = null;
    const spy = (async (i: RequestInfo | URL, n?: RequestInit) => {
      const req = new Request(i, n);
      paymentHeader = req.headers.get('PAYMENT-SIGNATURE') ?? req.headers.get('X-PAYMENT') ?? paymentHeader;
      const res = await base(req);
      if (res.status === 402) {
        try {
          terms = readTerms(JSON.parse(Buffer.from(res.headers.get('PAYMENT-REQUIRED') ?? '', 'base64').toString('utf8')) as PaymentRequired);
        } catch { /* no challenge header */ }
      }
      return res;
    }) as typeof fetch;
    const t0 = Date.now();
    const res = await wrapFetchWithPayment(spy, client)(input, init);
    const responseMs = Date.now() - t0;
    const url = new Request(input, init).url;
    const body = new Uint8Array(await res.arrayBuffer());
    const declaration = res.headers.get(DECLARATION_HEADER);
    const receipt = decodeReceipt(res.headers.get(RECEIPT_HEADER));
    let json: unknown = null;
    try { json = JSON.parse(Buffer.from(body).toString('utf8')); } catch { /* not JSON */ }
    const d = checkDelivery({ url, terms, header: declaration, body: json });
    // The payTo we actually paid, from our own payment header (never from the seller's receipt).
    let accepted: { payTo?: string; network?: string; scheme?: string; extra?: { seller?: string } } | null = null;
    let escrowId: string | null = null;
    try {
      const pp = paymentHeader ? JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf8')) : null;
      accepted = pp?.accepted ?? null;
      escrowId = accepted?.scheme === 'escrow' && typeof pp?.payload?.id === 'string' ? pp.payload.id : null;
    } catch { accepted = null; }
    // Escrow receipts are signed by the seller (extra.seller) for the escrow id.
    const paidTo = escrowId ? accepted?.extra?.seller ?? null : accepted?.payTo ?? null;
    const signers = paidTo && receipt && receipt.signer !== paidTo && accepted?.network ? await receiptSignersFor(paidTo, accepted.network).catch(() => []) : [];
    const report: DeliveryReport = {
      url,
      status: res.status,
      receipt: paymentHeader ? verifyReceipt(receipt, { paymentHeader, body, payTo: paidTo, declaration, signers, paymentId: escrowId }) : 'unpaid',
      providerAtFault: d.providerAtFault && (d.basis === 'at-source' || d.basis === 'declared'),
      codes: d.codes,
    };
    const t = terms as DeliveryTerms | null;
    // Refund only on the seller's own valid signature showing the breach.
    let settledPayer: string | null = null;
    try { settledPayer = JSON.parse(Buffer.from(res.headers.get('PAYMENT-RESPONSE') ?? '', 'base64').toString('utf8')).payer ?? null; } catch { settledPayer = null; }
    const settleAfter = async () => {
    if (escrowId && accepted?.payTo) {
      const net = accepted.network ?? '';
      const cfg = { contract: accepted.payTo, rpcUrl: o.escrow?.rpcUrl ?? RPC[net], networkPassphrase: o.escrow?.networkPassphrase ?? PASS[net] };
      const e: NonNullable<DeliveryReport['escrow']> = { id: escrowId, contract: accepted.payTo, action: 'held' };
      if (o.escrow && cfg.rpcUrl && cfg.networkPassphrase) {
        try {
          if (report.receipt === 'valid' && claimable(receipt)) {
            const r = await escrowSubmitReceipt(cfg, { submitter: o.escrow.payer, id: escrowId, receipt });
            Object.assign(e, { action: r.status === 'refunded' ? 'refunded' : 'held', tx: r.tx });
          } else if (res.ok && !report.providerAtFault && (report.receipt === 'valid' || (report.receipt === 'missing' && o.escrow.confirmWithoutReceipt !== false))) {
            Object.assign(e, { action: 'confirmed', tx: await escrowConfirm(cfg, { payer: o.escrow.payer, id: escrowId }) });
          }
        } catch (err) {
          Object.assign(e, { action: 'failed', error: (err as Error).message.slice(0, 300) });
        }
      }
      report.escrow = e;
    }
    // The refund goes to the receipt's payer: only claim when that is us.
    if (!escrowId && t?.refund && report.receipt === 'valid' && claimable(receipt) && o.refunds && (!settledPayer || receipt.payer === settledPayer)) {
      const net = t.refund.network;
      const cfg = { contract: t.refund.contract, rpcUrl: o.refunds.rpcUrl ?? RPC[net], networkPassphrase: o.refunds.networkPassphrase ?? PASS[net] };
      try {
        if (!cfg.rpcUrl || !cfg.networkPassphrase) throw new Error(`no RPC configured for ${net}`);
        const r = await claimRefund(cfg, { submitter: o.refunds.submitter, receipt });
        report.refund = { outcome: r.outcome, tx: r.tx, contract: cfg.contract };
      } catch (e) {
        report.refund = { outcome: 'failed', contract: cfg.contract, error: (e as Error).message.slice(0, 300) };
      }
    }
    report.timings = { responseMs, settledMs: Date.now() - t0 };
    o.onReport?.(report);
    };
    // The buyer's data never waits for the escrow or the refund: they settle in the background.
    const headers = new Headers(res.headers);
    headers.set('X-402Scope-Delivery', JSON.stringify(report));
    const done = settleAfter().catch((err: Error) => o.onReport?.({ ...report, refund: report.refund ?? { outcome: 'failed', contract: '', error: err.message } }));
    if (o.waitForSettlement) await done;
    return new Response(body, { status: res.status, statusText: res.statusText, headers });
  }) as typeof fetch;
}
