import { createHmac, timingSafeEqual } from 'node:crypto';
import { Keypair, Networks, StrKey, Transaction, WebAuth } from '@stellar/stellar-sdk';

/**
 * SEP-10 Stellar Web Authentication for partner facilitators.
 *
 * Instead of a shared contributor key, a facilitator proves it controls its
 * Stellar account: it asks for a challenge transaction, signs it with the
 * account's key (never submitted, never costs a fee) and gets a short-lived
 * JWT. The API accepts contributions from accounts listed in
 * `TRUST_CONTRIBUTOR_ACCOUNTS="name:G...,name2:G..."`.
 *
 *   GET  /v1/auth?account=G...      -> { transaction, network_passphrase }
 *   POST /v1/auth { transaction }   -> { token }
 *   POST /v1/contributions  Authorization: Bearer <token>
 *
 * Only the account's master key is accepted as the signer (the account need
 * not exist onchain). See https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
 */

export interface WebAuthConfig {
  /** Secret of the server signing key (S...). Its public key goes in stellar.toml as SIGNING_KEY. */
  serverSecret: string;
  /** Home domain whose stellar.toml lists WEB_AUTH_ENDPOINT and SIGNING_KEY. */
  homeDomain: string;
  /** Host that serves the auth endpoint (usually the same as homeDomain). */
  webAuthDomain: string;
  networkPassphrase: string;
  /** HMAC key for the JWTs; derived from serverSecret when absent. */
  jwtSecret?: string;
  /** Token lifetime in seconds (default 1 hour). */
  tokenSeconds?: number;
  /** Challenge lifetime in seconds (default 5 minutes). */
  challengeSeconds?: number;
}

export function webAuthFromEnv(env = process.env): WebAuthConfig | null {
  if (!env.TRUST_SEP10_SECRET) return null;
  const homeDomain = env.TRUST_HOME_DOMAIN ?? '402scope.org';
  return {
    serverSecret: env.TRUST_SEP10_SECRET,
    homeDomain,
    webAuthDomain: env.TRUST_WEB_AUTH_DOMAIN ?? homeDomain,
    networkPassphrase: env.TRUST_SEP10_NETWORK === 'testnet' ? Networks.TESTNET : Networks.PUBLIC,
    jwtSecret: env.TRUST_JWT_SECRET,
  };
}

/** `TRUST_CONTRIBUTOR_ACCOUNTS="name:G...,name2:G..."` -> account -> name. */
export function contributorAccountsFromEnv(env = process.env): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of (env.TRUST_CONTRIBUTOR_ACCOUNTS ?? '').split(',')) {
    const [name, account] = part.trim().split(':');
    if (name && account && StrKey.isValidEd25519PublicKey(account)) out.set(account, name);
  }
  return out;
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64url');

function jwtKey(c: WebAuthConfig): Buffer {
  return c.jwtSecret ? Buffer.from(c.jwtSecret) : createHmac('sha256', 'x402scope-sep10-jwt').update(c.serverSecret).digest();
}

/** A SEP-10 challenge for `account`. */
export function challenge(c: WebAuthConfig, account: string): { transaction: string; network_passphrase: string } {
  if (!StrKey.isValidEd25519PublicKey(account)) throw new Error('account must be a G... address');
  const transaction = WebAuth.buildChallengeTx(Keypair.fromSecret(c.serverSecret), account, c.homeDomain, c.challengeSeconds ?? 300, c.networkPassphrase, c.webAuthDomain);
  return { transaction, network_passphrase: c.networkPassphrase };
}

/**
 * Checks a signed challenge and returns a JWT for its account. Throws when the
 * challenge is not ours, expired, or not signed by the account's key.
 */
export function token(c: WebAuthConfig, signedXdr: string, now = Date.now()): { token: string; account: string; expiresAt: number } {
  const server = Keypair.fromSecret(c.serverSecret).publicKey();
  const { clientAccountID, tx } = WebAuth.readChallengeTx(signedXdr, server, c.networkPassphrase, c.homeDomain, c.webAuthDomain);
  const signed = WebAuth.verifyChallengeTxSigners(signedXdr, server, c.networkPassphrase, [clientAccountID], c.homeDomain, c.webAuthDomain);
  if (!signed.includes(clientAccountID)) throw new Error('the challenge is not signed by the account');
  const iat = Math.floor(now / 1000);
  const exp = iat + (c.tokenSeconds ?? 3600);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iss: `https://${c.webAuthDomain}/v1/auth`, sub: clientAccountID, iat, exp, jti: (tx as Transaction).hash().toString('hex') }));
  const sig = b64url(createHmac('sha256', jwtKey(c)).update(`${header}.${payload}`).digest());
  return { token: `${header}.${payload}.${sig}`, account: clientAccountID, expiresAt: exp };
}

/** The account a valid, unexpired token was issued to, or null. */
export function accountFromToken(c: WebAuthConfig, authorization: string | undefined, now = Date.now()): string | null {
  const m = /^Bearer\s+([\w-]+)\.([\w-]+)\.([\w-]+)$/.exec(authorization ?? '');
  if (!m) return null;
  const expected = createHmac('sha256', jwtKey(c)).update(`${m[1]}.${m[2]}`).digest();
  const got = Buffer.from(m[3], 'base64url');
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(m[2], 'base64url').toString('utf8'));
    if (typeof p.exp !== 'number' || p.exp * 1000 <= now || typeof p.sub !== 'string') return null;
    return p.sub;
  } catch {
    return null;
  }
}

/**
 * Client side: logs in to a 402Scope Trust API with a Stellar key and returns
 * the token for `shareResources` / `shareBazaar` (pass it as `key`).
 * `sign` may be a Keypair or any signer of transaction XDR (e.g. a wallet).
 */
export async function sep10Login(o: {
  apiUrl: string;
  account: string;
  sign: Keypair | ((xdr: string, networkPassphrase: string) => Promise<string>);
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const f = o.fetchImpl ?? fetch;
  const base = o.apiUrl.replace(/\/$/, '');
  const ch = await f(`${base}/v1/auth?account=${encodeURIComponent(o.account)}`);
  if (!ch.ok) throw new Error(`challenge: HTTP ${ch.status}`);
  const { transaction, network_passphrase } = (await ch.json()) as { transaction: string; network_passphrase: string };
  // Check the challenge before signing it: it must be a SEP-10 challenge for this account, with no other effect.
  const tx = new Transaction(transaction, network_passphrase);
  if (tx.sequence !== '0' || !tx.operations.every((op) => op.type === 'manageData')) throw new Error('not a SEP-10 challenge');
  let signed: string;
  if (o.sign instanceof Keypair) {
    tx.sign(o.sign);
    signed = tx.toXDR();
  } else {
    signed = await o.sign(transaction, network_passphrase);
  }
  const r = await f(`${base}/v1/auth`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transaction: signed }) });
  const j = (await r.json()) as { token?: string; error?: string };
  if (!r.ok || !j.token) throw new Error(`login: ${j.error ?? `HTTP ${r.status}`}`);
  return j.token;
}
