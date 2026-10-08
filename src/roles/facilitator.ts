import http from 'node:http';
import { resourceSharer } from '../contributions.js';
import { apiSellerChecker, cached, discoveryProxy, onchainSellerChecker, rankResources, withTrustHooks, type HookableFacilitator, type SellerChecker, type TrustDecision } from '../facilitator.js';
import { withBondInfo, type BondConfig } from '../refunds.js';
import type { ChainConfig } from '../chain.js';
import type { Keypair } from '@stellar/stellar-sdk';
import { EscrowStellarFacilitatorScheme, escrowKeeper } from '../escrow.js';

/**
 * 402Scope for facilitators, in one call:
 *
 *   const scope = scopeFacilitator(facilitator, { trust: { chain }, mode: 'flag', share: { apiUrl, key }, refunds: { ...bond, token: USDC } });
 *
 * - Trust hooks on verify and settle: flag (default) or block sellers that are not trusted.
 * - Optional: share the resources you settle and your Bazaar, so they get measured.
 * - Optional: see which sellers back their terms with a refund bond, and rank them first.
 * - `scope.rank(items)` / `scope.discovery(upstream)`: your Bazaar listing, ranked by measured quality.
 */
export interface FacilitatorOptions {
  /** Where verdicts come from: the onchain attesters, a 402Scope Trust API, or your own checker. */
  trust: { chain: ChainConfig; minScore?: number } | { apiUrl: string; minScore?: number } | { check: SellerChecker };
  /** `flag` never interferes (default); `block` refuses untrusted sellers. */
  mode?: 'flag' | 'block';
  /** Refuse when the trust source is unreachable (default false: a trust outage is not a payments outage). */
  failClosed?: boolean;
  /** Opt-in: share the resources you verify (URL, network, payTo; never the payer). `key` is a contributor key or a SEP-10 token. */
  share?: { apiUrl: string; key: string };
  /** Opt-in: read sellers' refund bonds, to label and rank refund-backed sellers. */
  refunds?: BondConfig & { token: string; minBond?: bigint };
  onDecision?: (d: TrustDecision) => void;
  cacheMs?: number;
  /**
   * Optional: settle the `escrow` scheme and keep it moving. `scope.escrowScheme(signer)`
   * returns the scheme to register; a keeper releases and refunds what is due.
   */
  escrow?: { submitter: Keypair; rpcUrl: string; networkPassphrase: string; intervalMs?: number; maxTransactionFeeStroops?: number };
}

export function scopeFacilitator<F extends HookableFacilitator>(fac: F, o: FacilitatorOptions) {
  let check: SellerChecker = 'check' in o.trust ? o.trust.check : 'chain' in o.trust ? onchainSellerChecker(o.trust.chain, o.trust.minScore ?? 80) : apiSellerChecker(o.trust.apiUrl, o.trust.minScore ?? 80);
  if (o.refunds) check = withBondInfo(check, o.refunds);
  check = cached(check, o.cacheMs);
  const sharer = o.share ? resourceSharer({ apiUrl: o.share.apiUrl, key: o.share.key }) : undefined;
  withTrustHooks(fac, { check, mode: o.mode ?? 'flag', failClosed: o.failClosed, onDecision: o.onDecision, cacheMs: 0, share: sharer });
  const keeper = o.escrow ? escrowKeeper(o.escrow) : null;
  keeper?.start();
  return {
    facilitator: fac,
    /** The verdict for one seller (trusted, score, and `bonded` when refunds are on). */
    check,
    /** Ranks Bazaar items: trusted and refund-backed first. */
    rank: <T extends { resource?: string | { url?: string }; accepts?: { network?: string; payTo?: string }[] }>(items: T[]) => rankResources(items, check),
    /** A Bazaar-compatible discovery endpoint in front of `upstream`, ranked. */
    discovery: (upstream: string): http.Server => discoveryProxy({ upstream, check }),
    /** The `escrow` scheme to register on your facilitator (`facilitator.register(network, scope.escrowScheme(signer))`). */
    escrowScheme: (signer: Keypair) => new EscrowStellarFacilitatorScheme(signer, { rpcUrl: o.escrow?.rpcUrl, maxTransactionFeeStroops: o.escrow?.maxTransactionFeeStroops, onSettled: (id, contract) => keeper?.add(id, contract) }),
    /** Releases and refunds what is due now (the keeper also runs on its own). */
    settleEscrow: () => keeper?.tick(),
    /** Flushes shared resources and stops the keeper. Call on shutdown. */
    stop: async () => { keeper?.stop(); await sharer?.stop(); },
  };
}
