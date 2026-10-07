import { createHash } from 'node:crypto';
import { BASE_FEE, Keypair, Networks, Operation, rpc, TransactionBuilder, type xdr } from '@stellar/stellar-sdk';
import { basicNodeSigner, Client } from '@stellar/stellar-sdk/contract';
import { evidenceTree } from './evidence.js';
import type { SellerScore } from './seller.js';
import type { EndpointRecord } from './store.js';

/** Endpoint attestation, field names as in the Soroban contract. */
export interface OnchainAttestation {
  score: number;
  calls: number;
  delivered: number;
  price_ok: boolean;
  p50_ms: number;
  measured_at: bigint;
  expires_ledger: number;
  method: number;
  evidence: Buffer;
}

/** Seller attestation, field names as in the Soroban contract. */
export interface OnchainSellerAttestation {
  score: number;
  endpoints: number;
  calls: number;
  delivered: number;
  receipts: number;
  measured_at: bigint;
  expires_ledger: number;
  method: number;
  evidence: Buffer;
}

export interface ChainConfig {
  contractId: string;
  rpcUrl: string;
  networkPassphrase: string;
  /** Attesters this reader trusts, and how many must agree. */
  attesters?: string[];
  quorum?: number;
}

export const TESTNET_RPC = 'https://soroban-testnet.stellar.org';
/** About 7 days of ledgers at ~5 s each. */
export const DEFAULT_TTL_LEDGERS = 7 * 17_280;

/**
 * Reads TRUST_CONTRACT_ID, STELLAR_RPC_URL, STELLAR_NETWORK (testnet | pubnet),
 * TRUST_ATTESTERS (comma-separated G... addresses) and TRUST_QUORUM.
 * Returns null when no contract is configured.
 */
export function chainConfigFromEnv(env = process.env): ChainConfig | null {
  if (!env.TRUST_CONTRACT_ID) return null;
  const pubnet = env.STELLAR_NETWORK === 'pubnet';
  const rpcUrl = env.STELLAR_RPC_URL ?? (pubnet ? '' : TESTNET_RPC);
  if (!rpcUrl) throw new Error('STELLAR_RPC_URL is required on pubnet');
  const attesters = (env.TRUST_ATTESTERS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return { contractId: env.TRUST_CONTRACT_ID, rpcUrl, networkPassphrase: pubnet ? Networks.PUBLIC : Networks.TESTNET, attesters, quorum: Number(env.TRUST_QUORUM ?? 1) };
}

type Method = (args: Record<string, unknown>) => Promise<{ result: unknown; signAndSend: () => Promise<{ result: unknown; sendTransactionResponse?: { hash: string } }> }>;
type AnyClient = Client & Record<string, Method>;

const readers = new Map<string, Promise<AnyClient>>();
function reader(cfg: ChainConfig): Promise<AnyClient> {
  const k = `${cfg.rpcUrl}|${cfg.contractId}`;
  if (!readers.has(k)) readers.set(k, Client.from({ contractId: cfg.contractId, rpcUrl: cfg.rpcUrl, networkPassphrase: cfg.networkPassphrase }) as Promise<AnyClient>);
  return readers.get(k) as Promise<AnyClient>;
}

function writer(cfg: ChainConfig, secret: string): Promise<AnyClient> {
  const kp = Keypair.fromSecret(secret);
  return Client.from({ contractId: cfg.contractId, rpcUrl: cfg.rpcUrl, networkPassphrase: cfg.networkPassphrase, publicKey: kp.publicKey(), ...basicNodeSigner(kp, cfg.networkPassphrase) }) as Promise<AnyClient>;
}

async function send(cfg: ChainConfig, secret: string, method: string, args: Record<string, unknown>): Promise<string> {
  const c = await writer(cfg, secret);
  const tx = await c[method](args);
  const sent = await tx.signAndSend();
  return sent.sendTransactionResponse?.hash ?? '';
}

async function read<T>(cfg: ChainConfig, method: string, args: Record<string, unknown>): Promise<T> {
  const c = await reader(cfg);
  return (await c[method](args)).result as T;
}

/** Older contracts returned Result types; unwrap them. */
const unwrap = <T>(v: unknown): T => (v && typeof v === 'object' && 'unwrap' in v && typeof (v as { unwrap: unknown }).unwrap === 'function' ? (v as { unwrap: () => T }).unwrap() : (v as T));

export function reportHash(r: EndpointRecord): Buffer {
  const report = { url: r.url, key: r.key, payTo: r.payTo, network: r.network, score: r.score, calls: r.calls.map((c) => ({ at: c.at, delivered: c.delivered, transaction: c.transaction, receipt: c.receipt })) };
  return createHash('sha256').update(JSON.stringify(report)).digest();
}

/** Endpoint attestation from a scored record; evidence = Merkle root of its paid calls. */
export function toAttestation(r: EndpointRecord, expiresLedger: number): OnchainAttestation {
  const s = r.score;
  if (!s || s.score == null) throw new Error(`${r.url} has no score yet`);
  const last = r.calls.at(-1)?.at ?? r.updatedAt;
  return {
    score: s.score,
    calls: s.calls,
    delivered: s.delivered,
    price_ok: s.priceOk,
    p50_ms: s.p50Ms ?? 0,
    measured_at: BigInt(Math.floor(Date.parse(last) / 1000)),
    expires_ledger: expiresLedger,
    method: s.method,
    evidence: evidenceTree(r.calls).root,
  };
}

export function toSellerAttestation(s: SellerScore, expiresLedger: number): OnchainSellerAttestation {
  return {
    score: s.score,
    endpoints: s.endpoints,
    calls: s.calls,
    delivered: s.delivered,
    receipts: s.receipts,
    measured_at: BigInt(Math.floor(Date.parse(s.measuredAt) / 1000)),
    expires_ledger: expiresLedger,
    method: s.method,
    evidence: evidenceTree(s.evidence).root,
  };
}

export async function latestLedger(cfg: Pick<ChainConfig, 'rpcUrl'>): Promise<number> {
  return (await new rpc.Server(cfg.rpcUrl, { allowHttp: cfg.rpcUrl.startsWith('http:') }).getLatestLedger()).sequence;
}

// ---- Attesters -------------------------------------------------------

/** Lock `amount` (token units) of the bond token and become an active attester. */
export const registerAttester = (cfg: ChainConfig, secret: string, amount: bigint) =>
  send(cfg, secret, 'register', { attester: Keypair.fromSecret(secret).publicKey(), amount });

export const writeAttestation = (cfg: ChainConfig, secret: string, keyHex: string, att: OnchainAttestation) =>
  send(cfg, secret, 'attest', { attester: Keypair.fromSecret(secret).publicKey(), key: Buffer.from(keyHex, 'hex'), att });

export const writeSellerAttestation = (cfg: ChainConfig, secret: string, seller: string, att: OnchainSellerAttestation) =>
  send(cfg, secret, 'attest_seller', { attester: Keypair.fromSecret(secret).publicKey(), seller, att });

// ---- Reads (simulation only: no fees, no signature) ------------------

export const readAttestation = (cfg: ChainConfig, attester: string, keyHex: string) =>
  read<OnchainAttestation | undefined>(cfg, 'get', { attester, key: Buffer.from(keyHex, 'hex') }).then((r) => r ?? null);

export const readSellerAttestation = (cfg: ChainConfig, attester: string, seller: string) =>
  read<OnchainSellerAttestation | undefined>(cfg, 'get_seller', { attester, seller }).then((r) => r ?? null);

export const trustedBy = (cfg: ChainConfig, seller: string, attesters: string[], minScore: number, quorum: number) =>
  read<boolean>(cfg, 'trusted_by', { seller, attesters, min_score: minScore, quorum });

export const verifySellerEvidence = (cfg: ChainConfig, attester: string, seller: string, leaf: Buffer, proof: Buffer[]) =>
  read<unknown>(cfg, 'verify_seller_evidence', { attester, seller, leaf, proof }).then((v) => unwrap<boolean>(v));

// ---- Deployment ------------------------------------------------------

/** Submits one operation signed by `source`, waits for it, and returns the result. */
export async function submit(server: rpc.Server, passphrase: string, source: Keypair, op: xdr.Operation): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const account = await server.getAccount(source.publicKey());
  const built = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase }).addOperation(op).setTimeout(60).build();
  const prepared = await server.prepareTransaction(built);
  prepared.sign(source);
  const sent = await server.sendTransaction(prepared);
  if (sent.status === 'ERROR') throw new Error(`send failed: ${JSON.stringify(sent.errorResult)}`);
  const done = await server.pollTransaction(sent.hash, { attempts: 30 });
  if (done.status !== 'SUCCESS') throw new Error(`transaction ${sent.hash} ${done.status}`);
  return done as rpc.Api.GetSuccessfulTransactionResponse;
}

/** Uploads a contract wasm and deploys it with constructor `args` (null if none). Returns the contract ID. */
export async function deployWasm(opts: { rpcUrl: string; networkPassphrase: string; deployer: Keypair; wasm: Buffer; args: Record<string, unknown> | null }): Promise<string> {
  const server = new rpc.Server(opts.rpcUrl);
  await submit(server, opts.networkPassphrase, opts.deployer, Operation.uploadContractWasm({ wasm: opts.wasm }));
  const wasmHash = createHash('sha256').update(opts.wasm).digest();
  const tx = await Client.deploy(opts.args, {
    wasmHash,
    rpcUrl: opts.rpcUrl,
    networkPassphrase: opts.networkPassphrase,
    publicKey: opts.deployer.publicKey(),
    ...basicNodeSigner(opts.deployer, opts.networkPassphrase),
  });
  const sent = await tx.signAndSend();
  return (sent.result as unknown as Client).options.contractId;
}

/** Deploys the attestation registry. `bondToken` is a SEP-41 contract (USDC on mainnet). */
export const deployRegistry = (o: { rpcUrl: string; networkPassphrase: string; deployer: Keypair; wasm: Buffer; admin: string; bondToken: string; minBond: bigint; unbondLedgers: number }) =>
  deployWasm({ ...o, args: { admin: o.admin, bond_token: o.bondToken, min_bond: o.minBond, unbond_ledgers: o.unbondLedgers } });
