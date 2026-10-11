# 402Scope Trust on Stellar testnet

Run finished 2026-10-11T11:36:58.290Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A second agent wallet carried the same trust policy plus a spending limit: it refused the untrusted seller, paid the trusted one until its daily budget ran out and refused the next call; the owner then raised the budget with a passkey.
6. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CDU2PI…UJBA](https://stellar.expert/explorer/testnet/contract/CDU2PIC3723H7NA4B2QCS4N3RYLM7ZZBDLGKK7IBIITZXEIC24PVUJBA) |
| Trust policy (OpenZeppelin `Policy`) | [CAMX7Z…HLUA](https://stellar.expert/explorer/testnet/contract/CAMX7ZCW6YM4ZIGS5TPCY4OWFAUPR7X5LQYRJGUZKKUDI64V2ENNHLUA) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAPGSB…O6BN](https://stellar.expert/explorer/testnet/contract/CAPGSBLPKODEGPA2FYF4DYOEBOOMO2JXERQ35YZSHZX2N2K3EJOHO6BN) |
| Spending limit policy (rolling window, x402-compatible) | [CBDCFX…JRV6](https://stellar.expert/explorer/testnet/contract/CBDCFXFRI3KJCSZ3UNE3WCP4OEVAK2XON5YLTTJTMODF2TZ6XEC6JRV6) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAHAED…WNVP](https://stellar.expert/explorer/testnet/contract/CAHAED3I3C3GC5Y3QBDTO3GKFK5RT6NQM3VMXBIYW5UCKMM76NTJWNVP) |
| WebAuthn (passkey) verifier | [CATDXQ…ZGES](https://stellar.expert/explorer/testnet/contract/CATDXQYKVEVTXMWLYL64XDG4NXBNDFDTVKPXGEPRF5DQJPFLOITEZGES) |
| Refund bond (optional seller bonds, no admin) | [CD5YCY…WTRY](https://stellar.expert/explorer/testnet/contract/CD5YCYXAOFX6AT7RABMGXPN3FRYU6I53W4R57VCSTXNKJCEBRSHOWTRY) |
| Escrow (x402 scheme `escrow`, no admin) | [CB7FKX…EW43](https://stellar.expert/explorer/testnet/contract/CB7FKXKOZ3NZ3N4H7L752U77MIEXLN6GXKOVKZHLHJUYDZSBRQ5KEW43) |
| ed25519 verifier | [CAKPWE…JSVD](https://stellar.expert/explorer/testnet/contract/CAKPWEAT7JQZT2MJU5ABZSR4YTBNMP2UI3FDZUJPDZYVV4XPSI6DJSVD) |
| Test token SCOPE (SEP-41) | [CAJLAW…DMLK](https://stellar.expert/explorer/testnet/contract/CAJLAWZXT5NGH75K63WCQTWJO2BJ36JTPN2HOUKAZ6WWOMJKEON7DMLK) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GCSRHB…PTSN](https://stellar.expert/explorer/testnet/account/GCSRHBQH3NL77DVF5BUCNDY6DENSGH4GGT3GLD5WGNMQ3L57GDRMPTSN) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/660cec58bdb3b997b019d68426a76199dd567ac1e0fbd17f4ec213b85fda95e6) |
| [GAZ2PY…UWDB](https://stellar.expert/explorer/testnet/account/GAZ2PYHF5EHPVXN65CXJZM2QVCDT7PMQRDLBZLCOYNQB5RF4AGZVUWDB) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/b3b22f470c65e3196e3b6028c77a6550077da4fe614d0da678c6e31a9b0cdaf8) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GCSRHB…PTSN](https://stellar.expert/explorer/testnet/account/GCSRHBQH3NL77DVF5BUCNDY6DENSGH4GGT3GLD5WGNMQ3L57GDRMPTSN) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/5e15b64ec7287a93867b3bc187daca9b751451d099823f4896af26d029527581) |
| good seller | [GAZ2PY…UWDB](https://stellar.expert/explorer/testnet/account/GAZ2PYHF5EHPVXN65CXJZM2QVCDT7PMQRDLBZLCOYNQB5RF4AGZVUWDB) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/c349348241ae2d82932c38e9bc2c3a4b82195094e22b365b10b9b510534b88ef) |
| bad seller | [GCSRHB…PTSN](https://stellar.expert/explorer/testnet/account/GCSRHBQH3NL77DVF5BUCNDY6DENSGH4GGT3GLD5WGNMQ3L57GDRMPTSN) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/e69c300306d290d04ceaba307a7d0ef6d1f9131f6ca1f5c89b179d17b5ac7f62) |
| bad seller | [GAZ2PY…UWDB](https://stellar.expert/explorer/testnet/account/GAZ2PYHF5EHPVXN65CXJZM2QVCDT7PMQRDLBZLCOYNQB5RF4AGZVUWDB) | 15 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/fab695772e7d032a2f735956246bf007f4fb705a3b8d1e1044b6ee871775a3ba) |
| stale seller | [GCSRHB…PTSN](https://stellar.expert/explorer/testnet/account/GCSRHBQH3NL77DVF5BUCNDY6DENSGH4GGT3GLD5WGNMQ3L57GDRMPTSN) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/9b1b4ef09858231330fa840cae6299b7a51401780ff2f752a929e10fee159496) |
| stale seller | [GAZ2PY…UWDB](https://stellar.expert/explorer/testnet/account/GAZ2PYHF5EHPVXN65CXJZM2QVCDT7PMQRDLBZLCOYNQB5RF4AGZVUWDB) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/6b67f4059627286d84515df8e54a2a5c9cba58af81965df52d99d614f0144da2) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/5a8559369369b628de80d88d2bc7f9b293a4fc486940660e2f3d36c8dfa3731d) [2](https://stellar.expert/explorer/testnet/tx/1416c2588e86f09fd1b5da6ebe5d240132daf3e4a99e2f3e456a299b1e40e4d3) [3](https://stellar.expert/explorer/testnet/tx/6f2d54037881891e08d042a8debd105e264a63d1d13fd3c56fb0ed75f38f85a7) … | [tx](https://stellar.expert/explorer/testnet/tx/d2d14419ec5116f0cfd03b995531050e74958150ad409f575caaf736343d0575) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/0b7fd7b56f63a60ca83cc0ee2942453e95f4b5d4ada89957d60bc0031ff73a7a) [2](https://stellar.expert/explorer/testnet/tx/52f0cd13a44e861ce66dcb0aaf8253876a01a9d95153f5288cc657faabb5a798) [3](https://stellar.expert/explorer/testnet/tx/4871c692ee7f8048e6d9ba2aa67b3c02db9be96c0dec58723b73dd3d640f8f62) … | [tx](https://stellar.expert/explorer/testnet/tx/17367968a8387d11a93e432ea58f8ff5942b0f29362deab0689a35414aa9324e) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/6c7cd07a68f0d846766d109c30860f12fab524c6ea9247712da3a28fdfca1bc8) [2](https://stellar.expert/explorer/testnet/tx/50cb7344b341660d42c156ba4ba5f20ee91be7c2bdf8c6ca9425e8d7512201d5) [3](https://stellar.expert/explorer/testnet/tx/9b4f6930224fa6627770bdb0b9871e423fcbbd0afd0e3e201ca39e7b2fc92d61) … | [tx](https://stellar.expert/explorer/testnet/tx/8bb9b382d0ab59144a6abe7bcb1eaa9f66e28ff11dfee200819384460fca293d) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/b1a636e3b934ab00615d2381c3184dbf9247b986fbaded26b25e19264c792f3b) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/b92b7999f53a0aa22f6173cfc6120b12ef1788fa162e4c490a100a67329f4b7c) [2](https://stellar.expert/explorer/testnet/tx/2a421b4ae3d17aa097e5fff6bff5e72f60e7e129d298bb6e6950bf7abf2af5c8) [3](https://stellar.expert/explorer/testnet/tx/cc0b55768a50f47755532d78fd36218d92f37a0b77bf5fa99cfdceeaffad2ef7) … | [tx](https://stellar.expert/explorer/testnet/tx/7c82e94ade04bc1b24c2ce1539f25913891de8f95b2cf83ba65c4b98c9562fec) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `2c454ca7fcab0f40…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/26023e31c88dca452ee55f804968b45cc9eb8131d9b4301abe49e89e6339db59) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a0f6dd7c10bffc9de982aadb01393b96566082ce1b98430c56dfd777df9cf486) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2fd4e824acb6c3676d03cdb84d47ad07309d3047fa1a2076d41b570577bcd53b) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/0a6e3be116166fabd9d4a6905fc2d8cf35f3a6642beba70e3a9acf8846778c99)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/e84bfdc335aaaed495538c035b645a066e437e9258ae8af9c2b3b52c63cb0c24)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 98 | true |
| `/slow` | trusted | 98 | true |
| `/wrong-type` | avoid | 15 | false |
| `/broken` | avoid | 15 | false |
| `/stale` | caution | 50 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 98); good seller allowed (score 98); stale seller blocked (score 50).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 98 |
| 2 | `/slow` | yes | 98 |
| 3 | `/stale` | no | 50 |
| 4 | `/wrong-type` | no | 15 |
| 5 | `/broken` | no | 15 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/161cd0dd01378ee177a5d5215fadaacedac432957ce79646ffa4484372edd6f8) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/70c4012a35e9a00b55bdfbdfd4aed8ba20c09cef38ab7e35e55dd69c5925be2b) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CD5YCY…WTRY](https://stellar.expert/explorer/testnet/contract/CD5YCYXAOFX6AT7RABMGXPN3FRYU6I53W4R57VCSTXNKJCEBRSHOWTRY) ([deposit](https://stellar.expert/explorer/testnet/tx/3b8df6ee9ef0b16096d5307e84a73eaef24d7e331d30dbea2278fe5e9e5c3eef)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/eec22de5f3a6696d078b5094c4117db51e24571c283809db682df34898b9da2f)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CB7FKX…EW43](https://stellar.expert/explorer/testnet/contract/CB7FKXKOZ3NZ3N4H7L752U77MIEXLN6GXKOVKZHLHJUYDZSBRQ5KEW43) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.7 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/f133630de11fef7c1f208febf61fd2681990457b76a4aed210089f92588c09e0)) | **released** | 5.3 s |
| `/escrow-stale` | 4.9 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/4992a307d0e6720906cc7892946a10e7026755b1af991e3ae3b408ae967686e7)) | **refunded** | 4.6 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
