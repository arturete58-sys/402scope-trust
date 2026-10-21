# 402Scope Trust on Stellar testnet

Run finished 2026-10-21T10:26:14.574Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CARL7O…A6BM](https://stellar.expert/explorer/testnet/contract/CARL7O24T4ABBU5V5JZ2QU5MIFXXLYM3Q47KMR2RB7HDCQOJCO54A6BM) |
| Trust policy (OpenZeppelin `Policy`) | [CCMOFD…KU4F](https://stellar.expert/explorer/testnet/contract/CCMOFDHM5BPLHZOTC5KUHADYHAQZI5DW4JAR4Y26GTIGFPB6WLPAKU4F) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBZDBR…4EEB](https://stellar.expert/explorer/testnet/contract/CBZDBRAHF4IPIOCXCHMYB7DMES4TF3B6C54224TP3UZ6JJ2BDUZD4EEB) |
| Spending limit policy (rolling window, x402-compatible) | [CAJL5N…ZCAJ](https://stellar.expert/explorer/testnet/contract/CAJL5NOK5NEPUYCXQ6XEJNR7TUXRGV7GWRHVERBA2YB3YT45JU26ZCAJ) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CBB5DU…WM4D](https://stellar.expert/explorer/testnet/contract/CBB5DUWHMJAQESYVGYPYXIR7FGSMAJFW3I5JPYG77KC23ICKI2RYWM4D) |
| WebAuthn (passkey) verifier | [CDQ6BK…K6CJ](https://stellar.expert/explorer/testnet/contract/CDQ6BK5T5QMMGHMLVEVVJSAX7E73AQAAM6AEIZY6XTHNM2DSHMN7K6CJ) |
| Refund bond (optional seller bonds, no admin) | [CAAGYD…XHTQ](https://stellar.expert/explorer/testnet/contract/CAAGYDTCFAV5MCV7GBCEH675YDDCQZLBR5JKARFPAODBEVM4NK7IXHTQ) |
| Escrow (x402 scheme `escrow`, no admin) | [CA5QKH…D4T2](https://stellar.expert/explorer/testnet/contract/CA5QKHSWBOGMR746S7ETJAWVEASLIXDGW55RGM2UCDNSASFZIM5TD4T2) |
| ed25519 verifier | [CAM35Y…UD4B](https://stellar.expert/explorer/testnet/contract/CAM35YRHBUFV5AFM2NOFWGUWJ34XLWVNHPPRN7QXWNOOZUW2R3VUUD4B) |
| Test token SCOPE (SEP-41) | [CCRYC5…ZLI6](https://stellar.expert/explorer/testnet/contract/CCRYC5NIP7NUWJW2PALJ5A6LU6ORPZQ3TMLSOL5T6VLTAA5FYUL2ZLI6) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDHZWA…YVOS](https://stellar.expert/explorer/testnet/account/GDHZWATI2R77VJGPG7ELOJMM3ZN2JCSAEEGHHFNXTVEPLMMK66RAYVOS) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/83b1c233d2ab79b78c3a17286d0279fedb0ef5c54dbe0e84031588311ea9ce59) |
| [GAQBGI…MDRX](https://stellar.expert/explorer/testnet/account/GAQBGI6PKL76PLBKPXAZV6RBP57M5IJG6HVCZEAEJEPHGZGDTG4QMDRX) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/45be878644fe1941960df7790cee354b98a8ced8351ef5ef49aedc66d587c80d) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDHZWA…YVOS](https://stellar.expert/explorer/testnet/account/GDHZWATI2R77VJGPG7ELOJMM3ZN2JCSAEEGHHFNXTVEPLMMK66RAYVOS) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/c357c03912e922f9cc37477fc52b25b512fb1696f65c0dd2dfe1319a9e945c5f) |
| good seller | [GAQBGI…MDRX](https://stellar.expert/explorer/testnet/account/GAQBGI6PKL76PLBKPXAZV6RBP57M5IJG6HVCZEAEJEPHGZGDTG4QMDRX) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/ccff91c30b994e2b61c150d061d28870d43fbde62b9bf3eb912065c94e885a44) |
| bad seller | [GDHZWA…YVOS](https://stellar.expert/explorer/testnet/account/GDHZWATI2R77VJGPG7ELOJMM3ZN2JCSAEEGHHFNXTVEPLMMK66RAYVOS) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/1e9e8ecb06d933f8d751bd05c55b5d1cd9d7b6cbf47a468c9126a536b3c1efe9) |
| bad seller | [GAQBGI…MDRX](https://stellar.expert/explorer/testnet/account/GAQBGI6PKL76PLBKPXAZV6RBP57M5IJG6HVCZEAEJEPHGZGDTG4QMDRX) | 13 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/13e1a8e987f83426621d3b4446783c2d3099593a0c94567518b11c194f6eb732) |
| stale seller | [GDHZWA…YVOS](https://stellar.expert/explorer/testnet/account/GDHZWATI2R77VJGPG7ELOJMM3ZN2JCSAEEGHHFNXTVEPLMMK66RAYVOS) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/1260fd17bf688ac1a4a38e306647f3fb7c08568f7e5332851103e2d2494f5116) |
| stale seller | [GAQBGI…MDRX](https://stellar.expert/explorer/testnet/account/GAQBGI6PKL76PLBKPXAZV6RBP57M5IJG6HVCZEAEJEPHGZGDTG4QMDRX) | 45 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/94774b8a7739b3a6a07682a0f36dcc06944a6eefccd5d3efebd9a7c91c827443) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/64e0a16dd9bc8c60cdb883b3e5dbbe044f95b4cefca421f66e48593f3db410a1) [2](https://stellar.expert/explorer/testnet/tx/71e34b7d9186c077c5ada3ae345feee639c3a4bd00f48d086b69adac573ea59a) [3](https://stellar.expert/explorer/testnet/tx/017372607ff20ea0565b17b79894671282c1ca529c8ca7279c175868be747ec5) … | [tx](https://stellar.expert/explorer/testnet/tx/049a2a06e22d5c7923f60b71981303ccf3b3d050af097f3cd33c4a94a0bab72b) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/2d08fe1b3f6e6e7f9bbdf91801e28d6aac2de3b2e9fe04980268c258f663453f) [2](https://stellar.expert/explorer/testnet/tx/20acc7724318d566ffaea52c000731cecda8b4867c23c4ad70a4f55bdc554a86) [3](https://stellar.expert/explorer/testnet/tx/25536b1a0be1b34b9072ca4bcf4ee2765ab43addb46e2e32051064d558444119) … | [tx](https://stellar.expert/explorer/testnet/tx/fdf352025346490fc16ff4713ab590b9cb1bc664ff5201f7adfaa638e17bbe2b) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/1353b58a5cb54982e1d66763da799e3621c7ffca5949b4170e37810367dc904d) [2](https://stellar.expert/explorer/testnet/tx/c326898ba7b5eea9a30d452e149c5422d9c9a0852c682fcb95b0e7d46b87b38e) [3](https://stellar.expert/explorer/testnet/tx/1e26f6358de7eeb4b091c0c2615aac0921030c9b9cc6d055be6b7f34d69ad7e2) … | [tx](https://stellar.expert/explorer/testnet/tx/bf73dfe0414e253b7ebfc584aa6d7450435331077ec3c37e223b69293c411b5c) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/97f898aceb88c47e1b327c190f17603d1e960288484049e9421e1a3d25cf7603) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/09aef86e24362811fc3950e9480d4a89a3f506df63c20fb8c475c2fffc3a02d6) [2](https://stellar.expert/explorer/testnet/tx/314bcf7988a35ce986e3956c49fec432f22f3b63d313042b4a84dd15916d4f17) [3](https://stellar.expert/explorer/testnet/tx/c1550ed9ea6d753822fc3af65ae2d7e0362b46f5d8998d6a97486bcfde21e977) … | [tx](https://stellar.expert/explorer/testnet/tx/fd515b68db82b1da0fd08bf857c826372ba6ae4f44908c9c40b9a97020d17bd5) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `45e4c23dbee669df…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/742c0ff626d1ababc244de2392e582c7a25011a69bb07d6a42c3126e1dd1605b) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/92c940b702db75d5d7a80e5e91d0aa3477b1d0a0c66c5de4ae2f657f27371907) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/09dc256676d944b457496c54bdd3e7d8595f47109461331073ee462727033708) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/c760d9f9e8f4a238090a5d655dd4d09ab962af057f4b2d932439ccd292d34ad2)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/bcc9669a67a4070bf35277feda05b1d30d96513b094d214143bbaae25c7afeec)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
| `/wrong-type` | avoid | 13 | false |
| `/broken` | avoid | 13 | false |
| `/stale` | caution | 45 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 95); good seller allowed (score 95); stale seller blocked (score 45).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 95 |
| 2 | `/slow` | yes | 95 |
| 3 | `/stale` | no | 45 |
| 4 | `/wrong-type` | no | 13 |
| 5 | `/broken` | no | 13 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/f0c48aafec34c4db58727d664ff93bcdba154fc32c8868a68c942bce73478059) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/f7050388d6d3714b6c870dc9cd9d49128f6f36a27b3f5972b2442ec24e38965f) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CAAGYD…XHTQ](https://stellar.expert/explorer/testnet/contract/CAAGYDTCFAV5MCV7GBCEH675YDDCQZLBR5JKARFPAODBEVM4NK7IXHTQ) ([deposit](https://stellar.expert/explorer/testnet/tx/c1cbb382c7ad5d292b68596d7dc449073b3bceade40a7ca321fcff2954c3a58a)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/13676fb4fe9b801150729fae0b00a58b2c4ffff6f096fc1762310f4dbbdb2add)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CA5QKH…D4T2](https://stellar.expert/explorer/testnet/contract/CA5QKHSWBOGMR746S7ETJAWVEASLIXDGW55RGM2UCDNSASFZIM5TD4T2) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/722abf5281443e0ec3ba622200f875a5c8f14f89988f934b4f3ae98becd69760)) | **released** | 4.5 s |
| `/escrow-stale` | 15.2 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/4fb1197e25655f6210fc1c91917002436d3cea71a0fa5360a0c5d51389e07491)) | **refunded** | 4.7 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
