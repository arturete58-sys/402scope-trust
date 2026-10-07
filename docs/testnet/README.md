# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T19:19:28.825Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A second agent wallet carried the same trust policy plus a spending limit: it paid the trusted seller until its daily budget ran out, and the wallet refused the next call.
6. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CD6LZB…6PZI](https://stellar.expert/explorer/testnet/contract/CD6LZBYWSMPUWQA5ROORYTR7TMOIE2UKY54LOLYHEKULVZ65F5CD6PZI) |
| Trust policy (OpenZeppelin `Policy`) | [CDVRNP…ZLXL](https://stellar.expert/explorer/testnet/contract/CDVRNP4UK3ZWSEY5JDCMI2JXYRWXCFOUXGZCMEYGZ5BUPCWGWIRQZLXL) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDZDTA…GQOE](https://stellar.expert/explorer/testnet/contract/CDZDTAFTE7P6OXQFPZ5656QIJT7T6FR3HZL377GLGDUPBA7O5G5DGQOE) |
| Spending limit policy (rolling window, x402-compatible) | [CBYS5X…N37U](https://stellar.expert/explorer/testnet/contract/CBYS5XUYTYFXSRUIEPPYZIPOGJQQJKKF73BPC6UQ7HR5UWZAZN7BN37U) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CA52YF…OF5E](https://stellar.expert/explorer/testnet/contract/CA52YFATZE4RIXGRY7WCYCXLDODCPPSEMJMSZMGVG2YLSRC7IFENOF5E) |
| WebAuthn (passkey) verifier | [CAJ53P…EOPP](https://stellar.expert/explorer/testnet/contract/CAJ53P3MCFBMQ5A6XS5DPRM3PQD2ZBKCPHYUHNS2T3YKFQ7VSB6YEOPP) |
| ed25519 verifier | [CD44IZ…SI5B](https://stellar.expert/explorer/testnet/contract/CD44IZQ3DYGEEGMTZ2ENQBW4NENBBO35I3M3II54XHMHTVWSUAZQSI5B) |
| Test token SCOPE (SEP-41) | [CADL6G…LI2M](https://stellar.expert/explorer/testnet/contract/CADL6GV7PCZBV23BEOZ5HLRRE64LWGWDQ47ZCEOOHYIG4Y2ISN4PLI2M) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GBRQB6…IOTQ](https://stellar.expert/explorer/testnet/account/GBRQB6HMOLEYG2AEASHU3LVLFPVSZ367I3QIHC3FOYJRHT2JMVRGIOTQ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/32761bbec884b2ba1f8f2d22833196252820e5b5705d9dd1245f695662332ada) |
| [GASLLZ…EB3C](https://stellar.expert/explorer/testnet/account/GASLLZDUDYQCIJCGWBVBJRKUVRVMH7LFRADIMPPDB7KRWCSAY4O5EB3C) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/3239e8adae59c9f54ebed64e4f5d0c692a4733c8ebaea0c9f30a07e85bc3752a) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GBRQB6…IOTQ](https://stellar.expert/explorer/testnet/account/GBRQB6HMOLEYG2AEASHU3LVLFPVSZ367I3QIHC3FOYJRHT2JMVRGIOTQ) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/9307ae2fbe13d1c9e1929fa3fddbdd0fa115ba79f5efaf925f7eb4919dccc4e1) |
| good seller | [GASLLZ…EB3C](https://stellar.expert/explorer/testnet/account/GASLLZDUDYQCIJCGWBVBJRKUVRVMH7LFRADIMPPDB7KRWCSAY4O5EB3C) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/fc05a4c56cc804c93f4d2380119128639494e6040813f20c013f7585051ef2d6) |
| bad seller | [GBRQB6…IOTQ](https://stellar.expert/explorer/testnet/account/GBRQB6HMOLEYG2AEASHU3LVLFPVSZ367I3QIHC3FOYJRHT2JMVRGIOTQ) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/2e0abe289ee83c3994e98abb743662a47fcecf4bd7be9b26a32bb34bcfc5c09d) |
| bad seller | [GASLLZ…EB3C](https://stellar.expert/explorer/testnet/account/GASLLZDUDYQCIJCGWBVBJRKUVRVMH7LFRADIMPPDB7KRWCSAY4O5EB3C) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/36d991cda8997b6841f786133f5ebebf08385de4df689d24f72aaa4421f3fa68) |
| stale seller | [GBRQB6…IOTQ](https://stellar.expert/explorer/testnet/account/GBRQB6HMOLEYG2AEASHU3LVLFPVSZ367I3QIHC3FOYJRHT2JMVRGIOTQ) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/43a1ac8e0395d97ac910ab3750c2b26a0e740ed8fa5855cedd397a5747a67ee0) |
| stale seller | [GASLLZ…EB3C](https://stellar.expert/explorer/testnet/account/GASLLZDUDYQCIJCGWBVBJRKUVRVMH7LFRADIMPPDB7KRWCSAY4O5EB3C) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/beaaaef6eafd29e7f4a85b57fd9ebdc0410211ee9e9c0dfe19d541a4c199bfe3) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/e3155073fff2e5c9a605e4d8a09fc5006d3dee27a43a70df5dfc1e5031394d2b) [2](https://stellar.expert/explorer/testnet/tx/60a0c7cc61c05a3c562bfba26f72f48f889b3db00c98c5d976cac9b66b8c03b8) [3](https://stellar.expert/explorer/testnet/tx/6efdd0248e1eee872ef67366ce1eefc94e17589c069422f69950065f3eca819c) … | [tx](https://stellar.expert/explorer/testnet/tx/3d2c2659c5c6231fcf160857341b7e235b7051f5251ac8b26bc293ac32d00c60) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/41762eeb8ce25878b46f08473dd3a47121bd6cede3870de57a42a4a8df3facfb) [2](https://stellar.expert/explorer/testnet/tx/92516b5907b5abdc3a909271c95dde04f98113915fa5dcbf601a389ad77c1b28) [3](https://stellar.expert/explorer/testnet/tx/d970af48c5a42ff02f9b210f3f3873d31adaf4fac18b67be33cd96569d305247) … | [tx](https://stellar.expert/explorer/testnet/tx/cd7816ef0ad909af5a3b92f81b05db2a7858d188aad7ce7293be607e411b9ac9) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/764651f24bf01cbe6b31bd052e96f7c4b98ab62a31fdf3412139fffc4d2b8106) [2](https://stellar.expert/explorer/testnet/tx/14f5eee56a50cbba1d8ed699979eb9961e1b9c7896af72fdc331b72da11729c3) [3](https://stellar.expert/explorer/testnet/tx/d051c182b16cbe3d456c29927cc71cec6d24daff37d1671b5060323f29ce0bbc) … | [tx](https://stellar.expert/explorer/testnet/tx/007b2eca0bd1ac3eafa682df1115e4872fde6d44d30c910c92806233d2198960) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/b46f3b6fb878626d128846c0bcbdaca4546d9a6cc16fe94843d394b54c8ddc2f) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/580481f3010cfd31416bcc0865e1834825a30d34a53eb85d1b8cb9f65e298679) [2](https://stellar.expert/explorer/testnet/tx/ab498147912b4666e44b9fcb831055fae2a78dc0807516f5ec755660d83a2d75) [3](https://stellar.expert/explorer/testnet/tx/28beff60f6e1a502b22fd1986d684ee426c868c5993d520fb5fe0084cbf982f5) … | [tx](https://stellar.expert/explorer/testnet/tx/a93e7ba5daef26636f6008f2637996acad6724ca7b57ba93bed933bcf53b973f) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `fd797ace8a5358fe…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e82332e6fcfc375c16552c1759829c9dc0f4046e703f92c48ff98d718cefd207) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/0e67b04424c4d3be92cd03445f159ab8a45cf0c5d5b82bcbf3d1f8f44bc6b081) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6c74e54776dc61412acdd439dc6b36af6fdd53759cc6f3e3edb877b9b6cd946e) |
| 3 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 4 | `/broken` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/0b94f71dc63c1ad794dd00efde5c097e0e459f303b8d289aace142b8d7c1928a)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/bf1e05e362c3ce35d2e4999aa71f76b48b0493dbe63395e228eacb86ab6303e2)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/7c8e560812944ff5d4939991894e96bd0c2fa8700041e9168f35191373f57dc1) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/747d1b309bee63af19fcd9c59c512fc65958613641c7d30f7da6f896da0660e5) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
