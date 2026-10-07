# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T16:16:42.109Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CDW257…4WMT](https://stellar.expert/explorer/testnet/contract/CDW257RXMGE5SK2LE3P2IOSAHQZIVTCUGH5OT7UAZ5X47WQ3BXFZ4WMT) |
| Trust policy (OpenZeppelin `Policy`) | [CDIYJI…HUXQ](https://stellar.expert/explorer/testnet/contract/CDIYJIEMB7OKVBEWL5VF4YIBBRTGUTUCZYYX5MM3HDTLQ5MO24OCHUXQ) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCQYJ2…LLHO](https://stellar.expert/explorer/testnet/contract/CCQYJ2C37EXK7NKMJUL3UKD7LVKI52CHGXYEFRGO64KREE6VAAXCLLHO) |
| ed25519 verifier | [CA5PIQ…VQGJ](https://stellar.expert/explorer/testnet/contract/CA5PIQMHL6UF7NJAYMMJOZ7LKPSUSJGGWUL2BWZTATZLTCSNAZEYVQGJ) |
| Test token SCOPE (SEP-41) | [CA6DPN…SUUG](https://stellar.expert/explorer/testnet/contract/CA6DPNC6RS5VULMMJCIUVAZ6KPQHBDUVEFZQZK2ID5D3EJF2HIBFSUUG) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GB2MGQ…WCON](https://stellar.expert/explorer/testnet/account/GB2MGQQ776OPJTY3HHZGYN73VF5VMH7TNZ5LN2ZNE6ZD3X2WJZC2WCON) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/1914275c216c5ae21498d08c07b7dc87978f4aac48591e3bfc2ce15f35f472ad) |
| [GC6GVA…QGGC](https://stellar.expert/explorer/testnet/account/GC6GVAY552DF7KY2QIV4LMOUOCCI54AOMAEWR44ERUXWA4OHP3SJQGGC) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/48e1095acdf943730ca9ec63f9944cbd874153d98cbd72f8c1f9f4533de2729d) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GB2MGQ…WCON](https://stellar.expert/explorer/testnet/account/GB2MGQQ776OPJTY3HHZGYN73VF5VMH7TNZ5LN2ZNE6ZD3X2WJZC2WCON) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/5fd7f5d875f73d4daaf55aba88f7dec07f80eb42d2c013c12eeaf423262546e6) |
| good seller | [GC6GVA…QGGC](https://stellar.expert/explorer/testnet/account/GC6GVAY552DF7KY2QIV4LMOUOCCI54AOMAEWR44ERUXWA4OHP3SJQGGC) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/d7f8b2bfe595b30750878d1ac620aa34a7defb83b98946e1fe8032d379ad2b57) |
| bad seller | [GB2MGQ…WCON](https://stellar.expert/explorer/testnet/account/GB2MGQQ776OPJTY3HHZGYN73VF5VMH7TNZ5LN2ZNE6ZD3X2WJZC2WCON) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/8f27fd7289e3e9163169e8a50e80c86c2d73ed10dac523361973b825a1313792) |
| bad seller | [GC6GVA…QGGC](https://stellar.expert/explorer/testnet/account/GC6GVAY552DF7KY2QIV4LMOUOCCI54AOMAEWR44ERUXWA4OHP3SJQGGC) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/4490c70fce6910d7bc7d43fb978e98d31851105d66def115c45f9164eeecfa0d) |
| stale seller | [GB2MGQ…WCON](https://stellar.expert/explorer/testnet/account/GB2MGQQ776OPJTY3HHZGYN73VF5VMH7TNZ5LN2ZNE6ZD3X2WJZC2WCON) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/bc940cf3fd7a5e2a68a8c37a60954ba39165c329161e742cf794fa58428ccde3) |
| stale seller | [GC6GVA…QGGC](https://stellar.expert/explorer/testnet/account/GC6GVAY552DF7KY2QIV4LMOUOCCI54AOMAEWR44ERUXWA4OHP3SJQGGC) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/7c9749ac04e115d3be3cacb31a47c344e6b9f258cd407697c9ebaff2b53d0593) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/bda3a2dec3e7136bfc6970a7f497ed184c2fe05f500c8ef6c76ba487c1e90bfd) [2](https://stellar.expert/explorer/testnet/tx/b64dac2ea878bc500b9b56228e5335abe6cd3b8290a2b63caafd87e59bedafa9) [3](https://stellar.expert/explorer/testnet/tx/1fce8bd0747cf7edc5fe47881195af9811fb083c48591558bcadd1ab56fd62dd) … | [tx](https://stellar.expert/explorer/testnet/tx/c68689f96dcfad03962c6c802c4b5e1dbe75a36f71d3b8e8ef1b2e2dd182e313) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/11927a4e4466151863f463548bf886325c2c9477c56843600e571bb587b4248f) [2](https://stellar.expert/explorer/testnet/tx/fcd157fcd5ba98a189348be904918247fd0de4f9da23f508cf13711e8a41c516) [3](https://stellar.expert/explorer/testnet/tx/05e8938b9d5650eba5c68977cd30338b421eab9147e906f2b8ff18ea45c2edeb) … | [tx](https://stellar.expert/explorer/testnet/tx/158ffb5269f05fc4293643811d55c142cee21dd267f49854087e2147fe9dd607) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/7be41f85f7d7cce904d0a8c142b35629b74647ddff2c6671c7afbd89f76357bc) [2](https://stellar.expert/explorer/testnet/tx/52e58c8ee9e15feaec97cad2c5b400e263bd45f10264fbd032af4c506b036961) [3](https://stellar.expert/explorer/testnet/tx/b401cc0faec381332701c9ee4375c2934b17997b987763732579e41b84ad14ae) … | [tx](https://stellar.expert/explorer/testnet/tx/9e3b0d1f8f7de4c8a7856de335f2291a33c4217ae69cb0691624b47b5c78922d) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/4aa010daa3951ae746729940b78880c25389352f57b77889ef13c7cc2557d39d) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/66a2af28ac24b85438e728e75e06d058664a3568c86e1c634f45de8a2da5c7c4) [2](https://stellar.expert/explorer/testnet/tx/be7384e23c6c6a75c011a5038a0d7b53c65ddc100231b354d0e022f80d8b7e1f) [3](https://stellar.expert/explorer/testnet/tx/c84b601b05251622e32a59a99f89b5ab57fd8bc0852bf459af0f8907bdeefcac) … | [tx](https://stellar.expert/explorer/testnet/tx/16028f62f184c57061079ee602ec18c97fc3c7165de2d9e89f94c0d6cd789e8d) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `97d766bd9fc73440…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/eb7d93ebd98961494c20245070cacd75bdd60e894e03f5353e88b8d9cc0d43dc) |
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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a985f65c2b9ca26524f1b713fb88188ec73016c519f788cfbce5b7ec1d8e5792) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/c4be34ff763de572cc67821c3ca7c742b2779ec8616f4101f951d3f07dea0461) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
