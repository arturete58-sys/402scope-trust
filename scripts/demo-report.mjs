// Turns demo-result.json (v2) into a Markdown report. Usage: node scripts/demo-report.mjs demo-result.json
import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync(process.argv[2] ?? 'demo-result.json', 'utf8'));
const acct = (a) => `[${a.slice(0, 6)}…${a.slice(-4)}](https://stellar.expert/explorer/testnet/account/${a})`;
const con = (a) => `[${a.slice(0, 6)}…${a.slice(-4)}](https://stellar.expert/explorer/testnet/contract/${a})`;
const out = [];
out.push('# 402Scope Trust on Stellar testnet', '');
out.push(`Run finished ${r.finishedAt}. Every link below is a real testnet transaction or contract on Stellar Expert.`, '');

out.push('## What happened', '');
const paid = (r.walletPayments ?? []).filter((p) => p.outcome === 'paid').length;
const refused = (r.walletPayments ?? []).filter((p) => String(p.outcome).startsWith('refused')).length;
out.push(`1. Two independent attesters locked a bond and measured four x402 endpoints from two sellers with real paid calls.`);
out.push(`2. They wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.`);
out.push(`3. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **${paid} payment(s) went through, ${refused} were refused by the wallet itself.**`, '');

const c = r.contracts ?? {};
out.push('## Contracts', '');
out.push('| Contract | Address |', '| --- | --- |');
out.push(`| Attestation registry (bonds, scores, evidence) | ${con(c.registry)} |`);
out.push(`| Trust policy (OpenZeppelin \`Policy\`) | ${con(c.policy)} |`);
out.push(`| Agent wallet (OpenZeppelin smart account, policy: ${r.policy?.quorum} of ${r.policy?.attesters?.length} attesters, score ≥ ${r.policy?.minScore}) | ${con(c.wallet)} |`);
out.push(`| ed25519 verifier | ${con(c.verifier)} |`);
out.push(`| Test token SCOPE (SEP-41) | ${con(c.token)} |`, '');

out.push('## Attesters', '');
out.push('| Attester | Bond | Registration |', '| --- | --- | --- |');
for (const a of r.attesters ?? []) out.push(`| ${acct(a.address)} | ${a.bond} | [tx](${a.tx}) |`);
out.push('');

out.push('## Seller scores (onchain)', '');
out.push('| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |', '| --- | --- | --- | --- | --- | --- | --- |');
for (const s of r.sellers ?? []) for (const a of s.attestations) out.push(`| ${s.label} | ${acct(a.attester)} | ${a.score} | ${a.calls} | ${a.delivered} | ${a.receipts} | [tx](${a.tx}) |`);
out.push('', 'Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): ' + (r.sellers ?? []).map((s) => `${s.label} **${s.trustedBy2of2 ? 'yes' : 'no'}**`).join(', ') + '.', '');

out.push('## Endpoints (attester 1)', '');
out.push('| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Settlements | Attestation |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const e of r.endpoints ?? []) {
  const s = e.score ?? {};
  const settl = (e.settlements ?? []).length ? e.settlements.map((u, i) => `[${i + 1}](${u})`).join(' ') : 'none';
  out.push(`| \`${e.endpoint}\` | ${e.seller} | ${s.score} | ${s.calls} | ${s.delivered} | ${s.receipts} | ${settl} | [tx](${e.attestationTx}) |`);
}
out.push('', 'Score parts (delivery 50, signed receipts 15, price 15, latency 10, declaration 10):', '');
for (const e of r.endpoints ?? []) out.push(`- \`${e.endpoint}\`: ${JSON.stringify(e.score?.parts)}${e.errors?.length ? ` — errors seen: ${e.errors.join('; ')}` : ''}`);
out.push('');

if (r.evidence) {
  out.push('## Evidence checked onchain', '');
  out.push(`The good seller's attestation from attester 1 commits to ${r.evidence.leaves} pieces of evidence (Merkle root \`${r.evidence.root.slice(0, 16)}…\`).`, '');
  out.push(`- A real piece of evidence, verified by the contract (\`verify_seller_evidence\`): **${r.evidence.realLeafVerifiedOnchain}**`);
  out.push(`- The same evidence with the delivery result flipped: **${r.evidence.forgedLeafVerifiedOnchain}**`, '');
}

out.push('## The agent wallet pays over x402', '');
out.push('| Endpoint | Outcome | Detail |', '| --- | --- | --- |');
for (const p of r.walletPayments ?? []) out.push(`| \`${p.endpoint}\` | **${p.outcome}** | ${p.tx ? `[settlement](${p.tx})` : (p.reason ?? '').replace(/\|/g, '/').slice(0, 160)} |`);
out.push('', 'The refusal happens inside the wallet\'s own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent\'s code does.', '');

if (r.checks) {
  out.push('## check_before_pay (onchain quorum)', '');
  out.push('| Endpoint | Verdict | Score | Trusted by quorum |', '| --- | --- | --- | --- |');
  for (const x of r.checks) out.push(`| \`${x.endpoint}\` | ${x.verdict} | ${x.score ?? '—'} | ${x.trusted ?? '—'} |`);
  out.push('');
}
if (r.guardDecisions?.length) {
  out.push('Off-chain trust guard for classic accounts: ' + r.guardDecisions.map((d) => `\`${d.url}\` ${d.paid ? 'paid' : 'refused'}`).join(', ') + '.', '');
}
if (r.officialDemo) {
  out.push("## Stellar's official x402 demo (unpaid conformance check)", '');
  if (r.officialDemo.error) out.push(`Not reachable in this run: ${r.officialDemo.error}`);
  else {
    out.push(`Discovered through [its manifest](${r.officialDemo.manifest}).`, '', '| Resource | HTTP | Stellar networks | Issues |', '| --- | --- | --- | --- |');
    for (const p of r.officialDemo.probes) out.push(`| ${p.url} | ${p.status} | ${p.networks.join(', ')} | ${p.issues.length ? p.issues.join('; ') : 'none'} |`);
  }
}
console.log(out.join('\n'));
