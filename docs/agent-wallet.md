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
| `contracts/agent-wallet` | An OpenZeppelin smart account (`stellar-accounts`), deployed with one context rule ("agent") holding the agent's signer and the trust policy |
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

`max_unverified` is a per-payment limit, not a budget. Combine it with OpenZeppelin's spending-limit policy on the same rule to cap the total.

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

Smart-account authorization plus the policy's cross-contract call to the registry cost more resources than a classic account payment. The default `maxTransactionFeeStroops` of the Stellar facilitator (50,000) can be too low and the payment then fails verification with a 402. The testnet demo runs its facilitator with 2,000,000 stroops (0.2 XLM). Facilitators that want to accept agent wallets need a ceiling in that range.

## Proven on testnet

In the [latest run](testnet/README.md) the wallet paid the good seller (trusted by 2 of 2 attesters at score ≥ 80) and refused the broken and wrong-content-type endpoints of the bad seller inside its own `__check_auth`.

Tests: `cargo test -p scope-trust-policy` runs the policy end to end with a real OpenZeppelin smart account, an ed25519 signer and token transfers.
