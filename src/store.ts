import fs from 'node:fs';
import path from 'node:path';
import { attestationKey, normalizeUrl } from './key.js';
import type { ProbeResult } from './probe.js';
import type { PaidCall } from './measure.js';
import type { Score } from './score.js';

/** Everything the observatory knows about one endpoint. */
export interface EndpointRecord {
  url: string;
  /** Onchain key, known once a probe has returned a Stellar payTo. */
  key: string | null;
  payTo: string | null;
  network: string | null;
  /** Where the endpoint was found: a facilitator discovery URL, "seed" or "check". */
  source: string;
  firstSeen: string;
  probe: ProbeResult | null;
  /** Most recent paid calls, newest last (capped). */
  calls: PaidCall[];
  score: Score | null;
  /** Last attestation written onchain for this endpoint. */
  attestation?: { tx: string; expiresLedger: number; score: number; at: string };
  updatedAt: string;
}

const MAX_CALLS = 50;

/** A small JSON-file store. Enough for the MVP; swap for SQLite when it grows. */
export class Store {
  private data: Record<string, EndpointRecord> = {};
  constructor(private file: string) {
    try { this.data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { this.data = {}; }
  }

  static open(dir = process.env.TRUST_DATA_DIR ?? 'data'): Store {
    fs.mkdirSync(dir, { recursive: true });
    return new Store(path.join(dir, 'endpoints.json'));
  }

  save(): void {
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 1));
    fs.renameSync(tmp, this.file);
  }

  all(): EndpointRecord[] {
    return Object.values(this.data);
  }

  get(url: string): EndpointRecord | undefined {
    return this.data[normalizeUrl(url)];
  }

  byKey(key: string): EndpointRecord | undefined {
    return this.all().find((r) => r.key === key);
  }

  /** Adds an endpoint if new. Returns true when it was added. */
  add(url: string, source: string): boolean {
    const u = normalizeUrl(url);
    if (this.data[u]) return false;
    const now = new Date().toISOString();
    this.data[u] = { url: u, key: null, payTo: null, network: null, source, firstSeen: now, probe: null, calls: [], score: null, updatedAt: now };
    return true;
  }

  setProbe(url: string, p: ProbeResult): EndpointRecord {
    this.add(url, 'check');
    const r = this.data[normalizeUrl(url)];
    r.probe = p;
    const first = p.stellar[0];
    if (first) {
      // A changed payTo starts a new identity: old calls belong to the old key.
      if (r.payTo && r.payTo !== first.payTo) { r.calls = []; r.score = null; }
      r.payTo = first.payTo;
      r.network = first.network;
      r.key = attestationKey(first.payTo, r.url);
    }
    r.updatedAt = new Date().toISOString();
    return r;
  }

  addCall(url: string, c: PaidCall): void {
    const r = this.data[normalizeUrl(url)];
    r.calls.push(c);
    if (r.calls.length > MAX_CALLS) r.calls.splice(0, r.calls.length - MAX_CALLS);
    r.updatedAt = new Date().toISOString();
  }

  setAttestation(url: string, a: NonNullable<EndpointRecord['attestation']>): void {
    this.data[normalizeUrl(url)].attestation = a;
  }

  setScore(url: string, s: Score): void {
    const r = this.data[normalizeUrl(url)];
    r.score = s;
    r.updatedAt = new Date().toISOString();
  }
}
