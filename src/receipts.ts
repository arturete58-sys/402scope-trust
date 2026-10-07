import { createHash } from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import type { NextFunction, Request, Response } from 'express';

/**
 * x402 delivery receipts on Stellar (draft extension "x402-receipt/1").
 *
 * After a paid request, the seller signs what it delivered with the key of
 * its payment address, binding together: the resource, the payment (hash of
 * the PAYMENT-SIGNATURE header the buyer sent) and the response body (hash).
 * Any buyer can verify the receipt offline and keep it as evidence; an
 * attester can put it in the Merkle tree behind an onchain attestation.
 *
 * Header: `X-402-Receipt: base64url(JSON)`. See docs/receipts.md.
 */
export const RECEIPT_HEADER = 'X-402-Receipt';
export const RECEIPT_VERSION = 'x402-receipt/1';

export interface Receipt {
  v: typeof RECEIPT_VERSION;
  /** Resource URL as the seller served it. */
  resource: string;
  /** sha256 (hex) of the PAYMENT-SIGNATURE header value the buyer sent. */
  payment: string;
  /** sha256 (hex) of the response body bytes. */
  body: string;
  /** Unix seconds. */
  at: number;
  /** Stellar public key (G...) that signed: normally the seller's payTo. */
  signer: string;
  /** base64 ed25519 signature over `receiptMessage(...)`. */
  sig: string;
}

export type ReceiptCheck = 'valid' | 'unbound' | 'invalid' | 'missing';

export const sha256hex = (b: Uint8Array | string) => createHash('sha256').update(b).digest('hex');

/** The exact bytes that are signed. */
export function receiptMessage(r: Pick<Receipt, 'resource' | 'payment' | 'body' | 'at'>): Buffer {
  return Buffer.from(`${RECEIPT_VERSION}\n${r.resource}\n${r.payment}\n${r.body}\n${r.at}`, 'utf8');
}

export function signReceipt(secret: string, p: { resource: string; paymentHeader: string; body: Uint8Array | string; at?: number }): Receipt {
  const kp = Keypair.fromSecret(secret);
  const base = { resource: p.resource, payment: sha256hex(p.paymentHeader), body: sha256hex(p.body), at: p.at ?? Math.floor(Date.now() / 1000) };
  return { v: RECEIPT_VERSION, ...base, signer: kp.publicKey(), sig: kp.sign(receiptMessage(base)).toString('base64') };
}

export const encodeReceipt = (r: Receipt) => Buffer.from(JSON.stringify(r)).toString('base64url');

export function decodeReceipt(header: string | null | undefined): Receipt | null {
  if (!header) return null;
  try {
    const r = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    return r && r.v === RECEIPT_VERSION ? (r as Receipt) : null;
  } catch {
    return null;
  }
}

/**
 * Verifies a receipt against what the buyer actually sent and received.
 * - `valid`: signature checks, hashes match, and the signer is the payTo paid;
 * - `unbound`: signature and hashes check but the signer is not the payTo
 *   (e.g. a contract payTo, or a separate signing key);
 * - `invalid`: wrong signature or hashes; `missing`: no receipt.
 */
export function verifyReceipt(r: Receipt | null, expect: { paymentHeader: string; body: Uint8Array | string; payTo?: string | null }): ReceiptCheck {
  if (!r) return 'missing';
  try {
    if (r.payment !== sha256hex(expect.paymentHeader) || r.body !== sha256hex(expect.body)) return 'invalid';
    const ok = Keypair.fromPublicKey(r.signer).verify(receiptMessage(r), Buffer.from(r.sig, 'base64'));
    if (!ok) return 'invalid';
    return expect.payTo && expect.payTo === r.signer ? 'valid' : 'unbound';
  } catch {
    return 'invalid';
  }
}

/**
 * Express middleware for sellers. Register it BEFORE the x402 payment
 * middleware so it wraps the final response: for every paid request that
 * succeeds (2xx), it hashes the exact body sent and adds the signed
 * `X-402-Receipt` header.
 */
export function deliveryReceipts(opts: { secret: string; resourceUrl?: (req: Request) => string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const paymentHeader = req.header('PAYMENT-SIGNATURE') ?? req.header('X-PAYMENT');
    if (!paymentHeader) return next();
    const chunks: Buffer[] = [];
    const write = res.write.bind(res);
    const end = res.end.bind(res);
    const toBuf = (c: unknown, enc?: BufferEncoding) => (Buffer.isBuffer(c) ? c : typeof c === 'string' ? Buffer.from(c, enc) : c instanceof Uint8Array ? Buffer.from(c) : null);
    res.write = ((chunk: unknown, enc?: unknown, cb?: unknown) => {
      const b = toBuf(chunk, typeof enc === 'string' ? (enc as BufferEncoding) : undefined);
      if (b) chunks.push(b);
      if (typeof enc === 'function') (enc as () => void)();
      else if (typeof cb === 'function') (cb as () => void)();
      return true;
    }) as Response['write'];
    res.end = ((chunk?: unknown, enc?: unknown, cb?: unknown) => {
      const b = chunk == null || typeof chunk === 'function' ? null : toBuf(chunk, typeof enc === 'string' ? (enc as BufferEncoding) : undefined);
      if (b) chunks.push(b);
      const body = Buffer.concat(chunks);
      if (res.statusCode >= 200 && res.statusCode < 300 && !res.headersSent) {
        const resource = opts.resourceUrl ? opts.resourceUrl(req) : `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.setHeader(RECEIPT_HEADER, encodeReceipt(signReceipt(opts.secret, { resource, paymentHeader, body })));
      }
      if (!res.headersSent) res.setHeader('content-length', String(body.length));
      if (body.length) write(body);
      const done = typeof chunk === 'function' ? chunk : typeof enc === 'function' ? enc : cb;
      return end(done as () => void);
    }) as Response['end'];
    next();
  };
}
