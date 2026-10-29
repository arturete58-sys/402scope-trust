# 402Scope Trust on Stellar testnet

Run finished 2026-10-29T11:42:48.653Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CB5QYR…IUDD](https://stellar.expert/explorer/testnet/contract/CB5QYRTF3G7JW6SQCKWH2DG75DIUGURTKTF6SR5BQU65DMAORO4NIUDD) |
| Trust policy (OpenZeppelin `Policy`) | [CDIMUA…FD4V](https://stellar.expert/explorer/testnet/contract/CDIMUAS4IMZMAB552ST2D5EU5WULQVIGVBM5QDRNIXYFNW3EDCHZFD4V) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCUMB5…CWB6](https://stellar.expert/explorer/testnet/contract/CCUMB5VXHY4RO2ONSV5Z3DSEC5RHG2MZWGOG7VCEXT74CR4HNZHNCWB6) |
| Spending limit policy (rolling window, x402-compatible) | [CB7JHT…UB7Y](https://stellar.expert/explorer/testnet/contract/CB7JHT7MMJTSZ3VAH4SDKAA3FUI6QQUV33NM47PY7EQEZAT7HYEVUB7Y) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDEVCC…4B47](https://stellar.expert/explorer/testnet/contract/CDEVCCQKM2CA4IJREJ2WH42WAIHYQKANFBPIJKBYL2HI4KDNUSQH4B47) |
| WebAuthn (passkey) verifier | [CBQ4S5…5F4R](https://stellar.expert/explorer/testnet/contract/CBQ4S5EAQRMDN2UVKB3HXGHW7X5VY7HCX3GHAHYKEW3LQY6AG2AG5F4R) |
| Refund bond (optional seller bonds, no admin) | [CDMN2E…TCTA](https://stellar.expert/explorer/testnet/contract/CDMN2EQ5Y2ZB2IB3ZYVQYHYUGYZV7KI3M3MO4SSX7HFSNZ2KL2TXTCTA) |
| Escrow (x402 scheme `escrow`, no admin) | [CBEZHU…L6AM](https://stellar.expert/explorer/testnet/contract/CBEZHUQJPE3HGQJRLU4VETGLTMMDVRBYEMDCG56YDIGQLICMR4PCL6AM) |
| ed25519 verifier | [CAI2BW…M5EW](https://stellar.expert/explorer/testnet/contract/CAI2BWHRPQSRJX7U3TT3PC7STAD2RHGM5INFA45AXHN5AKBDOJLWM5EW) |
| Test token SCOPE (SEP-41) | [CDIOZ5…2Z3Z](https://stellar.expert/explorer/testnet/contract/CDIOZ5GWQ2SYOXBM7JVAQZ2WZGVLCLMMAVDWXYVOW7PMYJRIRTPZ2Z3Z) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GA3M3I…2XVV](https://stellar.expert/explorer/testnet/account/GA3M3IYVJYVZ5VFAZMQKCHY5S2QMLIO7WBOSPZUFQGXHW6FRGBR52XVV) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/fda774aa112d527356cc3ff63bdb43f481a0ae0933938e40cc38c55b74dc1a6c) |
| [GAHGOK…TYNY](https://stellar.expert/explorer/testnet/account/GAHGOKA22JKVQ3P3RBLTTRZU3J7BTNKVUP3B2BYBXPIII5WKCGRZTYNY) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/1b7690aa51928d8f5fa6df5d184311c1ed85b38985b9e99d8cf9acbdc864bec6) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GA3M3I…2XVV](https://stellar.expert/explorer/testnet/account/GA3M3IYVJYVZ5VFAZMQKCHY5S2QMLIO7WBOSPZUFQGXHW6FRGBR52XVV) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/ade77a34f18f0764cb6d87af33af6bc3ea50b984d06344565131b3c6a75c8e1b) |
| good seller | [GAHGOK…TYNY](https://stellar.expert/explorer/testnet/account/GAHGOKA22JKVQ3P3RBLTTRZU3J7BTNKVUP3B2BYBXPIII5WKCGRZTYNY) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/1a75bf8e4b063858129d9bbb0f66e042fa5499caf1ab08d72a8dd5f450e7ac7b) |
| bad seller | [GA3M3I…2XVV](https://stellar.expert/explorer/testnet/account/GA3M3IYVJYVZ5VFAZMQKCHY5S2QMLIO7WBOSPZUFQGXHW6FRGBR52XVV) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/7a3bc625fe6579feadcc0591670b6aa06cd644388c0f6d62ad42423228bca834) |
| bad seller | [GAHGOK…TYNY](https://stellar.expert/explorer/testnet/account/GAHGOKA22JKVQ3P3RBLTTRZU3J7BTNKVUP3B2BYBXPIII5WKCGRZTYNY) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/5bb89dd9ea15a2c4bb07512b432fa0e535ed96704327e8965f1ee4e3a9c3695e) |
| stale seller | [GA3M3I…2XVV](https://stellar.expert/explorer/testnet/account/GA3M3IYVJYVZ5VFAZMQKCHY5S2QMLIO7WBOSPZUFQGXHW6FRGBR52XVV) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/6f4372a508e4beae721aec4bbe08212f7dac4872034c5b22b6fda92217ad9423) |
| stale seller | [GAHGOK…TYNY](https://stellar.expert/explorer/testnet/account/GAHGOKA22JKVQ3P3RBLTTRZU3J7BTNKVUP3B2BYBXPIII5WKCGRZTYNY) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/fcd3968642304323b2e6597b403b007e61582d60f7a5988e6282923c1fe4f2e6) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/27b4f0ea1bec0ac5b57dfe7c330bc987dff57c4c0fe10d1f5f252f2e0b5c35ef) [2](https://stellar.expert/explorer/testnet/tx/a7cefe1637b12566fe3967f64c902a8f0c54118a55ad8c430694190d0a4d7984) [3](https://stellar.expert/explorer/testnet/tx/e70daeb26488addf9ce1b7aa1ef6366a01b31284c6e31db35eef2d7521623ee3) … | [tx](https://stellar.expert/explorer/testnet/tx/a58985c2baff35375c8879d0d6e19c0de201f8e60b2221594551e264c6670a5d) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/0a025637da21345b186109aa91bc17ad12673672e32dab4e04741a55af0a9d84) [2](https://stellar.expert/explorer/testnet/tx/867c20dfc28ab51fb1df19a77bef0836cd9d1394844a333f7265d6ced76ead3b) [3](https://stellar.expert/explorer/testnet/tx/1e3878a4c197085db4df9fd2a666a17682fec47203a2f8936b8c3c5665ee5621) … | [tx](https://stellar.expert/explorer/testnet/tx/27a237810dce80f5f42e37b3ac49e348c47846749a7f0c3b72bf0b6babf8f0a3) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/159360a370be0db03fb8e5de392b4b07315cae16eec5afc35e8d40bb8459209d) [2](https://stellar.expert/explorer/testnet/tx/6cf6659a39c4dc6701712d623fb876978194fc525a1f7d20f8f87f003a33b618) [3](https://stellar.expert/explorer/testnet/tx/f1c2d14fb3b9f8737788f97cc2ef2ed824ce35502892fca7d34d918e6c4351cf) … | [tx](https://stellar.expert/explorer/testnet/tx/223828fa7ac34cf1b5a72ca648c9e400258f613af5b8aa4867547fd91c525333) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/deaf7fbc71fc1f8220a279b32d13a57f92c28bbec5ff2d16f6d3fcfdac642f11) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/c96767f745fa3613acaff5d70f36890aae5da4dd3d6ee6d62db054b38436ea0c) [2](https://stellar.expert/explorer/testnet/tx/8ef3beb35ae3cfcef55a2256e834133e14c4ed136d5458568804a4bd24bc347a) [3](https://stellar.expert/explorer/testnet/tx/962b98837ddecf8d5cd4a9e7b6895af7c5a4229eda13c44f3d1b6aedccb801ba) … | [tx](https://stellar.expert/explorer/testnet/tx/7ae0482aeab04ed5577d3398720102ff39c33ce1ad4e59b69af5df9f4a69bc0e) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `878a67254980ec51…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a1d8738cab34812cd0c6bbb64722209333a1a13315be90c7220a55dd1e4fd297) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9690e8732491f94cd7a031cc5c8a7923b5df78e93ca503e7b993997eeaa2949a) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9678ef956a8d28d3b0c9f904325c6beb8d4599a8f48e8737e52ddf02eab861ba) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/5232cea148b38e91d554b8dc426b4ccf298f2b5950010ed48d9c77a85605361e)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/7d564211403e47e19d5ae55a92719200b2ea8d9d470626178c097b48ba808c9b)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 98 | true |
| `/slow` | trusted | 98 | true |
| `/wrong-type` | avoid | 18 | false |
| `/broken` | avoid | 18 | false |
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
| 4 | `/wrong-type` | no | 18 |
| 5 | `/broken` | no | 18 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/707b016ad45bc6e6572123d31d8b45f012ccafbe180e13f3ec11c57b6d33acfb) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/226e6c1e406a3e70e44d0056fc68dde748171d2f18ac28effe9898ac33f0264b) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CDMN2E…TCTA](https://stellar.expert/explorer/testnet/contract/CDMN2EQ5Y2ZB2IB3ZYVQYHYUGYZV7KI3M3MO4SSX7HFSNZ2KL2TXTCTA) ([deposit](https://stellar.expert/explorer/testnet/tx/6f863ef8b7b18e2ad1948bede72789832438ce49ccb9a32c8546df7816c242a1)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/32a4b7d3c136f174546e99e20e4dadafab94775f91a4d83d5912f1a266367628)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CBEZHU…L6AM](https://stellar.expert/explorer/testnet/contract/CBEZHUQJPE3HGQJRLU4VETGLTMMDVRBYEMDCG56YDIGQLICMR4PCL6AM) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 3.6 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/9221fbb3dce9b358c46a9d0bd7ed899bd2737110ff0670e5eb1d40c0e0e54add)) | **released** | 5.8 s |
| `/escrow-stale` | 4.8 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/b15045a4ae561fd9abf27a33a39d2e25e135548e802d3c2ba8cd0f8e6332b246)) | **refunded** | 5.7 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
