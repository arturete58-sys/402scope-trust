# 402Scope Trust on Stellar testnet

Run finished 2026-10-08T18:31:10.040Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CCJXZ6…ALYI](https://stellar.expert/explorer/testnet/contract/CCJXZ6GRH3UTYUII3XIT6SYX4TCJWJHTYBOGSE42ZIWB6WKCYMFRALYI) |
| Trust policy (OpenZeppelin `Policy`) | [CDNGAP…D6XR](https://stellar.expert/explorer/testnet/contract/CDNGAPGKWU4J5MTL7BMSX4G53H32JCLPA2WNPK3ZQLJF3JJCVCTED6XR) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBCJZ2…QZVO](https://stellar.expert/explorer/testnet/contract/CBCJZ2YGLUMPA5KWSHP2IFYGYBZL76TY4WWLWOEJYE46AWT3AI7XQZVO) |
| Spending limit policy (rolling window, x402-compatible) | [CD4Q6G…TOYW](https://stellar.expert/explorer/testnet/contract/CD4Q6GHCZUNJMJBF24GN5BK3DVMF5KHJKTLCCULCOO34SQAQYRI7TOYW) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CCOFOI…N3NF](https://stellar.expert/explorer/testnet/contract/CCOFOI7YJVID4GUTAQRC4J2NGYJD7OELJOL5YUPIZVW374UONG6BN3NF) |
| WebAuthn (passkey) verifier | [CDSKVV…OUU4](https://stellar.expert/explorer/testnet/contract/CDSKVVQQ6JMNNYRIIGQ3JKJCMQ6RDLX4ECOQPFVWJMMQQ4O2DLWVOUU4) |
| Refund bond (optional seller bonds, no admin) | [CCNNKJ…ZMFM](https://stellar.expert/explorer/testnet/contract/CCNNKJ6O4EHESRSVH3AU5HIGDSDRLVQGWAOPQCPGV7STCIIGIVLSZMFM) |
| Escrow (x402 scheme `escrow`, no admin) | [CAI2YO…DWGN](https://stellar.expert/explorer/testnet/contract/CAI2YO2I5WBYVGC5QSOBTVVBOCY6V5XCT5Z2S3OJM4GU3B6VRB4ADWGN) |
| ed25519 verifier | [CCWGUB…NTMF](https://stellar.expert/explorer/testnet/contract/CCWGUBG44QWOEB47D56NFQYUM52OPPGTJSJZVY3EOCHOYRXMQQWFNTMF) |
| Test token SCOPE (SEP-41) | [CAPCXJ…Z5C2](https://stellar.expert/explorer/testnet/contract/CAPCXJBRCJWGYXBMOJ7BIB23B3TWQGYZCNDFK7AQ6OF6HGFKJGWNZ5C2) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GC7W7C…TV4R](https://stellar.expert/explorer/testnet/account/GC7W7CDLYMRSDGZNQJNUVE7Z57VPFNQV7F5GBBACZHMVHOXJ2VLYTV4R) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/dbd0537ebd46cbb9f2ea8df49e0205594c022b32dba867f4934f04d4d39fbfb1) |
| [GBSRAN…GI26](https://stellar.expert/explorer/testnet/account/GBSRANJPTNZ3IVJUO4XXMXIELQGGXJOESVSBMKWZUBC4CEVEPWKOGI26) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/02fa97960737e8b4fd91bafaa48616e49fc7ad71aef4f67e609537e9e71743dd) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GC7W7C…TV4R](https://stellar.expert/explorer/testnet/account/GC7W7CDLYMRSDGZNQJNUVE7Z57VPFNQV7F5GBBACZHMVHOXJ2VLYTV4R) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/aa6a5209460ea5536b304697b8d1edebd52f73c47ede087b0c8e98caa9df8adc) |
| good seller | [GBSRAN…GI26](https://stellar.expert/explorer/testnet/account/GBSRANJPTNZ3IVJUO4XXMXIELQGGXJOESVSBMKWZUBC4CEVEPWKOGI26) | 95 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/06d9f0c8c5649b134bb11051141ac6cf4611ccf3ea33a0096178811e99c99c38) |
| bad seller | [GC7W7C…TV4R](https://stellar.expert/explorer/testnet/account/GC7W7CDLYMRSDGZNQJNUVE7Z57VPFNQV7F5GBBACZHMVHOXJ2VLYTV4R) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/8ee71519a2d8bae6ffe5b4fa2a46e7da2d099efcba8ff0f39dcb7cc31227478d) |
| bad seller | [GBSRAN…GI26](https://stellar.expert/explorer/testnet/account/GBSRANJPTNZ3IVJUO4XXMXIELQGGXJOESVSBMKWZUBC4CEVEPWKOGI26) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/3f000636a9d580293f59e3177cd38ccdded0f259f897c5377fefc7d68314ff2e) |
| stale seller | [GC7W7C…TV4R](https://stellar.expert/explorer/testnet/account/GC7W7CDLYMRSDGZNQJNUVE7Z57VPFNQV7F5GBBACZHMVHOXJ2VLYTV4R) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/484fe48745197eedc71d8a47bec14fbf14ed9939a780b3dc0f1edecfadb20e34) |
| stale seller | [GBSRAN…GI26](https://stellar.expert/explorer/testnet/account/GBSRANJPTNZ3IVJUO4XXMXIELQGGXJOESVSBMKWZUBC4CEVEPWKOGI26) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/583e05cc0134b1a9ab73b1ff4f1d6bc0c3568740e351bc6b1d865de6bbe62c3c) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/4b1c6621dccf1d5d6a5b4c87d1ea51bb28d9b1bb4c14afce20866ba28456e427) [2](https://stellar.expert/explorer/testnet/tx/e4b19f8fc6b9a085a09cefa90ad87b75709c6baad1e45e37c27a08fcb4533d57) [3](https://stellar.expert/explorer/testnet/tx/814ed902faef122719e43761ad479769c7084b90d892447dfb878d3e2e97ecc2) … | [tx](https://stellar.expert/explorer/testnet/tx/cb48e5ddf83be3b21ba8f6b5e397b2ec5e30c3a41cbce7a21e2df8691dd81ead) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/6f55ffc563613985547d8565d216d84ed9cb93454e63111e47296e0363fda4d2) [2](https://stellar.expert/explorer/testnet/tx/ee01dbc628bfce5177d9aec8aee39c346e62f088f43efd693c6d4bb56e332df0) [3](https://stellar.expert/explorer/testnet/tx/f078a6c5acb7579163d64ffb3afefec68183c74369d2b8eb77eaf809cc53f72a) … | [tx](https://stellar.expert/explorer/testnet/tx/2a30898130b14a2224980b39d04e61b0e019576cd7bcb23773ff94e673fa8fb3) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/b9743011f234908d053acb3666e1b3cfda867aa85fc764c3c04378e560dd15b5) [2](https://stellar.expert/explorer/testnet/tx/3bf5a11df82852af17f953a217d9ff849943330e0b94ca0c73689dc6aabf2467) [3](https://stellar.expert/explorer/testnet/tx/d3e1eac747945dd7b9f116671f429b78a450bbb304b2dcaa65ed45e744c26982) … | [tx](https://stellar.expert/explorer/testnet/tx/ff8a386d2f5b6d936724be572d57f30c59f27069699fcc1c0fac11d557145d8c) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/e4f6358cf09b883746e53743127429cf32a45e5499096db1b9f66d0b0d287a99) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/a81f09d8f1a18d49786079f5e5fe88a6077bb9aab4f593f1b5ca641405308191) [2](https://stellar.expert/explorer/testnet/tx/a875ceeb3e1d07ede1ca1758544acce0281ae3857278f71d318a261410c70771) [3](https://stellar.expert/explorer/testnet/tx/0a967df651381f3368387be4d3335486787527bf61e0f077ce4db7501e0826ab) … | [tx](https://stellar.expert/explorer/testnet/tx/ae67dd8af028f56f97e6db9a5f79285b437f102c084494d4910077d2e663a287) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `1ff3a05ac0d22289…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a1b0b6005c434b080dc3d0d2c3aa5dfcdc3feceb943d05f7627085370b494bf1) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/69ef6981c38e7dc75f9c3f0acfb19d2719b8576340820150a4f9455fcecc25dd) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/001a472cd2504ce6337e2c0d11816306eff9935275dce0ee1bd622a14e9c0354) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/2e72fdfecda25d751cdbb24c7e9a6bde606dd5d65d0744e946ce9458bd76b921)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/a3c1efd6cfca1f08e7f1d74073447ee0f975f6c972e423cf3cf895aab3a4290e)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/32888db3353e7d86c2c9cce66a452b3ddf483001a9d4617d51f8a54b5c321da5) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4cfcc80742d4d77d8c1304a376504a807150df6f9ad3f003094d5d587b019682) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCNNKJ…ZMFM](https://stellar.expert/explorer/testnet/contract/CCNNKJ6O4EHESRSVH3AU5HIGDSDRLVQGWAOPQCPGV7STCIIGIVLSZMFM) ([deposit](https://stellar.expert/explorer/testnet/tx/945d46122dbb05c4ee47dab1278b99a08911f0bd30f24d1b3d022c76bb8d511a)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/37c703ceec0b7147485a0e7b2bccd1192dac0c4a76927c67fa2bc068c3abd7db)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CAI2YO…DWGN](https://stellar.expert/explorer/testnet/contract/CAI2YO2I5WBYVGC5QSOBTVVBOCY6V5XCT5Z2S3OJM4GU3B6VRB4ADWGN) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.7 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/2fde2c0b615aed9b3be4363aa214c67914aa38cdf177b4259c5adaa24866159d)) | **released** | 4.8 s |
| `/escrow-stale` | 5.2 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/b6c3cb25ac28ad8463cec8dd986c4fcfae3512cbebca86f8dda92570be6e0d95)) | **refunded** | 4.8 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
