# 402Scope Trust on Stellar testnet

Run finished 2026-10-31T11:06:12.745Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBP23S…2GGA](https://stellar.expert/explorer/testnet/contract/CBP23SI55ATDEXQ6AXJWDTDKXV5MEOPADBQLVPH4IEZCCAYA4SH32GGA) |
| Trust policy (OpenZeppelin `Policy`) | [CAXTUY…UZVY](https://stellar.expert/explorer/testnet/contract/CAXTUYGKRPIIWZA5XQZVCQQVWZA4PL2OKNMOFEEKJE6UAJAIIZG4UZVY) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAR7FL…ATM4](https://stellar.expert/explorer/testnet/contract/CAR7FLT626JE3VXJHKCU5CXBRNCGF7XPKU33AU4NLZUK3ROK36NKATM4) |
| Spending limit policy (rolling window, x402-compatible) | [CAH5SG…XHAX](https://stellar.expert/explorer/testnet/contract/CAH5SGP6QA5U3AWB4RZRUWWK2WWILGJHWGWXVBLEBLKD2HDDFNKCXHAX) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CB42J2…GZLR](https://stellar.expert/explorer/testnet/contract/CB42J2WVZWMFVSIIWYZRNXZAEBDOW2QJDNAVXGD5FJL62EP7YVABGZLR) |
| WebAuthn (passkey) verifier | [CDYJCE…5MCO](https://stellar.expert/explorer/testnet/contract/CDYJCENG5QUOHIT5XS3XFVZIHUPWSBO3Q3XPRCAEB2TMZ2I7Q2LN5MCO) |
| Refund bond (optional seller bonds, no admin) | [CBVXYO…4AD2](https://stellar.expert/explorer/testnet/contract/CBVXYOVBD5WDQWWBGYJS3O5MBISZQMGOCTHCANCYWR7OJKQHIWOQ4AD2) |
| Escrow (x402 scheme `escrow`, no admin) | [CBYVQC…NZD6](https://stellar.expert/explorer/testnet/contract/CBYVQCTM47GTW6X4MMEINJQNPVEK6KBWDHOC7HQ4RTXWJQTEJPG3NZD6) |
| ed25519 verifier | [CCSDNI…JF2N](https://stellar.expert/explorer/testnet/contract/CCSDNIUHGIS2CZ2VYSDAE6PQC5HOXP4Y2EDJOE64SGDEBNZUGWROJF2N) |
| Test token SCOPE (SEP-41) | [CCOYJN…3Y2K](https://stellar.expert/explorer/testnet/contract/CCOYJNGMUJOFJZV2O673AXIJTB5MXIEQXAW7T64JKJGUHPXVZHXO3Y2K) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GAMSMD…N6FP](https://stellar.expert/explorer/testnet/account/GAMSMDSWXOAZG5GMNROMEKF2DYJVTIRR7FBYL27CLVOZOFBZ7KVGN6FP) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f3e471583fc14ef81c9251b8059b0169f22bce769310e7f08da8a48f46debdd0) |
| [GCSZKB…ZFND](https://stellar.expert/explorer/testnet/account/GCSZKB5JSJTH6YIGGALCLWAGZ763MAV5OR6C3TSXWUUT3CPF3KU2ZFND) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f99eef0836664e6e1d74e5814294431e962280052f60b045695083c2290db0b0) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GAMSMD…N6FP](https://stellar.expert/explorer/testnet/account/GAMSMDSWXOAZG5GMNROMEKF2DYJVTIRR7FBYL27CLVOZOFBZ7KVGN6FP) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/52dd65bc68f844aebe15e573febed79a24870bac2ff3abe6c881899d43d3c17a) |
| good seller | [GCSZKB…ZFND](https://stellar.expert/explorer/testnet/account/GCSZKB5JSJTH6YIGGALCLWAGZ763MAV5OR6C3TSXWUUT3CPF3KU2ZFND) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/9e192276603b679f290f99006966ff16bfdf72f769fd233c06a3c5c9322d6f15) |
| bad seller | [GAMSMD…N6FP](https://stellar.expert/explorer/testnet/account/GAMSMDSWXOAZG5GMNROMEKF2DYJVTIRR7FBYL27CLVOZOFBZ7KVGN6FP) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/740827fab8eea39a02eb1f432e6c67f93ed7c6571a97034ea5113bb12cad9e28) |
| bad seller | [GCSZKB…ZFND](https://stellar.expert/explorer/testnet/account/GCSZKB5JSJTH6YIGGALCLWAGZ763MAV5OR6C3TSXWUUT3CPF3KU2ZFND) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/339c4bef73124d6f16e7df082489d7db0b675910393536dea0efd3cf7fab6887) |
| stale seller | [GAMSMD…N6FP](https://stellar.expert/explorer/testnet/account/GAMSMDSWXOAZG5GMNROMEKF2DYJVTIRR7FBYL27CLVOZOFBZ7KVGN6FP) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/b4b6ccaef23c13ad57497a5951d78f184690a99daaeb09c617e0538a253016dd) |
| stale seller | [GCSZKB…ZFND](https://stellar.expert/explorer/testnet/account/GCSZKB5JSJTH6YIGGALCLWAGZ763MAV5OR6C3TSXWUUT3CPF3KU2ZFND) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/cb39dbb7dcc94e5ca4cba9c7e305cf7b01c290080a7c1db178a46d14c836cf24) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/24d8049cf9fbbea9401f30fd08178e0c2e881e16f039710891427f5edba172cb) [2](https://stellar.expert/explorer/testnet/tx/2d97c62fe2ff4c7ce0e6dc09cc7ac47ee16f3ce82db40720783a9b41f25c4772) [3](https://stellar.expert/explorer/testnet/tx/b304a427493ee9f854f82cff0522d204d078e958b7f35293ff9f62fbba5fd07a) … | [tx](https://stellar.expert/explorer/testnet/tx/db09d4e746abf1828d1a4ea63bc8642a48674b6043b8aa6a9921147ad41fdb96) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/857beddf51b0ebe1109bcf1e5b714fbe75445bdbde2a7e8136a6e2e4bfb8b5bc) [2](https://stellar.expert/explorer/testnet/tx/ba5116ca598e5ef1e03563fb1ba1763dfaf50eea96b78357224bd953a72cab30) [3](https://stellar.expert/explorer/testnet/tx/99b4dd8d8311c046afecba3c451fe0b851a4328ce011a6774a58aaf228cb3fca) … | [tx](https://stellar.expert/explorer/testnet/tx/35792c05ff481e3d03c639f8e08af9e146ae59e4cae9687d512a368cad2d4ea8) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/8980547b1df3d2f9b912d81d75e965d0c999014a7f2ac0ce08ed3a8d76e9df11) [2](https://stellar.expert/explorer/testnet/tx/19a628e322915e9edeb791b2b9854ec062b5c8a1586977bf43a36812bb6f0a54) [3](https://stellar.expert/explorer/testnet/tx/fe0264a5c7b0719c4731e4fb0c1ae7cc2bfd1e3434a7b791ab8495ac51a8181a) … | [tx](https://stellar.expert/explorer/testnet/tx/8681caafce30f67f5c29576840636b6d908f657cd0b0804bc03fd72b69565f34) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/fe168f70ed32493f51e7dd5a3f9c9fd6154ecda9d96dc3f180faaefe791c9fc4) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/562a31f9c417c78c890413164b89ae61b1bcced93ad2961b0c5497a1ec5c8de6) [2](https://stellar.expert/explorer/testnet/tx/ec55f9de9f843238dd53eceb79dcb3e639ae5ae6b7f95581d3d6fbf93c2bd44c) [3](https://stellar.expert/explorer/testnet/tx/ef873a32aa2d124bcf34898fe2e2daa614a21f1bc18caa4f895b7cd065e91003) … | [tx](https://stellar.expert/explorer/testnet/tx/e471ab4add0f26fc389772e4b3be587f859762695633d4f101bc2de270a6cf37) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `dc5074ffd46cb7f6…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/19c128981d5839c81a987b60a03d8bb0986650d024ace76b197f90417feaaa1a) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/5c70c256e09cb9bf38529bbd039f257182a210faaf952da0664e9dd34d84f0f9) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/0e6de19a5ee048d92af705ab444c3754bf6bc8e60686fac7f67ac5697eee59b1) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/0b84ffd8d25e06a523fc2d8423296b8e6064af8ae984119daf26ec9b057d1151)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/5f87e1ff80525a48d8e3455336a8ab7407033fbbdcce7e00df823932108e0c46)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9404597bee93389678fa4237f557fc0ac59095b9b939c4c048f90db84c935301) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e44045fd355ee7152ba1697a58b15fe34c85c991e5021d492d8a6b6aac97146d) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CBVXYO…4AD2](https://stellar.expert/explorer/testnet/contract/CBVXYOVBD5WDQWWBGYJS3O5MBISZQMGOCTHCANCYWR7OJKQHIWOQ4AD2) ([deposit](https://stellar.expert/explorer/testnet/tx/30cc395e75ae6a8561cc7af320ae0b9e92e5c685371ea8f8844469f3809afccd)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/1bcb529e89d6147fe5de35e48cac005d1ad89b3652d7f08c005e30905263b521)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CBYVQC…NZD6](https://stellar.expert/explorer/testnet/contract/CBYVQCTM47GTW6X4MMEINJQNPVEK6KBWDHOC7HQ4RTXWJQTEJPG3NZD6) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.3 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/7c6abfcb68a7bd7c9fa33723b251a38a656ffc6903404cc223a90ff997ff8f00)) | **released** | 4.7 s |
| `/escrow-stale` | 5.3 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/8a8fb9425e0377a01ae99c6473dc17e3e700c9076d71a41126f03b841f4994f3)) | **refunded** | 4.5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
