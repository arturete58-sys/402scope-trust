import { randomBytes } from 'node:crypto';
import { Account, Address, contract, Contract, Keypair, nativeToScVal, Operation, rpc, scValToNative, StrKey, TransactionBuilder, Transaction, xdr } from '@stellar/stellar-sdk';
import { getEstimatedLedgerCloseTimeSeconds, getNetworkPassphrase, getRpcClient } from '@x402/stellar';
import { ExactStellarScheme as ExactServer } from '@x402/stellar/exact/server';
import type { Network, PaymentPayload, PaymentRequirements, Price, SchemeNetworkClient, SchemeNetworkFacilitator, SchemeNetworkServer, SettleResponse, VerifyResponse } from '@x402/core/types';
import { submit } from './chain.js';
import { receiptStructScVal, type Receipt } from './receipts.js';

/**
 * x402 `escrow` scheme on Stellar (contracts/escrow).
 *
 * The buyer pays the escrow contract instead of the seller. The response
 * reaches the buyer at once, as with `exact`; only the seller's money is
 * held, and in the normal case for one ledger:
 *
 * - the buyer's agent checks the response and confirms: the seller is paid;
 * - the seller's own receipt shows a breach of its terms: the buyer is refunded;
 * - a seller whose refund bond covers the amount is paid as soon as it posts its receipt;
 * - otherwise a posted receipt is released after a short contest window,
 *   and a payment with no receipt by the deadline is refunded.
 *
 * Requirements: `payTo` is the escrow contract, `extra.seller` the seller's
 * account (G...). The payload carries the signed `pay` transaction and the
 * escrow id, which is also the `payment` field of the seller's receipts.
 */

export const ESCROW = 'escrow';

export interface EscrowConfig {
  /** Escrow contract (C...). */
  contract: string;
  rpcUrl: string;
  networkPassphrase: string;
}

export const ESCROW_STATUS = ['held', 'delivered', 'released', 'refunded'] as const;
export type EscrowStatus = (typeof ESCROW_STATUS)[number];

const bytes32 = (hex: string) => xdr.ScVal.scvBytes(Buffer.from(hex, 'hex'));

// ---- Client --------------------------------------------------------------

/** Pays into the escrow from a classic account (the buyer's key signs the auth entry; the facilitator pays the fee). */
export class EscrowStellarClientScheme implements SchemeNetworkClient {
  readonly scheme = ESCROW;
  constructor(private readonly key: Keypair, private readonly rpcConfig?: { url?: string }) {}

  async createPaymentPayload(x402Version: number, req: PaymentRequirements): Promise<Pick<PaymentPayload, 'x402Version' | 'payload'>> {
    const seller = (req.extra as { seller?: string } | undefined)?.seller;
    if (!seller || !StrKey.isValidEd25519PublicKey(seller)) throw new Error('escrow requirements need extra.seller (G...)');
    const networkPassphrase = getNetworkPassphrase(req.network);
    const server = getRpcClient(req.network, this.rpcConfig);
    const id = randomBytes(32).toString('hex');
    const tx = await contract.AssembledTransaction.build({
      contractId: req.payTo,
      method: 'pay',
      args: [new Address(this.key.publicKey()).toScVal(), new Address(seller).toScVal(), new Address(req.asset).toScVal(), nativeToScVal(BigInt(req.amount), { type: 'i128' }), bytes32(id)],
      networkPassphrase,
      rpcUrl: server.serverURL.toString(),
      parseResultXdr: (r: xdr.ScVal) => r,
    });
    if (tx.simulation && rpc.Api.isSimulationError(tx.simulation)) throw new Error(`escrow payment simulation failed: ${tx.simulation.error}`);
    const ledger = (await server.getLatestLedger()).sequence;
    const expiration = ledger + Math.ceil((req.maxTimeoutSeconds ?? 60) / (await getEstimatedLedgerCloseTimeSeconds(req.network)));
    await tx.signAuthEntries({ address: this.key.publicKey(), expiration, signAuthEntry: contract.basicNodeSigner(this.key, networkPassphrase).signAuthEntry });
    return { x402Version, payload: { transaction: tx.built!.toXDR(), id } };
  }
}

// ---- Resource server -----------------------------------------------------

/**
 * Server scheme for sellers: route `accepts` use `scheme: 'escrow'` and the
 * seller's own `payTo`; requirements are rewritten to pay the escrow
 * contract, with the seller in `extra.seller`.
 */
export class EscrowStellarServerScheme implements SchemeNetworkServer {
  readonly scheme = ESCROW;
  readonly defaultAssetTransferMethod = 'default';
  readonly paymentFlows = { default: { supported: ['authorization'], default: 'authorization' } } as const;
  private readonly inner = new ExactServer();
  constructor(private readonly escrowContract: string) {}

  getAssetDecimals(asset: string, network: Network) {
    return this.inner.getAssetDecimals(asset, network);
  }
  parsePrice(price: Price, network: Network) {
    return this.inner.parsePrice(price, network);
  }
  async enhancePaymentRequirements(req: PaymentRequirements, kind: { x402Version: number; scheme: string; network: Network; extra?: Record<string, unknown> }, extensionKeys: string[]): Promise<PaymentRequirements> {
    const r = await this.inner.enhancePaymentRequirements(req, kind, extensionKeys);
    if (r.payTo === this.escrowContract) return r;
    return { ...r, payTo: this.escrowContract, extra: { ...(r.extra ?? {}), seller: r.payTo, escrow: true } };
  }
}

// ---- Facilitator ---------------------------------------------------------

/**
 * Facilitator scheme: verifies that the payload is exactly
 * `escrow.pay(payer, seller, asset, amount, id)` for these requirements,
 * signed by the payer, and settles it with the facilitator's own account
 * paying the fee. Every settled id is passed to `onSettled`, for a keeper
 * that later releases or expires what is due (`escrowSettleDue`).
 */
export class EscrowStellarFacilitatorScheme implements SchemeNetworkFacilitator {
  readonly scheme = ESCROW;
  readonly caipFamily = 'stellar:*';
  constructor(
    private readonly signer: Keypair,
    private readonly o: { rpcUrl?: string; maxTransactionFeeStroops?: number; onSettled?: (id: string, contract: string) => void } = {},
  ) {}

  getExtra() {
    return { areFeesSponsored: true };
  }
  getSigners() {
    return [this.signer.publicKey()];
  }

  private check(payload: PaymentPayload, req: PaymentRequirements): { tx: Transaction; op: Operation.InvokeHostFunction; payer: string; id: string } | { reason: string } {
    if (req.scheme !== ESCROW) return { reason: 'unsupported_scheme' };
    const p = payload.payload as { transaction?: string; id?: string };
    if (!p?.transaction || !/^[0-9a-f]{64}$/.test(p.id ?? '')) return { reason: 'invalid_escrow_payload' };
    let tx: Transaction;
    try { tx = new Transaction(p.transaction, getNetworkPassphrase(req.network)); } catch { return { reason: 'invalid_escrow_payload' }; }
    if (tx.operations.length !== 1 || tx.operations[0].type !== 'invokeHostFunction') return { reason: 'invalid_escrow_operation' };
    const op = tx.operations[0] as Operation.InvokeHostFunction;
    if (op.func.switch().name !== 'hostFunctionTypeInvokeContract') return { reason: 'invalid_escrow_operation' };
    const call = op.func.invokeContract();
    const target = Address.fromScAddress(call.contractAddress()).toString();
    const args = call.args().map((a) => scValToNative(a));
    const seller = (req.extra as { seller?: string } | undefined)?.seller;
    if (target !== req.payTo || call.functionName().toString() !== 'pay' || args.length !== 5) return { reason: 'invalid_escrow_operation' };
    const [payer, to, asset, amount, id] = args as [string, string, string, bigint, Buffer];
    if (to !== seller) return { reason: 'invalid_escrow_seller' };
    if (asset !== req.asset) return { reason: 'invalid_escrow_asset' };
    if (BigInt(amount) !== BigInt(req.amount)) return { reason: 'invalid_escrow_amount' };
    if (Buffer.from(id).toString('hex') !== p.id) return { reason: 'invalid_escrow_id' };
    if (payer === this.signer.publicKey()) return { reason: 'invalid_escrow_payer' };
    if (!op.auth?.length || op.auth.some((a) => a.credentials().switch().name !== 'sorobanCredentialsAddress')) return { reason: 'invalid_escrow_auth' };
    return { tx, op, payer, id: p.id! };
  }

  private async simulate(req: PaymentRequirements, op: Operation.InvokeHostFunction) {
    const server = getRpcClient(req.network, this.o.rpcUrl ? { url: this.o.rpcUrl } : undefined);
    const account = await server.getAccount(this.signer.publicKey());
    const built = new TransactionBuilder(account, { fee: '100', networkPassphrase: getNetworkPassphrase(req.network) })
      .addOperation(Operation.invokeHostFunction({ func: op.func, auth: op.auth }))
      .setTimeout(req.maxTimeoutSeconds ?? 60)
      .build();
    const sim = await server.simulateTransaction(built);
    return { server, built, sim };
  }

  async verify(payload: PaymentPayload, req: PaymentRequirements): Promise<VerifyResponse> {
    const c = this.check(payload, req);
    if ('reason' in c) return { isValid: false, invalidReason: c.reason } as VerifyResponse;
    try {
      const { sim } = await this.simulate(req, c.op);
      if (!rpc.Api.isSimulationSuccess(sim)) return { isValid: false, invalidReason: 'invalid_escrow_simulation_failed', payer: c.payer } as VerifyResponse;
      if (Number(sim.minResourceFee) + 100 > (this.o.maxTransactionFeeStroops ?? 2_000_000)) return { isValid: false, invalidReason: 'invalid_escrow_fee_exceeds_maximum', payer: c.payer } as VerifyResponse;
      return { isValid: true, payer: c.payer } as VerifyResponse;
    } catch (e) {
      return { isValid: false, invalidReason: 'unexpected_verify_error', invalidMessage: (e as Error).message, payer: c.payer } as VerifyResponse;
    }
  }

  async settle(payload: PaymentPayload, req: PaymentRequirements): Promise<SettleResponse> {
    const c = this.check(payload, req);
    if ('reason' in c) return { success: false, errorReason: c.reason, transaction: '', network: req.network } as SettleResponse;
    try {
      const { server, built, sim } = await this.simulate(req, c.op);
      if (!rpc.Api.isSimulationSuccess(sim)) return { success: false, errorReason: 'invalid_escrow_simulation_failed', transaction: '', network: req.network, payer: c.payer } as SettleResponse;
      const tx = rpc.assembleTransaction(built, sim).build();
      tx.sign(this.signer);
      const sent = await server.sendTransaction(tx);
      if (sent.status !== 'PENDING') return { success: false, errorReason: 'escrow_submission_failed', transaction: '', network: req.network, payer: c.payer } as SettleResponse;
      for (let i = 0; i < 60; i++) {
        const r = await server.getTransaction(sent.hash);
        if (r.status === rpc.Api.GetTransactionStatus.SUCCESS) {
          this.o.onSettled?.(c.id, req.payTo);
          return { success: true, transaction: sent.hash, network: req.network, payer: c.payer } as SettleResponse;
        }
        if (r.status === rpc.Api.GetTransactionStatus.FAILED) break;
        await new Promise((ok) => setTimeout(ok, 1000));
      }
      return { success: false, errorReason: 'escrow_transaction_failed', transaction: sent.hash, network: req.network, payer: c.payer } as SettleResponse;
    } catch (e) {
      return { success: false, errorReason: 'unexpected_settle_error', transaction: '', network: req.network, payer: c.payer, errorMessage: (e as Error).message } as SettleResponse;
    }
  }
}

// ---- Calls after payment -------------------------------------------------

async function invoke(c: EscrowConfig, source: Keypair, method: string, args: xdr.ScVal[]) {
  const done = await submit(new rpc.Server(c.rpcUrl), c.networkPassphrase, source, Operation.invokeContractFunction({ contract: c.contract, function: method, args }));
  return { tx: done.txHash, value: done.returnValue ? scValToNative(done.returnValue) : null };
}

/** The buyer (the payer's key) confirms a good delivery: the seller is paid at once. */
export async function escrowConfirm(c: EscrowConfig, o: { payer: Keypair; id: string }): Promise<string> {
  return (await invoke(c, o.payer, 'confirm', [bytes32(o.id)])).tx;
}

/** Posts the seller's receipt for an escrow payment (anyone may): refunds on a breach, releases a bonded seller. */
export async function escrowSubmitReceipt(c: EscrowConfig, o: { submitter: Keypair; id: string; receipt: Receipt }): Promise<{ status: EscrowStatus; tx: string }> {
  const r = await invoke(c, o.submitter, 'submit_receipt', [bytes32(o.id), receiptStructScVal(o.receipt), xdr.ScVal.scvBytes(Buffer.from(o.receipt.sig, 'base64'))]);
  return { status: ESCROW_STATUS[Number(r.value)] ?? 'held', tx: r.tx };
}

/** Refunds a payment with no receipt by the deadline. Anyone may call. */
export async function escrowExpire(c: EscrowConfig, o: { submitter: Keypair; id: string }): Promise<string> {
  return (await invoke(c, o.submitter, 'expire', [bytes32(o.id)])).tx;
}

/** For a facilitator or keeper: releases or expires every listed id that is due (up to 50). */
export async function escrowSettleDue(c: EscrowConfig, o: { submitter: Keypair; ids: string[] }): Promise<{ statuses: EscrowStatus[]; tx: string }> {
  const r = await invoke(c, o.submitter, 'settle_due', [xdr.ScVal.scvVec(o.ids.map(bytes32))]);
  return { statuses: ((r.value as number[]) ?? []).map((n) => ESCROW_STATUS[Number(n)] ?? 'held'), tx: r.tx };
}

/** One escrowed payment, or null. Read by simulation (free). */
export async function escrowHold(c: EscrowConfig, id: string): Promise<{ payer: string; seller: string; asset: string; amount: bigint; status: EscrowStatus; releaseAt: number } | null> {
  const t = new TransactionBuilder(new Account(Keypair.random().publicKey(), '0'), { fee: '100', networkPassphrase: c.networkPassphrase })
    .addOperation(new Contract(c.contract).call('hold', bytes32(id)))
    .setTimeout(30)
    .build();
  const sim = await new rpc.Server(c.rpcUrl).simulateTransaction(t);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) return null;
  const h = scValToNative(sim.result.retval) as { payer: string; seller: string; asset: string; amount: bigint; status: number; release_at: bigint } | null;
  return h ? { payer: h.payer, seller: h.seller, asset: h.asset, amount: BigInt(h.amount), status: ESCROW_STATUS[Number(h.status)] ?? 'held', releaseAt: Number(h.release_at) } : null;
}

/**
 * For facilitators: remembers escrow payments it settled and, every
 * `intervalMs`, releases those past their contest window and refunds those
 * past their receipt deadline (`settle_due`, up to 50 per transaction).
 * Payments a buyer confirmed or refunded are simply dropped.
 */
export function escrowKeeper(o: { submitter: Keypair; rpcUrl: string; networkPassphrase: string; intervalMs?: number; onSettled?: (r: { contract: string; ids: string[]; statuses: EscrowStatus[]; tx: string }) => void; onError?: (e: Error) => void }) {
  const pending = new Map<string, string>(); // id -> escrow contract
  let timer: NodeJS.Timeout | null = null;
  const tick = async () => {
    const byContract = new Map<string, string[]>();
    for (const [id, c] of pending) byContract.set(c, [...(byContract.get(c) ?? []), id]);
    for (const [contract, ids] of byContract) {
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        try {
          const r = await escrowSettleDue({ contract, rpcUrl: o.rpcUrl, networkPassphrase: o.networkPassphrase }, { submitter: o.submitter, ids: batch });
          r.statuses.forEach((s, k) => { if (s === 'released' || s === 'refunded') pending.delete(batch[k]); });
          o.onSettled?.({ contract, ids: batch, statuses: r.statuses, tx: r.tx });
        } catch (e) {
          o.onError?.(e as Error);
        }
      }
    }
  };
  return {
    add: (id: string, contract: string) => { pending.set(id, contract); },
    pending: () => pending.size,
    tick,
    start: () => { timer ??= setInterval(() => { void tick(); }, o.intervalMs ?? 60_000); timer.unref?.(); },
    stop: () => { if (timer) clearInterval(timer); timer = null; },
  };
}
