# 402Scope Trust on Stellar testnet

Run finished 2026-11-02T13:41:00.672Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CCSXSP…B6E6](https://stellar.expert/explorer/testnet/contract/CCSXSPASWHAUMQJM3LZYHF2V43TKFN2WFICL5CUDUISNXFQ3JGMGB6E6) |
| Trust policy (OpenZeppelin `Policy`) | [CCNDNX…HEFS](https://stellar.expert/explorer/testnet/contract/CCNDNXFIIF4BTJXQBVH47BZEZHQ4Y5TCJHXVBJBWKBT4VKU5HT2SHEFS) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAVNLK…UXWZ](https://stellar.expert/explorer/testnet/contract/CAVNLK6O3MVTYFFS322G3IFNTVBJFZCVRGZNTEJELEV5KIIO3KY5UXWZ) |
| Spending limit policy (rolling window, x402-compatible) | [CC5OQ5…3ISM](https://stellar.expert/explorer/testnet/contract/CC5OQ52SYNBF5UE2Q2SUIJE3NKBTK25TX2RV7LVCVYBYB5GM2KQM3ISM) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CABJBC…HWJP](https://stellar.expert/explorer/testnet/contract/CABJBCZQ3NSS7QXF7DXYMXYK5IOO3LYI5XL6MLNZCM2ZQOCL7BT7HWJP) |
| WebAuthn (passkey) verifier | [CCEY2F…S2IY](https://stellar.expert/explorer/testnet/contract/CCEY2FXOLW4QH2EI5ZR24XVB2WD2CIYSEZBAKN4AQBAXINDQSKOFS2IY) |
| Refund bond (optional seller bonds, no admin) | [CCBPVY…5BAX](https://stellar.expert/explorer/testnet/contract/CCBPVYYUSLTYCB42LNZRT7CRPE2H62KJ3XSU2V4AM2BBZ34QXXWH5BAX) |
| Escrow (x402 scheme `escrow`, no admin) | [CC6BHF…Q4XO](https://stellar.expert/explorer/testnet/contract/CC6BHFC2UA2UORPNDDDC4SE6ZYUPHXC3AHNOYS3G7PBQFVPCFNRNQ4XO) |
| ed25519 verifier | [CD6F2B…NSCD](https://stellar.expert/explorer/testnet/contract/CD6F2BYZD4WWHYG22KAJ6YK74G2B4YU263M7UXTXS33FGMJNPNPFNSCD) |
| Test token SCOPE (SEP-41) | [CABHPA…565G](https://stellar.expert/explorer/testnet/contract/CABHPABHPCN47EO6DDEXS4I4EQIPI3XWUTWVHUUIEUH4GC5ZVNMG565G) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GB7ZU5…EMRS](https://stellar.expert/explorer/testnet/account/GB7ZU5CKMAC7C7ZP5QIETMAJU2CY4IADD5OKYEZEZPVPJGK6ZIC4EMRS) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/cc69306bc72eab400192a98350de15bc1d2e5f07b109b458aac4375cefdf1ae5) |
| [GCKM7D…QHRU](https://stellar.expert/explorer/testnet/account/GCKM7DORFEOJSTP6RI7AHBF7DZUUZHYF5BVJDZGJROKNVWMINHVQQHRU) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/9f8cfbb66d64f5ff315bad22746d2a43edcd33fade7bdc57424c9750c3040b28) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GB7ZU5…EMRS](https://stellar.expert/explorer/testnet/account/GB7ZU5CKMAC7C7ZP5QIETMAJU2CY4IADD5OKYEZEZPVPJGK6ZIC4EMRS) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/5ee247cbba4a20e654ad5451d4eb7b886c8b8d51eaab9755af0acf3831464cfb) |
| good seller | [GCKM7D…QHRU](https://stellar.expert/explorer/testnet/account/GCKM7DORFEOJSTP6RI7AHBF7DZUUZHYF5BVJDZGJROKNVWMINHVQQHRU) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/3a081deebb147c38ea508df09cb24dc7180cf7082cc13a3df24e46353d5d40df) |
| bad seller | [GB7ZU5…EMRS](https://stellar.expert/explorer/testnet/account/GB7ZU5CKMAC7C7ZP5QIETMAJU2CY4IADD5OKYEZEZPVPJGK6ZIC4EMRS) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/84f862c784caa483f39b6f9d8cc8198906fd9dcc63f305f5059d915ade6ef774) |
| bad seller | [GCKM7D…QHRU](https://stellar.expert/explorer/testnet/account/GCKM7DORFEOJSTP6RI7AHBF7DZUUZHYF5BVJDZGJROKNVWMINHVQQHRU) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/e317ef42399f93882033e2f476372515a62927ad5d0202e10fc017d3b64e5868) |
| stale seller | [GB7ZU5…EMRS](https://stellar.expert/explorer/testnet/account/GB7ZU5CKMAC7C7ZP5QIETMAJU2CY4IADD5OKYEZEZPVPJGK6ZIC4EMRS) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/10adbde8de574f3148da6fd8f9f46470852070d3002bf71e56ba1042ac3de253) |
| stale seller | [GCKM7D…QHRU](https://stellar.expert/explorer/testnet/account/GCKM7DORFEOJSTP6RI7AHBF7DZUUZHYF5BVJDZGJROKNVWMINHVQQHRU) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/341a801e8ff227148d4ba8de610d41421f5482cf55167c5234cc32b82aad1945) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/4ad719aaca71c45198b62175d20590cb28925dd04e4d35faf042f8ea73e466ae) [2](https://stellar.expert/explorer/testnet/tx/be780da0cb5bd50f2046180098a9a831d2eeb9d5204d640da26d3aa7baa32bf9) [3](https://stellar.expert/explorer/testnet/tx/d692705382ec2a1ef4db16121d66ce6874652a574ebc746fd95de23f28cf69c4) … | [tx](https://stellar.expert/explorer/testnet/tx/cadc55382659704b42529ae6f882cdeaaecd77a9f9ab431039256381073d3042) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/b0884fb3b78011b2fc0199264d493f84a96a6f144bede43ffa34c0ed71ccb5f3) [2](https://stellar.expert/explorer/testnet/tx/4feba8fc12a33f146a0c635058fc900c644bb28983e7782f96e82ce7defefeb7) [3](https://stellar.expert/explorer/testnet/tx/8bef11b9f144dcd0f11e19af2a73030e3b7366effa0d141d361f282c71d47905) … | [tx](https://stellar.expert/explorer/testnet/tx/cbd8497c5de71ef40396914e6b248a535461ec3028ee8dd049d385e3b4383c65) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/7be63a4f0f608843ef579edce736f28ed934690b2c1f13b1cb1bf904b76e4bc0) [2](https://stellar.expert/explorer/testnet/tx/d98326b0ce0f0651a8a15c1804384acf2587f3f8db4006c30da2153867f8c221) [3](https://stellar.expert/explorer/testnet/tx/61bf98af872e63aaa04d59f6406f93bb99289f542aff406636a4d7e75f4465e8) … | [tx](https://stellar.expert/explorer/testnet/tx/2e28b0f74bec1fdec41be90aa9d801f85c8c879571f27ea63c57ca50a5b3d040) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/4f6d6361d4fa2656ab7104a6c57498ab6922727f551c1bbf910fc90cda63650d) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/7a3a681b72dd1870b115f4c7e80403a754b4af1defb67749a77cbb13adb8fe20) [2](https://stellar.expert/explorer/testnet/tx/9d9a9fa705aa40e379d868d952d70e4e589997c90309874e5809da83bce6fe79) [3](https://stellar.expert/explorer/testnet/tx/4de9398eea9a7315cc0f70c6ce3ef2c04e2c16a60ddcae0b4ca456deac95e409) … | [tx](https://stellar.expert/explorer/testnet/tx/86e1d8cdabfebf603b9a8ff2b073ad5e7c45a67f9b3809a056cb79b1740da4e0) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `9bf7a1b3453710f3…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3e667529fab1f56a236197a9b5cec70322cb967c6f2a2774c6c8a24961e598a5) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9114085a097cfaecd72eef211be0291a2f35cfd69f97057f3419a61c40482de1) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/cc15292473cfc921d6c86bc10fb9a70de71164b357a03cc7ea6622ef2673bf02) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/489788118b210d94f4806fb96a18f05c80926e523d60c3cd327b1cd14381afce)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/906f8cae3373c0acaa06dc5ff477aab2eb1d44c86b0b84d519f4a8cd99c4e512)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/79a790e272a8bc4d19b4ddb791987bbfdf1448c70d764a457694d73ff394ea3f) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3a11e7175a6f1f8a715be0efcc3b4a4d05daf7a5dad39cd7c9cf05d49aaaa246) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCBPVY…5BAX](https://stellar.expert/explorer/testnet/contract/CCBPVYYUSLTYCB42LNZRT7CRPE2H62KJ3XSU2V4AM2BBZ34QXXWH5BAX) ([deposit](https://stellar.expert/explorer/testnet/tx/34dabd903bfbc40e26bba880fd234bd1d06255efba0dbe645646532d58017c75)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/6ba5c968d00aa399693f91d53e7d5be62403a6bda2853426bc66dc29acec38ae)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CC6BHF…Q4XO](https://stellar.expert/explorer/testnet/contract/CC6BHFC2UA2UORPNDDDC4SE6ZYUPHXC3AHNOYS3G7PBQFVPCFNRNQ4XO) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/04940f9e1f321f0b5c2d7e8dd750665d03475291b1d32d43216ad628cb0b1c77)) | **released** | 4.8 s |
| `/escrow-stale` | 5.4 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/de17d7271cd4886f627753fc9e2954cda6f3f24f1a93e36b4644a450b5d7d0c6)) | **refunded** | 5.4 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
