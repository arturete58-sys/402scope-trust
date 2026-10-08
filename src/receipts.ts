import { createHash } from 'node:crypto';
import { Address, Keypair, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import type { NextFunction, Request, Response } from 'express';
import { checkDelivery, DECLARATION_HEADER, type DeliveryTerms } from './declarations.js';

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
/**
 * Checkable onchain: also binds payer, payTo, asset, amount, the declared age,
 * the promised maximum and whether the seller marked the response unusable, so
 * the refund bond contract can verify it and refund the payer (see refunds.ts).
 */
export const RECEIPT_VERSION_3 = 'x402-receipt/3';
/** Age value meaning "not declared" in a v3 receipt. */
export const NO_AGE = 0xffffffff;

export interface Receipt {
  v: typeof RECEIPT_VERSION | typeof RECEIPT_VERSION_1 | typeof RECEIPT_VERSION_3;
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
  /** v3 only: who paid, whom, in which token and how much (base units, as a string). */
  payer?: string;
  payTo?: string;
  asset?: string;
  amount?: string;
  /** v3 only: the data's age the seller declared (null if none), the maximum it promised (0 if none), and whether it marked the response unusable. */
  age?: number | null;
  maxAge?: number;
  unusable?: boolean;
}

/** The v3 facts beyond v2. */
export interface ReceiptFacts {
  payer: string;
  payTo: string;
  asset: string;
  amount: string | bigint;
  age: number | null;
  maxAge: number;
  unusable: boolean;
}

export type ReceiptCheck = 'valid' | 'unbound' | 'invalid' | 'missing';

export const sha256hex = (b: Uint8Array | string) => createHash('sha256').update(b).digest('hex');

/** The message that is signed (for v2, the SEP-53 message). */
export function receiptMessage(r: Pick<Receipt, 'resource' | 'payment' | 'body' | 'at' | 'decl'> & { v?: Receipt['v'] }): Buffer {
  return Buffer.from(`${r.v ?? RECEIPT_VERSION}\n${r.resource}\n${r.payment}\n${r.body}\n${r.at}${r.decl ? `\n${r.decl}` : ''}`, 'utf8');
}

const sym = (k: string) => xdr.ScVal.scvSymbol(k);
const b32 = (hex: string) => xdr.ScVal.scvBytes(Buffer.from(hex, 'hex'));

/** XDR of the contract's `Receipt` struct (fields in the order Soroban sorts them). */
export function receiptStructXdr(r: Receipt): Buffer {
  return receiptStructScVal(r).toXDR();
}

/** The contract's `Receipt` struct as an ScVal, for a `claim` call. */
export function receiptStructScVal(r: Receipt): xdr.ScVal {
  const f: Record<string, xdr.ScVal> = {
    age: xdr.ScVal.scvU32(r.age === null || r.age === undefined ? NO_AGE : r.age),
    amount: nativeToScVal(BigInt(r.amount ?? 0), { type: 'i128' }),
    asset: new Address(r.asset!).toScVal(),
    at: xdr.ScVal.scvU64(new xdr.Uint64(BigInt(r.at))),
    body: b32(r.body),
    decl: b32(r.decl ?? '0'.repeat(64)),
    max_age: xdr.ScVal.scvU32(r.maxAge ?? 0),
    pay_to: new Address(r.payTo!).toScVal(),
    payer: new Address(r.payer!).toScVal(),
    payment: b32(r.payment),
    resource: b32(sha256hex(r.resource)),
    unusable: xdr.ScVal.scvBool(!!r.unusable),
  };
  return xdr.ScVal.scvMap(Object.keys(f).sort().map((k) => new xdr.ScMapEntry({ key: sym(k), val: f[k] })));
}

/** The v3 message: the version line and the hex sha256 of the struct's XDR. */
export function receiptMessageV3(r: Receipt): Buffer {
  return Buffer.from(`${RECEIPT_VERSION_3}\n${sha256hex(receiptStructXdr(r))}`, 'utf8');
}

/** The SEP-53 hash a v3 receipt's signature covers (what the contract checks). */
export function receiptHashV3(r: Receipt): Buffer {
  return createHash('sha256').update(Buffer.concat([Buffer.from('Stellar Signed Message:\n'), receiptMessageV3(r)])).digest();
}

/** Whether a v3 receipt shows the seller broke its own terms (the contract's rule). */
export function receiptShowsBreach(r: Receipt): boolean {
  if (r.v !== RECEIPT_VERSION_3) return false;
  const age = r.age === null || r.age === undefined ? NO_AGE : r.age;
  return !!r.unusable || ((r.maxAge ?? 0) > 0 && age !== NO_AGE && age > (r.maxAge ?? 0));
}

/** Signs a v3 receipt: what was delivered, for which payment, and the facts a refund contract needs. */
export function signReceiptV3(secret: string, p: { resource: string; paymentHeader: string; body: Uint8Array | string; at?: number; declaration?: string | null } & ReceiptFacts): Receipt {
  const kp = Keypair.fromSecret(secret);
  const r: Receipt = {
    v: RECEIPT_VERSION_3, ...receiptBase(p), signer: kp.publicKey(), sig: '',
    payer: p.payer, payTo: p.payTo, asset: p.asset, amount: String(p.amount), age: p.age, maxAge: p.maxAge, unusable: p.unusable,
  };
  r.sig = kp.signMessage(receiptMessageV3(r)).toString('base64');
  return r;
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
    return r && (r.v === RECEIPT_VERSION || r.v === RECEIPT_VERSION_1 || r.v === RECEIPT_VERSION_3) ? (r as Receipt) : null;
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
    const ok = r.v === RECEIPT_VERSION_1 ? kp.verify(receiptMessage(r), sig) : r.v === RECEIPT_VERSION_3 ? kp.verifyMessage(receiptMessageV3(r), sig) : kp.verifyMessage(receiptMessage(r), sig);
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
export function deliveryReceipts(opts: {
  secret: string;
  resourceUrl?: (req: Request) => string;
  /**
   * The delivery terms this seller published. With them, receipts are
   * x402-receipt/3 and carry the facts a refund bond checks onchain (declared
   * age against the promised maximum, unusable responses). Without them, v2.
   */
  terms?: DeliveryTerms | null;
}) {
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
        const decl = typeof declaration === 'string' ? declaration : null;
        const facts = opts.terms ? receiptFacts(paymentHeader, res.getHeader('PAYMENT-RESPONSE'), resource, opts.terms, decl) : null;
        res.setHeader(RECEIPT_HEADER, encodeReceipt(facts ? signReceiptV3(opts.secret, { resource, paymentHeader, body, declaration: decl, ...facts }) : signReceipt(opts.secret, { resource, paymentHeader, body, declaration: decl })));
      }
      if (!res.headersSent) res.setHeader('content-length', String(body.length));
      if (body.length) write(body);
      const done = typeof chunk === 'function' ? chunk : typeof enc === 'function' ? enc : cb;
      return end(done as () => void);
    }) as Response['end'];
    next();
  };
}

const b64json = (v: unknown): Record<string, any> | null => {
  try {
    return typeof v === 'string' ? JSON.parse(Buffer.from(v, 'base64').toString('utf8')) : null;
  } catch {
    return null;
  }
};

/**
 * The v3 facts for one paid response: what was paid (from the payment the
 * buyer sent and the settlement the x402 middleware reported) and what the
 * seller declared about the response, read against its own terms.
 * Null when the payment cannot be read (the receipt then falls back to v2).
 */
export function receiptFacts(paymentHeader: string, settlementHeader: unknown, resource: string, terms: DeliveryTerms, declaration: string | null): ReceiptFacts | null {
  const payment = b64json(paymentHeader);
  const settlement = b64json(settlementHeader);
  const accepted = payment?.accepted ?? payment?.paymentRequirements;
  const payer: string | undefined = settlement?.payer ?? payment?.payload?.payer;
  if (!accepted?.payTo || !accepted?.asset || !accepted?.amount || !payer) return null;
  const d = checkDelivery({ url: resource, terms, header: declaration });
  return {
    payer,
    payTo: accepted.payTo,
    asset: accepted.asset,
    amount: String(accepted.amount),
    age: typeof d.declaration.freshness?.ageSeconds === 'number' ? Math.max(0, Math.min(0xfffffffe, Math.round(d.declaration.freshness.ageSeconds))) : null,
    maxAge: terms.freshness?.maxAgeSeconds ?? 0,
    unusable: d.codes.includes('DECLARED_UNUSABLE') || d.codes.includes('BREAKS_TERMS'),
  };
}
