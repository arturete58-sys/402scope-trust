import type { Keypair } from '@stellar/stellar-sdk';
import type { RequestHandler } from 'express';
import { declarations, declare, declareDeliveryTerms, type DeliveryTerms, type ResponseDeclaration } from '../declarations.js';
import { decodeReceipt, deliveryReceipts, RECEIPT_HEADER, RECEIPT_VERSION_3 } from '../receipts.js';
import { Keypair as KP } from '@stellar/stellar-sdk';
import { EscrowStellarServerScheme, escrowSubmitReceipt, type EscrowConfig } from '../escrow.js';
import { bondOf, depositBond, requestBondWithdraw, withdrawBond, type BondConfig } from '../refunds.js';

/**
 * 402Scope for sellers, in one call:
 *
 *   const scope = scopeSeller({ secret: PAYTO_SECRET, terms: { version: 1, freshness: { maxAgeSeconds: 60 } } });
 *   app.use(...scope.middleware);                  // before the x402 middleware
 *   routes['GET /quote'] = { accepts, extensions: scope.extensions };
 *   res.declare({ freshness: { ageSeconds: 3 } });  // per response
 *
 * - Publishes your delivery terms in the 402 challenge (extensions.declarations).
 * - Signs a delivery receipt for every paid response (x402-receipt/3, SEP-53).
 * - Optional refund bond: add `refund` and deposit with `scope.bond.deposit`.
 *   Buyers whose response breaks your own terms are refunded automatically
 *   from it; you can withdraw what is left after a notice period.
 */
export interface SellerOptions {
  /** Secret of the payTo account: it signs receipts. */
  secret: string;
  terms: DeliveryTerms;
  /** Optional: back your terms with a refund bond in this contract. */
  refund?: BondConfig;
  /**
   * Optional: accept the `escrow` scheme. Register `scope.escrowScheme` on your
   * resource server and use `scheme: 'escrow'` in your route's accepts.
   * With `postReceipts`, your receipt is posted to the escrow after each paid
   * response, so you are paid even if the buyer never confirms (at once if
   * your refund bond covers the amount, otherwise after the contest window).
   */
  escrow?: EscrowConfig & { postReceipts?: boolean; onPosted?: (r: { id: string; status?: string; tx?: string; error?: string }) => void };
}

export function scopeSeller(o: SellerOptions) {
  const terms: DeliveryTerms = o.refund
    ? { ...o.terms, onBreach: 'refund', refund: { contract: o.refund.contract, network: o.refund.networkPassphrase.startsWith('Test') ? 'stellar:testnet' : 'stellar:pubnet' } }
    : o.terms;
  const extensions = declareDeliveryTerms(terms);
  const middleware: RequestHandler[] = [declarations() as RequestHandler, deliveryReceipts({ secret: o.secret, terms }) as RequestHandler];
  if (o.escrow?.postReceipts) {
    const cfg = o.escrow;
    const key = KP.fromSecret(o.secret);
    // After the response is sent: post this escrow payment's receipt. Never delays the buyer.
    middleware.unshift(((req, res, next) => {
      res.on('finish', () => {
        const r = decodeReceipt(String(res.getHeader(RECEIPT_HEADER) ?? ''));
        let id: string | null = null;
        try { id = JSON.parse(Buffer.from(req.header('PAYMENT-SIGNATURE') ?? '', 'base64').toString('utf8'))?.payload?.id ?? null; } catch { id = null; }
        if (!r || r.v !== RECEIPT_VERSION_3 || !id || r.payment !== id) return;
        escrowSubmitReceipt(cfg, { submitter: key, id, receipt: r })
          .then((x) => cfg.onPosted?.({ id: id!, status: x.status, tx: x.tx }))
          .catch((e: Error) => cfg.onPosted?.({ id: id!, error: e.message.slice(0, 300) }));
      });
      next();
    }) as RequestHandler);
  }
  const bond = o.refund
    ? {
        /** Deposit `amount` (token base units) from `owner`, behind receipts signed by `signer` (your payTo). */
        deposit: (owner: Keypair, signer: string, token: string, amount: bigint) => depositBond(o.refund!, { owner, signer, token, amount }),
        status: (signer: string, token: string) => bondOf(o.refund!, signer, token),
        requestWithdraw: (owner: Keypair, signer: string, token: string, amount: bigint) => requestBondWithdraw(o.refund!, { owner, signer, token, amount }),
        withdraw: (owner: Keypair, signer: string, token: string) => withdrawBond(o.refund!, { owner, signer, token }),
      }
    : null;
  return {
    terms,
    /** Route `extensions` for the x402 middleware. */
    extensions,
    /** Register before the x402 middleware. */
    middleware,
    /** Declares one response (also available as `res.declare` after the middleware). */
    declare: (res: Parameters<typeof declare>[0], d: ResponseDeclaration) => declare(res, d),
    bond,
    /** Register on your x402 resource server for routes with `scheme: 'escrow'`. */
    escrowScheme: o.escrow ? new EscrowStellarServerScheme(o.escrow.contract) : null,
  };
}
