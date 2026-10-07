# Agent wallet and trust policy

An off-chain check only helps if the agent's code calls it. The trust policy moves the decision into the wallet: an agent wallet on Stellar cannot sign a payment to a seller its chosen attesters do not trust, whatever the agent's code does.

```
agent → x402 client → wallet signs transfer(from, to, amount)
                              ↓  __check_auth
                    OpenZeppelin smart account
                              ↓  enforce()
                    402Scope trust policy → registry.trusted_by(to, attesters, min_score, quorum)
                              ↓
                    allowed → facilitator settles   |   refused → no valid signature, nothing to settle
```

## Pieces

| Contract | What it is |
| --- | --- |
| `contracts/agent-wallet` | An OpenZeppelin smart account (`stellar-accounts`), deployed with the agent's signer and its policies on one context rule (see [shapes](#two-shapes)) |
| `contracts/spending-limit` | Spending limit policy: at most an amount in any rolling window of ledgers. OpenZeppelin's semantics and parameters, compatible with x402 facilitators (see below) |
| `contracts/trust-policy` | An OpenZeppelin `Policy`. Installed per smart account and context rule, with its own parameters |
| `contracts/ed25519-verifier` | OpenZeppelin `Verifier` for ed25519 keys, so the agent's key is an `External` signer |
| `contracts/attestations` | The [registry](attestation-spec.md) the policy reads |

## Policy parameters

```rust
TrustPolicyParams {
    registry: Address,        // attestation registry
    attesters: Vec<Address>,  // 1 to 10 attesters this wallet trusts
    min_score: u32,           // 0 to 100
    quorum: u32,              // how many of them must agree, 1..=attesters
    max_unverified: i128,     // largest single payment allowed to a seller nobody attested (0 = none)
}
```

## What `enforce` does

1. Requires the smart account's own authorization and at least one authenticated signer.
2. For a token `transfer(from, to, amount)` or `approve(from, spender, amount, …)`: takes the destination (the underlying address of a muxed `to`) and the amount. Other calls are not payments and are left to the wallet's other rules.
3. Allows the payment if `trusted_by(to, attesters, min_score, quorum)` is true, or if `amount <= max_unverified`. Otherwise it fails with `NotTrusted`, so `__check_auth` fails and the signed transaction is invalid.

Unknown or unparsable destinations are treated as untrusted (fail closed). Read-only helpers: `params(account, rule)`, `would_allow(account, rule, to, amount)`. The account can change its parameters with `set_params`.

`max_unverified` is a per-payment limit, not a budget. For a budget, add the spending limit policy to the same rule (below).

## Who and how much: trust policy plus spending limit

The trust policy decides *who* the agent may pay. The spending limit decides *how much*: at most `spending_limit` in any rolling window of `period_ledgers` (17,280 ledgers is about a day). Installed on the same rule, both run on every payment inside `__check_auth`, independently of each other, and either one can refuse it.

```rust
SpendingLimitParams { spending_limit: i128, period_ledgers: u32 }
```

A refused payment (untrusted seller) does not use up the budget. Reads: `window(account, rule)` returns the limit, the payments still in the window and their total; `remaining(account, rule)` what is left. The wallet can change the limit with `set_spending_limit`. Errors: `LimitExceeded` (#3302), `NotAllowed` (#3304, anything but a token transfer).

### Why not OpenZeppelin's spending limit as it is

OpenZeppelin's `spending_limit` policy has the same rolling window and parameters, and we first deployed it unchanged. On testnet every payment from that wallet was refused by the facilitator, not by the wallet: the x402 `exact` facilitator for Stellar (`@x402/stellar`) simulates the payment and accepts it only if the simulation emits exactly one event, the token transfer. OpenZeppelin's policy emits `SpendingLimitEnforced` on every payment, so the facilitator answers `invalid_exact_stellar_payload_event_not_transfer`.

`scope-spending-limit` keeps OpenZeppelin's semantics and emits no event when it lets a payment through (installing or changing a limit still does). The trust policy emits none either. The test `a_payment_emits_only_the_transfer_event` holds both policies to it.

### Two shapes

A spending limit only accepts rules scoped to one token contract (amounts of different tokens are never added together), so the wallet constructor takes the token:

```rust
__constructor(signers: Vec<Signer>, policies: Map<Address, Val>, token: Option<Address>, admins: Vec<Signer>)
```

| `token` | Rule 0 | Rule 1 |
| --- | --- | --- |
| `None` | "agent", Default: the policies run on every call the agent signs | "admin", only if `admins` is not empty |
| `Some(usdc)` | "payments", calls to `usdc` only: the agent key can pay in that token, within its policies, and do nothing else | "admin" (Default, no policies), only if `admins` is not empty, to change rules and policies |

From TypeScript:

```ts
await deployAgentWallet({
  rpcUrl, networkPassphrase, deployer, walletWasmHash, verifier, signerKey: agentKey,
  policy: trustPolicy, params: { registry, attesters, minScore: 80, quorum: 2, maxUnverified: 0n },
  token: usdc,
  spendingLimit: { policy: spendingLimitPolicy, spendingLimit: 5_000_000n, periodLedgers: 17_280 }, // 0.5 USDC a day
});
```

## Paying over x402

`AgentWalletExactScheme` (`src/smart-account.ts`) is an x402 client scheme for Stellar `exact` that pays from the wallet. It builds the same SEP-41 `transfer` as `@x402/stellar`, signs the auth entry with the OpenZeppelin `AuthPayload` (an ed25519 signature over `sha256(XDR(AuthDigestPreimage{account, signature_payload, context_rule_ids}))`), then re-simulates so the policy runs before anything is sent. A refused payment never reaches the seller.

```ts
import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { AgentWalletExactScheme } from '402scope-trust';

const scheme = new AgentWalletExactScheme({ account: 'C…wallet', key: agentKeypair, verifier: 'C…verifier' });
const client = x402Client.fromConfig({ schemes: [{ network: 'stellar:testnet', client: scheme }] });
const pay = wrapFetchWithPayment(fetch, client);
```

The facilitator verifies and settles the transaction unchanged; no facilitator changes are needed.

### Facilitator fee ceiling

Smart-account authorization plus the policy's cross-contract call to the registry cost more resources than a classic account payment. The default `maxTransactionFeeStroops` of the Stellar facilitator (50,000) can be too low and the payment then fails verification with a 402. The testnet demo runs its facilitator with 2,000,000 stroops (0.2 XLM). Self-hosted facilitators that want to accept agent wallets need a ceiling in that range. OpenZeppelin's hosted Built on Stellar facilitator settled an agent-wallet payment in testnet USDC as it is ([latest run](testnet/README.md)).

## Proven on testnet

In the [latest run](testnet/README.md) the wallet paid the good seller (trusted by 2 of 2 attesters at score ≥ 80) and refused the broken and wrong-content-type endpoints of the bad seller inside its own `__check_auth`. A second, budgeted wallet (trust policy plus a spending limit of 2.5 calls a day) paid the good seller twice, was refused the third call by the spending limit, and was refused the bad seller by the trust policy.

Tests: `cargo test -p scope-trust-policy` runs the policy end to end with a real OpenZeppelin smart account, an ed25519 signer and token transfers. `cargo test -p scope-agent-wallet` runs the deployed wallet with both policies: payments up to the limit, the rolling window, untrusted sellers refused within the budget, the agent key unable to move any other token, and a payment emitting only the transfer event.
