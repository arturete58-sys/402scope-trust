import { randomBytes } from 'node:crypto';
import { Account, Contract, Keypair, Networks, rpc, scValToNative, TransactionBuilder } from '@stellar/stellar-sdk';
import type { PaymentPayload, PaymentRequirements, SchemeNetworkClient } from '@x402/core/types';

/**
 * Prepaid sellers on Stellar: the x402 `batch-settlement` scheme as Fermah Pay
 * serves it (https://github.com/fermah-xyz/fermah-pay-stellar, docs/api/x402.md).
 *
 * The buyer holds a prepaid USDC balance on the seller's ledger contract and
 * authorizes each request by signing a commitment (SEP-53). The seller's
 * `payTo` is that ledger contract (C...), not the seller's own account, so a
 * delivery receipt signed by the seller's key is checked against the
 * `seller` role the contract records (`get_config`).
 */

export const BATCH_SETTLEMENT = 'batch-settlement';

export interface Commitment {
  network: string;
  asset: string;
  payTo: string;
  amount: string;
  payer: string;
  /** 32 random bytes, 64 lowercase hex characters, unique per payment. */
  commitment: string;
  /** Unix seconds, as a decimal string. */
  validUntil: string;
}

/** The exact text the buyer signs (SEP-53), one field per line, no trailing newline. */
export function commitmentMessage(c: Commitment): string {
  return [
    'x402 batch-settlement commitment',
    `network: ${c.network}`,
    `asset: ${c.asset}`,
    `payTo: ${c.payTo}`,
    `amount: ${c.amount}`,
    `payer: ${c.payer}`,
    `commitment: ${c.commitment}`,
    `validUntil: ${c.validUntil}`,
  ].join('\n');
}

/**
 * x402 client scheme for `batch-settlement` on Stellar. The payer must already
 * be a buyer of the seller deployment with a prepaid balance; the facilitator
 * refuses unknown payers (`invalid_batch_settlement_stellar_unknown_payer`).
 */
export class BatchSettlementStellarScheme implements SchemeNetworkClient {
  readonly scheme = BATCH_SETTLEMENT;
  constructor(private readonly key: Keypair, private readonly now: () => number = () => Math.floor(Date.now() / 1000)) {}

  async createPaymentPayload(x402Version: number, req: PaymentRequirements): Promise<Pick<PaymentPayload, 'x402Version' | 'payload'>> {
    const ahead = Math.max(1, Math.min(req.maxTimeoutSeconds ?? 60, 300) - 5);
    const c: Commitment = {
      network: req.network,
      asset: req.asset,
      payTo: req.payTo,
      amount: req.amount,
      payer: this.key.publicKey(),
      commitment: randomBytes(32).toString('hex'),
      validUntil: String(this.now() + ahead),
    };
    const signature = this.key.signMessage(commitmentMessage(c)).toString('base64');
    return { x402Version, payload: { payer: c.payer, commitment: c.commitment, validUntil: c.validUntil, signature } };
  }
}

/** Checks a commitment's signature (SEP-53) by its payer. */
export function verifyCommitment(c: Commitment, signatureBase64: string): boolean {
  try {
    return Keypair.fromPublicKey(c.payer).verifyMessage(commitmentMessage(c), Buffer.from(signatureBase64, 'base64'));
  } catch {
    return false;
  }
}

const RPC_BY_NETWORK: Record<string, string> = { 'stellar:testnet': 'https://soroban-testnet.stellar.org' };
const PASSPHRASE: Record<string, string> = { 'stellar:testnet': Networks.TESTNET, 'stellar:pubnet': Networks.PUBLIC };
const sellerCache = new Map<string, { at: number; seller: string | null }>();

/**
 * The `seller` role of a prepaid ledger contract (Fermah Pay `get_config`), or
 * null when the contract has no such call. Read by simulation: free, no
 * account needed. Cached for 10 minutes.
 */
export async function prepaidSeller(contractId: string, network: string, rpcUrl?: string): Promise<string | null> {
  const key = `${network}|${contractId}`;
  const hit = sellerCache.get(key);
  if (hit && Date.now() - hit.at < 600_000) return hit.seller;
  const url = rpcUrl ?? RPC_BY_NETWORK[network];
  const passphrase = PASSPHRASE[network];
  if (!url || !passphrase) return null;
  let seller: string | null = null;
  try {
    const server = new rpc.Server(url);
    const tx = new TransactionBuilder(new Account(Keypair.random().publicKey(), '0'), { fee: '100', networkPassphrase: passphrase })
      .addOperation(new Contract(contractId).call('get_config'))
      .setTimeout(30)
      .build();
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
      const cfg = scValToNative(sim.result.retval) as { seller?: unknown };
      seller = typeof cfg?.seller === 'string' ? cfg.seller : null;
    }
  } catch {
    seller = null;
  }
  sellerCache.set(key, { at: Date.now(), seller });
  return seller;
}

/** Keys allowed to sign a delivery receipt for `payTo`: the payTo, and the seller role when payTo is a prepaid ledger contract. */
export async function receiptSignersFor(payTo: string | undefined, network: string, rpcUrl?: string): Promise<string[]> {
  if (!payTo) return [];
  if (!payTo.startsWith('C')) return [payTo];
  const seller = await prepaidSeller(payTo, network, rpcUrl);
  return seller ? [payTo, seller] : [payTo];
}
