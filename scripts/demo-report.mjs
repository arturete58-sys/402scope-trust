// Turns demo-result.json into a Markdown report. Usage: node scripts/demo-report.mjs demo-result.json
import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync(process.argv[2] ?? 'demo-result.json', 'utf8'));
const acct = (a) => `[${a.slice(0, 6)}…${a.slice(-4)}](https://stellar.expert/explorer/testnet/account/${a})`;
const out = [];
out.push('# 402Scope Trust on Stellar testnet', '');
out.push(`Run finished ${r.finishedAt}. Everything below is a real testnet transaction you can open on Stellar Expert.`, '');
out.push(`- Attestation contract: [${r.contractId}](${r.contractUrl})`);
out.push(`- Test token (SEP-41, SCOPE): [${r.token}](https://stellar.expert/explorer/testnet/contract/${r.token})`);
out.push(`- Seller: ${acct(r.accounts.seller)} · Measurer: ${acct(r.accounts.buyer)} · Facilitator: ${acct(r.accounts.facilitator)} · Signer: ${acct(r.accounts.signer)}`, '');
out.push('## Measured endpoints', '');
out.push('| Endpoint | What it does | Score | Verdict | Paid calls | Delivered | Settlements | Attestation |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
const what = { '/good': 'Fast JSON, as declared', '/slow': 'Correct JSON after 3.5 s', '/wrong-type': 'Declares JSON, returns HTML', '/broken': 'Returns HTTP 500' };
for (const e of r.endpoints ?? []) {
  const s = e.score ?? {};
  const settl = (e.settlements ?? []).length ? (e.settlements ?? []).map((u, i) => `[${i + 1}](${u})`).join(' ') : 'none';
  out.push(`| \`${e.endpoint}\` | ${what[e.endpoint] ?? ''} | ${s.score} | **${e.verdict}** | ${s.calls} | ${s.delivered} | ${settl} | [tx](${e.attestationTx}) |`);
}
out.push('', 'Score parts (delivery 60, price 20, latency 10, declaration 10):', '');
for (const e of r.endpoints ?? []) out.push(`- \`${e.endpoint}\`: ${JSON.stringify(e.score?.parts)}${e.errors?.length ? ` — errors seen: ${e.errors.join('; ')}` : ''}`);
out.push('', '## Agent with the trust guard', '');
for (const d of r.agentDecisions ?? []) out.push(`- \`${d.url}\`: ${d.paid ? 'paid' : `refused — ${d.reason}`}`);
console.log(out.join('\n'));
