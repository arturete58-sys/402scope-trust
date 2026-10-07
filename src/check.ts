import { probe } from './probe.js';
import { verdict, type Score, type Verdict } from './score.js';
import { latestLedger, readSellerAttestation, trustedBy, type ChainConfig } from './chain.js';
import type { Store } from './store.js';

export interface OnchainView {
  contractId: string;
  /** True when at least `quorum` of the chosen attesters trust the seller (contract `trusted_by`). */
  trusted: boolean;
  quorum: number;
  attestations: { attester: string; score: number; calls: number; receipts: number; expiresLedger: number; current: boolean }[];
}

export interface CheckResult {
  url: string;
  /** Onchain attestation key, when the endpoint declares a Stellar payTo. */
  key: string | null;
  payTo: string | null;
  network: string | null;
  verdict: Verdict;
  score: number | null;
  minScore: number;
  /** Plain-language reasons, most important first. */
  reasons: string[];
  measuredAt: string | null;
  paidCalls: number;
  method: number | null;
  /** The attestation read from the Soroban contract, when a contract is configured. */
  onchain: OnchainView | null;
}

const FATAL = ['unreachable', 'not-402', 'no-challenge', 'no-stellar', 'bad-header'];

/**
 * The question an agent asks before paying: should I pay this endpoint?
 * Uses the stored measurements when there are any; otherwise probes the
 * endpoint (unpaid) and answers "unknown" with what the challenge shows.
 * With a contract configured, the onchain attestation is read and decides:
 * an agent does not have to trust our API, only the contract.
 */
export async function checkBeforePay(store: Store, url: string, minScore = 80, opts: { live?: boolean; chain?: ChainConfig | null } = {}): Promise<CheckResult> {
  let rec = store.get(url);
  if ((!rec || !rec.probe) && opts.live !== false) {
    const p = await probe(url);
    rec = store.setProbe(url, p);
    store.save();
  }
  const s: Score | null = rec?.score ?? null;
  const reasons: string[] = [];
  const issues = rec?.probe?.issues ?? [];
  let v = verdict(s, minScore);
  let score = s?.score ?? null;

  let onchain: OnchainView | null = null;
  const attesters = opts.chain?.attesters ?? [];
  if (opts.chain && rec?.payTo && attesters.length) {
    const chain = opts.chain;
    const quorum = Math.max(1, Math.min(chain.quorum ?? 1, attesters.length));
    try {
      const [ledger, trusted, atts] = await Promise.all([
        latestLedger(chain),
        trustedBy(chain, rec.payTo, attesters, minScore, quorum),
        Promise.all(attesters.map((a) => readSellerAttestation(chain, a, rec!.payTo as string))),
      ]);
      onchain = {
        contractId: chain.contractId,
        trusted,
        quorum,
        attestations: atts.flatMap((a, i) => (a ? [{ attester: attesters[i], score: a.score, calls: a.calls, receipts: a.receipts, expiresLedger: a.expires_ledger, current: a.expires_ledger > ledger }] : [])),
      };
      const current = onchain.attestations.filter((a) => a.current);
      if (current.length) {
        const sorted = current.map((a) => a.score).sort((x, y) => x - y);
        score = sorted[Math.floor((sorted.length - 1) / 2)];
        v = trusted ? 'trusted' : score < 40 ? 'avoid' : 'caution';
        reasons.push(`onchain: ${current.length} current attestation(s) for seller ${rec.payTo}, ${trusted ? '' : 'not '}trusted by ${quorum} of ${attesters.length} chosen attesters at score ${minScore} (contract ${chain.contractId})`);
      } else {
        v = 'unknown';
        reasons.push('no current onchain attestation for this seller');
      }
    } catch (e) {
      reasons.push(`could not read the contract: ${(e as Error).message}`);
    }
  }

  const fatal = issues.find((i) => FATAL.includes(i.code));
  if (fatal) {
    v = 'avoid';
    reasons.unshift(fatal.message);
  }
  if (!onchain?.attestations.some((a) => a.current)) {
    if (s && s.score != null) {
      reasons.push(`${s.delivered} of ${s.calls} paid calls delivered, ${s.receipts ?? 0} with a valid signed receipt`);
      reasons.push(s.priceOk ? 'charged the declared price' : 'charged amount did not match the declared price, or no settlement seen');
      if (s.p50Ms != null) reasons.push(`median paid latency ${s.p50Ms} ms`);
      if (s.lowSample) reasons.push('fewer than 5 paid calls: low confidence');
    } else if (!fatal) {
      reasons.push('not measured with paid calls yet');
    }
  }
  for (const i of issues) if (i !== fatal) reasons.push(i.message);
  return {
    url: rec?.url ?? url,
    key: rec?.key ?? null,
    payTo: rec?.payTo ?? null,
    network: rec?.network ?? null,
    verdict: v,
    score,
    minScore,
    reasons,
    measuredAt: rec?.calls.at(-1)?.at ?? null,
    paidCalls: s?.calls ?? 0,
    method: s?.method ?? null,
    onchain,
  };
}
