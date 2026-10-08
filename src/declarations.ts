import { createRequire } from 'node:module';
import type { NextFunction, Request, Response } from 'express';
import type { PaymentRequired, ResourceServerExtension } from '@x402/core/types';

/**
 * x402 delivery declarations (extension key `declarations`, version 1).
 *
 * x402 standardised how a seller asks to be paid. It says nothing about what
 * the buyer gets: how fresh the data is, how sure the seller is of it, where
 * it comes from. Sellers that care declare it anyway, each in its own
 * vocabulary (see the x402-declarations library). This extension gives them
 * one vocabulary, carried by x402 itself, in two places:
 *
 * 1. Terms, in the 402 challenge: `extensions.declarations.info`. What the
 *    seller commits to before the buyer pays (for example "data at most 60 s
 *    old") and what it does when it breaks that commitment.
 * 2. A per-response declaration, in the `X-402-Declaration` header: what the
 *    seller states about this particular response (its age, whether it is
 *    stale, its source). A delivery receipt signs it together with the body.
 *
 * The vocabulary is the normalised schema of x402-declarations (freshness,
 * quality, provenance), so the same checks apply whether a seller declares
 * at source or a library has to read its own field names. See
 * docs/declarations.md.
 */

export const DECLARATIONS = 'declarations';
export const DECLARATIONS_VERSION = 1;
export const DECLARATION_HEADER = 'X-402-Declaration';

export type FreshnessBasis = 'live' | 'cache' | 'snapshot' | 'multi-source' | 'window';

/** Standing terms, published in the 402 challenge. */
export interface DeliveryTerms {
  version: 1;
  freshness?: {
    /** Responses are never older than this. The seller is at fault if one is. */
    maxAgeSeconds?: number;
    basis?: FreshnessBasis;
  };
  quality?: {
    /** The seller only serves statistically established results. */
    established?: boolean;
  };
  provenance?: {
    source?: string;
    /** Responses carry a hash or record id the buyer can check upstream. */
    verifiable?: boolean;
  };
  /** Each response carries an X-402-Declaration header. */
  perResponse?: boolean;
  /** What the seller does when it breaks its own declaration. */
  onBreach?: 'refund' | 'retry' | 'none';
  /** Where a buyer claims a refund (URL or email). */
  refundContact?: string;
  /**
   * Optional automatic refunds: the seller's bond in a 402Scope refund bond
   * contract. A buyer holding a signed receipt (x402-receipt/3) that shows a
   * breach claims there and is refunded in the same transaction.
   */
  refund?: { contract: string; network: string };
}

/** What the seller states about one response (normalised x402-declarations schema). */
export interface ResponseDeclaration {
  freshness?: { ageSeconds?: number | null; isStale?: boolean | null; basis?: FreshnessBasis | null };
  quality?: { confidence?: number | null; established?: boolean | null; sampleSize?: number | null; note?: string | null };
  provenance?: { source?: string | null; hash?: string | null; verifiable?: boolean | null; servedFrom?: string | null };
}

/** JSON Schema of the terms, published next to them as x402 extensions do. */
export const TERMS_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  required: ['version'],
  properties: {
    version: { const: 1 },
    freshness: { type: 'object', properties: { maxAgeSeconds: { type: 'integer', minimum: 0 }, basis: { enum: ['live', 'cache', 'snapshot', 'multi-source', 'window'] } } },
    quality: { type: 'object', properties: { established: { type: 'boolean' } } },
    provenance: { type: 'object', properties: { source: { type: 'string' }, verifiable: { type: 'boolean' } } },
    perResponse: { type: 'boolean' },
    onBreach: { enum: ['refund', 'retry', 'none'] },
    refundContact: { type: 'string' },
    refund: { type: 'object', properties: { contract: { type: 'string' }, network: { type: 'string' } }, required: ['contract', 'network'] },
  },
} as const;

const BASES = new Set(['live', 'cache', 'snapshot', 'multi-source', 'window']);

/** Problems with a terms object; empty when it is valid. */
export function validateTerms(t: unknown): string[] {
  const p: string[] = [];
  if (!t || typeof t !== 'object') return ['terms must be an object'];
  const o = t as Record<string, any>;
  if (o.version !== 1) p.push('version must be 1');
  const max = o.freshness?.maxAgeSeconds;
  if (max !== undefined && !(Number.isInteger(max) && max >= 0)) p.push('freshness.maxAgeSeconds must be a non-negative integer (seconds)');
  if (o.freshness?.basis !== undefined && !BASES.has(o.freshness.basis)) p.push('freshness.basis is not one of live, cache, snapshot, multi-source, window');
  if (o.quality?.established !== undefined && typeof o.quality.established !== 'boolean') p.push('quality.established must be a boolean');
  if (o.provenance?.source !== undefined && typeof o.provenance.source !== 'string') p.push('provenance.source must be a string');
  if (o.onBreach !== undefined && !['refund', 'retry', 'none'].includes(o.onBreach)) p.push('onBreach must be refund, retry or none');
  if (o.refund !== undefined && !(/^C[A-Z2-7]{55}$/.test(o.refund?.contract ?? '') && /^stellar:/.test(o.refund?.network ?? ''))) p.push('refund must be { contract: C..., network: stellar:... }');
  return p;
}

// ---- Seller side ------------------------------------------------------

/**
 * Route-config helper, like the Bazaar's `declareDiscoveryExtension`:
 *
 *   'GET /quote': { accepts, extensions: { ...declareDeliveryTerms({ version: 1, freshness: { maxAgeSeconds: 60 } }) } }
 */
export function declareDeliveryTerms(terms: DeliveryTerms): Record<string, { info: DeliveryTerms; schema: typeof TERMS_SCHEMA }> {
  const problems = validateTerms(terms);
  if (problems.length) throw new Error(`invalid delivery terms: ${problems.join('; ')}`);
  return { [DECLARATIONS]: { info: terms, schema: TERMS_SCHEMA } };
}

/**
 * Optional server extension: register it on an x402ResourceServer so a route
 * with invalid terms fails loudly instead of publishing them.
 */
export const declarationsResourceServerExtension: ResourceServerExtension = {
  key: DECLARATIONS,
  enrichDeclaration: (declaration: unknown) => {
    const info = (declaration as { info?: unknown })?.info;
    const problems = validateTerms(info);
    if (problems.length) throw new Error(`invalid ${DECLARATIONS} extension: ${problems.join('; ')}`);
    return declaration;
  },
};

export const encodeDeclaration = (d: ResponseDeclaration) => Buffer.from(JSON.stringify(d)).toString('base64url');

export function decodeDeclaration(header: string | null | undefined): ResponseDeclaration | null {
  if (!header) return null;
  try {
    const d = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    return d && typeof d === 'object' && !Array.isArray(d) ? (d as ResponseDeclaration) : null;
  } catch {
    return null;
  }
}

/** Sets the per-response declaration on an Express response (before the body is sent). */
export function declare(res: Response, d: ResponseDeclaration): void {
  res.setHeader(DECLARATION_HEADER, encodeDeclaration(d));
}

/** Express middleware that adds `res.declare(d)`; handy when handlers are written elsewhere. */
export function declarations() {
  return (_req: Request, res: Response & { declare?: (d: ResponseDeclaration) => void }, next: NextFunction) => {
    res.declare = (d) => declare(res, d);
    next();
  };
}

// ---- Buyer side -------------------------------------------------------

/** Terms from a decoded 402 challenge, or null if absent or invalid. */
export function readTerms(pr: PaymentRequired | null | undefined): DeliveryTerms | null {
  const info = (pr?.extensions as Record<string, { info?: unknown }> | undefined)?.[DECLARATIONS]?.info;
  return info && !validateTerms(info).length ? (info as DeliveryTerms) : null;
}

type Normalised = {
  freshness: { ageSeconds: number | null; declaredMaxSeconds: number | null; isStale: boolean | null; basis: string | null };
  quality: { confidence: number | null; established: boolean | null; sampleSize: number | null; note: string | null };
  provenance: { source: string | null; hash: string | null; verifiable: boolean | null; servedFrom: string | null };
  _adapter?: string;
};
const lib = createRequire(import.meta.url)('x402-declarations') as { normalize: (url: string, body: unknown) => Normalised };

/** Reason codes, the same as x402-declarations plus two for terms published at source. */
export const REASONS = {
  DECLARED_UNUSABLE: { attributable: 'provider', text: 'provider declares this response should not be relied on' },
  EXCEEDS_DECLARED_MAX: { attributable: 'provider', text: 'age exceeds the maximum the provider declared' },
  NOT_ESTABLISHED: { attributable: 'provider', text: 'provider states the metric is not statistically established' },
  BREAKS_TERMS: { attributable: 'provider', text: 'response contradicts the terms the provider published in its 402 challenge' },
  MISSING_DECLARATION: { attributable: 'provider', text: 'terms promise a per-response declaration and none was sent' },
  EXCEEDS_CALLER_LIMIT: { attributable: 'caller', text: 'age exceeds the limit set by the caller' },
} as const;
export type ReasonCode = keyof typeof REASONS;

export interface DeliveryCheck {
  usable: boolean;
  /** True only when the seller broke something it declared itself. */
  providerAtFault: boolean;
  codes: ReasonCode[];
  reasons: { code: ReasonCode; attributable: 'provider' | 'caller'; message: string; detail?: unknown }[];
  /**
   * Where the declaration came from: `at-source` (X-402-Declaration header),
   * `declared` (an exact adapter read the seller's own fields), `heuristic`
   * (inferred from field names; verify before acting) or `none`.
   */
  basis: 'at-source' | 'declared' | 'heuristic' | 'none';
  declaration: ResponseDeclaration;
  terms: DeliveryTerms | null;
}

/**
 * Reads what the seller declared about one response and checks it against
 * the seller's own terms and, separately, the caller's policy.
 */
export function checkDelivery(o: {
  url: string;
  terms?: DeliveryTerms | null;
  /** Value of the X-402-Declaration header, if any. */
  header?: string | null;
  /** Parsed JSON body, used when there is no header. */
  body?: unknown;
  maxAgeSeconds?: number;
  requireEstablished?: boolean;
}): DeliveryCheck {
  const terms = o.terms ?? null;
  const atSource = decodeDeclaration(o.header);
  let decl: ResponseDeclaration;
  let basis: DeliveryCheck['basis'];
  let declaredMax: number | null = null;
  if (atSource) {
    decl = atSource;
    basis = 'at-source';
  } else {
    const n = o.body !== undefined && o.body !== null && typeof o.body === 'object' ? lib.normalize(o.url, o.body) : null;
    decl = n ? { freshness: { ageSeconds: n.freshness.ageSeconds, isStale: n.freshness.isStale, basis: n.freshness.basis as FreshnessBasis | null }, quality: n.quality, provenance: n.provenance } : {};
    declaredMax = n?.freshness.declaredMaxSeconds ?? null;
    basis = !n || n._adapter === 'none' ? 'none' : n._adapter === 'heuristic' ? 'heuristic' : 'declared';
  }
  const maxDeclared = terms?.freshness?.maxAgeSeconds ?? declaredMax;
  const age = decl.freshness?.ageSeconds ?? null;

  const reasons: DeliveryCheck['reasons'] = [];
  const add = (code: ReasonCode, detail?: unknown) => reasons.push({ code, attributable: REASONS[code].attributable, message: REASONS[code].text, ...(detail === undefined ? {} : { detail }) });

  if (decl.freshness?.isStale === true) add('DECLARED_UNUSABLE');
  if (maxDeclared !== null && age !== null && age > maxDeclared) add('EXCEEDS_DECLARED_MAX', { ageSeconds: age, declaredMaxSeconds: maxDeclared });
  if (terms) {
    if (terms.perResponse && !atSource) add('MISSING_DECLARATION');
    else if (terms.freshness?.maxAgeSeconds !== undefined && atSource && age === null) add('MISSING_DECLARATION', { missing: 'freshness.ageSeconds' });
    if (terms.quality?.established === true && decl.quality?.established === false) add('BREAKS_TERMS', { field: 'quality.established' });
    if (terms.provenance?.source && decl.provenance?.source && decl.provenance.source !== terms.provenance.source) add('BREAKS_TERMS', { field: 'provenance.source', terms: terms.provenance.source, response: decl.provenance.source });
  }
  if (o.requireEstablished && decl.quality?.established === false) add('NOT_ESTABLISHED');
  if (o.maxAgeSeconds !== undefined && age !== null && age > o.maxAgeSeconds) add('EXCEEDS_CALLER_LIMIT', { ageSeconds: age, callerLimitSeconds: o.maxAgeSeconds });

  return {
    usable: reasons.length === 0,
    providerAtFault: reasons.some((r) => r.attributable === 'provider'),
    codes: reasons.map((r) => r.code),
    reasons,
    basis,
    declaration: decl,
    terms,
  };
}
