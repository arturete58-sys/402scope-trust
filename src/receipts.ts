import { createHash } from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import type { NextFunction, Request, Response } from 'express';
import { DECLARATION_HEADER } from './declarations.js';

/**
 * x402 delivery receipts on Stellar (draft extension "x402-receipt/2", signed
 * as SEP-53 Stellar signed messages; "x402-receipt/1" is still verified).
 *
 * After a paid request, the seller signs what it delivered with the key of
 * its payment address, binding together: the resource, the payment (hash of
 * the PAYMENT-SIGNATURE header the buyer sent) and the response body (hash).
 * Any buyer can verify the receipt offline and keep it as evidence; an
 * attester can put it in the Merkle tree behind an onchain attestation.
 *
 * When the response carries an `X-402-Declaration` header, the receipt also
 * signs its hash, so what the seller stated about the response (its age,
 * source...) is bound to it as well.
 *
 * Header: `X-402-Receipt: base64url(JSON)`. See docs/receipts.md.
 */
export const RECEIPT_HEADER = 'X-402-Receipt';
/** Current version: signed as a SEP-53 Stellar signed message. */
export const RECEIPT_VERSION = 'x402-receipt/2';
/** Legacy version: raw ed25519 over the message. Still verified. */
export const RECEIPT_VERSION_1 = 'x402-receipt/1';

export interface Receipt {
  v: typeof RECEIPT_VERSION | typeof RECEIPT_VERSION_1;
  /** Resource URL as the seller served it. */
  resource: string;
  /** sha256 (hex) of the PAYMENT-SIGNATURE header value the buyer sent. */
  payment: string;
  /** sha256 (hex) of the response body bytes. */
  body: string;
  /** Unix seconds. */
  at: number;
  /** sha256 (hex) of the X-402-Declaration header value, when the response carried one. */
  decl?: string;
  /** Stellar public key (G...) that signed: normally the seller's payTo. */
  signer: string;
  /**
   * base64 ed25519 signature. v2: SEP-53, i.e. over
   * sha256("Stellar Signed Message:\n" + receiptMessage(...)), so any Stellar
   * wallet or SDK that implements SEP-53 can produce and check it.
   * v1: raw over receiptMessage(...).
   */
  sig: string;
}

export type ReceiptCheck = 'valid' | 'unbound' | 'invalid' | 'missing';

export const sha256hex = (b: Uint8Array | string) => createHash('sha256').update(b).digest('hex');

/** The message that is signed (for v2, the SEP-53 message). */
export function receiptMessage(r: Pick<Receipt, 'resource' | 'payment' | 'body' | 'at' | 'decl'> & { v?: Receipt['v'] }): Buffer {
  return Buffer.from(`${r.v ?? RECEIPT_VERSION}\n${r.resource}\n${r.payment}\n${r.body}\n${r.at}${r.decl ? `\n${r.decl}` : ''}`, 'utf8');
}

type ReceiptBase = Pick<Receipt, 'resource' | 'payment' | 'body' | 'at' | 'decl'>;
function receiptBase(p: { resource: string; paymentHeader: string; body: Uint8Array | string; at?: number; declaration?: string | null }): ReceiptBase {
  return { resource: p.resource, payment: sha256hex(p.paymentHeader), body: sha256hex(p.body), at: p.at ?? Math.floor(Date.now() / 1000), ...(p.declaration ? { decl: sha256hex(p.declaration) } : {}) };
}

/**
 * Signs with any SEP-53 signer, for example a wallet that never hands over
 * its secret key: `signMessage(message)` returns the base64 (or raw) signature.
 */
export async function signReceiptWith(signer: { publicKey: string; signMessage: (message: string) => Promise<string | Uint8Array> | string | Uint8Array }, p: { resource: string; paymentHeader: string; body: Uint8Array | string; at?: number; declaration?: string | null }): Promise<Receipt> {
  const base = receiptBase(p);
  const sig = await signer.signMessage(receiptMessage({ ...base, v: RECEIPT_VERSION }).toString('utf8'));
  return { v: RECEIPT_VERSION, ...base, signer: signer.publicKey, sig: typeof sig === 'string' ? sig : Buffer.from(sig).toString('base64') };
}

export function signReceipt(secret: string, p: { resource: string; paymentHeader: string; body: Uint8Array | string; at?: number; declaration?: string | null }): Receipt {
  const kp = Keypair.fromSecret(secret);
  const base = receiptBase(p);
  // SEP-53: Keypair.signMessage prefixes "Stellar Signed Message:\n" and signs the sha256.
  return { v: RECEIPT_VERSION, ...base, signer: kp.publicKey(), sig: kp.signMessage(receiptMessage({ ...base, v: RECEIPT_VERSION })).toString('base64') };
}

export const encodeReceipt = (r: Receipt) => Buffer.from(JSON.stringify(r)).toString('base64url');

export function decodeReceipt(header: string | null | undefined): Receipt | null {
  if (!header) return null;
  try {
    const r = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    return r && (r.v === RECEIPT_VERSION || r.v === RECEIPT_VERSION_1) ? (r as Receipt) : null;
  } catch {
    return null;
  }
}

/**
 * Verifies a receipt against what the buyer actually sent and received.
 * - `valid`: signature checks, hashes match, and the signer is the payTo paid;
 * - `unbound`: signature and hashes check but the signer is neither the payTo
 *   nor one of `signers` (keys bound to it, such as a prepaid ledger's seller);
 * - `invalid`: wrong signature or hashes; `missing`: no receipt.
 */
export function verifyReceipt(r: Receipt | null, expect: { paymentHeader: string; body: Uint8Array | string; payTo?: string | null; declaration?: string | null; signers?: string[] }): ReceiptCheck {
  if (!r) return 'missing';
  try {
    if (r.payment !== sha256hex(expect.paymentHeader) || r.body !== sha256hex(expect.body)) return 'invalid';
    // A declaration received must be the one signed, and a signed one must have been received.
    if ((r.decl ?? null) !== (expect.declaration ? sha256hex(expect.declaration) : null)) return 'invalid';
    const kp = Keypair.fromPublicKey(r.signer);
    const sig = Buffer.from(r.sig, 'base64');
    const ok = r.v === RECEIPT_VERSION_1 ? kp.verify(receiptMessage(r), sig) : kp.verifyMessage(receiptMessage(r), sig);
    if (!ok) return 'invalid';
    // The payTo, or a key bound to it (e.g. the seller role of a prepaid ledger contract, see prepaid.ts).
    return (expect.payTo && expect.payTo === r.signer) || (expect.signers ?? []).includes(r.signer) ? 'valid' : 'unbound';
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
        const declaration = res.getHeader(DECLARATION_HEADER);
        res.setHeader(RECEIPT_HEADER, encodeReceipt(signReceipt(opts.secret, { resource, paymentHeader, body, declaration: typeof declaration === 'string' ? declaration : null })));
      }
      if (!res.headersSent) res.setHeader('content-length', String(body.length));
      if (body.length) write(body);
      const done = typeof chunk === 'function' ? chunk : typeof enc === 'function' ? enc : cb;
      return end(done as () => void);
    }) as Response['end'];
    next();
  };
}
