# 402Scope Trust on Stellar testnet

Run finished 2026-10-14T10:25:18.890Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CAMWQG…HYWJ](https://stellar.expert/explorer/testnet/contract/CAMWQGCF7ODG5NXJCJH4VOWFMURXKARZTIXOUVWF7TVWBLJ74P5QHYWJ) |
| Trust policy (OpenZeppelin `Policy`) | [CDEHEM…5T73](https://stellar.expert/explorer/testnet/contract/CDEHEMEMXECXAOTQZXFP4C4GUHFU4FBKBD5KA7IELCUQTGHBS2FP5T73) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCLM4R…J76B](https://stellar.expert/explorer/testnet/contract/CCLM4RGPXBEFWOLM3VX6QJ5H2WVL72BUFRI2BWV4BMISVDB5YKFVJ76B) |
| Spending limit policy (rolling window, x402-compatible) | [CD6H5O…WB5Y](https://stellar.expert/explorer/testnet/contract/CD6H5OALEVT54HGX7YA4P3IWUP27U732ZIGJMT3ECRCUICC34AHFWB5Y) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDBRSP…IFTH](https://stellar.expert/explorer/testnet/contract/CDBRSPL3GI3LUE66J7O4HQBEYILK3USBMSNYCEJBQHAEW5CXVQUYIFTH) |
| WebAuthn (passkey) verifier | [CCNFJT…L3OY](https://stellar.expert/explorer/testnet/contract/CCNFJT2JOOXHZB4CAEXLY5L3DVXIX5QKOVVXNWTWZ7PIFRMZXDFEL3OY) |
| Refund bond (optional seller bonds, no admin) | [CCEHXF…E4BI](https://stellar.expert/explorer/testnet/contract/CCEHXFWVEZJS32WI72QXJPKBBZBGHBD7A76FRJRUIOFGCG2DV56IE4BI) |
| Escrow (x402 scheme `escrow`, no admin) | [CDTPOQ…NPUT](https://stellar.expert/explorer/testnet/contract/CDTPOQ6WTCEBUEMDQUTRIMDEXBG5UDROJEUJG3MEM3RPGDYJHA5BNPUT) |
| ed25519 verifier | [CC7M2U…EHXZ](https://stellar.expert/explorer/testnet/contract/CC7M2UR2XSQTQH5LNK6U5GOHXOIJ5XF5MQ2CM5FQNW55LP2YFDD6EHXZ) |
| Test token SCOPE (SEP-41) | [CCXCYZ…3KRI](https://stellar.expert/explorer/testnet/contract/CCXCYZ3I6O73OP5J2HTKOYKKO3Z2RSO5ZMRAR43S3T7EVJBF3ERI3KRI) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDUKYC…JVPN](https://stellar.expert/explorer/testnet/account/GDUKYCZGTSU2AHI6UMDHJJEDJGDWXFMBDGHTWVPFC2NCNLTS372TJVPN) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f5a5b54c36eff2af0f63b2d9be6fa42d83518fa76040f1287f6a81cbad11bb58) |
| [GBKLLN…SVKO](https://stellar.expert/explorer/testnet/account/GBKLLNE3N5VYAV66I4MUJ6JH2UNPH43PXCXSWGOC2Y6SRFGXHL7VSVKO) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/55de5048284b63dbd6b6c78ae5922e05405fc8597751670b05640f9f2475a67d) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDUKYC…JVPN](https://stellar.expert/explorer/testnet/account/GDUKYCZGTSU2AHI6UMDHJJEDJGDWXFMBDGHTWVPFC2NCNLTS372TJVPN) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/95dd03822b5f08d134b5dae1e21c9008be1a7961bc2a03049d9eee533d75fd33) |
| good seller | [GBKLLN…SVKO](https://stellar.expert/explorer/testnet/account/GBKLLNE3N5VYAV66I4MUJ6JH2UNPH43PXCXSWGOC2Y6SRFGXHL7VSVKO) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/33ee6322c66adb23924e42b3fbc3cbe7f085cf7cc084501c1740686c5d8c7a55) |
| bad seller | [GDUKYC…JVPN](https://stellar.expert/explorer/testnet/account/GDUKYCZGTSU2AHI6UMDHJJEDJGDWXFMBDGHTWVPFC2NCNLTS372TJVPN) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/8156e06af62577dd13bbb5636e55efc029e749d79f34f2a6be7ca80d3f31e5da) |
| bad seller | [GBKLLN…SVKO](https://stellar.expert/explorer/testnet/account/GBKLLNE3N5VYAV66I4MUJ6JH2UNPH43PXCXSWGOC2Y6SRFGXHL7VSVKO) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/0826ad58cc02e2bf5aa4209544eb0fb3934a575dba57f627bf8aca6505dfa627) |
| stale seller | [GDUKYC…JVPN](https://stellar.expert/explorer/testnet/account/GDUKYCZGTSU2AHI6UMDHJJEDJGDWXFMBDGHTWVPFC2NCNLTS372TJVPN) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/cc80baa175c6d6ee1f29a2bde9e22c3fc151711f0ab2273ccfa36ab90ddc1566) |
| stale seller | [GBKLLN…SVKO](https://stellar.expert/explorer/testnet/account/GBKLLNE3N5VYAV66I4MUJ6JH2UNPH43PXCXSWGOC2Y6SRFGXHL7VSVKO) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/53b45261750664eebf75e7379baad8b6f0717b85644bec999fe288ec9b2b5163) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/8ebe8615259d8ee199d2c486198fdb20a81e754333c201b17b14d1c9b8c4aa21) [2](https://stellar.expert/explorer/testnet/tx/fec50fc9064d244946482ba69325db27fed8a812494e65f7c28a327cd807782e) [3](https://stellar.expert/explorer/testnet/tx/84eb3fad1fbf85d430ea3caaa4d1eef6a970f406e0a3176779ee21eb69a0c5ba) … | [tx](https://stellar.expert/explorer/testnet/tx/1548dbc9f048bc94fa9a11f2d6a6d017c1542cbde4bf65b0e34081c357cb64ca) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/726f8f8f3fe8f6952011e6e3d14ba401da7a535f91d2fe73f22436b482026cba) [2](https://stellar.expert/explorer/testnet/tx/e0969fddd27c0247e5829250a09cb02849609428cbc24f55a0a69ebba753fd29) [3](https://stellar.expert/explorer/testnet/tx/24f4dd137506aa61ea7f1dead850dd5cc5388e897dc828fcb9ce52af07d7b735) … | [tx](https://stellar.expert/explorer/testnet/tx/b764a2ec772c96caab487958a0b206c90b2f0d11c1a31d85964ac35f24907289) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/6ad6c9f02b74ed8fc6177ceb15aac56b987b543b08ac3df3bf774d4a811092cf) [2](https://stellar.expert/explorer/testnet/tx/f5efff03557361a1109985cf81458dbb9be8bca2cb512ee2723aa70969e55256) [3](https://stellar.expert/explorer/testnet/tx/238c9d3a1ee5cfdf094ef65e739438070351dd700dc56e77325bb91cc5ff82ce) … | [tx](https://stellar.expert/explorer/testnet/tx/b457c332adf992a6c0da4045f319190d1e2b2a389fa2c4f288c663776f0beecc) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/77cb387d5dd7b4e02d8a5a2c27553e7ab5db1afc2504f8129f010e41dba9cc7a) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/83438ca9c2591716909f7928f37aca41561c64d3c72b24073be30fa2e9cf867a) [2](https://stellar.expert/explorer/testnet/tx/164d8d8643c7e4e74534c939f389cceedf850cc81c6ead85cc9288e391f52c8d) [3](https://stellar.expert/explorer/testnet/tx/550d44278e014366ce656eb572f75ff7cf0230cd0e7ae400c5049ca2ffa3e9d0) … | [tx](https://stellar.expert/explorer/testnet/tx/a6af995831e4258f926bb171496efa39c04424e870b1f8399cbd14bda0c9b6f8) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `dd21c815493e3d79…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a372aa406ff012da802c430debaf67b152807326af509e7beea8bd7c9dbd5904) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9e4ecfa80221b088eb45e026cef7688bf8768eb3e176ca0b7a0043ce3ebd689b) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/5cf625bd887c990e7cb53ef30925d49216f38256fd1566d6a4616d6376a7b669) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/869b8c9dbb51dcc30de15c6293a467661a36d32bdd4fcbd31d50a8d8e65db3e8)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/d8069bea8765f4c9f43c590c48834084db516d20ad73a30951f79194d09bb402)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/7cb8a2f9b9c78cf2686998ead6dfec3573e715139375a1811c700db6e91c8c53) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/c5a16bd1202cb9804cd06b7b8ea4309af85d31e532bde479de516952cb99621a) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCEHXF…E4BI](https://stellar.expert/explorer/testnet/contract/CCEHXFWVEZJS32WI72QXJPKBBZBGHBD7A76FRJRUIOFGCG2DV56IE4BI) ([deposit](https://stellar.expert/explorer/testnet/tx/a040e08a9e09c157dfce6a08911bfdd19bbc5f8f854aafce3850dc26c0e24fe2)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/a104bcf7749e80dea0e4bbd849bb3bf85b29a8fb2e8f1d6581388490f6a61404)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDTPOQ…NPUT](https://stellar.expert/explorer/testnet/contract/CDTPOQ6WTCEBUEMDQUTRIMDEXBG5UDROJEUJG3MEM3RPGDYJHA5BNPUT) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/c6e70b13b49e1577f6c72b4b7c96bed000a9f514e25f2e70859a9291d602c5c9)) | **released** | 4.5 s |
| `/escrow-stale` | 5.6 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/ca210f8380ff45d418f634c27259b94c42110c973babef6de6b62f257fe70bcc)) | **refunded** | 4.2 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
