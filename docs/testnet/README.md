# 402Scope Trust on Stellar testnet

Run finished 2026-10-30T11:47:58.771Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CDAC6D…RWQO](https://stellar.expert/explorer/testnet/contract/CDAC6DQFHFUO7RD6WJ2EDET2EE26GTIS2XFCS7PJ37XE2ETYI3TARWQO) |
| Trust policy (OpenZeppelin `Policy`) | [CDKRXW…RXGC](https://stellar.expert/explorer/testnet/contract/CDKRXWVPXGXAFKBZ2KWOQ2GVO5E5PP7DJE4AWWMI2F5VEMXQ3ZTGRXGC) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDXHB3…PFGA](https://stellar.expert/explorer/testnet/contract/CDXHB3P5CIMXXLMFRMUDRDPKM7QKUSTDWZUYLPKTP6CYTMS3JVPXPFGA) |
| Spending limit policy (rolling window, x402-compatible) | [CDVBXO…IYLT](https://stellar.expert/explorer/testnet/contract/CDVBXOUZY4XBMPE2KFLAVSQX32G76VUKPF4WUA6CPO73BE4GDY7NIYLT) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDRHN7…2GNT](https://stellar.expert/explorer/testnet/contract/CDRHN7VPGPAW4QZKAQ5P3G5M2TYGHJ5CFNPL4RM2MCSCALI4VVB72GNT) |
| WebAuthn (passkey) verifier | [CAKZBY…GEWU](https://stellar.expert/explorer/testnet/contract/CAKZBYZZ625T7JYH3CCXHHMG5DDINLVZJSVSOVUVAN5IZ6U7YZX7GEWU) |
| Refund bond (optional seller bonds, no admin) | [CDB2XW…EM6L](https://stellar.expert/explorer/testnet/contract/CDB2XWKIXX6QWUENDBWGVHFDTNIWQBBQSP62VIQHK5UTM5K5XNOQEM6L) |
| Escrow (x402 scheme `escrow`, no admin) | [CAMB3I…PTFI](https://stellar.expert/explorer/testnet/contract/CAMB3IPCNNIKXWZJMF63B3K56QPWTPXK5PRVD2XMOUNQMEXMY6RCPTFI) |
| ed25519 verifier | [CBBU46…IDFN](https://stellar.expert/explorer/testnet/contract/CBBU46TMKBRENICR5QDOE5FCUOJWSJ3RU7FDBWQ4QBXESUXZDQFXIDFN) |
| Test token SCOPE (SEP-41) | [CCWMLV…6LC3](https://stellar.expert/explorer/testnet/contract/CCWMLV2PRWGNG6FPMSAD4WBNIGZECX3MM2ZBFV7LEIWAHDM5P67W6LC3) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDS5ZA…JZLQ](https://stellar.expert/explorer/testnet/account/GDS5ZAEFMLJKPCJ6W76W6QQPYTRZSHY7M52MEUQZRFKVYRZDLYOYJZLQ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/1ef744ec77ffb7362fa252c3ec98acddf33ee948e9357077d6a1fde1ec39b078) |
| [GCUVRL…W23I](https://stellar.expert/explorer/testnet/account/GCUVRL4XOWLP23XERZ4ONXPRJJ6Y3Y26B2CVN2AYCGBLOURWD7PWW23I) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/ffb556cd4446ad4ba746bf1dc0134a037f9539f475a132281447f7a13d116293) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDS5ZA…JZLQ](https://stellar.expert/explorer/testnet/account/GDS5ZAEFMLJKPCJ6W76W6QQPYTRZSHY7M52MEUQZRFKVYRZDLYOYJZLQ) | 90 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/942cf28012f75fc061e558b2cabfc9d5c12ec9caaa10f305933b756910788ab4) |
| good seller | [GCUVRL…W23I](https://stellar.expert/explorer/testnet/account/GCUVRL4XOWLP23XERZ4ONXPRJJ6Y3Y26B2CVN2AYCGBLOURWD7PWW23I) | 90 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/f13221a4d43e4e65adc5fa21c8042db3136660e8794f4d1013d250f9cffc70e2) |
| bad seller | [GDS5ZA…JZLQ](https://stellar.expert/explorer/testnet/account/GDS5ZAEFMLJKPCJ6W76W6QQPYTRZSHY7M52MEUQZRFKVYRZDLYOYJZLQ) | 13 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/63e744dc8b9e379f33d7453a72251091649f919636754f220597de1b812576fb) |
| bad seller | [GCUVRL…W23I](https://stellar.expert/explorer/testnet/account/GCUVRL4XOWLP23XERZ4ONXPRJJ6Y3Y26B2CVN2AYCGBLOURWD7PWW23I) | 13 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/4834fa5e8de465bc8095831d0c4aa0fc67e195fffcdc7b810e5b2fc06f8da2b5) |
| stale seller | [GDS5ZA…JZLQ](https://stellar.expert/explorer/testnet/account/GDS5ZAEFMLJKPCJ6W76W6QQPYTRZSHY7M52MEUQZRFKVYRZDLYOYJZLQ) | 40 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/e7ae6674e9e9aa44eaa271684e7b3a7042fc8065b556d906771a75fc54287513) |
| stale seller | [GCUVRL…W23I](https://stellar.expert/explorer/testnet/account/GCUVRL4XOWLP23XERZ4ONXPRJJ6Y3Y26B2CVN2AYCGBLOURWD7PWW23I) | 40 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/9c1c46038fc5db08922c468b8a2d0a9d0c290a2f390b45a3b8e96e1e945e801f) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/16bf5aa4793390702e2a070559e4c8ec9e763caa91f105a5e1511a9d9dacb179) [2](https://stellar.expert/explorer/testnet/tx/c62a79e787d438d0a2dad85fc2e6052b348f2760163347d05b9bb90abdf8b6d1) [3](https://stellar.expert/explorer/testnet/tx/5774caac503960dd463c8887d5cf4d7bbb50d48a57c9e43ae07ea097701ba484) … | [tx](https://stellar.expert/explorer/testnet/tx/09bae1f07b52232183b7520d0c171f7f37d0718a97a4f58978dd00ef24fe550b) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/b870965d991e5b26a4d28c63844b2d029d46ce81568c802d8a2e9e2aaeabd05a) [2](https://stellar.expert/explorer/testnet/tx/d2675b9335cc7b22f4edf6cf0e6ba20577c2edf91cadce4c8773de2cc77a617d) [3](https://stellar.expert/explorer/testnet/tx/9d9296287765187f83db3a27b4ffcaa425b1fd84b2578f3f597dfd069a8ae2f5) … | [tx](https://stellar.expert/explorer/testnet/tx/b110ec0a4ec6f23bb52c2af55c50f6b64790abe6444e8713c501c77a7e43db5d) |
| `/wrong-type` | bad seller | 20 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/4cb30a79c6121ebe38dbdd6309cfb5d099cabb381a689abff78d58e5f54b9e9c) [2](https://stellar.expert/explorer/testnet/tx/fcf29653084f37c95690334c15c7bd9d97475a3029064aa161c93dbba3ddde90) [3](https://stellar.expert/explorer/testnet/tx/ff1d37f72ee5bc669bda351b0c6ab2f12d128662a4a4d3f5d1c829214b577ab0) … | [tx](https://stellar.expert/explorer/testnet/tx/7c8f06ea207507266b5acf134b59056cbc1ae5862a1540ef99e90ae05b4f7b94) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/3f36a3323d919de75972b3c49bf09461758c8a6682ddca816dc0e666e11475c3) |
| `/stale` | stale seller | 40 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/adb375981f1bcf56df58bd4045a3d30d0e72bc89ec057cac5e784407053a8fbd) [2](https://stellar.expert/explorer/testnet/tx/21d7405f43f221b15bf210bc7be6aca9a9cadd480ae8c30d5057a0c03d6942ea) [3](https://stellar.expert/explorer/testnet/tx/4f02ca6753585991b013949bb2213ce5238428337342f3ff820ea36c2c18b1f4) … | [tx](https://stellar.expert/explorer/testnet/tx/e6f050672237229a7d286d6d651dd6a922f3785269a92e545c2bd6fe830f9be5) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":0,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":0,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `fcb542d865b2f53b…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/88b0ae28084d32ff5fa7313f1e460f438550144735f1248e0fccc815d0c77cd3) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6876f28dbc3240d40bbfd7bf172335f52fb851718083c18e58f1cf990ffdd73c) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/60ed44705e063286d9ea0805ce7a7efe85845b923abadb698194c68235b02b51) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/95e05c31109d458615ed298086d694b31f1abec3fa65726735d9df79423168c2)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/c72033d20e5ca06e610088d8556f65c5d25898b1d7de6cfab7b13610f26eb5d4)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 90 | true |
| `/slow` | trusted | 90 | true |
| `/wrong-type` | avoid | 13 | false |
| `/broken` | avoid | 13 | false |
| `/stale` | caution | 40 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 90); good seller allowed (score 90); stale seller blocked (score 40).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 90 |
| 2 | `/slow` | yes | 90 |
| 3 | `/stale` | no | 40 |
| 4 | `/wrong-type` | no | 13 |
| 5 | `/broken` | no | 13 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2784a9b89e5121b62f2bcbf0670e38623c4ddeb067e26bf185b9f5a5b49da17f) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6fede2295e16f54cafbf1e1331cdd185cc8e012392f632db8d2dbc5ededf026d) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CDB2XW…EM6L](https://stellar.expert/explorer/testnet/contract/CDB2XWKIXX6QWUENDBWGVHFDTNIWQBBQSP62VIQHK5UTM5K5XNOQEM6L) ([deposit](https://stellar.expert/explorer/testnet/tx/3f2d2e0191301131fd8adb4683737cc8c3e4a16e4f839ab9125cd4e80ed23986)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/11e4ab9f3b20cb73ec425384d4bb9d5b3a7dfdd167da24bca5b4db77c7ef42e3)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CAMB3I…PTFI](https://stellar.expert/explorer/testnet/contract/CAMB3IPCNNIKXWZJMF63B3K56QPWTPXK5PRVD2XMOUNQMEXMY6RCPTFI) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 7.5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/e59d5ba08c293add2afe7f789623c8e7b5b36552a983a88f00af15f29d020b34)) | **released** | 10.1 s |
| `/escrow-stale` | 13.9 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/b9459b6a1b89b2b5b3576122489b095ce97179271b24757d2ac733cf0264de42)) | **refunded** | 5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
