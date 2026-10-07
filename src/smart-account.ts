import { createHash, randomBytes } from 'node:crypto';
import { Address, authorizeEntry, contract, Keypair, nativeToScVal, Operation, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { getEstimatedLedgerCloseTimeSeconds, getNetworkPassphrase, getRpcClient } from '@x402/stellar';
import type { PaymentPayload, PaymentRequirements, SchemeNetworkClient } from '@x402/core/types';
import { submit } from './chain.js';

/**
 * x402 payments from an OpenZeppelin smart account ("agent wallet").
 *
 * The standard @x402/stellar client signs auth entries for a classic G
 * account. An agent wallet is a contract (C address) whose `__check_auth`
 * expects an OpenZeppelin `AuthPayload`: per signer, a signature over the
 * `AuthDigestPreimage` (account, signature payload, context rule ids).
 * This scheme builds exactly that, so the wallet's policies, including the
 * 402Scope Trust policy, run on every x402 payment, and the standard
 * facilitator verifies and settles it unchanged.
 */

const sha256 = (b: Buffer) => createHash('sha256').update(b).digest();
const sym = (s: string) => xdr.ScVal.scvSymbol(s);
const u32vec = (ids: number[]) => xdr.ScVal.scvVec(ids.map((i) => xdr.ScVal.scvU32(i)));
/** A contracttype struct is an ScMap with symbol keys in sorted order. */
const struct = (fields: Record<string, xdr.ScVal>) =>
  xdr.ScVal.scvMap(Object.keys(fields).sort().map((k) => new xdr.ScMapEntry({ key: sym(k), val: fields[k] })));

/** OpenZeppelin `Signer::External(verifier, public key)`. */
export function externalSigner(verifier: string, publicKey: Buffer): xdr.ScVal {
  return xdr.ScVal.scvVec([sym('External'), new Address(verifier).toScVal(), xdr.ScVal.scvBytes(publicKey)]);
}

/** sha256 of the XDR of `AuthDigestPreimage { account, signature_payload, context_rule_ids }`. */
export function authDigest(account: string, signaturePayload: Buffer, contextRuleIds: number[]): Buffer {
  const preimage = struct({ account: new Address(account).toScVal(), context_rule_ids: u32vec(contextRuleIds), signature_payload: xdr.ScVal.scvBytes(signaturePayload) });
  return sha256(preimage.toXDR());
}

export interface AgentWalletSigner {
  /** The smart account (C...). */
  account: string;
  /** ed25519 key of the External signer. */
  key: Keypair;
  /** ed25519 verifier contract (C...). */
  verifier: string;
  /** Context rule used for payments (0 for a wallet deployed with one rule). */
  contextRuleId?: number;
}

/** Signs a Soroban auth entry for the agent wallet; usable as `authorizeEntry` in stellar-sdk. */
export function walletAuthorizer(w: AgentWalletSigner) {
  const ruleIds = [w.contextRuleId ?? 0];
  return (entry: xdr.SorobanAuthorizationEntry, _signer: unknown, validUntil: number, passphrase?: string) =>
    authorizeEntry(
      entry,
      async (_preimage: xdr.HashIdPreimage, payload: Buffer) => {
        const sig = w.key.sign(authDigest(w.account, Buffer.from(payload), ruleIds));
        const signers = xdr.ScVal.scvMap([new xdr.ScMapEntry({ key: externalSigner(w.verifier, w.key.rawPublicKey()), val: xdr.ScVal.scvBytes(sig) })]);
        return { signatureScVal: struct({ context_rule_ids: u32vec(ruleIds), signers }), address: w.account };
      },
      validUntil,
      passphrase as string,
    );
}

/**
 * x402 "exact" client scheme for Stellar that pays from an agent wallet.
 * Same transaction shape as @x402/stellar: a SEP-41 `transfer(from, to, amount)`
 * whose fee the facilitator sponsors.
 */
export class AgentWalletExactScheme implements SchemeNetworkClient {
  readonly scheme = 'exact';
  constructor(private readonly w: AgentWalletSigner, private readonly rpcConfig?: { url?: string }) {}

  async createPaymentPayload(x402Version: number, req: PaymentRequirements): Promise<Pick<PaymentPayload, 'x402Version' | 'payload'>> {
    if (!req.extra?.areFeesSponsored) throw new Error('Exact scheme requires areFeesSponsored to be true');
    const networkPassphrase = getNetworkPassphrase(req.network);
    const server = getRpcClient(req.network, this.rpcConfig);
    const current = (await server.getLatestLedger()).sequence;
    const ledgerSeconds = await getEstimatedLedgerCloseTimeSeconds(req.network);
    const maxLedger = current + Math.ceil((req.maxTimeoutSeconds ?? 60) / ledgerSeconds);
    const tx = await contract.AssembledTransaction.build({
      contractId: req.asset,
      method: 'transfer',
      args: [nativeToScVal(this.w.account, { type: 'address' }), nativeToScVal(req.payTo, { type: 'address' }), nativeToScVal(req.amount, { type: 'i128' })],
      networkPassphrase,
      rpcUrl: server.serverURL.toString(),
      parseResultXdr: (r: xdr.ScVal) => r,
    });
    if (tx.simulation && rpc.Api.isSimulationError(tx.simulation)) throw new Error(`simulation failed: ${tx.simulation.error}`);
    await tx.signAuthEntries({ address: this.w.account, expiration: maxLedger, authorizeEntry: walletAuthorizer(this.w) as never });
    // Re-simulating runs the wallet's __check_auth, policies included: an untrusted seller fails here.
    await tx.simulate();
    if (tx.simulation && rpc.Api.isSimulationError(tx.simulation)) throw new Error(`wallet refused the payment: ${tx.simulation.error}`);
    return { x402Version, payload: { transaction: tx.built!.toXDR() } };
  }
}

// ---- Deployment ------------------------------------------------------

export interface TrustPolicyParams {
  registry: string;
  attesters: string[];
  minScore: number;
  quorum: number;
  maxUnverified: bigint;
}

export function trustPolicyParams(p: TrustPolicyParams): xdr.ScVal {
  return struct({
    registry: new Address(p.registry).toScVal(),
    attesters: xdr.ScVal.scvVec(p.attesters.map((a) => new Address(a).toScVal())),
    min_score: xdr.ScVal.scvU32(p.minScore),
    quorum: xdr.ScVal.scvU32(p.quorum),
    max_unverified: nativeToScVal(p.maxUnverified, { type: 'i128' }),
  });
}

/** Deploys an agent wallet (already uploaded wasm) with one External signer and the trust policy. */
export async function deployAgentWallet(o: {
  rpcUrl: string;
  networkPassphrase: string;
  deployer: Keypair;
  walletWasmHash: Buffer;
  verifier: string;
  signerKey: Keypair;
  policy: string;
  params: TrustPolicyParams;
}): Promise<string> {
  const server = new rpc.Server(o.rpcUrl);
  const signers = xdr.ScVal.scvVec([externalSigner(o.verifier, o.signerKey.rawPublicKey())]);
  const policies = xdr.ScVal.scvMap([new xdr.ScMapEntry({ key: new Address(o.policy).toScVal(), val: trustPolicyParams(o.params) })]);
  const done = await submit(server, o.networkPassphrase, o.deployer, Operation.createCustomContract({
    address: new Address(o.deployer.publicKey()),
    wasmHash: o.walletWasmHash,
    salt: randomBytes(32),
    constructorArgs: [signers, policies],
  }));
  return scValToNative(done.returnValue as xdr.ScVal) as string;
}

/** Uploads a wasm and returns its hash. */
export async function uploadWasm(o: { rpcUrl: string; networkPassphrase: string; deployer: Keypair; wasm: Buffer }): Promise<Buffer> {
  await submit(new rpc.Server(o.rpcUrl), o.networkPassphrase, o.deployer, Operation.uploadContractWasm({ wasm: o.wasm }));
  return sha256(o.wasm);
}
