import { Horizon, StellarToml } from '@stellar/stellar-sdk';

/**
 * Who is behind an attester, by SEP-1 (stellar.toml).
 *
 * An attester's bond is onchain, but its name is not. SEP-1 gives the
 * standard link: the attester's account sets `home_domain`, and that domain
 * lists the account under ACCOUNTS in https://<domain>/.well-known/stellar.toml.
 * Both directions must hold, so neither a domain nor an account can claim the
 * other alone. Wallets can show "attester: 402scope.org" instead of a G... key.
 */

export interface AttesterIdentity {
  address: string;
  /** Both directions hold: home_domain on the account, and the account in that domain's stellar.toml. */
  verified: boolean;
  domain: string | null;
  orgName: string | null;
  orgUrl: string | null;
  reason?: string;
}

export interface IdentityOptions {
  horizonUrl?: string;
  /** For tests or other networks: returns the account's home_domain. */
  homeDomainOf?: (address: string) => Promise<string | null>;
  /** For tests: fetch over http. */
  allowHttp?: boolean;
  timeoutMs?: number;
}

export async function attesterIdentity(address: string, o: IdentityOptions = {}): Promise<AttesterIdentity> {
  const base: AttesterIdentity = { address, verified: false, domain: null, orgName: null, orgUrl: null };
  let domain: string | null = null;
  try {
    domain = o.homeDomainOf
      ? await o.homeDomainOf(address)
      : ((await new Horizon.Server(o.horizonUrl ?? 'https://horizon.stellar.org').loadAccount(address)) as unknown as { home_domain?: string }).home_domain ?? null;
  } catch (e) {
    return { ...base, reason: `account not found: ${(e as Error).message}` };
  }
  if (!domain) return { ...base, reason: 'the account sets no home_domain' };
  let toml: Record<string, unknown>;
  try {
    toml = (await StellarToml.Resolver.resolve(domain, { allowHttp: o.allowHttp, timeout: o.timeoutMs ?? 10_000 })) as Record<string, unknown>;
  } catch (e) {
    return { ...base, domain, reason: `no stellar.toml at ${domain}: ${(e as Error).message}` };
  }
  const doc = (toml.DOCUMENTATION ?? {}) as Record<string, string>;
  const accounts = Array.isArray(toml.ACCOUNTS) ? (toml.ACCOUNTS as string[]) : [];
  const listed = accounts.includes(address);
  return {
    address,
    verified: listed,
    domain,
    orgName: doc.ORG_NAME ?? null,
    orgUrl: doc.ORG_URL ?? null,
    ...(listed ? {} : { reason: `${domain}'s stellar.toml does not list this account under ACCOUNTS` }),
  };
}
