# 402Scope Trust on Stellar testnet

Run finished 2026-10-08T18:16:53.673Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CCG4UQ…NCKE](https://stellar.expert/explorer/testnet/contract/CCG4UQXEKHVV7CYGOJCJO7JHY6AHGS3JV4MHFCUF6I6NTHUWL6AHNCKE) |
| Trust policy (OpenZeppelin `Policy`) | [CA5H2P…GBL4](https://stellar.expert/explorer/testnet/contract/CA5H2PEVUNEJDULQXUG5UDZTY36S4FN26GQUGNKGDWQ6LH5PDM5LGBL4) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCSCZA…OXCZ](https://stellar.expert/explorer/testnet/contract/CCSCZALFD3NFA4OTDTGXTOEOV2NQE5HEOM2SO67MQYCNO6QLQZMYOXCZ) |
| Spending limit policy (rolling window, x402-compatible) | [CANDOK…RNJC](https://stellar.expert/explorer/testnet/contract/CANDOKLEQDAX4G7434K6YO4OWU7KKVIKVTA3HGDP2SXBPBL6DLXORNJC) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CBWHEL…ICYE](https://stellar.expert/explorer/testnet/contract/CBWHELTPLZM7ISNCBWUSDHVINLV2DLVS57E3BBXH6JOQQKTH2Y7HICYE) |
| WebAuthn (passkey) verifier | [CAKWXF…ZRAH](https://stellar.expert/explorer/testnet/contract/CAKWXFQGQYDCN2UUCWKBB2ROR6GAN673CG4L3RWI4OKRD3LZE2QNZRAH) |
| Refund bond (optional seller bonds, no admin) | [CCK2TW…TY7O](https://stellar.expert/explorer/testnet/contract/CCK2TWFJ4J6PEPD3TIWQ7R5DQW7EEAQDL25OZXK45UBGZRMB2SHCTY7O) |
| Escrow (x402 scheme `escrow`, no admin) | [CDRN5R…34CI](https://stellar.expert/explorer/testnet/contract/CDRN5RYF7CLUJA2TEAY5YTII44C7MFZV2FJZNMPJUFLIQZC26LMY34CI) |
| ed25519 verifier | [CC7U7U…RGNR](https://stellar.expert/explorer/testnet/contract/CC7U7U4RJP7XI4FCSLVAP4GJJRLTTUA33RHJTHRZIRHKN4A3DJ22RGNR) |
| Test token SCOPE (SEP-41) | [CDUWP2…T7N7](https://stellar.expert/explorer/testnet/contract/CDUWP2CITJPZKB27HKIHHWHGAUJBUPJ4IIVUOGKXQHKPA5H4ILWHT7N7) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GAX6WZ…GQ3R](https://stellar.expert/explorer/testnet/account/GAX6WZ44XWJ4UA6XDRIP6AQOI4T3C5XKSIYIBMYRGYPC4TOZI4VEGQ3R) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/2bbeca4fd50b4c42ac79e8c51635f067806542f72a6e9e1bc96fa884792e3f29) |
| [GA5PUG…3HFQ](https://stellar.expert/explorer/testnet/account/GA5PUGTSAHUER22NBAF3245ZQAVLYRTJ2SXUCJGJZFYCI6BEYSOP3HFQ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/34f48733791cc860cdb97285f169e37cb26d1e1544fc8a55a092434eadebaa37) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GAX6WZ…GQ3R](https://stellar.expert/explorer/testnet/account/GAX6WZ44XWJ4UA6XDRIP6AQOI4T3C5XKSIYIBMYRGYPC4TOZI4VEGQ3R) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/ddbf29edeffb3d76dc18e23c877f6c3c8a7f9c537cf2c8bfe4594ec026edfb89) |
| good seller | [GA5PUG…3HFQ](https://stellar.expert/explorer/testnet/account/GA5PUGTSAHUER22NBAF3245ZQAVLYRTJ2SXUCJGJZFYCI6BEYSOP3HFQ) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/4c2878096b9a5638727a91598e6e51557d43684b0762f7f397fab9785d1af84f) |
| bad seller | [GAX6WZ…GQ3R](https://stellar.expert/explorer/testnet/account/GAX6WZ44XWJ4UA6XDRIP6AQOI4T3C5XKSIYIBMYRGYPC4TOZI4VEGQ3R) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/aefde02f19d1a1a02bcfa4aa08a351a07ca7fd6e81786d604ef959336132d0cb) |
| bad seller | [GA5PUG…3HFQ](https://stellar.expert/explorer/testnet/account/GA5PUGTSAHUER22NBAF3245ZQAVLYRTJ2SXUCJGJZFYCI6BEYSOP3HFQ) | 15 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/462a7c57771020ed3ba647db81c9b0dba8aec7557fce52a5c92565596334caf1) |
| stale seller | [GAX6WZ…GQ3R](https://stellar.expert/explorer/testnet/account/GAX6WZ44XWJ4UA6XDRIP6AQOI4T3C5XKSIYIBMYRGYPC4TOZI4VEGQ3R) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/3860090468c9aa66c48a83dbd5fcc6bc3e07eab79fdbbedba617a2984c23c84b) |
| stale seller | [GA5PUG…3HFQ](https://stellar.expert/explorer/testnet/account/GA5PUGTSAHUER22NBAF3245ZQAVLYRTJ2SXUCJGJZFYCI6BEYSOP3HFQ) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/904e8534c22ef1dfb86c8eda821cc26f642f1a8a5e27cd6ea65cb18f1dd7b3b3) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/adf89d40852d8eeaa6e17defb111bbbc910cd3b3eae9e488cedf8ecabe59fa7f) [2](https://stellar.expert/explorer/testnet/tx/4b7166a79c6aaa0947dbc890b97bcc5a9df9f5332753eb692d00e775e0c73dbf) [3](https://stellar.expert/explorer/testnet/tx/3b8e3829b452a12587b57d9e068637219bf98bb9bfd4acb6e561dd51d3f0b1ca) … | [tx](https://stellar.expert/explorer/testnet/tx/9fc0e31e0ebc8bd61f8386104fc09a21891ba9694717a51ad758590d0fa64116) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/57c63268906561c485bd5e59421c5966de181b277ee88643f12d1d26aa4798d3) [2](https://stellar.expert/explorer/testnet/tx/2d55c0a688ab9d21a49aeafa4f95f16804401ef825ec4ed7d7dc9e15a5b6c58f) [3](https://stellar.expert/explorer/testnet/tx/eec4e1c3f4b6c17f88d21714d76568ab4fc881d84876f4a8a9b7c7cbd987968d) … | [tx](https://stellar.expert/explorer/testnet/tx/3a68fae45a1a124aa6f17465ac8a48b76aab6fe72623d4ff7a85db689e299097) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/bc8bce941fc5441f6907b703ec28252b4b73cb46e06da166763b5caa06df1cbc) [2](https://stellar.expert/explorer/testnet/tx/1a702b40ffe88e8b7a68676dc4005c41bdde256759f8755063bfbed96a782136) [3](https://stellar.expert/explorer/testnet/tx/51ae8a4057179af6c69b3b7db2c0721f1b93990bc8e070e828a76e8ce4054421) … | [tx](https://stellar.expert/explorer/testnet/tx/39e23e4c39b9588c925136b625872686b70fd8236b7b147556c4d8eb6c3e174d) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/a126c520de14416c5b5aedc3c90b1d5b45604ffa6b516f77ac04ed89f57ce092) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/d1f263083243f1b959ad4c367745c95bf6b60b7257f242f79adaed7dc2633c94) [2](https://stellar.expert/explorer/testnet/tx/b4a4fe2eebf81d4983862838c5dea5e5f16eef9f99f0f8ececcb09d0d1ed405f) [3](https://stellar.expert/explorer/testnet/tx/d4ff48fe9af477816098ab71fb22e4760a41f428b1c32e2993965bef04b7abeb) … | [tx](https://stellar.expert/explorer/testnet/tx/e8ffb6d5d13669edc3ca036b232a07ebdd0c8b69334229d7d0b917c23b77ca46) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `4778d5d222fb4c16…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/662c015edbd36dc22442cb435e80bd29c424223d756bc1494f07cdd465f70f66) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e75ea9e09bf8dc6f948f3041ec895cad748b7f03d0ba3742bd3cca6a62313136) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/760162a5f098515b04168494247bce1853e295b77afb8837c3681556e8dfe2a3) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/64ca90438a2c083eead8d09e5bd1a583b0542aaaad4fbd6adb0dc41ff7e63634)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/a70ae04402dd08ab4d603332afa8a6ffe2a2570be2417ab8e32620dbd2db89bd)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
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

Facilitator decisions: good seller allowed (score 95); good seller allowed (score 95); stale seller blocked (score 50).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 95 |
| 2 | `/slow` | yes | 95 |
| 3 | `/stale` | no | 50 |
| 4 | `/wrong-type` | no | 15 |
| 5 | `/broken` | no | 15 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/be4d5b4856327636c89cbd4bf4fafa09b3b638a46d6eb7359ca80df0ec0425f6) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/8f4eeb1847bb28d19319dbe7919b6ae1c063151555570db457db2b8bc61e9c40) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCK2TW…TY7O](https://stellar.expert/explorer/testnet/contract/CCK2TWFJ4J6PEPD3TIWQ7R5DQW7EEAQDL25OZXK45UBGZRMB2SHCTY7O) ([deposit](https://stellar.expert/explorer/testnet/tx/c45faaed93305c2d965dabf5984598c8f7019cee500d343bce25182280156684)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/c40c59e934edb3dd7a884197234ff1fd3b08db44e4d718335b18558d1fef80fa)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDRN5R…34CI](https://stellar.expert/explorer/testnet/contract/CDRN5RYF7CLUJA2TEAY5YTII44C7MFZV2FJZNMPJUFLIQZC26LMY34CI) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Data received in | Seller at fault | Agent | Escrow | Settled in |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 10.9 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/80f3b8452926af8161b1813d99c72ab13c097f6649f4dd467171c767dc6302bd)) | **released** | 11.1 s |
| `/escrow-stale` | 9.6 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/fe5498e9233734a12d4f4b5f53a2580711b4c3f82149d296e018129b48a23f79)) | **refunded** | 9.8 s |

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
