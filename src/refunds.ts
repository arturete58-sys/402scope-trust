import { Account, Address, Contract, Keypair, nativeToScVal, Operation, rpc, scValToNative, StrKey, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { submit } from './chain.js';
import { receiptShowsBreach, receiptStructScVal, RECEIPT_VERSION_3, type Receipt } from './receipts.js';
import type { SellerChecker } from './facilitator.js';

/**
 * Optional automatic refunds (contracts/refund-bond).
 *
 * A seller that opts in locks a bond under the key it signs receipts with.
 * When a paid response breaks the seller's own terms, its signed
 * x402-receipt/3 is the proof: anyone submits it and the contract refunds the
 * payer from the bond in the same transaction. Nobody, 402Scope included,
 * can move a bond or decide a refund. See docs/refunds.md.
 */

export interface BondConfig {
  /** Refund bond contract (C...). */
  contract: string;
  rpcUrl: string;
  networkPassphrase: string;
}

export interface Bond {
  owner: string;
  balance: bigint;
  pending: bigint;
  unlockLedger: number;
}

export const OUTCOMES = ['refunded', 'partly_refunded', 'already_claimed', 'no_breach', 'expired', 'no_bond'] as const;
export type RefundOutcome = (typeof OUTCOMES)[number];

const keyBytes = (signer: string) => xdr.ScVal.scvBytes(Buffer.from(StrKey.decodeEd25519PublicKey(signer)));

async function read(c: BondConfig, method: string, args: xdr.ScVal[]): Promise<unknown> {
  const tx = new TransactionBuilder(new Account(Keypair.random().publicKey(), '0'), { fee: '100', networkPassphrase: c.networkPassphrase })
    .addOperation(new Contract(c.contract).call(method, ...args))
    .setTimeout(30)
    .build();
  const sim = await new rpc.Server(c.rpcUrl).simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) throw new Error(`${method}: ${(sim as { error?: string }).error ?? 'simulation failed'}`);
  return scValToNative(sim.result.retval);
}

async function call(c: BondConfig, source: Keypair, method: string, args: xdr.ScVal[]) {
  const done = await submit(new rpc.Server(c.rpcUrl), c.networkPassphrase, source, Operation.invokeContractFunction({ contract: c.contract, function: method, args }));
  return { hash: done.txHash, value: done.returnValue ? scValToNative(done.returnValue) : null };
}

/** The bond behind receipts signed by `signer` (G...), in `token`, or null. */
export async function bondOf(c: BondConfig, signer: string, token: string): Promise<Bond | null> {
  const b = (await read(c, 'bond', [keyBytes(signer), new Address(token).toScVal()])) as { owner: string; balance: bigint; pending: bigint; unlock_ledger: number } | null;
  return b ? { owner: b.owner, balance: BigInt(b.balance), pending: BigInt(b.pending), unlockLedger: Number(b.unlock_ledger) } : null;
}

/** Seller side: lock `amount` (token base units) as the bond behind its receipts. `owner` pays and can withdraw. */
export async function depositBond(c: BondConfig, o: { owner: Keypair; signer: string; token: string; amount: bigint }): Promise<string> {
  const args = [new Address(o.owner.publicKey()).toScVal(), keyBytes(o.signer), new Address(o.token).toScVal(), nativeToScVal(o.amount, { type: 'i128' })];
  return (await call(c, o.owner, 'deposit', args)).hash;
}

/** Seller side: start the notice period to withdraw. Claims are still paid meanwhile. */
export async function requestBondWithdraw(c: BondConfig, o: { owner: Keypair; signer: string; token: string; amount: bigint }): Promise<number> {
  const r = await call(c, o.owner, 'request_withdraw', [keyBytes(o.signer), new Address(o.token).toScVal(), nativeToScVal(o.amount, { type: 'i128' })]);
  return Number(r.value);
}

export async function withdrawBond(c: BondConfig, o: { owner: Keypair; signer: string; token: string }): Promise<bigint> {
  return BigInt((await call(c, o.owner, 'withdraw', [keyBytes(o.signer), new Address(o.token).toScVal()])).value as bigint);
}

/** The contract's `Claim` for one v3 receipt. */
export function claimScVal(r: Receipt): xdr.ScVal {
  const f: Record<string, xdr.ScVal> = { key: keyBytes(r.signer), receipt: receiptStructScVal(r), signature: xdr.ScVal.scvBytes(Buffer.from(r.sig, 'base64')) };
  return xdr.ScVal.scvMap(Object.keys(f).sort().map((k) => new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol(k), val: f[k] })));
}

/** Whether a receipt can be claimed: v3, and showing a breach of the seller's own terms. */
export const claimable = (r: Receipt | null): r is Receipt => !!r && r.v === RECEIPT_VERSION_3 && receiptShowsBreach(r);

/**
 * Buyer side: claim the refund for one receipt. `submitter` pays the fee
 * (a few stroops' worth); the refund always goes to the receipt's payer.
 * Verify the receipt first (verifyReceipt): a forged one fails the transaction.
 */
export async function claimRefund(c: BondConfig, o: { submitter: Keypair; receipt: Receipt }): Promise<{ outcome: RefundOutcome; tx: string }> {
  if (!claimable(o.receipt)) return { outcome: 'no_breach', tx: '' };
  const r = await call(c, o.submitter, 'claim', [claimScVal(o.receipt)]);
  return { outcome: OUTCOMES[Number(r.value)] ?? 'no_breach', tx: r.hash };
}

/** Up to 50 claims in one transaction (a facilitator or relayer acting for many buyers). */
export async function claimRefunds(c: BondConfig, o: { submitter: Keypair; receipts: Receipt[] }): Promise<{ outcomes: RefundOutcome[]; tx: string }> {
  const list = o.receipts.filter(claimable);
  if (!list.length) return { outcomes: [], tx: '' };
  const r = await call(c, o.submitter, 'claim_batch', [xdr.ScVal.scvVec(list.map(claimScVal))]);
  return { outcomes: ((r.value as number[]) ?? []).map((n) => OUTCOMES[Number(n)] ?? 'no_breach'), tx: r.hash };
}

/**
 * Facilitator side: adds `bonded` to a seller checker's verdicts, so a
 * facilitator can label (and a Bazaar rank first) sellers that back their
 * terms with a refund bond of at least `minBond` in `token`.
 */
export function withBondInfo(check: SellerChecker, c: BondConfig & { token: string; minBond?: bigint }): SellerChecker {
  return async (payTo, network) => {
    const v = await check(payTo, network);
    if (!StrKey.isValidEd25519PublicKey(payTo)) return v;
    const b = await bondOf(c, payTo, c.token).catch(() => null);
    const bonded = !!b && b.balance >= (c.minBond ?? 1n) && b.pending < b.balance;
    return { ...v, bonded, bond: b ? b.balance.toString() : '0' };
  };
}
