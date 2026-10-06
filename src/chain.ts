import { createHash } from 'node:crypto';
import { Keypair, Networks, rpc, TransactionBuilder, Operation, BASE_FEE, type xdr } from '@stellar/stellar-sdk';
import { basicNodeSigner, Client } from '@stellar/stellar-sdk/contract';
import type { EndpointRecord } from './store.js';

/** Onchain attestation, field names as in the Soroban contract. */
export interface OnchainAttestation {
  score: number;
  calls: number;
  delivered: number;
  price_ok: boolean;
  p50_ms: number;
  measured_at: bigint;
  expires_ledger: number;
  method: number;
  report: Buffer;
}

export interface ChainConfig {
  contractId: string;
  rpcUrl: string;
  networkPassphrase: string;
}

export const TESTNET_RPC = 'https://soroban-testnet.stellar.org';
/** About 7 days of ledgers at ~5 s each. */
export const DEFAULT_TTL_LEDGERS = 7 * 17_280;

/**
 * Reads TRUST_CONTRACT_ID, STELLAR_RPC_URL and STELLAR_NETWORK (testnet | pubnet).
 * Returns null when no contract is configured.
 */
export function chainConfigFromEnv(env = process.env): ChainConfig | null {
  if (!env.TRUST_CONTRACT_ID) return null;
  const pubnet = env.STELLAR_NETWORK === 'pubnet';
  const rpcUrl = env.STELLAR_RPC_URL ?? (pubnet ? '' : TESTNET_RPC);
  if (!rpcUrl) throw new Error('STELLAR_RPC_URL is required on pubnet');
  return { contractId: env.TRUST_CONTRACT_ID, rpcUrl, networkPassphrase: pubnet ? Networks.PUBLIC : Networks.TESTNET };
}

const clients = new Map<string, Promise<Client>>();
function readClient(cfg: ChainConfig): Promise<Client> {
  const k = `${cfg.rpcUrl}|${cfg.contractId}`;
  if (!clients.has(k)) clients.set(k, Client.from({ ...cfg }));
  return clients.get(k) as Promise<Client>;
}

/** sha256 of the public report for one endpoint; stored onchain so the API copy can be checked. */
export function reportHash(r: EndpointRecord): Buffer {
  const report = { url: r.url, key: r.key, payTo: r.payTo, network: r.network, score: r.score, calls: r.calls.map((c) => ({ at: c.at, delivered: c.delivered, transaction: c.transaction })) };
  return createHash('sha256').update(JSON.stringify(report)).digest();
}

/** Builds the onchain attestation from a scored record. */
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
    report: reportHash(r),
  };
}

export async function latestLedger(cfg: Pick<ChainConfig, 'rpcUrl'>): Promise<number> {
  return (await new rpc.Server(cfg.rpcUrl, { allowHttp: cfg.rpcUrl.startsWith('http:') }).getLatestLedger()).sequence;
}

/** Reads the attestation for a key (hex). Simulation only: no fees, no signature. */
export async function readAttestation(cfg: ChainConfig, keyHex: string): Promise<OnchainAttestation | null> {
  const c = (await readClient(cfg)) as Client & { get: (a: { key: Buffer }) => Promise<{ result: OnchainAttestation | undefined }> };
  const tx = await c.get({ key: Buffer.from(keyHex, 'hex') });
  return tx.result ?? null;
}

/** Writes an attestation. The signer pays the fee and authorises the call. Returns the transaction hash. */
export async function writeAttestation(cfg: ChainConfig, signerSecret: string, keyHex: string, att: OnchainAttestation): Promise<string> {
  const kp = Keypair.fromSecret(signerSecret);
  const c = (await Client.from({ ...cfg, publicKey: kp.publicKey(), ...basicNodeSigner(kp, cfg.networkPassphrase) })) as Client & {
    attest: (a: { key: Buffer; att: OnchainAttestation }) => Promise<{ signAndSend: () => Promise<{ sendTransactionResponse?: { hash: string } }> }>;
  };
  const tx = await c.attest({ key: Buffer.from(keyHex, 'hex'), att });
  const sent = await tx.signAndSend();
  return sent.sendTransactionResponse?.hash ?? '';
}

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

/** Uploads the contract wasm and deploys it with (admin, signer). Returns the contract ID. */
export async function deployContract(opts: { rpcUrl: string; networkPassphrase: string; deployer: Keypair; wasm: Buffer; admin: string; signer: string }): Promise<string> {
  const server = new rpc.Server(opts.rpcUrl);
  await submit(server, opts.networkPassphrase, opts.deployer, Operation.uploadContractWasm({ wasm: opts.wasm }));
  const wasmHash = createHash('sha256').update(opts.wasm).digest();
  const tx = await Client.deploy(
    { admin: opts.admin, signer: opts.signer },
    { wasmHash, rpcUrl: opts.rpcUrl, networkPassphrase: opts.networkPassphrase, publicKey: opts.deployer.publicKey(), ...basicNodeSigner(opts.deployer, opts.networkPassphrase) },
  );
  const sent = await tx.signAndSend();
  return (sent.result as unknown as Client).options.contractId;
}
