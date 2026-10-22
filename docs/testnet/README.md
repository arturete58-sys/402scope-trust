# 402Scope Trust on Stellar testnet

Run finished 2026-10-22T10:29:43.780Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CAIQHH…OUOG](https://stellar.expert/explorer/testnet/contract/CAIQHHNQTYSUKHT363TI6LIFTDP3ARCFCNW4TJM5TAJAR2QIU3OAOUOG) |
| Trust policy (OpenZeppelin `Policy`) | [CD2BJY…Y76W](https://stellar.expert/explorer/testnet/contract/CD2BJYLIXFYBE4O5NGG5MI6BBYTEWQ2IHHWWETF245HLNNOX73NKY76W) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CC4CYX…VHXL](https://stellar.expert/explorer/testnet/contract/CC4CYXWZTZCYAEN7CZZDEVMSYGCYSSZXAWHVKM5IKCBPVXSOTDXTVHXL) |
| Spending limit policy (rolling window, x402-compatible) | [CBEP6O…ICI3](https://stellar.expert/explorer/testnet/contract/CBEP6OIU73Q6N7YUNC6X2DN6HCLMJ7M2XZVBIDEY6U53SFRRQ7PPICI3) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CCZHWG…KJZN](https://stellar.expert/explorer/testnet/contract/CCZHWG76BSFEHHMLRETURFAZGKQMXNWE7HNKIQ3NTSTFO5FK5ZBTKJZN) |
| WebAuthn (passkey) verifier | [CABUDS…G5BY](https://stellar.expert/explorer/testnet/contract/CABUDSP3L4U2ADBXURTP7QIK2MAGLPXMUSNCX7PBNZWSJA36T7SGG5BY) |
| Refund bond (optional seller bonds, no admin) | [CDM6EO…4BNO](https://stellar.expert/explorer/testnet/contract/CDM6EOJ43WA5HUGBENC5LDGYHTXEHWPXICKSP7ENCKMASM2QSVJT4BNO) |
| Escrow (x402 scheme `escrow`, no admin) | [CCJJQK…BXSS](https://stellar.expert/explorer/testnet/contract/CCJJQK5WAFDJIOIYR3IWLWLB2NUTZOZPNRZP4VPAELMCFPYVGOJ4BXSS) |
| ed25519 verifier | [CAXL5O…U3J6](https://stellar.expert/explorer/testnet/contract/CAXL5OCTQ56KCREC4YK653TANYXMDKY5DFDR5O5I3ZYS6CGJCAGCU3J6) |
| Test token SCOPE (SEP-41) | [CBIPDH…5SIL](https://stellar.expert/explorer/testnet/contract/CBIPDHDDBEV2L2TEEJJCG6SLVCKDNTVRA6EZLMBVJGA3O7T2ZIR45SIL) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GBERMZ…S5VC](https://stellar.expert/explorer/testnet/account/GBERMZTRMUC2LH7ZVQBUIKKTJEOQPQRXVFXW5SXPXA7Z3JFRGIOVS5VC) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/3e2065fd3f12744a95685b1b780a4954c76b3b0538ede87afcea55edbdfb131f) |
| [GAUZ2N…B7PH](https://stellar.expert/explorer/testnet/account/GAUZ2NNQ6LQPSBPX4XQD36UX3OXVYO233OOP6HHTRYWZBICP2DPMB7PH) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/7ba15a859c7ac031ead575bce89d664d78421009d87fea5aa094ee5196267215) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GBERMZ…S5VC](https://stellar.expert/explorer/testnet/account/GBERMZTRMUC2LH7ZVQBUIKKTJEOQPQRXVFXW5SXPXA7Z3JFRGIOVS5VC) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/54293426a22b8739c4143395ccd2b9c7b0e2615f1657ed74d3aad057afa23851) |
| good seller | [GAUZ2N…B7PH](https://stellar.expert/explorer/testnet/account/GAUZ2NNQ6LQPSBPX4XQD36UX3OXVYO233OOP6HHTRYWZBICP2DPMB7PH) | 95 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/bcb3de4ffc62e7d6ff574a90bf4dcdef526e7208812eb51c94dee790bbd567bc) |
| bad seller | [GBERMZ…S5VC](https://stellar.expert/explorer/testnet/account/GBERMZTRMUC2LH7ZVQBUIKKTJEOQPQRXVFXW5SXPXA7Z3JFRGIOVS5VC) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/f74e8969afd7e86dfbc24425d564bd352af0573b7e62857e96dbac11dd05f280) |
| bad seller | [GAUZ2N…B7PH](https://stellar.expert/explorer/testnet/account/GAUZ2NNQ6LQPSBPX4XQD36UX3OXVYO233OOP6HHTRYWZBICP2DPMB7PH) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/9e28e6f6ab3c4b09f6db48078e76946ccc080c348f197916b0e51fd051688451) |
| stale seller | [GBERMZ…S5VC](https://stellar.expert/explorer/testnet/account/GBERMZTRMUC2LH7ZVQBUIKKTJEOQPQRXVFXW5SXPXA7Z3JFRGIOVS5VC) | 40 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/cd9303bfc1630c174da70ef74156906f2e12f2e107de58efffbda6470b17996b) |
| stale seller | [GAUZ2N…B7PH](https://stellar.expert/explorer/testnet/account/GAUZ2NNQ6LQPSBPX4XQD36UX3OXVYO233OOP6HHTRYWZBICP2DPMB7PH) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/9574106a4656169766af63f4fd298e69d56cb847a1b5949e78af21b9ea2d3f56) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/0b31df8f8702c85985f433ddad0ec7d444e442fd7d6b5da2ef0d33a818a6c5c2) [2](https://stellar.expert/explorer/testnet/tx/947fe90b692a01b156347623c788b5d95ca4095bc4c852e45d45959b6ea4804f) [3](https://stellar.expert/explorer/testnet/tx/4bacbc5d5a6b3efdf7ff5985ad1c78dd4bbad15f638e5f4eebfabd77ca0a73a1) … | [tx](https://stellar.expert/explorer/testnet/tx/f3815bf8c0dc3f22d15066f5a189e946d846fd5a56f838f11b4a6e5331dbb61f) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/68b07ccb8114bc4634d7f122400e2ab3b37e3c790f8337bbb7da54712b1a5d48) [2](https://stellar.expert/explorer/testnet/tx/15b193bdb36e203663ea700395ceca854b9781ca938b25172c644c1ad8eabe98) [3](https://stellar.expert/explorer/testnet/tx/f738c72a1d47b8bfee86e04cff21c03d08c33247d886559447d492853edd362b) … | [tx](https://stellar.expert/explorer/testnet/tx/7745d49a0dd92436d548cf34f9b5ce821d3d5650bb56d74a880d11d53e0b31e7) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/9b8eb544abcc0fc1b79197f548861f91cec4ce62c2b566c9c6873038d12be057) [2](https://stellar.expert/explorer/testnet/tx/d7e08a4b885721cefb76adfb2dd6c1db82781936642a763b7eae1b5f88efec8e) [3](https://stellar.expert/explorer/testnet/tx/6062355dfcb88bda115603ddd82ae119f989f33cac55e73fb226675666168a89) … | [tx](https://stellar.expert/explorer/testnet/tx/5b887f4faf0e68392005af7bd0284c829b2922b9279af9651a24df313080b2f3) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/ff03c6e27c8281b953a0dc26ca3098b88d2ab61be43ee09b06eed1c58c1217b7) |
| `/stale` | stale seller | 40 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/b9134c2b3160b2e432fc0fdd4c08fe16330d2fe9ce234e4359833be4ebe7b959) [2](https://stellar.expert/explorer/testnet/tx/7eb8b8cc22520debde5201e149ea915516d1b92998091e74f8ea9d1d85d9dc34) [3](https://stellar.expert/explorer/testnet/tx/d1cb30758b7f395ef95c73ba800d603517b9e1daeb091bb62153b37858ee8def) … | [tx](https://stellar.expert/explorer/testnet/tx/76c6b011503d848eaaca6e3017e84f8d253fbe599829f2be8ad96b69def38c00) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":0,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `ca2175afe77e20b8…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/621b2c600349c17339aad35cb1d60d06ff6f2d3ecc6d2109ac5e1700c608c828) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/aeccc127e1eb627a2f5166f4780caa50cdfa9bf47c21a7ba705c40d7be827635) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9d215c41b6ec8af3f5f8ac8d5e1059ba07a1e29a2c1d175aeab44096eccf9e34) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/1329d8d058548619a83671ec7dead7074bc005e0d3d04870e00abcb27d625e37)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/91633f762dc5071e40fd8349539dd8aefa98a46a7c95f253541f7b15c94f885f)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
| `/wrong-type` | avoid | 18 | false |
| `/broken` | avoid | 18 | false |
| `/stale` | caution | 40 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 95); good seller allowed (score 95); stale seller blocked (score 40).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 95 |
| 2 | `/slow` | yes | 95 |
| 3 | `/stale` | no | 40 |
| 4 | `/wrong-type` | no | 18 |
| 5 | `/broken` | no | 18 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/1315a55ce5dd638d56208bf6c6b9592cbfb99711c6c377cd62b00c4cead529a5) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9e3c0a174405651a8c473c0e29da6e87c4f12835aeca22a2f8349ab9ae3be0cb) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CDM6EO…4BNO](https://stellar.expert/explorer/testnet/contract/CDM6EOJ43WA5HUGBENC5LDGYHTXEHWPXICKSP7ENCKMASM2QSVJT4BNO) ([deposit](https://stellar.expert/explorer/testnet/tx/f0f2bc9f1a57c6f1ee0bbe5914d95985098439f7c856a244c3cde36637d1ce18)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/7bec147a93e3ea15861fb0e9560fcd32383ccc3fbda4a63831de09ffe2192053)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CCJJQK…BXSS](https://stellar.expert/explorer/testnet/contract/CCJJQK5WAFDJIOIYR3IWLWLB2NUTZOZPNRZP4VPAELMCFPYVGOJ4BXSS) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.2 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/bdd1f41a3d60bd4bf47ad14f26a5fe1961d83e9d6083f44c0276544cef49dd32)) | **released** | 16.5 s |
| `/escrow-stale` | 3.9 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/8961e0bd840b44ed860c14475551b7b34fd3550409abbb5b5f1437b290cc0633)) | **refunded** | 4.7 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
