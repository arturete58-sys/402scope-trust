import { createHash } from 'node:crypto';

/**
 * Canonical form of a resource URL: lowercase scheme and host, no default
 * port, no fragment, no trailing slash on the path (except "/"), query kept
 * as given. Two sellers can share a host but not a (payTo, URL) pair.
 */
export function normalizeUrl(input: string): string {
  const u = new URL(input);
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
  if (u.pathname.length > 1 && u.pathname.endsWith('/')) u.pathname = u.pathname.replace(/\/+$/, '');
  return u.toString();
}

/**
 * Attestation key used onchain: sha256(payTo + "|" + normalized URL), hex.
 * Binding the score to the payment address stops a seller from borrowing
 * another seller's reputation by copying its metadata.
 */
export function attestationKey(payTo: string, url: string): string {
  return createHash('sha256').update(`${payTo}|${normalizeUrl(url)}`).digest('hex');
}
