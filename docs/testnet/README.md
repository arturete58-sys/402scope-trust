# 402Scope Trust on Stellar testnet

Run finished 2026-10-26T11:23:29.692Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CAKL2U…XB7O](https://stellar.expert/explorer/testnet/contract/CAKL2UFJ3RVG6EWJTQ5MYZ64MXRQOFVDHIEM3WVQ54R2Z25Z5FC5XB7O) |
| Trust policy (OpenZeppelin `Policy`) | [CBPIJV…FEAM](https://stellar.expert/explorer/testnet/contract/CBPIJVTABJPCAOTHF3F76ESCJ7X57Q3OSP7TPE3CH575ZWBGTDWNFEAM) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCAO7Q…OG5A](https://stellar.expert/explorer/testnet/contract/CCAO7QJF4AYTXVLIW5XLCKBRDZBHMXCW756LJ3NMZKH6LT3EV45GOG5A) |
| Spending limit policy (rolling window, x402-compatible) | [CAVW2Y…HSPK](https://stellar.expert/explorer/testnet/contract/CAVW2YBFRLXCY46R2ZF4AT2BG5BVJ47RJ5UNSK2KEOHTWALZ4EUXHSPK) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CCEYAZ…WQR2](https://stellar.expert/explorer/testnet/contract/CCEYAZQGANMZURAJ4D6AZQZ3DAXFNHVSKMLF3XYWKAKVDYRAQUKVWQR2) |
| WebAuthn (passkey) verifier | [CB27YE…COVZ](https://stellar.expert/explorer/testnet/contract/CB27YEQOXN3TBRGSFPQLBCNXYSZDBV26YNKQILTIW2SUULG7FKS7COVZ) |
| Refund bond (optional seller bonds, no admin) | [CDM3ZP…AOST](https://stellar.expert/explorer/testnet/contract/CDM3ZP3LSN7ROWKF7BKHLLOCANE66EBFCJ2BFM5SK4S4MNKXJUDUAOST) |
| Escrow (x402 scheme `escrow`, no admin) | [CDXLTO…BNBJ](https://stellar.expert/explorer/testnet/contract/CDXLTOEEDMVCWMOBXTJVNBW232V2Y25R64SR7VGXBSDJYIV3XK7ZBNBJ) |
| ed25519 verifier | [CA5OV6…Y3KV](https://stellar.expert/explorer/testnet/contract/CA5OV6J5ITKOMPIPTWVJQOJZOPR652WOQIZL7WKLVJUUL2KOTNQGY3KV) |
| Test token SCOPE (SEP-41) | [CDJIHK…AM4P](https://stellar.expert/explorer/testnet/contract/CDJIHKHEGGEPMPDXQ5TR32NEKXPUSYLK5VX7MJEJSAOFJJVDHBRFAM4P) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GCBNXC…OSG2](https://stellar.expert/explorer/testnet/account/GCBNXCQDSXU5LHQFR4ADBEOHXKDOOZP4LMTU7A5IER26OS7VYWCPOSG2) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/c25c272327b490f65f9efdd2f3e871bd63f8b11c80deec330b9fce5d89d2d92b) |
| [GCAGYW…Z7GG](https://stellar.expert/explorer/testnet/account/GCAGYWE2ZOQ6XDG3OMD4V3KY555EFBURV7XPYGQXP435CDXS3JDQZ7GG) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/0db72d41b0becfbfcdbf24dbbbbb6832bb3f3bdbd42befc3c6d84828663c6540) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GCBNXC…OSG2](https://stellar.expert/explorer/testnet/account/GCBNXCQDSXU5LHQFR4ADBEOHXKDOOZP4LMTU7A5IER26OS7VYWCPOSG2) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/165074b4fd9917b3ab2d66812e32f05f43f651c14d48454cd05e31f1fca18530) |
| good seller | [GCAGYW…Z7GG](https://stellar.expert/explorer/testnet/account/GCAGYWE2ZOQ6XDG3OMD4V3KY555EFBURV7XPYGQXP435CDXS3JDQZ7GG) | 93 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/eb4e41e22618beb1c893dce24f64241686967f341b45f2b670daed4157f0d5f9) |
| bad seller | [GCBNXC…OSG2](https://stellar.expert/explorer/testnet/account/GCBNXCQDSXU5LHQFR4ADBEOHXKDOOZP4LMTU7A5IER26OS7VYWCPOSG2) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/ee71f6f6760fbe374afafdc068baf173cfa926ee74ee016fbe4a4a461ec64c27) |
| bad seller | [GCAGYW…Z7GG](https://stellar.expert/explorer/testnet/account/GCAGYWE2ZOQ6XDG3OMD4V3KY555EFBURV7XPYGQXP435CDXS3JDQZ7GG) | 13 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/4781c00e992f8cafe6fd8f8dd7be4c320cd1a8be100d744a149ebd54e7e6025b) |
| stale seller | [GCBNXC…OSG2](https://stellar.expert/explorer/testnet/account/GCBNXCQDSXU5LHQFR4ADBEOHXKDOOZP4LMTU7A5IER26OS7VYWCPOSG2) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/0f40c07f326037710f0e2a3a3466430583e09476454082b1ad27512ff9af4ba9) |
| stale seller | [GCAGYW…Z7GG](https://stellar.expert/explorer/testnet/account/GCAGYWE2ZOQ6XDG3OMD4V3KY555EFBURV7XPYGQXP435CDXS3JDQZ7GG) | 45 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/e0185198010cc3227efeb583fc8c9f6ef9618afa65c03f15b3ded9b92bdf5f16) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/44d35f9377b024d789add76d91f86e111cf773125ebe149f58363f7d5143a991) [2](https://stellar.expert/explorer/testnet/tx/81e862d9162be8bf47ce427057ab4895dba5d60d2d154f6c68bf8c022779fae8) [3](https://stellar.expert/explorer/testnet/tx/d80b09e33df91fb11557eec77948af79e6695f6430180624f483b8e3c9e4da89) … | [tx](https://stellar.expert/explorer/testnet/tx/13800085b5221573983c55dc1f36a7d8be8099735f238ffefffefa39ebb5d8ae) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/e8af93c9ce084d61da28bdf79c3d30e02e1f327a0aafcb5519fe4c67881ef994) [2](https://stellar.expert/explorer/testnet/tx/4a55c3b2f64ed363157be56c2822188885f4c233850f83e07227561bc8142ddc) [3](https://stellar.expert/explorer/testnet/tx/7c3b88861ca660a6fbebf8ef8da3845729783256ccf3ca94bc9eab90dc61a49b) … | [tx](https://stellar.expert/explorer/testnet/tx/af24b162409b8332cfc6fb03c55373f6fcf665f31b65a7c0980a073b85225d36) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/9ce9cd721df8d0f3608a78480f1424404f5335ab43e504def5188cb0520c5286) [2](https://stellar.expert/explorer/testnet/tx/9bc7d5f629d6048aa37b83686cc599422712401c1266abdc91d08905a661a086) [3](https://stellar.expert/explorer/testnet/tx/82fc1826ee16a4be0345ea8e1633931df00756e94509eb0c75133aa168225c17) … | [tx](https://stellar.expert/explorer/testnet/tx/52f5e60acc25c4903344cc7f27bde2e13147c85535d4bb0d4515a2714bd24c97) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/99269684561d98e3685741d8116f2ded916851e3a7443b1debae4d839fd62f2e) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/3c7a4acb266adb4ebab091c4b99c2f53fb159133ecb7edcbbf6652bce41d0c63) [2](https://stellar.expert/explorer/testnet/tx/985519f86a9245128ad9eeebe2e950f751c1037c93b17db70180a3c7b3de0509) [3](https://stellar.expert/explorer/testnet/tx/aba01f1701c62b956a8a3a6b7d854d50bb553be7f722b639e904663e62a0f60c) … | [tx](https://stellar.expert/explorer/testnet/tx/f8dec47f27a185acb5cd19a61273646cbdf6b9cc43d50ac90e92b5adaa71c0c2) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `0dec52bab3e705a1…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/b0fa52e83bce57676b13a340cfe1f79408e580cdbd34b0f54460ba431b93a630) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/ec8221c968f2e496e9cf8d9df2c708405afbc0ebe0b39ee5891b88f072b9a84b) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2128b37de625030e67b51b192cd935d67f9eff789cabe63361a9093ce6fa9cac) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/0d85115369fbf1e8385cffcd2f958e44ac43d397db64f909911b34887c2ea5f6)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/62ad4d872e7f4d91c0c8bc2544a9391ea032b2c721cfa00e80e8ce8f58a1cc09)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 93 | true |
| `/slow` | trusted | 93 | true |
| `/wrong-type` | avoid | 13 | false |
| `/broken` | avoid | 13 | false |
| `/stale` | caution | 45 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 93); good seller allowed (score 93); stale seller blocked (score 45).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 93 |
| 2 | `/slow` | yes | 93 |
| 3 | `/stale` | no | 45 |
| 4 | `/wrong-type` | no | 13 |
| 5 | `/broken` | no | 13 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/af72e3c57079bd4d670c4bec2f96484a22d62d82a110ecd6ca5710a70ff29c38) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6c38f917b9d6049b90109e7b09afc16090bcd4d215b4ef54e5a3fbd45fbc744e) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CDM3ZP…AOST](https://stellar.expert/explorer/testnet/contract/CDM3ZP3LSN7ROWKF7BKHLLOCANE66EBFCJ2BFM5SK4S4MNKXJUDUAOST) ([deposit](https://stellar.expert/explorer/testnet/tx/dd079e8b1bba00b007c4584f387f29742eed8867a7d17aa9b3e00bd4d31de309)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/d83c4f7e33ffa3aa21f9cdb468d1be84802cacde913cd964729693859c8aa44c)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDXLTO…BNBJ](https://stellar.expert/explorer/testnet/contract/CDXLTOEEDMVCWMOBXTJVNBW232V2Y25R64SR7VGXBSDJYIV3XK7ZBNBJ) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.7 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/5a504214af1766fbeab252eeb5a445add0338def48fadf4cd8c490b3905a27cf)) | **released** | 4.8 s |
| `/escrow-stale` | 5.6 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/4124bd8464c1977eb67daacdb3ccf404eb2c04f812b0709ada320f220e0c89c8)) | **refunded** | 5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
