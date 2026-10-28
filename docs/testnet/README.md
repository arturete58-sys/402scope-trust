# 402Scope Trust on Stellar testnet

Run finished 2026-10-28T11:32:18.342Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBVKNW…UENU](https://stellar.expert/explorer/testnet/contract/CBVKNWVWWKGBNZFALJQZJPKY6Y6PDKMYC4PGHLFJOLVBH4QNIMPZUENU) |
| Trust policy (OpenZeppelin `Policy`) | [CCM5DK…7QU7](https://stellar.expert/explorer/testnet/contract/CCM5DKC3MLGA3CKU5TUIVVNPHAUFV3NZTOD2CLW2HT2BKQ2576YH7QU7) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAE6JO…PKKW](https://stellar.expert/explorer/testnet/contract/CAE6JOQLRCMDA4ESYL7WCMPFZXBHKZKMIDXFEZCCFWMLLR5DNRHVPKKW) |
| Spending limit policy (rolling window, x402-compatible) | [CDYHDG…2OQX](https://stellar.expert/explorer/testnet/contract/CDYHDG52KZMR65G76SDOPI7WBVTZOXH6IRAK46YSKJYHULLMP5OU2OQX) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CD4FWY…XPVO](https://stellar.expert/explorer/testnet/contract/CD4FWYGVBN34QJMLYDV7LT4KLCHHHXCJUETYXMH53E4W3N4DQOGDXPVO) |
| WebAuthn (passkey) verifier | [CBIHFS…44LS](https://stellar.expert/explorer/testnet/contract/CBIHFSXCFQPDHZLJJSI6763LKZHPTL2QIBO4VYYNO7GHTRH5B7BE44LS) |
| Refund bond (optional seller bonds, no admin) | [CA6DM4…UI27](https://stellar.expert/explorer/testnet/contract/CA6DM4452VC2B3PZG6YHNGV7TYEPMMA4GSNG5JOIXMMWIQ46UMMSUI27) |
| Escrow (x402 scheme `escrow`, no admin) | [CANROK…SGDR](https://stellar.expert/explorer/testnet/contract/CANROK4DEWG4SASC2Z3PL2U4EVKO6L2UHHZQFCXFD4ZAKHWDS3NKSGDR) |
| ed25519 verifier | [CBH6PO…AOKD](https://stellar.expert/explorer/testnet/contract/CBH6PORD5Q47BHGGF62UGBMFFYJEQ7BKVJANMUVGRKT3Q7EWJZGHAOKD) |
| Test token SCOPE (SEP-41) | [CCYTUN…63GF](https://stellar.expert/explorer/testnet/contract/CCYTUNZ3UGCCOVOUSDNZEY3V6QBKDUWVM3MUSUSGXE5T4ZLAZW7R63GF) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GBHF5C…LREI](https://stellar.expert/explorer/testnet/account/GBHF5CGJDP7LI2YBOFTTZX3UJ5YMWLT3RIH2WRHJXJZNP77GMO7CLREI) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/7486203ae355389475e74e1d30a5fd31481bcc0498565f2ad2fdac47397fe06d) |
| [GB4AP4…FQXL](https://stellar.expert/explorer/testnet/account/GB4AP446GSTUXQPM32VOFZFKSFZSEFSBWLDB4JVFJ7NN535DPWVTFQXL) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f85f3d768e5a9abce1d6e74cc5d9cc03983b5a2b3c90c35eb43815d0d7e8cd29) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GBHF5C…LREI](https://stellar.expert/explorer/testnet/account/GBHF5CGJDP7LI2YBOFTTZX3UJ5YMWLT3RIH2WRHJXJZNP77GMO7CLREI) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/9d0891376da80a5fdec9ee69a13713fe3d49209b9e6ae6cece6df0efccb67009) |
| good seller | [GB4AP4…FQXL](https://stellar.expert/explorer/testnet/account/GB4AP446GSTUXQPM32VOFZFKSFZSEFSBWLDB4JVFJ7NN535DPWVTFQXL) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/d60baff008754a6547b0baa8d4d08b9fdf8cf36075f80e5f49d430ef74ff0d64) |
| bad seller | [GBHF5C…LREI](https://stellar.expert/explorer/testnet/account/GBHF5CGJDP7LI2YBOFTTZX3UJ5YMWLT3RIH2WRHJXJZNP77GMO7CLREI) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/e10e53eb170ebb161e215588195013d4f0d662b9033d44635466b9dc774cbcbf) |
| bad seller | [GB4AP4…FQXL](https://stellar.expert/explorer/testnet/account/GB4AP446GSTUXQPM32VOFZFKSFZSEFSBWLDB4JVFJ7NN535DPWVTFQXL) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/00ac1a9891117622852b021bc18b9339c9d741bdc0a532266f923f4f79e72ddd) |
| stale seller | [GBHF5C…LREI](https://stellar.expert/explorer/testnet/account/GBHF5CGJDP7LI2YBOFTTZX3UJ5YMWLT3RIH2WRHJXJZNP77GMO7CLREI) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/d02e489a62221debf2e368e3c552dd58e3d2c5f52a1adbf21d1519a5f49d1541) |
| stale seller | [GB4AP4…FQXL](https://stellar.expert/explorer/testnet/account/GB4AP446GSTUXQPM32VOFZFKSFZSEFSBWLDB4JVFJ7NN535DPWVTFQXL) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/051c9e71331f4e2d9a40262da9de05c62981eb897ebac68ea39015521b42847b) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/3b6d924222bc985614cf948a8d788688d8a4acdceb71a095270da63ad2dc7f21) [2](https://stellar.expert/explorer/testnet/tx/b4cb651a09582d8e25c4f3f23cd4559eb10cba99b1d0ab9e835eba1732d08035) [3](https://stellar.expert/explorer/testnet/tx/e5c4e90907dffe09f2357fa7fe1232e3d77b8dc7a066e3aef37edb98cbbf2dc1) … | [tx](https://stellar.expert/explorer/testnet/tx/e6d0b76ebf8c1b149f27667a254357efeddda383469ee145ee819f367d0ec427) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/5252c06f0e52bbdf38e92d6340361966921e4d4d8bfcdf48f7a803b88410bd60) [2](https://stellar.expert/explorer/testnet/tx/6b9303780f783d81dd4f29a2d8c586e3056c593cac117ddf3216fcd4c1082c50) [3](https://stellar.expert/explorer/testnet/tx/c9464711efbedd3b1de9f7c30947a144f34fcbb3031979df2b3afe6654524c6f) … | [tx](https://stellar.expert/explorer/testnet/tx/01a65adcc174ba8cd8cf0179df0c25824f2f6cce1817d23b5442a6752e25f327) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/5e27e44a0b69f456fb21483dc48e60fa8057227fac9a2fab93c60891ab7a7ceb) [2](https://stellar.expert/explorer/testnet/tx/3a760c7214a9d79bde7e146ff7f4881d373fe577cdf2950a81cbedb103319554) [3](https://stellar.expert/explorer/testnet/tx/602b18e89fe5978cdade336e0b1ea2fecf3e17f460165eae4c376a16429b39b4) … | [tx](https://stellar.expert/explorer/testnet/tx/bee87eb9afaa201bd128ee1665f72436ed3145211d3b6785874a58351d3ea235) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/130622b8ec57c89efb7a299188a066ee3091fb87039eec7624904087bd8ded7f) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/0d1d886c8aa39a34800b79861f3191f73f03c425b262b7510819be477dde620b) [2](https://stellar.expert/explorer/testnet/tx/375cd2ac71d849e32eaa87118865f02fbc4d544ca664e244c9c59da40e7902bd) [3](https://stellar.expert/explorer/testnet/tx/737645d6adb2cfe31d6c30527f4af52adc2902a59ad36f0225fdd729a4a64c1b) … | [tx](https://stellar.expert/explorer/testnet/tx/d97fd4cccac35fac1c4ebb46f3bb3a5a0f2cb42d161e24ae7808635f0c62c0ce) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `85a67ce6305ce44e…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4e1fb31e07730725bcb86258bc731d61fa68bae78e6c476c0ac8d1492abbfc6b) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a92a5f0dde95a523f7855c9143b9538ca05e0ff71bf72dbddd9f6ad75d9f0531) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e86fbbf65a40dfecb55f4225473971d432a4f1eb36984ee950ec078d706eb41e) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/bf2e3579b78177c1d1f6697f81513ca19d549a8504991d494c4a1b87aaf0175f)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/f41d0ad4c312cdb04a6797ca8ac2a0815896c52706aa7271317f70553bdb1a8a)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/670eab3bcb9930c6ed01dc80782304723c9fc896a5f488d25feee002ae6841f4) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/05c5288267ec48d3bf975706619415d1c8f0d95c43860b213b8887f013326419) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CA6DM4…UI27](https://stellar.expert/explorer/testnet/contract/CA6DM4452VC2B3PZG6YHNGV7TYEPMMA4GSNG5JOIXMMWIQ46UMMSUI27) ([deposit](https://stellar.expert/explorer/testnet/tx/3d0e7b2699736621d6fcc24546ad617d953a25c24bcb0a405662b67eb98fe377)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/529db89a88ef0035bd0fd0a584fd0128842936458a3aebf80120c8eb0c878ad4)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CANROK…SGDR](https://stellar.expert/explorer/testnet/contract/CANROK4DEWG4SASC2Z3PL2U4EVKO6L2UHHZQFCXFD4ZAKHWDS3NKSGDR) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.9 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/4d9d4b25e366b4880c95e9c36bf756a994238bb0bade347cb3fcf9c0d4f24061)) | **released** | 5.1 s |
| `/escrow-stale` | 4.4 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/7edc2aba9b7f10495fc4bd1eb6296a02e8035b4ed316f6c9fa8f6bec047a005a)) | **refunded** | 5.5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
