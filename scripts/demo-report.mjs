// Turns demo-result.json (v3) into a Markdown report. Usage: node scripts/demo-report.mjs demo-result.json
import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync(process.argv[2] ?? 'demo-result.json', 'utf8'));
const acct = (a) => `[${a.slice(0, 6)}…${a.slice(-4)}](https://stellar.expert/explorer/testnet/account/${a})`;
const con = (a) => `[${a.slice(0, 6)}…${a.slice(-4)}](https://stellar.expert/explorer/testnet/contract/${a})`;
const out = [];
// Short, readable reason for a refused payment.
const reason = (msg = '') => {
  if (/Error\(Auth, InvalidAction\)/.test(msg) && /wallet refused/.test(msg)) return `\`__check_auth\` failed: the trust policy found no ${r.policy?.quorum}-of-${r.policy?.attesters?.length} quorum at score ${r.policy?.minScore} for this seller (\`Error(Auth, InvalidAction)\`)`;
  return msg.split('\n')[0].replace(/\|/g, '/').slice(0, 160);
};
out.push('# 402Scope Trust on Stellar testnet', '');
out.push(`Run finished ${r.finishedAt}. Every link below is a real testnet transaction or contract on Stellar Expert.`, '');

out.push('## What happened', '');
const paid = (r.walletPayments ?? []).filter((p) => p.outcome === 'paid').length;
const refused = (r.walletPayments ?? []).filter((p) => String(p.outcome).startsWith('refused')).length;
const nEndpoints = (r.endpoints ?? []).length;
const nSellers = (r.sellers ?? []).length;
out.push(`1. Two independent attesters locked a bond and measured ${nEndpoints} x402 endpoints from ${nSellers} sellers with real paid calls.`);
if (r.version >= 3) out.push(`2. Sellers published delivery terms in their 402 challenge (\`extensions.declarations\`) and declared each response (\`X-402-Declaration\`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.`);
out.push(`${r.version >= 3 ? 3 : 2}. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.`);
out.push(`${r.version >= 3 ? 4 : 3}. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **${paid} payment(s) went through, ${refused} were refused by the wallet itself.**`);
if (r.budgetWallet) out.push(`${r.version >= 3 ? 5 : 4}. A second agent wallet carried the same trust policy plus a spending limit: it refused the untrusted seller, paid the trusted one until its daily budget ran out and refused the next call; the owner then raised the budget with a passkey.`);
if (r.facilitatorHooks) out.push(`${r.budgetWallet ? 6 : 5}. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.`);
out.push('');

const c = r.contracts ?? {};
out.push('## Contracts', '');
out.push('| Contract | Address |', '| --- | --- |');
out.push(`| Attestation registry (bonds, scores, evidence) | ${con(c.registry)} |`);
out.push(`| Trust policy (OpenZeppelin \`Policy\`) | ${con(c.policy)} |`);
out.push(`| Agent wallet (OpenZeppelin smart account, policy: ${r.policy?.quorum} of ${r.policy?.attesters?.length} attesters, score ≥ ${r.policy?.minScore}) | ${con(c.wallet)} |`);
if (c.budgetWallet) {
  out.push(`| Spending limit policy (rolling window, x402-compatible) | ${con(c.spendingLimit)} |`);
  out.push(`| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | ${con(c.budgetWallet)} |`);
  if (c.webauthnVerifier) out.push(`| WebAuthn (passkey) verifier | ${con(c.webauthnVerifier)} |`);
}
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
out.push('| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const e of r.endpoints ?? []) {
  const s = e.score ?? {};
  const settl = (e.settlements ?? []).length ? e.settlements.slice(0, 3).map((u, i) => `[${i + 1}](${u})`).join(' ') + (e.settlements.length > 3 ? ' …' : '') : 'none';
  const broke = (e.declarations ?? []).filter((d) => d && d.providerAtFault && (d.basis === 'at-source' || d.basis === 'declared'));
  const codes = [...new Set(broke.flatMap((d) => d.codes))];
  out.push(`| \`${e.endpoint}\` | ${e.seller} | ${s.score} | ${s.calls} | ${s.delivered} | ${s.receipts} | ${e.terms ? 'yes' : 'no'} | ${broke.length ? `${broke.length} of ${s.calls} (${codes.join(', ')})` : '0'} | ${settl} | [tx](${e.attestationTx}) |`);
}
out.push('', 'Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):', '');
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
for (const p of r.walletPayments ?? []) out.push(`| \`${p.endpoint}\` | **${p.outcome}** | ${p.tx ? `[settlement](${p.tx})` : reason(p.reason)} |`);
out.push('', 'The refusal happens inside the wallet\'s own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent\'s code does.', '');

if (r.budgetWallet) {
  const b = r.budgetWallet;
  const units = (x) => (Number(x) / 1e7).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  out.push('## Who and how much: trust policy plus spending limit', '');
  out.push(`The budgeted wallet may pay sellers trusted by the quorum, and at most ${units(b.limit)} SCOPE in any ${b.periodLedgers.toLocaleString('en')} ledgers (about a day). Each call costs ${units(b.price)} SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.`, '');
  out.push('| Call | Endpoint | Outcome | Detail |', '| --- | --- | --- | --- |');
  b.payments.forEach((p, i) => out.push(`| ${i + 1} | \`${p.endpoint}\` | **${p.outcome}** | ${p.tx ? `[settlement](${p.tx})` : String(p.reason ?? '').split('\n')[0].replace(/\|/g, '/').slice(0, 120)} |`));
  if (b.owner) {
    const ow = b.owner;
    out.push('', ow.raised
      ? `Then the owner doubled the budget to ${units(ow.newLimit)} SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](${ow.tx})). The agent key cannot do this: its rule covers the token only. The next call: **${ow.paymentAfter?.outcome}**${ow.paymentAfter?.tx ? ` ([settlement](${ow.paymentAfter.tx}))` : ''}.`
      : `The owner's passkey could not raise the budget: ${String(ow.error ?? '').split('\n')[0].slice(0, 160)}`);
  }
  out.push('', 'Both checks run inside the wallet\'s `__check_auth`, so neither depends on the agent\'s code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin\'s own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).', '');
}

if (r.checks) {
  out.push('## check_before_pay (onchain quorum)', '');
  out.push('| Endpoint | Verdict | Score | Trusted by quorum |', '| --- | --- | --- | --- |');
  for (const x of r.checks) out.push(`| \`${x.endpoint}\` | ${x.verdict} | ${x.score ?? '—'} | ${x.trusted ?? '—'} |`);
  out.push('');
}
if (r.guardDecisions?.length) {
  out.push('Off-chain trust guard for classic accounts: ' + r.guardDecisions.map((d) => `\`${d.url}\` ${d.paid ? 'paid' : 'refused'}`).join(', ') + '.', '');
}
if (r.facilitatorHooks) {
  out.push('## Any facilitator: trust hooks and ranked discovery', '');
  out.push('A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:', '');
  out.push('| Endpoint | Outcome |', '| --- | --- |');
  for (const p of r.facilitatorHooks.payments) out.push(`| \`${p.endpoint}\` | ${p.outcome === 'paid' ? '**paid**' : `**refused by the facilitator** (${p.outcome})`} |`);
  out.push('', 'Facilitator decisions: ' + r.facilitatorHooks.decisions.map((d) => `${d.seller} ${d.action}${d.score != null ? ` (score ${d.score})` : ''}`).join('; ') + '.', '');
}
if (r.rankedDiscovery) {
  out.push('A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):', '');
  out.push('| Rank | Endpoint | Trusted | Score |', '| --- | --- | --- | --- |');
  r.rankedDiscovery.forEach((it, i) => out.push(`| ${i + 1} | \`${it.endpoint}\` | ${it.trusted ? 'yes' : 'no'} | ${it.score ?? '—'} |`));
  out.push('');
}
if (r.openzeppelin) {
  out.push("## OpenZeppelin's Built on Stellar facilitator", '');
  const z = r.openzeppelin;
  if (z.error) out.push(`Tried [${z.facilitator}](${z.facilitator}); not usable in this run: ${String(z.error).replace(/\|/g, '/')}`, '');
  else {
    out.push(`The same seller code, pointed at ${z.facilitator} instead of a local facilitator. Supported: ${(z.supported ?? []).join(', ') || 'none listed'}. Testnet USDC: ${z.usdc ?? 'not tried'}.`, '');
    out.push('| Asset | Payer | Outcome | Detail |', '| --- | --- | --- | --- |');
    const why = (p) => {
      const f = p.facilitator ?? {};
      const bits = [p.error, f.step && `${f.step}: ${f.invalidReason ?? f.errorReason ?? f.error ?? ''} ${f.invalidMessage ?? f.errorMessage ?? ''}`, p.detail].filter(Boolean);
      return bits.join(' · ').replace(/\|/g, '/').replace(/\n/g, ' ').slice(0, 200);
    };
    for (const p of z.payments ?? []) out.push(`| ${p.asset ?? 'SCOPE'} | ${p.payer} | **${p.outcome}** | ${p.tx ? `[settlement](${p.tx})` : why(p)} |`);
    out.push('');
  }
}
if (r.prepaidLedger) {
  const p = r.prepaidLedger;
  out.push('## Prepaid ledgers (batch-settlement)', '');
  out.push(p.readable
    ? `Fermah Pay's prepaid ledger on testnet, ${con(p.contract)}, names its seller role onchain: ${acct(p.seller)}. A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the \`payTo\`) cannot sign.`
    : `The seller role of the prepaid ledger ${p.contract ? con(p.contract) : ''} could not be read${p.error ? `: ${p.error}` : ''}.`, '');
}

if (r.officialDemo) {
  out.push("## Stellar's official x402 demo (unpaid conformance check)", '');
  if (r.officialDemo.error) out.push(`Not reachable in this run: ${r.officialDemo.error}`);
  else {
    out.push(`Discovered through [its manifest](${r.officialDemo.manifest}).`, '', '| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |', '| --- | --- | --- | --- | --- |');
    for (const p of r.officialDemo.probes) out.push(`| ${p.url} | ${p.status} | ${p.networks.join(', ')} | ${p.issues.length ? p.issues.join('; ') : 'none'} | ${p.terms ? 'published' : 'not published'} |`);
  }
}
console.log(out.join('\n'));
