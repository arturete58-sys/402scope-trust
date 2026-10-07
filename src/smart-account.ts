import { createHash, randomBytes, generateKeyPairSync, sign as cryptoSign, type KeyObject } from 'node:crypto';
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

/**
 * OpenZeppelin `Signer::External(webauthnVerifier, publicKey || credentialId)` for a passkey:
 * `publicKey` is the 65-byte uncompressed P-256 key from the WebAuthn credential.
 */
export function passkeySigner(webauthnVerifier: string, publicKey: Uint8Array, credentialId: Uint8Array): xdr.ScVal {
  if (publicKey.length !== 65 || publicKey[0] !== 4) throw new Error('expected a 65-byte uncompressed P-256 public key');
  return xdr.ScVal.scvVec([sym('External'), new Address(webauthnVerifier).toScVal(), xdr.ScVal.scvBytes(Buffer.concat([Buffer.from(publicKey), Buffer.from(credentialId)]))]);
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

// ---- Passkeys (WebAuthn) ----------------------------------------------

/** What a WebAuthn assertion returns (navigator.credentials.get), with the signature as raw r||s. */
export interface PasskeyAssertion {
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  /** 64 bytes r||s. DER signatures from browsers must be converted first (`derToRaw`). */
  signature: Uint8Array;
}

export interface PasskeySigner {
  /** The smart account (C...). */
  account: string;
  /** WebAuthn verifier contract (C...). */
  verifier: string;
  /** 65-byte uncompressed P-256 public key. */
  publicKey: Uint8Array;
  credentialId: Uint8Array;
  /** Context rule the passkey signs for (the owner's "admin" rule is 1). */
  contextRuleId: number;
  /**
   * Gets an assertion whose challenge is `challenge` (the auth digest). In a
   * browser: navigator.credentials.get({ publicKey: { challenge, allowCredentials } }).
   */
  assert: (challenge: Uint8Array) => Promise<PasskeyAssertion>;
}

const P256_N = BigInt('0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551');

/** Low-S form of a raw P-256 signature (Soroban's secp256r1 check requires it). */
export function lowS(sig: Uint8Array): Buffer {
  const r = Buffer.from(sig.subarray(0, 32));
  let s = BigInt('0x' + Buffer.from(sig.subarray(32, 64)).toString('hex'));
  if (s > P256_N / 2n) s = P256_N - s;
  return Buffer.concat([r, Buffer.from(s.toString(16).padStart(64, '0'), 'hex')]);
}

/** Converts a DER ECDSA signature (what browsers return) to raw r||s. */
export function derToRaw(der: Uint8Array): Buffer {
  const b = Buffer.from(der);
  let i = 2;
  const int = () => {
    if (b[i++] !== 0x02) throw new Error('not a DER signature');
    const len = b[i++];
    let v = b.subarray(i, i + len);
    i += len;
    while (v.length > 32 && v[0] === 0) v = v.subarray(1);
    return Buffer.concat([Buffer.alloc(32 - v.length), v]);
  };
  return Buffer.concat([int(), int()]);
}

/**
 * A software stand-in for a passkey, for tests and demos: a P-256 key that
 * answers assertions exactly as an authenticator does (client data with the
 * challenge in base64url, authenticator data with user-present and verified flags).
 */
export function softwarePasskey(origin = 'https://402scope.org'): { publicKey: Buffer; credentialId: Buffer; assert: (challenge: Uint8Array) => Promise<PasskeyAssertion>; privateKey: KeyObject } {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = publicKey.export({ format: 'jwk' }) as { x: string; y: string };
  const pub = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, 'base64url'), Buffer.from(jwk.y, 'base64url')]);
  const rpIdHash = sha256(Buffer.from(new URL(origin).hostname));
  return {
    publicKey: pub,
    credentialId: randomBytes(16),
    privateKey,
    assert: async (challenge) => {
      const clientDataJSON = Buffer.from(JSON.stringify({ type: 'webauthn.get', challenge: Buffer.from(challenge).toString('base64url'), origin, crossOrigin: false }));
      const authenticatorData = Buffer.concat([rpIdHash, Buffer.from([0x05]), Buffer.alloc(4)]); // UP | UV, counter 0
      const signature = cryptoSign('sha256', Buffer.concat([authenticatorData, sha256(clientDataJSON)]), { key: privateKey, dsaEncoding: 'ieee-p1363' });
      return { authenticatorData, clientDataJSON, signature };
    },
  };
}

/** Signs a Soroban auth entry for the smart account with a passkey; usable as `authorizeEntry`. */
export function passkeyAuthorizer(p: PasskeySigner) {
  const ruleIds = [p.contextRuleId];
  return (entry: xdr.SorobanAuthorizationEntry, _signer: unknown, validUntil: number, passphrase?: string) =>
    authorizeEntry(
      entry,
      async (_preimage: xdr.HashIdPreimage, payload: Buffer) => {
        const a = await p.assert(authDigest(p.account, Buffer.from(payload), ruleIds));
        // OpenZeppelin WebAuthnSigData, as the XDR of its contracttype struct.
        const sigData = struct({
          authenticator_data: xdr.ScVal.scvBytes(Buffer.from(a.authenticatorData)),
          client_data: xdr.ScVal.scvBytes(Buffer.from(a.clientDataJSON)),
          signature: xdr.ScVal.scvBytes(lowS(a.signature)),
        }).toXDR();
        const signers = xdr.ScVal.scvMap([new xdr.ScMapEntry({ key: passkeySigner(p.verifier, p.publicKey, p.credentialId), val: xdr.ScVal.scvBytes(sigData) })]);
        return { signatureScVal: struct({ context_rule_ids: u32vec(ruleIds), signers }), address: p.account };
      },
      validUntil,
      passphrase as string,
    );
}

/**
 * Has the smart account call `contractId.method(args)` with a passkey's
 * authorization, sent by `source` (which pays the fee). For example the owner
 * changing the agent's budget: `spendingLimit.set_spending_limit(wallet, 0, limit)`.
 */
export async function invokeWithPasskey(o: { rpcUrl: string; networkPassphrase: string; source: Keypair; contractId: string; method: string; args: xdr.ScVal[]; passkey: PasskeySigner }): Promise<string> {
  const server = new rpc.Server(o.rpcUrl);
  const tx = await contract.AssembledTransaction.build({
    contractId: o.contractId,
    method: o.method,
    args: o.args,
    networkPassphrase: o.networkPassphrase,
    rpcUrl: o.rpcUrl,
    publicKey: o.source.publicKey(),
    parseResultXdr: (r: xdr.ScVal) => r,
  });
  const latest = (await server.getLatestLedger()).sequence;
  await tx.signAuthEntries({ address: o.passkey.account, expiration: latest + 100, authorizeEntry: passkeyAuthorizer(o.passkey) as never });
  await tx.simulate();
  if (tx.simulation && rpc.Api.isSimulationError(tx.simulation)) throw new Error(`refused: ${tx.simulation.error}`);
  const sent = await tx.signAndSend({ signTransaction: contract.basicNodeSigner(o.source, o.networkPassphrase).signTransaction });
  return sent.sendTransactionResponse?.hash ?? '';
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

export interface SpendingLimitParams {
  /** Most the wallet may pay in any window of `periodLedgers` (token base units). */
  spendingLimit: bigint;
  /** Window length in ledgers (17,280 is about a day). */
  periodLedgers: number;
}

/** Install parameters of the spending limit policy (OpenZeppelin `SpendingLimitAccountParams`). */
export function spendingLimitParams(p: SpendingLimitParams): xdr.ScVal {
  return struct({ spending_limit: nativeToScVal(p.spendingLimit, { type: 'i128' }), period_ledgers: xdr.ScVal.scvU32(p.periodLedgers) });
}

/** A Soroban map needs its keys in order; for addresses of one kind that is the order of their XDR. */
function policyMap(entries: [string, xdr.ScVal][]): xdr.ScVal {
  const items = entries.map(([a, v]) => ({ key: new Address(a).toScVal(), val: v }));
  items.sort((x, y) => Buffer.compare(x.key.toXDR(), y.key.toXDR()));
  return xdr.ScVal.scvMap(items.map((i) => new xdr.ScMapEntry(i)));
}

/**
 * Deploys an agent wallet (already uploaded wasm) with one External signer
 * and the trust policy. With `spendingLimit` (which needs `token`), the
 * spending limit policy is installed on the same rule, and the agent's rule
 * covers payments in that token only: the agent key can pay trusted sellers,
 * up to the limit, and do nothing else. `admins` get a separate rule to manage the wallet.
 */
export async function deployAgentWallet(o: {
  rpcUrl: string;
  networkPassphrase: string;
  deployer: Keypair;
  walletWasmHash: Buffer;
  verifier: string;
  signerKey: Keypair;
  policy: string;
  params: TrustPolicyParams;
  token?: string;
  spendingLimit?: { policy: string } & SpendingLimitParams;
  admins?: xdr.ScVal[];
}): Promise<string> {
  if (o.spendingLimit && !o.token) throw new Error('a spending limit needs the wallet scoped to a token');
  const server = new rpc.Server(o.rpcUrl);
  const signers = xdr.ScVal.scvVec([externalSigner(o.verifier, o.signerKey.rawPublicKey())]);
  const entries: [string, xdr.ScVal][] = [[o.policy, trustPolicyParams(o.params)]];
  if (o.spendingLimit) entries.push([o.spendingLimit.policy, spendingLimitParams(o.spendingLimit)]);
  const token = o.token ? new Address(o.token).toScVal() : xdr.ScVal.scvVoid();
  const done = await submit(server, o.networkPassphrase, o.deployer, Operation.createCustomContract({
    address: new Address(o.deployer.publicKey()),
    wasmHash: o.walletWasmHash,
    salt: randomBytes(32),
    constructorArgs: [signers, policyMap(entries), token, xdr.ScVal.scvVec(o.admins ?? [])],
  }));
  return scValToNative(done.returnValue as xdr.ScVal) as string;
}

/** Uploads a wasm and returns its hash. */
export async function uploadWasm(o: { rpcUrl: string; networkPassphrase: string; deployer: Keypair; wasm: Buffer }): Promise<Buffer> {
  await submit(new rpc.Server(o.rpcUrl), o.networkPassphrase, o.deployer, Operation.uploadContractWasm({ wasm: o.wasm }));
  return sha256(o.wasm);
}
