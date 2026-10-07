# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T17:13:40.294Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CCRL6G…JBFL](https://stellar.expert/explorer/testnet/contract/CCRL6GRELVZC67CUHAAC5AJ5FCRDG26TJ7EGCWGE2A7763JXKOMMJBFL) |
| Trust policy (OpenZeppelin `Policy`) | [CAPWMH…MPCM](https://stellar.expert/explorer/testnet/contract/CAPWMHNBDJIELKFZDGHQS7GK7GUTDZ5BLCWXVCKCTY2UTMFMJTOAMPCM) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCXJQ6…ZPXG](https://stellar.expert/explorer/testnet/contract/CCXJQ6FBDJ3RNZS6QBZ2X2MCBBD35CES56CVMRX4Q64LZZOBLDFGZPXG) |
| ed25519 verifier | [CCGXHO…XMWY](https://stellar.expert/explorer/testnet/contract/CCGXHOAM5TXBYHVG4NCBV2AJ3E5SQDL6UFUXLEVZMWJJSTHVVM5BXMWY) |
| Test token SCOPE (SEP-41) | [CC43GD…ZKQS](https://stellar.expert/explorer/testnet/contract/CC43GDC7S2DAT3SXCQJ4EML475J4TJ4QBRYTAJAQRRXIONWX6P37ZKQS) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GB4RNE…RYIK](https://stellar.expert/explorer/testnet/account/GB4RNEI45ONXXWQFYC7OM7DXH5AHGPBZYYFQGN5XPUECZSCY3VYMRYIK) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/b23bbc4e78f1bb9568b3e6589145a2f0b396bf726cb6f407c3d4d678ab46c134) |
| [GC6X42…LJJ5](https://stellar.expert/explorer/testnet/account/GC6X42CWKPLZIZLZJIPP4HPYY2SE6A6P42KTRZVDX246LMFPA6CYLJJ5) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/621ddfbc72a7d7ae0fbbb65194537553f9292b13a56cb8a2a43d6b2279b55237) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GB4RNE…RYIK](https://stellar.expert/explorer/testnet/account/GB4RNEI45ONXXWQFYC7OM7DXH5AHGPBZYYFQGN5XPUECZSCY3VYMRYIK) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/d692a9ddb41df399bd980d463a4c71b24d7e8438396b8c3026355f07d4d2483c) |
| good seller | [GC6X42…LJJ5](https://stellar.expert/explorer/testnet/account/GC6X42CWKPLZIZLZJIPP4HPYY2SE6A6P42KTRZVDX246LMFPA6CYLJJ5) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/f7b6ecff74f70901536cacacf5da9d61598c5fdadde6915b604f12ea9fc895ad) |
| bad seller | [GB4RNE…RYIK](https://stellar.expert/explorer/testnet/account/GB4RNEI45ONXXWQFYC7OM7DXH5AHGPBZYYFQGN5XPUECZSCY3VYMRYIK) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/4be30a1d26984623d308f73b187d684bcdb869d1015e3755dbbbd6e878e33a93) |
| bad seller | [GC6X42…LJJ5](https://stellar.expert/explorer/testnet/account/GC6X42CWKPLZIZLZJIPP4HPYY2SE6A6P42KTRZVDX246LMFPA6CYLJJ5) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/dcb45dec679afd2c2c0d86b0485b6b015c553ee522c370586bc22638dcf12f28) |
| stale seller | [GB4RNE…RYIK](https://stellar.expert/explorer/testnet/account/GB4RNEI45ONXXWQFYC7OM7DXH5AHGPBZYYFQGN5XPUECZSCY3VYMRYIK) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/b181ea3f46707fa94cde4c52aff1cffdb8af9c1f14bf8e5e8d7b095ea92ae1d8) |
| stale seller | [GC6X42…LJJ5](https://stellar.expert/explorer/testnet/account/GC6X42CWKPLZIZLZJIPP4HPYY2SE6A6P42KTRZVDX246LMFPA6CYLJJ5) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/e5cf1f49695ac28e21b2d1b56c5d2da44dfd77ed594e086408528a529188f2c5) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/130560439f4fca66852dc1269b66892d40f8bdd303ab7426370dec95bb19c6b4) [2](https://stellar.expert/explorer/testnet/tx/a337d1930135355ed05c4308e980ad53ec0b95d41f2440ca3d0e08204318a361) [3](https://stellar.expert/explorer/testnet/tx/a6bbc692d5a69fcf204e29ae2daf8e6a90880a85e44db99e7aa545cebfaf7898) … | [tx](https://stellar.expert/explorer/testnet/tx/9d0278d26175106d81f5584963ab0633002cf79fe69d70f72b3510293f633dc7) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/bcc7ac9aa3ec7c81b168896a3bce8ea02b033911afba1d9754013cfe14497d3b) [2](https://stellar.expert/explorer/testnet/tx/94db2505d04eefb35067268933ce790d8ed2470546ef55e2b0bd177240341ef5) [3](https://stellar.expert/explorer/testnet/tx/1e018c271b256f9ab73091a66c8b17f02d2293c0c0f7a6cf20120b6ccd069e6c) … | [tx](https://stellar.expert/explorer/testnet/tx/162ad6bba93734116cae6e5934a5a7f2f8036dad8a985e25834930b778986f58) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/036fcd920bd45bc3dffbba59d8e9013a219476fc05fbb06f5c8f1e040e0762c7) [2](https://stellar.expert/explorer/testnet/tx/fd9bba38a2520d48cffd1e24fa963eaa70d580bddaa1c65169bb09dae16abfe7) [3](https://stellar.expert/explorer/testnet/tx/288c907eac11da411aac0bc2e5d216e2dff7ea2fcdfdc6c215b496e91a23c5f5) … | [tx](https://stellar.expert/explorer/testnet/tx/e6f468dfbcc0dda4dd7efc54e8dc20d02d47e138dc201af2dca5d41b4b7b87c6) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/c880f1778a41a2f5ebe97c3f103ff760df469beeafc7495397f3f0ffcc511d05) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/69f3e480b38f7fb535300632363ad3bcaa1cb4204d457c2d9b883dbc23b9f80f) [2](https://stellar.expert/explorer/testnet/tx/a9985c5fd935ecd4458ea407b97ee726c19a83ae8eb2170b47698aacc14ddb94) [3](https://stellar.expert/explorer/testnet/tx/cb4c5a9a81260d2f9c06de73ffbab275affde18000a9349524ae9bb9eb0aab28) … | [tx](https://stellar.expert/explorer/testnet/tx/00384b6c67e2cbb135a6808ec38f1cc445ef82f6a71f2bd86cf4483345254b84) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `fb48d1b4ff0572d8…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/c580378c829e59790cb9a6d3400bc2fd27ce9e63ef571d0813506800dfef315b) |
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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/eff638f83599224d1a6fa2e794834213269390cd825a6efa72de584e00faa9f3) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/86b2505681e61db4ec3da227d5a9226f3b79f1116401d4144a40125185d93f6b) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
