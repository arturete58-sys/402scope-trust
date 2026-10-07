# Stellar standards used

402Scope Trust builds on Stellar's own standards wherever one exists, so that wallets, explorers and SDKs can check its outputs without its code.

| Standard | Used for | Where |
| --- | --- | --- |
| [SEP-41](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md) Soroban Token Interface | x402 `exact` payments are SEP-41 `transfer`s; attester bonds are a SEP-41 token | `smart-account.ts`, `contracts/attestations` |
| [SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md) Sign and Verify Messages | Delivery receipts (`x402-receipt/2`) and endpoint claims are Stellar signed messages, checkable with `Keypair.verifyMessage` | [receipts.md](receipts.md) |
| [SEP-1](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md) Stellar Info File | Who is behind an attester: the account's `home_domain`, and that domain's `stellar.toml` listing the account under `ACCOUNTS` | `identity.ts`, `scope-trust attester-identity G…` |
| [SEP-10](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md) Stellar Web Authentication | Partner facilitators log in with their Stellar account to share their Bazaar, instead of holding a shared key | `sep10.ts`, [facilitators.md](facilitators.md#log-in-with-your-stellar-account-sep-10) |
| [SEP-46](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0046.md) Contract Meta and [SEP-55](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0055.md) Contract Build Info | Every contract carries `source_repo` and `home_domain` in its meta; GitHub attests the exact wasm, so explorers can show a deployed contract as built from this repository | `.github/workflows/testnet-demo.yml`, `.github/workflows/release-contracts.yml` |
| OpenZeppelin Stellar smart accounts | The agent wallet, the trust policy and the spending limit (`Policy` trait, `__check_auth`) | [agent-wallet.md](agent-wallet.md) |
| Stellar SDKs: JavaScript (bindings generator, `WebAuth`) and Python | Typed contract clients generated from the deployed wasm; the Python verifier | `src/clients`, [python/](../python) |

## Verified builds (SEP-55)

- Every testnet demo run builds the contracts with `--meta source_repo=github:arturete58-sys/402scope-trust --meta home_domain=402scope.org` and attests the resulting wasm files with GitHub's build provenance before deploying them.
- A version tag (`v*`) runs [stellar-expert/soroban-build-workflow](https://github.com/stellar-expert/soroban-build-workflow) for each contract: an optimized build, a GitHub release with its sha256, and an attestation. Those are the builds to deploy on mainnet.

Anyone can check a deployed contract: take its wasm hash and ask `https://api.github.com/repos/arturete58-sys/402scope-trust/attestations/sha256:<hash>`.

## Attester identity (SEP-1)

An attester that wants to be known by name sets `home_domain` on its account and lists the account in `https://<domain>/.well-known/stellar.toml`:

```toml
ACCOUNTS = ["G…attester"]

[DOCUMENTATION]
ORG_NAME = "Example Attester"
ORG_URL = "https://attester.example"
```

`attesterIdentity(address)` checks both directions; one without the other is not an identity.
