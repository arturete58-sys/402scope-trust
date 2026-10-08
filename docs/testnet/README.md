# 402Scope Trust on Stellar testnet

Run finished 2026-10-08T17:07:58.506Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBJX3Z…LDQ3](https://stellar.expert/explorer/testnet/contract/CBJX3ZFOZ6JAEIIFZIRA6KPZ65VCIE2MCQWZGOMSFAJ57FRAGOT6LDQ3) |
| Trust policy (OpenZeppelin `Policy`) | [CCNLID…CQ5P](https://stellar.expert/explorer/testnet/contract/CCNLIDCVXZX5JO5JS4XYZZ2CAQU6B4N5SFCZL4CHM4VM6BBQCEQACQ5P) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDHRWT…XWXL](https://stellar.expert/explorer/testnet/contract/CDHRWTK4JYPAIQ73MMH2SHTC67K7LRUWEGKRGOPTGJQBVEGPZCB4XWXL) |
| Spending limit policy (rolling window, x402-compatible) | [CBVVDD…DGZ2](https://stellar.expert/explorer/testnet/contract/CBVVDDNRIBIOYSKLNGFV56XBD2BP554W6VSUHS4XHIHFXPCIUX7ADGZ2) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CCLCQJ…3NAL](https://stellar.expert/explorer/testnet/contract/CCLCQJRZVZGGJQYNF455N6BIJTXGNJIBVUMBAKIF2YQNLAEDF6BC3NAL) |
| WebAuthn (passkey) verifier | [CBWXUN…FPOS](https://stellar.expert/explorer/testnet/contract/CBWXUNBHSOYAGUERKVCKDVGL5QZ76OCLH5KV2RTPOR3NVYS2CXAJFPOS) |
| ed25519 verifier | [CAYPP2…MSEJ](https://stellar.expert/explorer/testnet/contract/CAYPP2JWPSUBT7NZCLCXNA4THRVUITL7YWGEV3JACSZ5QHKFPZ5TMSEJ) |
| Test token SCOPE (SEP-41) | [CCRXFN…IU6C](https://stellar.expert/explorer/testnet/contract/CCRXFNFR3BVDTJFSR3NST5PVKEUYFRYEVME4M42ABGT6CGFTQLPRIU6C) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GBKIYJ…PTHE](https://stellar.expert/explorer/testnet/account/GBKIYJPRXFLWITCXDFORNSACU73OUWG5NSGT2OV55J2J3YZBO427PTHE) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/5adef38b48e813b8b54a3939bf8c3ef6898ec69c70cc31bba7b717444a5b7798) |
| [GASNCW…5NCL](https://stellar.expert/explorer/testnet/account/GASNCWLWVCLY7VE453EFAQCYZT3ZENZGHQX6X5KY352UMZVBKNRZ5NCL) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/27e17c71514bbda969983f07053cc7cc8117759a3260aca5272cec9384f810b8) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GBKIYJ…PTHE](https://stellar.expert/explorer/testnet/account/GBKIYJPRXFLWITCXDFORNSACU73OUWG5NSGT2OV55J2J3YZBO427PTHE) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/18f28f7d7cfa984aa8405485dbc89ba4c83427e6cced6c665372c2fcc5087e8d) |
| good seller | [GASNCW…5NCL](https://stellar.expert/explorer/testnet/account/GASNCWLWVCLY7VE453EFAQCYZT3ZENZGHQX6X5KY352UMZVBKNRZ5NCL) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/19f2269c0733e65325d82b784a633c64ad1aae605f94384b26eba7c9da91e3db) |
| bad seller | [GBKIYJ…PTHE](https://stellar.expert/explorer/testnet/account/GBKIYJPRXFLWITCXDFORNSACU73OUWG5NSGT2OV55J2J3YZBO427PTHE) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/e006d656d0b66a771ad012aaad3085bcb1ca6f0c94d01c0165ddd1f8da354102) |
| bad seller | [GASNCW…5NCL](https://stellar.expert/explorer/testnet/account/GASNCWLWVCLY7VE453EFAQCYZT3ZENZGHQX6X5KY352UMZVBKNRZ5NCL) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/63a6b2abedcbcaaa94671c33d3428784fd9ef1a612b9296dc0e922b7c81a06f1) |
| stale seller | [GBKIYJ…PTHE](https://stellar.expert/explorer/testnet/account/GBKIYJPRXFLWITCXDFORNSACU73OUWG5NSGT2OV55J2J3YZBO427PTHE) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/e148747eb0e38cee6872a0717e592ed8c4a222ee3070697f0959d5e73d580c7d) |
| stale seller | [GASNCW…5NCL](https://stellar.expert/explorer/testnet/account/GASNCWLWVCLY7VE453EFAQCYZT3ZENZGHQX6X5KY352UMZVBKNRZ5NCL) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/af87a35ad45f5604ed9a7f8d013ff5b4e08be5b537fbdad547c315a95d2c1410) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/b243304fe859a779acf9a43899a2c5560c51435249272ed17ade6bca699a129b) [2](https://stellar.expert/explorer/testnet/tx/cea68f1b9d724004ccc72f87da0a939b045e59a14b5f9b38a189487f8b4d5321) [3](https://stellar.expert/explorer/testnet/tx/ff7f8989b80f2b84ca5217e88139828bbd2aadb0d60bc6d37efd45ca83fb26c0) … | [tx](https://stellar.expert/explorer/testnet/tx/3a5bd3516191fca2716e71a3114875eda6d42dc9da4e4809c9e02b79f7fbf771) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/d6ee65f5dc6c22895763331ae4b0533720c839c2050a96526e67c7032845e0ca) [2](https://stellar.expert/explorer/testnet/tx/8aef9148251c54bce2b24b7931997e6d39071af50a5fde0a4920199c3556790b) [3](https://stellar.expert/explorer/testnet/tx/8a8cb8ec7e61da754d99278e80047fa48537d47a5bff9dedd9bf01ee57114bd7) … | [tx](https://stellar.expert/explorer/testnet/tx/13e48516e2d5037322c4c3def9646bbecda28f295d67a67fd5b12e9b5508fc33) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/6719ed3c62502b3ca8ebed20a7c6afb56b2740f90e4b70d8b3b6e0a342ee6891) [2](https://stellar.expert/explorer/testnet/tx/9847efc860785daeaeacac0bb046723878b1b40b0e2ca958b4e11b96374e3267) [3](https://stellar.expert/explorer/testnet/tx/16711d0fc0c1d2299c95c7d63d7736a97e8ce9734dcf17376b58b2142be96f8b) … | [tx](https://stellar.expert/explorer/testnet/tx/48afff0ea7e98e6084dafd511391a2a88a54710f8a7e547b4ef88c427f5240c2) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/9bdb051cb341fa69893367c5bde49cda8fb7d493c790393363fd486700581e88) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/8a361c02b78dfb6d839ea835e63340766e0953704acc81c032efa531251e08e7) [2](https://stellar.expert/explorer/testnet/tx/f4e4d258504cbd64c48a3a674845837d668335d9f50df330322d76560d78f790) [3](https://stellar.expert/explorer/testnet/tx/3680818d2252242a61653a2950e1a0efc5b145d90a3c6d5ecacbea3780986b9d) … | [tx](https://stellar.expert/explorer/testnet/tx/287ff19572e23823c4bcda8b0afb6962fc7334927efb848f3cb5ff80592f7267) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `473ba012b2f3c16d…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3371575c147d479af54b9da6fdd4a61431684ba7cd17ac8686c3bef3ffaf43e8) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/37df0fc2c16dcdcc3ddaadc469581d030ec392bd9cb9a5cfd63ff61daf4ef337) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/7a012aba985655e88338293e8577a6277db56766e1753aacf14857825fca07b8) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/d09160d32dfa82d8e31195c8ccb2c2d2819f8ee3999d890630c230031f239fa1)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/af0c4204bc73ad67fb5292614a496145c2f29ab3af0295d39c138c62619ee551)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a5ce6b50a63badeb545f1ca998d7688872c887136ad226e729d06e94827f14d9) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/f639ae5beff4e5a7d80225a157e2fd52e3aa8601e6f280c67a13c400e2a6b944) |

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
