# 402Scope Trust on Stellar testnet

Run finished 2026-10-18T09:56:25.050Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBD6CG…MJZ4](https://stellar.expert/explorer/testnet/contract/CBD6CGDFEQGDPJZDWO2LK2QY2IXOKWO6JKPJRMAWXKSMGKPUQ2ZQMJZ4) |
| Trust policy (OpenZeppelin `Policy`) | [CATOGM…7FMG](https://stellar.expert/explorer/testnet/contract/CATOGMAB2JYBPQI6PDN56KCHIP46WUTB23MWWZB6VSWQZ6DKP6K57FMG) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCR5NI…MCOI](https://stellar.expert/explorer/testnet/contract/CCR5NIJOOBAVQCUR26EJYYMFPLCQWYLID7HBUZJEEHXQIE7H45MPMCOI) |
| Spending limit policy (rolling window, x402-compatible) | [CAQAXE…FL2X](https://stellar.expert/explorer/testnet/contract/CAQAXEVI7CJV3OYAMP2ZR7CF4OQ6CG7FHEND2437JFSWTUQ5H5Q7FL2X) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDYVUS…DU4X](https://stellar.expert/explorer/testnet/contract/CDYVUS44SQXD25R2OCIGMU3GMUHEQW3K7LOISWBY53KRCVCKN3RTDU4X) |
| WebAuthn (passkey) verifier | [CA4OSP…U4WH](https://stellar.expert/explorer/testnet/contract/CA4OSPS4M2FPQGF2DNKFGU73MXCYZRKGNP47EYPI3GMCQPH6CV5YU4WH) |
| Refund bond (optional seller bonds, no admin) | [CDBUST…YOBW](https://stellar.expert/explorer/testnet/contract/CDBUSTHEZPFUKRYZV5CW4MTXWINNQD3OJ64MGNVJJXXVG2KV6L4BYOBW) |
| Escrow (x402 scheme `escrow`, no admin) | [CBHVPI…7NHR](https://stellar.expert/explorer/testnet/contract/CBHVPIGMPWA22TYNIPJR2UQV675K4WVS4PEABPIQTX6R2QMR23OV7NHR) |
| ed25519 verifier | [CAJRG3…IFYN](https://stellar.expert/explorer/testnet/contract/CAJRG3MX5VIX6XCHJ56XRWCO27JGR7VBKC3LWHEQ3GPXJ32OPVVVIFYN) |
| Test token SCOPE (SEP-41) | [CC3XB3…H45I](https://stellar.expert/explorer/testnet/contract/CC3XB3L6WXXSL5LBRHSXMXBK7PDXS5GOBJCQYZQOPKMYULMJYKWTH45I) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GA32PF…J6KP](https://stellar.expert/explorer/testnet/account/GA32PFP4YKUWGOKUWGAVKWO77OCLCQ4MPS3VLGO7UISIENZUOTDOJ6KP) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/d3bb0966d09de4edfea1028c009149b7f4aa016e7e1230c5698953278659694b) |
| [GBL4MU…YHCI](https://stellar.expert/explorer/testnet/account/GBL4MUQHCSB4B46ZE4SE7FQA6PEPSWPWUYYFBSXFG52W4EERRSLLYHCI) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/06b2e5e482ab69f871f890abe6242f322756b71a26ad0129ab4618213fb1af2a) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GA32PF…J6KP](https://stellar.expert/explorer/testnet/account/GA32PFP4YKUWGOKUWGAVKWO77OCLCQ4MPS3VLGO7UISIENZUOTDOJ6KP) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/82f13734406c1e89a1c932b206ce32a3cc4dedef588c7ca5ba22319ae039a06a) |
| good seller | [GBL4MU…YHCI](https://stellar.expert/explorer/testnet/account/GBL4MUQHCSB4B46ZE4SE7FQA6PEPSWPWUYYFBSXFG52W4EERRSLLYHCI) | 93 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/19b235246301f9ee8f8706900e443931063825c85998245e03d78923bf331498) |
| bad seller | [GA32PF…J6KP](https://stellar.expert/explorer/testnet/account/GA32PFP4YKUWGOKUWGAVKWO77OCLCQ4MPS3VLGO7UISIENZUOTDOJ6KP) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/057941bfe7e0a9feeae38fcb93ce21d05939dadb9a76b021d2419970c733f774) |
| bad seller | [GBL4MU…YHCI](https://stellar.expert/explorer/testnet/account/GBL4MUQHCSB4B46ZE4SE7FQA6PEPSWPWUYYFBSXFG52W4EERRSLLYHCI) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/831bcfa41dde4d50941eb8e78de0542963f8f8b7a4ff0d2cbdae522d02f91871) |
| stale seller | [GA32PF…J6KP](https://stellar.expert/explorer/testnet/account/GA32PFP4YKUWGOKUWGAVKWO77OCLCQ4MPS3VLGO7UISIENZUOTDOJ6KP) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/d615c86b00faf625d2b3d1c7e8878b64ae5d1c71c7ce62580f97aeba4b5328b6) |
| stale seller | [GBL4MU…YHCI](https://stellar.expert/explorer/testnet/account/GBL4MUQHCSB4B46ZE4SE7FQA6PEPSWPWUYYFBSXFG52W4EERRSLLYHCI) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/033ee7d3bcfba796506bf12b9b6a0631e85b27d23328bbcb7245517aa3352991) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/834d1b61740170e908ed8f4278734b8a19a451766eedeaa69bf3e3002f62741b) [2](https://stellar.expert/explorer/testnet/tx/84e0b0f26754ece2852dac9928699af4d09dc4138025c0bad271f5d7c9c34296) [3](https://stellar.expert/explorer/testnet/tx/e78d556696b517794778e4dc76189ee3bd2b43e70ed52178028db4bd06b8cd3c) … | [tx](https://stellar.expert/explorer/testnet/tx/b19ebfd0d1caa8f3937c17bd210ecc2dd909ef3a8ea446c82c19fdc71928e7ce) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/0d61768c4be8de30df822502ff85c8eca07a8a43d41851f15c0b163d109ee065) [2](https://stellar.expert/explorer/testnet/tx/cb18b3155cb64bd7e07ae0d358762911886234e51066001174c761baba86989b) [3](https://stellar.expert/explorer/testnet/tx/26e09b9ed9d39ce40c855fa63f3ae9d115d5c191668394d24ca9dd0fc640bc34) … | [tx](https://stellar.expert/explorer/testnet/tx/7548863bd3d2fc8b5e28381259e44d7b98f584c980402e08ad0e46e8afce846b) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/fba9420cbfc06aa819e7506cdae5d65f9b9f2c079e881362862982e240289ec2) [2](https://stellar.expert/explorer/testnet/tx/afe55ae8240d6e8bb7e03bbc6c903ca2bb63e1aed1454d1032335ecc2816e626) [3](https://stellar.expert/explorer/testnet/tx/fb54fe490c279b8c1c59201d47a1f5fb90a62756baf381d9ed92151ce6b3df52) … | [tx](https://stellar.expert/explorer/testnet/tx/2cb3099f1fda9f72221bdbf6204c92c3bf31f6fd3779e1cbe65cc50d64965337) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/25010b361e4c2e2a4b0cdc3e68b7159970612fdab17b0b7c3c2cb3014892e0bc) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/f29a665f68ead1a926e191bda2851517ae1d0a8fb765e55b427517cb865cff69) [2](https://stellar.expert/explorer/testnet/tx/40ba1387000cf859940c86457c59fdaab314c1d046b42b42bfb8a44ce2f9ea44) [3](https://stellar.expert/explorer/testnet/tx/ca9befe93d16b9596793c93cf0e8b88e107c11cfbd2b2fc31baceb894f12e95e) … | [tx](https://stellar.expert/explorer/testnet/tx/0eb6f4dd7da099de9971e4918462af0fc206e1411ef7543455074281ae0d255d) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `cc9aa411261197bc…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/15a52022e5c686f728c9cb6edbecc6e4ae1ae3fe528369891ec8be5eaa05a951) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2b84838cd1b5dda2a87a15b9a0ee8af086688e836931adfa781c498ea1b770b2) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a926a9bca4eae3ee6f55a66a6e337197cc0dcd7ad413181e179bbe67923ba810) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/46a04bb84bdccf5d01def752a597d138bf3a5337645fbb6f0570d00a81d92342)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/cf13448da9a312f03d270ef0e747fca43272a0e1aa8e2eaffa888e464f6db929)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 93 | true |
| `/slow` | trusted | 93 | true |
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

Facilitator decisions: good seller allowed (score 93); good seller allowed (score 93); stale seller blocked (score 50).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 93 |
| 2 | `/slow` | yes | 93 |
| 3 | `/stale` | no | 50 |
| 4 | `/wrong-type` | no | 18 |
| 5 | `/broken` | no | 18 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/1a18ad0f40abb11ee7d936b9405f932912090d40930d4677176135272a9ae64a) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/15a5fad64beb66a1dd1dedbbb4eaa106016771b45c085aa323d8edf5c6b9ac57) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CDBUST…YOBW](https://stellar.expert/explorer/testnet/contract/CDBUSTHEZPFUKRYZV5CW4MTXWINNQD3OJ64MGNVJJXXVG2KV6L4BYOBW) ([deposit](https://stellar.expert/explorer/testnet/tx/a02618dd669fb4f5fc19b7efde30245cca88c8323010938960922799f6cdcd61)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/a79ca90158c8da6a2532a9fb209f500ae65a72179fd890b2ef2c109872ccf413)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CBHVPI…7NHR](https://stellar.expert/explorer/testnet/contract/CBHVPIGMPWA22TYNIPJR2UQV675K4WVS4PEABPIQTX6R2QMR23OV7NHR) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.2 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/4cbaa7f1f65b217028d0a201eba5733243e7f4580f8e23ff1ea8adbb2e5987e2)) | **released** | 4.6 s |
| `/escrow-stale` | 20.5 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/5053289873b2e44ecc28f883436f6aa5f5195104a1854754ebeabb729fd5a80c)) | **refunded** | 4.6 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
