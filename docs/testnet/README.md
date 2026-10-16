# 402Scope Trust on Stellar testnet

Run finished 2026-10-16T10:06:33.972Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CANVR2…C2SQ](https://stellar.expert/explorer/testnet/contract/CANVR2OR3QNOCY6RAXMI33FRLCN2FFGLW3R3NISOT5NVE2OSCNK6C2SQ) |
| Trust policy (OpenZeppelin `Policy`) | [CBEE2H…4DJ4](https://stellar.expert/explorer/testnet/contract/CBEE2H55GBVTOYYL7WVNL6RVSACYCTCIHM35LEEXF2RHVR2CBXMJ4DJ4) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CADSEK…YGCF](https://stellar.expert/explorer/testnet/contract/CADSEK4BAJFFDFLBUHFGUAMU2ZB5N6F5IA2DHZUPCJHTH3AJKOGZYGCF) |
| Spending limit policy (rolling window, x402-compatible) | [CAXRUV…QVER](https://stellar.expert/explorer/testnet/contract/CAXRUV7SR6X74Y4KQ5P5RZXRGTFZSEQJWUFZQIK3FXHJ2VQCAEDCQVER) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAMWOC…LRNR](https://stellar.expert/explorer/testnet/contract/CAMWOC34HCGVYRKYLQKKZZELY3YLCYNPNLQYGXTH4HET67GJLP6DLRNR) |
| WebAuthn (passkey) verifier | [CDII6T…X6IR](https://stellar.expert/explorer/testnet/contract/CDII6TXYLYTPBDULEO2WFVH2EJCRUB5XOU6ZYDC5SB6RAUG64FZVX6IR) |
| Refund bond (optional seller bonds, no admin) | [CANCUW…AOXP](https://stellar.expert/explorer/testnet/contract/CANCUWIVUZEPCD7GUZHUXTDYX3E6YJFBSVUSPLLYCK3UT4AKZMV6AOXP) |
| Escrow (x402 scheme `escrow`, no admin) | [CBMNQK…FPJ5](https://stellar.expert/explorer/testnet/contract/CBMNQKCQ4NDJXGWOQMQFCZ3UMAXUEHUHKZ4YOMRJGXZINQV2VKEUFPJ5) |
| ed25519 verifier | [CD4KHJ…QNUC](https://stellar.expert/explorer/testnet/contract/CD4KHJJ7IVQRNQL5BDUPI7HRTI6EIG4QWISCXQX742EVEYUOTA43QNUC) |
| Test token SCOPE (SEP-41) | [CBU6O2…Z7RN](https://stellar.expert/explorer/testnet/contract/CBU6O2TQPCIMSS5W2SZW75X6P6AUUW7FI5MWOSJW2OMXYEN3EUQDZ7RN) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GAWIE2…3D2B](https://stellar.expert/explorer/testnet/account/GAWIE2F7GG5TTF63WE6PIBDFE5BQCZWHAA42XZDCYVKPDKUTCT7Q3D2B) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/40d3b494ea072734e399045da444f2f88e629bb9d23fa91d3401dcdd9aa9a328) |
| [GDCRXW…5R3Z](https://stellar.expert/explorer/testnet/account/GDCRXWTZSXGZ445NII223CWMMZF7FRJXWX3SDCXEWZTC4KFHCBBZ5R3Z) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/ef0bcb80cb46bab8d63237ddbec7eaa486cb494d71e149740938c54ef17af31e) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GAWIE2…3D2B](https://stellar.expert/explorer/testnet/account/GAWIE2F7GG5TTF63WE6PIBDFE5BQCZWHAA42XZDCYVKPDKUTCT7Q3D2B) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/1f34fe17307bd5bd5df7a57627e8b76e11d6c92c094acb951675703cce414063) |
| good seller | [GDCRXW…5R3Z](https://stellar.expert/explorer/testnet/account/GDCRXWTZSXGZ445NII223CWMMZF7FRJXWX3SDCXEWZTC4KFHCBBZ5R3Z) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/7493e56055818abfd26db91505fed9b974c3a814878b70418b0b836d734cf1e5) |
| bad seller | [GAWIE2…3D2B](https://stellar.expert/explorer/testnet/account/GAWIE2F7GG5TTF63WE6PIBDFE5BQCZWHAA42XZDCYVKPDKUTCT7Q3D2B) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/2d3eabc4d78e41ea6a8e135695b34f9045ad5976d81c2387156d2524843084e6) |
| bad seller | [GDCRXW…5R3Z](https://stellar.expert/explorer/testnet/account/GDCRXWTZSXGZ445NII223CWMMZF7FRJXWX3SDCXEWZTC4KFHCBBZ5R3Z) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/c37d3061d0157e3da67462aecea62786933af1506e65b373ce7440af9850c5d9) |
| stale seller | [GAWIE2…3D2B](https://stellar.expert/explorer/testnet/account/GAWIE2F7GG5TTF63WE6PIBDFE5BQCZWHAA42XZDCYVKPDKUTCT7Q3D2B) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/f9d2739dd4649c8671c37ec054ba043acd742ca38933f6b276e9d35baad849a7) |
| stale seller | [GDCRXW…5R3Z](https://stellar.expert/explorer/testnet/account/GDCRXWTZSXGZ445NII223CWMMZF7FRJXWX3SDCXEWZTC4KFHCBBZ5R3Z) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/e09ea0ad41dc7b77f4f94e4f829d617ba5e6419b30ba0c52292bdd6ae18b6324) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/81c930955c8172c2e712975e198888ead00fe91ba56b73512f910299cf79c793) [2](https://stellar.expert/explorer/testnet/tx/73b08824d7dadf8fae15f9573f0ce1b359eccb3166c8c4f734da480112bf59f7) [3](https://stellar.expert/explorer/testnet/tx/5eb11c42be94b1a4ed4a5f02f2afbb61126333155e94c1fca30f35dc29516390) … | [tx](https://stellar.expert/explorer/testnet/tx/3df357758bdab4e7aed3c2db47e08fa7dd7f4fd586ca8d8b6f1fa32dfa83ce7b) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/75a6bf902096469652a2da0ec828d4cf2979d72703d410d3419f5c635bf7ee51) [2](https://stellar.expert/explorer/testnet/tx/ebb03760fe37b26bf2d35f038056dc74937905af356dabc58240d72a61fadb13) [3](https://stellar.expert/explorer/testnet/tx/7c991bee118215ebd42d9d13c383a38b87c037bc03bc64ffe27e1d673d146c16) … | [tx](https://stellar.expert/explorer/testnet/tx/ba535e45b58404a0924254413db989854980573bc615e4af925fe6793c6056b9) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/72468828cbe7a2e5aa36ccf11195710e59e4a8f08d638300db542cd1287bf671) [2](https://stellar.expert/explorer/testnet/tx/2d8e35fea3d2d68022d4a531e7b2d5604f812a5ceb65a9f5f74a60981e48329d) [3](https://stellar.expert/explorer/testnet/tx/59b5d7b71200480bc45d476d970d67a0fd1a549ad8288dd72574fe08baba12fa) … | [tx](https://stellar.expert/explorer/testnet/tx/384eea508119f3770874d6e61e8debe9455b3fbaec45d8a288c6ed864ca2c845) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/7c2673d7cbda3d13a29ebdd4bba6cc59655bdc9276a5d0816b62790275897fef) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/f4d489bae392d6941f911f884066db9a801f9b55f109186e8ba7ae70af933cb3) [2](https://stellar.expert/explorer/testnet/tx/5e6ccdc7ab7a096c8fa5d8f613ea2c6e2f20fead8eb471df42b59cb25d1843a8) [3](https://stellar.expert/explorer/testnet/tx/133dfb29fd9c18131d4989775798dd024becc421b67a07e764ccf011069e3cc3) … | [tx](https://stellar.expert/explorer/testnet/tx/5f398f7cd9c14e88f731e002c1e8dfa2fd5103b441b1dff485bf6a77a4ffce0c) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `c309de6dccc53726…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/935b6b5549046d5ffebca825eb5ded4a707392c3d380138b7269b76057e91b16) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/0bc3fd4b55e0c8d8a7fdbd302ddfe12f6232c8493904242e6721a1bfea3bd080) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/749d5bd31b2542fb855a29ba0d12911c272149a353b7da9c8ae72df7ed44c92a) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/b2da099167e8ea3a78fe72ee28ce765bc626347eaa20c0d8ba5263bc7079d996)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/6feb7b1daa8e6b3133a699ba0e24e03a6469a06d865b9e50349bd3f9a39f3448)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
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

Facilitator decisions: good seller allowed (score 95); good seller allowed (score 95); stale seller blocked (score 50).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 95 |
| 2 | `/slow` | yes | 95 |
| 3 | `/stale` | no | 50 |
| 4 | `/wrong-type` | no | 18 |
| 5 | `/broken` | no | 18 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/c34040b1f0b70336f6a18ef7c255669a28cf8b3e6662831c8c61573f7ffae395) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2ecf0c82fbc1c08c9d207ecb744a14610e1c690b732c45227b0fe6dfcfacf892) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CANCUW…AOXP](https://stellar.expert/explorer/testnet/contract/CANCUWIVUZEPCD7GUZHUXTDYX3E6YJFBSVUSPLLYCK3UT4AKZMV6AOXP) ([deposit](https://stellar.expert/explorer/testnet/tx/b9a7df75e7d69123d2fe4c04bb6de110e3128b5c690515d8a142788f9bcb2a23)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/504bab087146ce6448882b6f55887d0bf11a82911d0e96ffa68abbf70d444f0b)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CBMNQK…FPJ5](https://stellar.expert/explorer/testnet/contract/CBMNQKCQ4NDJXGWOQMQFCZ3UMAXUEHUHKZ4YOMRJGXZINQV2VKEUFPJ5) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.1 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/1943e4889ac9e97765e0f28f75522dc54a4bcf4dfef1686ad6c6a318a5bdfd28)) | **released** | 5.1 s |
| `/escrow-stale` | 20.2 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/ddebc3b29e63f7f231df867115626b130cd490a0db9db35e4d784ddece1368e6)) | **refunded** | 4.8 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
