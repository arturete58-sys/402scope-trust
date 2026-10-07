# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T19:32:29.611Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CDYXZM…DXSH](https://stellar.expert/explorer/testnet/contract/CDYXZM55IHVX7UJZQRPQ5POY3JO63A723XAHXXPHZYOWTQKAHVMCDXSH) |
| Trust policy (OpenZeppelin `Policy`) | [CBJA6X…KQRE](https://stellar.expert/explorer/testnet/contract/CBJA6XDQFIRHRN3HW5KMYK3V6OXMUGAVCYPYU254DNC2EDPGAZ3QKQRE) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CC2ZLI…EYQV](https://stellar.expert/explorer/testnet/contract/CC2ZLI3SG7RQZVAP22CDBJDZCWIQ7JHVIYIFBGUPXKPWGY5LKLMQEYQV) |
| Spending limit policy (rolling window, x402-compatible) | [CBROXW…6FS7](https://stellar.expert/explorer/testnet/contract/CBROXWOC27PRCPN3COUUNIM4WPHOGVDOB7VSPCABABHUDPLJU5K46FS7) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CB2RM4…IOMM](https://stellar.expert/explorer/testnet/contract/CB2RM4D5LYBM3RAP2ITF3LEMKUSGJ3X6B3KLWA4NRFZ5A7OVSSONIOMM) |
| WebAuthn (passkey) verifier | [CDKHYZ…3DAH](https://stellar.expert/explorer/testnet/contract/CDKHYZXDGO7WTMAMXNNYWYLJARR765DV2UQB6NJCJ4A6I2DOA3IS3DAH) |
| ed25519 verifier | [CDQQPC…BDZD](https://stellar.expert/explorer/testnet/contract/CDQQPCBKFLWIUFSFQWW4UK77AAFSWWFLUB46545PATGDT33ZQLMZBDZD) |
| Test token SCOPE (SEP-41) | [CBF46Z…AEYW](https://stellar.expert/explorer/testnet/contract/CBF46ZGXL4BWQ45V26ZCRL7QZBUBOQAEDFZMPPJKNUG4OTAWIL2GAEYW) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDFGT7…UNN7](https://stellar.expert/explorer/testnet/account/GDFGT74AIN6UNTBHQGQSTKFF3IW3NRBSU4OSSWINKTSFEI26LUUVUNN7) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/02d0f83e0ecd42786c579eaa5730f73fe33d252d868c281a442a2954e4d09cad) |
| [GB62AP…57BN](https://stellar.expert/explorer/testnet/account/GB62APEKMXT2K6Y3P5RDFOUDMTFXSB6BO5WJZ7K2AA7YCRA3BJ7V57BN) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/8215eebc2cc42d5ef1da9d7283278ee8721f67c74a509a50a7ad61013f0c1146) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDFGT7…UNN7](https://stellar.expert/explorer/testnet/account/GDFGT74AIN6UNTBHQGQSTKFF3IW3NRBSU4OSSWINKTSFEI26LUUVUNN7) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/fe124c843162d5ffa5933130d6b88e48dfdb11afe3908524ec357e603c7f29de) |
| good seller | [GB62AP…57BN](https://stellar.expert/explorer/testnet/account/GB62APEKMXT2K6Y3P5RDFOUDMTFXSB6BO5WJZ7K2AA7YCRA3BJ7V57BN) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/df82edbab5e8906ef99c5a5fd2749c603fb1fc9d953455d3e401986c1a3c76e9) |
| bad seller | [GDFGT7…UNN7](https://stellar.expert/explorer/testnet/account/GDFGT74AIN6UNTBHQGQSTKFF3IW3NRBSU4OSSWINKTSFEI26LUUVUNN7) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/7fa668c9dd707320e4298571764fe582987c8a7292949810a38a7e3c560ebc98) |
| bad seller | [GB62AP…57BN](https://stellar.expert/explorer/testnet/account/GB62APEKMXT2K6Y3P5RDFOUDMTFXSB6BO5WJZ7K2AA7YCRA3BJ7V57BN) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/3d57b494f9003e3c151f789eedd39cdbd78bad4b60c0857a42e76d4a73caabbc) |
| stale seller | [GDFGT7…UNN7](https://stellar.expert/explorer/testnet/account/GDFGT74AIN6UNTBHQGQSTKFF3IW3NRBSU4OSSWINKTSFEI26LUUVUNN7) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/5f71c14ff0a0fa5819042bd9e87f7b814a71be3073e4fc0226f949d018a22a4a) |
| stale seller | [GB62AP…57BN](https://stellar.expert/explorer/testnet/account/GB62APEKMXT2K6Y3P5RDFOUDMTFXSB6BO5WJZ7K2AA7YCRA3BJ7V57BN) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/00f6e67530350d5565f963f08fad128fc57b8e656f75d3c24651eaca0f7c8931) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/db98b85a1946846d30f9b1be975e4cd39d08b81d7b2e85dc0123ff3c4114948a) [2](https://stellar.expert/explorer/testnet/tx/3a1587418aaf12ce6db96660d2ac7ec60ab7a4030b51a68ace604abac7673fc3) [3](https://stellar.expert/explorer/testnet/tx/94ed3f2947fd7cadec89a47c0c5f66046dff33d2ca0faadffcb6a8c754767dc9) … | [tx](https://stellar.expert/explorer/testnet/tx/f509fcf234e4332ee0fad6c1f73fa78e15bb9d37444769dc2d8167691acae298) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/6a8e8bd796b9fbc45d1029a6894319fcbd247e7989e3f30adb074ae3372d083e) [2](https://stellar.expert/explorer/testnet/tx/f1d6b4f4064172834eac538c922689445eb74f8ec0afaee7c70088902bbad23c) [3](https://stellar.expert/explorer/testnet/tx/4fdfb5f89d61ca9152768d16390625f9c7dfaab8a586209cc7fbaf0389392cb8) … | [tx](https://stellar.expert/explorer/testnet/tx/1b2d62e8add36c0142dc99abde389e9b6878f907e50bed53b995261ec522fa3d) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/880d6c9113cc762efeff2a211f5a472893233630efe48a2ad6dff6c010153aa7) [2](https://stellar.expert/explorer/testnet/tx/8b989d5d76667072d118b67aacf918e6979a162271deaf4aa2268f368cf21ffd) [3](https://stellar.expert/explorer/testnet/tx/7becb95183e90af8975e76e1ecafb3ccd23a706e354ba63279b62da89c9bed6b) … | [tx](https://stellar.expert/explorer/testnet/tx/f44d27c399559ee784b19596de4a37650ac36d13b5f29defd3e7c5b6862c2412) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/272c966ea022155ab3129e515f1d239a7f2813a33d027a33d36ad1f5d4f1bf18) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/a210d6f58217c6e1f2b0c6afa05c62197ac93b8fe5543ac842c1e08229e6f984) [2](https://stellar.expert/explorer/testnet/tx/4364466b96d1c46c62e2a1e74afcdd4a312e715979357007acfcdf42580942f3) [3](https://stellar.expert/explorer/testnet/tx/a09b721ccf56d793efb0e17797eda95e9c0c5cd1f73603cf464f56c53c2d85e3) … | [tx](https://stellar.expert/explorer/testnet/tx/daef95d67b6de3f7bed2ba3e861cccf983713cc14384ea42cc5374b173e03554) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `52b82020c907b308…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a17a30393d62227d7e47cf226119b0f20790f257deac647b664fe9f9ed7d2c4f) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/fc1b294ab1731c94d4055e17deffc96a1efde139161a07ac3a6d476bb826bb5e) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9200a4ebc825cfb7ae7ae38399940880b764bb54ca8db03ed0f6cbf01d7b10b3) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/0cc64b1e628f71fc16bd61f12771f8b745d4bbe2b7749857c5e851728d9dcb15)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/ea5485603fe371553819d0aba8d2a15b1a791145eaaebc8d83754f126dcdb648)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/96c60a3857f25c0f4fd59555636f3ca6f263be69fcd7b467ee06a1ffc67a50b4) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/cef3973999018549adec35aa500b7900e3c133adeb212ec6530118715183d675) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
