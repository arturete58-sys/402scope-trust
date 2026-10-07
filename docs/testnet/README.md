# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T13:24:40.018Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CA4T3L…JJXE](https://stellar.expert/explorer/testnet/contract/CA4T3LMZFJCWZAOM3LISUKXQLPSWPKOMGD754H3LEWQ7YIO6SLNYJJXE) |
| Trust policy (OpenZeppelin `Policy`) | [CB4U7R…ZI3H](https://stellar.expert/explorer/testnet/contract/CB4U7RNP4HKEYKMKDH5WGBUMKKSCTONTFTU5LLEFWNK3I2IVAUO3ZI3H) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCKM6D…22PF](https://stellar.expert/explorer/testnet/contract/CCKM6DIREX7OGJCBSMXGS6KYW373WPERWZHLSAFRK2WJFZRW2N3Y22PF) |
| ed25519 verifier | [CCWRBK…AFSB](https://stellar.expert/explorer/testnet/contract/CCWRBKVPQ2VWJ23SEB3AT2CW6E7RHVOAUDSCFQBC43BCTM6YL744AFSB) |
| Test token SCOPE (SEP-41) | [CABZGT…RTUP](https://stellar.expert/explorer/testnet/contract/CABZGTOMPGDRG5ESPSDQWGFG77XHHGCXLZID5U6HZSE7S7URVK67RTUP) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GAKUOD…HQ5R](https://stellar.expert/explorer/testnet/account/GAKUODXIPDXQIBCCLE5F6OF77Y6IYRHHVYUIY5CPYO27VJV55CG5HQ5R) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/59e005aafba7054ed22fad683ca10579106fe501294af62fc7bd00cdd5fb45d8) |
| [GAFY7O…PKB3](https://stellar.expert/explorer/testnet/account/GAFY7OKYTZCGTTUPDHVZCXBBJSEGF2L4JVFNE24B5OCSWS2ALWIWPKB3) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/3418e8f7429f56e5d34394201dcea53bc3ea550a67c48bacd74eab0ae5bf8f5d) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GAKUOD…HQ5R](https://stellar.expert/explorer/testnet/account/GAKUODXIPDXQIBCCLE5F6OF77Y6IYRHHVYUIY5CPYO27VJV55CG5HQ5R) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/782fb18efb1ec1080ee19695e26451a148e56d877148efdbbcc2a98c3984637f) |
| good seller | [GAFY7O…PKB3](https://stellar.expert/explorer/testnet/account/GAFY7OKYTZCGTTUPDHVZCXBBJSEGF2L4JVFNE24B5OCSWS2ALWIWPKB3) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/bf3645498cd84a86dde5db17e3af7f02a2de47f8fcdecbd1b97c21d8fc7ceb4c) |
| bad seller | [GAKUOD…HQ5R](https://stellar.expert/explorer/testnet/account/GAKUODXIPDXQIBCCLE5F6OF77Y6IYRHHVYUIY5CPYO27VJV55CG5HQ5R) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/ecf9f5c32e40a3409553ef16058116098d67f8a2482859c2343669c77f2d6667) |
| bad seller | [GAFY7O…PKB3](https://stellar.expert/explorer/testnet/account/GAFY7OKYTZCGTTUPDHVZCXBBJSEGF2L4JVFNE24B5OCSWS2ALWIWPKB3) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/0e9049bda76411e0714d58683ef0004e53100baccabac96d6f709e4b9c13184b) |
| stale seller | [GAKUOD…HQ5R](https://stellar.expert/explorer/testnet/account/GAKUODXIPDXQIBCCLE5F6OF77Y6IYRHHVYUIY5CPYO27VJV55CG5HQ5R) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/eba9d5b1806142f2f02014fd1f387b93616d5da633aa5231245c3e3da5d17b28) |
| stale seller | [GAFY7O…PKB3](https://stellar.expert/explorer/testnet/account/GAFY7OKYTZCGTTUPDHVZCXBBJSEGF2L4JVFNE24B5OCSWS2ALWIWPKB3) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/74c1f4c87a1e0512f2389776de581682d5831de521e2dbfb211beaf65acd4b3a) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/d2264249d6b0dbad81d55671eec18db6a495e04c40d82dfa2c5b1a95d2b691d4) [2](https://stellar.expert/explorer/testnet/tx/e9148dc75ca48b0e3e008af6d13f98a7c0de6ba4a279bb4c85af745017697361) [3](https://stellar.expert/explorer/testnet/tx/3251ff69cfbbca1ceed4bfa0cb8b628aabbceb1059122fa4c61df4ac45b5e0ff) … | [tx](https://stellar.expert/explorer/testnet/tx/61e357654b4185186e9db362d59931bb14989de8a4d0279993ba0989c6aa37fe) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/43112cc2569b2521e59eb818a852853b9389aa1bdb0d9850d2c2f42ffcea11b6) [2](https://stellar.expert/explorer/testnet/tx/5a176e432d4a52be24bbb750a86d1052d3f744cdaaf0182a3faeacdebef41fa6) [3](https://stellar.expert/explorer/testnet/tx/6db3898777fa97d1c23aaa26c2e3880c35be8acbb8d02141e1252c23c99b13f4) … | [tx](https://stellar.expert/explorer/testnet/tx/7b1ace09d0e841afbbe856418be15cff695114ec716e82620f8a25592430ba2f) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/60a1bbdcdb3c0cb5ce9f22e518b558b73b4231827f30e6c0be031fae56e6fc4a) [2](https://stellar.expert/explorer/testnet/tx/558809009e4efbb2d8cdf948f7eee12230aa78ee6c1e9a9051107c4b55700143) [3](https://stellar.expert/explorer/testnet/tx/c472513d4e0db50fb133e0cf938ebd243175b228e74e8bda6765d815dca99fc0) … | [tx](https://stellar.expert/explorer/testnet/tx/b0d5cb7f203ea838728ae02e6a00e2d671b4530355cf6ba7836cd7093833cc89) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/33a6e0fdd430e218808eba9e189281b984f6b65b4e1ec993e6f106bd3188b54c) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/8bb0627455f0fab2b5fb1b67d3a2354414ee48b0f522b69be06942a0ff922e03) [2](https://stellar.expert/explorer/testnet/tx/2797e74e623b57a2fb1bff0e2086d204ec9541301b7724c2d7760d8e6e3ea594) [3](https://stellar.expert/explorer/testnet/tx/6aa55d1a1890546a0018531a833be3bde6ab8cc9888be404bc277bfd2a7f9233) … | [tx](https://stellar.expert/explorer/testnet/tx/b54ea777f472d7bde4ff2b723a1bd4776de8bca41df28bc73452f75df0baba00) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `82909028fd659ffe…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/242a7237d8a48be2dede666205f3c01cf32dd3fd33c00e7ac67a44fbd44df96c) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4f5430c809aee7fe1f8b92e1c9ccdcc8663b9a0cd799f218002bcbda6857ae3b) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4e53b5e19d883028eaf1ca8812c5c5ff449607c17d13d869a2a82d2b513b60ba) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
