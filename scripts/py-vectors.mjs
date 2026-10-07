// Writes cross-language test vectors for the Python package (python/tests/vectors.json)
// from the TypeScript implementation. Usage: npm run build && node scripts/py-vectors.mjs
import fs from 'node:fs';
import { Keypair } from '@stellar/stellar-sdk';
import { signReceipt, encodeReceipt, receiptMessage, RECEIPT_VERSION_1, buildTree, proofFor, evidenceLeaf } from '../dist/index.js';

const secret = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).secret();
const kp = Keypair.fromSecret(secret);
const base = { resource: 'https://api.example.com/paid', paymentHeader: 'eyJwYXltZW50IjoidGVzdCJ9', body: '{"pair":"XLM/USD","price":0.42}', at: 1791360000 };
const v2 = signReceipt(secret, base);
const v2decl = signReceipt(secret, { ...base, declaration: 'eyJmcmVzaG5lc3MiOnsiYWdlU2Vjb25kcyI6MX19' });
const v1 = { ...v2, v: RECEIPT_VERSION_1 };
v1.sig = kp.sign(receiptMessage(v1)).toString('base64');
const calls = [0, 1, 2, 3, 4].map((i) => ({ transaction: `tx${i}`, bodyHash: `b${i}`, delivered: i !== 3, receipt: i % 2 ? 'valid' : 'missing' }));
const leaves = calls.map((c) => evidenceLeaf(c));
const tree = buildTree(leaves);
const out = {
  secret, signer: kp.publicKey(), ...base, declaration: 'eyJmcmVzaG5lc3MiOnsiYWdlU2Vjb25kcyI6MX19',
  receipts: { v2: encodeReceipt(v2), v2decl: encodeReceipt(v2decl), v1: encodeReceipt(v1) },
  evidence: { calls, leaves: leaves.map((l) => l.toString('hex')), root: tree.root.toString('hex'), proof2: proofFor(tree, 2).map((p) => p.toString('hex')) },
};
fs.writeFileSync('python/tests/vectors.json', JSON.stringify(out, null, 2) + '\n');
console.log('wrote python/tests/vectors.json');
