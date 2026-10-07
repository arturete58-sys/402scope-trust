import { createHash } from 'node:crypto';
import type { PaidCall } from './measure.js';

/**
 * Evidence behind an attestation, as a Merkle tree the contract can check
 * (`verify_seller_evidence`, `verify_evidence`). One leaf per paid call:
 *
 *   leaf = sha256("x402-evidence/1" | settlement tx hash | body hash | delivered | receipt check)
 *
 * Pairs are hashed sorted (smaller first), like the contract; an odd node
 * moves up unchanged. See docs/evidence.md.
 */
const sha = (b: Buffer) => createHash('sha256').update(b).digest();

export function evidenceLeaf(c: PaidCall): Buffer {
  return sha(Buffer.from(['x402-evidence/1', c.transaction ?? '', c.bodyHash ?? '', c.delivered ? '1' : '0', c.receipt ?? 'missing'].join('|'), 'utf8'));
}

function pair(a: Buffer, b: Buffer): Buffer {
  return Buffer.compare(a, b) <= 0 ? sha(Buffer.concat([a, b])) : sha(Buffer.concat([b, a]));
}

export interface MerkleTree {
  root: Buffer;
  /** levels[0] = leaves, last level = [root]. */
  levels: Buffer[][];
}

export function buildTree(leaves: Buffer[]): MerkleTree {
  if (!leaves.length) return { root: Buffer.alloc(32), levels: [[]] };
  const levels: Buffer[][] = [leaves];
  while (levels.at(-1)!.length > 1) {
    const cur = levels.at(-1)!;
    const next: Buffer[] = [];
    for (let i = 0; i < cur.length; i += 2) next.push(i + 1 < cur.length ? pair(cur[i], cur[i + 1]) : cur[i]);
    levels.push(next);
  }
  return { root: levels.at(-1)![0], levels };
}

/** Sibling hashes from leaf `index` up to the root. */
export function proofFor(tree: MerkleTree, index: number): Buffer[] {
  const proof: Buffer[] = [];
  let i = index;
  for (let l = 0; l < tree.levels.length - 1; l++) {
    const level = tree.levels[l];
    const sib = i % 2 ? i - 1 : i + 1;
    if (sib < level.length) proof.push(level[sib]);
    i = Math.floor(i / 2);
  }
  return proof;
}

export function verifyProof(leaf: Buffer, proof: Buffer[], root: Buffer): boolean {
  return proof.reduce((node, sib) => pair(node, sib), leaf).equals(root);
}

export function evidenceTree(calls: PaidCall[]): MerkleTree {
  return buildTree(calls.map(evidenceLeaf));
}
