# 402Scope Trust on Stellar testnet

Run finished 2026-10-10T11:22:59.532Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CD5PB2…GAVR](https://stellar.expert/explorer/testnet/contract/CD5PB2QLNVC3CYIPBNKFXBWPK44Q4K4HGYPA4XEOFCVH27DMB25ZGAVR) |
| Trust policy (OpenZeppelin `Policy`) | [CAL4AJ…66F6](https://stellar.expert/explorer/testnet/contract/CAL4AJBHDZRARZKVLSQWLNQGVW6CUWSTQC6CVBPU3OLQKIHFRGLK66F6) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBYH63…FSZN](https://stellar.expert/explorer/testnet/contract/CBYH635YSFUOX523QFEGFD77TUCEXSOHFI7QXZZ6M2AVOO24H5OWFSZN) |
| Spending limit policy (rolling window, x402-compatible) | [CALGBL…PS64](https://stellar.expert/explorer/testnet/contract/CALGBLWPKPNIIMEUDIP3BWZML4PICRZ4NT5EHCG4MZN325DUAZRAPS64) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDRJTD…27MH](https://stellar.expert/explorer/testnet/contract/CDRJTDI7PY5ZSRUEBBRNTYEOG5IT5AGRGRZZ7L2U5XDVNW7ZMTVH27MH) |
| WebAuthn (passkey) verifier | [CB6WRR…S7VW](https://stellar.expert/explorer/testnet/contract/CB6WRRXLJJ7BJTSBOEWRKYURDAHCSMXXNHN457CPGA2AQNISKCBAS7VW) |
| Refund bond (optional seller bonds, no admin) | [CAHK24…MSJW](https://stellar.expert/explorer/testnet/contract/CAHK24EP7CJATRRKIUWNK6HIECA2HPX4RHRGTQHTARTGHR537WZ2MSJW) |
| Escrow (x402 scheme `escrow`, no admin) | [CDZOGS…CCHK](https://stellar.expert/explorer/testnet/contract/CDZOGSNQORZ4MKNAIT4UWQGXS4Q2UHZWKQ7VB3M4ZUZVXPKYDL5ACCHK) |
| ed25519 verifier | [CAXF43…U3U4](https://stellar.expert/explorer/testnet/contract/CAXF43CUQUFH2I4RWPEHEVROUFF52VAANPFTPUDKVTP6DP4MCKXQU3U4) |
| Test token SCOPE (SEP-41) | [CDCCTW…4OWY](https://stellar.expert/explorer/testnet/contract/CDCCTW56GNOXI2SFSSHXGYKGFKJ4FERUWQKSJA6SRQ4GVNJJTD2O4OWY) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GCCFUR…CROG](https://stellar.expert/explorer/testnet/account/GCCFURYAJPODNJV7XHXLBU2R2W4K52GFCALQMNQXXSISMVS3ZP35CROG) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/c17c667abfde2718c41a90265b96aa40242c8e128962a8a437a95d4201af2acc) |
| [GATH4P…WUGD](https://stellar.expert/explorer/testnet/account/GATH4PGT3TSUS5DV7M6RE3J3YGIQ2TZ4T3JMAYYOKAWGXPALMKL5WUGD) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/5583ddbc4be5a16ca7b690aa5333c7b328c5a0f25944246e44b5d468107b8179) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GCCFUR…CROG](https://stellar.expert/explorer/testnet/account/GCCFURYAJPODNJV7XHXLBU2R2W4K52GFCALQMNQXXSISMVS3ZP35CROG) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/cbb3a6c92eef1b088576a914f825d2bab47a40cba2eb442eaac288eebda287db) |
| good seller | [GATH4P…WUGD](https://stellar.expert/explorer/testnet/account/GATH4PGT3TSUS5DV7M6RE3J3YGIQ2TZ4T3JMAYYOKAWGXPALMKL5WUGD) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/7c9947f0053ff4fc33246ca90dbe603745a18a86bb04f3512c7042b82c290c96) |
| bad seller | [GCCFUR…CROG](https://stellar.expert/explorer/testnet/account/GCCFURYAJPODNJV7XHXLBU2R2W4K52GFCALQMNQXXSISMVS3ZP35CROG) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/f71fce119d1ead037faa603f6afa074919fcf667f8e465950ad2d0f85e7df38a) |
| bad seller | [GATH4P…WUGD](https://stellar.expert/explorer/testnet/account/GATH4PGT3TSUS5DV7M6RE3J3YGIQ2TZ4T3JMAYYOKAWGXPALMKL5WUGD) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/7851b58d3149b0d385c97fa85c1cc629849873a5477c5127c10614877e325f57) |
| stale seller | [GCCFUR…CROG](https://stellar.expert/explorer/testnet/account/GCCFURYAJPODNJV7XHXLBU2R2W4K52GFCALQMNQXXSISMVS3ZP35CROG) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/13fd82a600409a3e8430d6eda8972553ede9ccac3fc0503409b8c130da7da458) |
| stale seller | [GATH4P…WUGD](https://stellar.expert/explorer/testnet/account/GATH4PGT3TSUS5DV7M6RE3J3YGIQ2TZ4T3JMAYYOKAWGXPALMKL5WUGD) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/601b79b58c6a7f1a1a079968f5c6ac059ee9d64cbb9ab2b0d90b0e4b0c9e9ec0) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/2b1469f72d9b08ae168be50504bcd9112508efdfde3b69607130ea7e6bb47aa5) [2](https://stellar.expert/explorer/testnet/tx/e83458fd09e5f7106194293e09e210a2d07a0a55c5fc1a367e108ec69f56cde8) [3](https://stellar.expert/explorer/testnet/tx/aa4672f4f81772cdcb719c4ed6cf21e2cfe4b88d472e3861187753dcb9f3d232) … | [tx](https://stellar.expert/explorer/testnet/tx/a74a62cf3df5122d0dd837f1320188c214884c030c8601c0a80ebd060a3cff43) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/171561495d8585fd7ee8beba4d2d8a1ca2a1f6d91a0d0252d48726dcfddb537e) [2](https://stellar.expert/explorer/testnet/tx/10912d90564afd88fce7af37bdb9392b745881cf49fad368779d12ddb46433f4) [3](https://stellar.expert/explorer/testnet/tx/6257e3eaca8f9036a66cfd6ec15d559dbece2e0995ece179c7f05af3fb118e2a) … | [tx](https://stellar.expert/explorer/testnet/tx/0ee59d9945858b68d2c0d72fbf27559ba601767e0b2ebab5535305f527aaf986) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/662b81c64fb77372f5b55d6e7bd90df0e01f5a99afc9d5cc97481d5e9b2dfa81) [2](https://stellar.expert/explorer/testnet/tx/c9b9d8ef1afa0b38f487e63edc2e06feb5026d2500a347aca58c1e0921d42995) [3](https://stellar.expert/explorer/testnet/tx/f1babf0a0d961bf0f4d49d28ddc4db8ba99731d6351c7d4892b57389072edc5d) … | [tx](https://stellar.expert/explorer/testnet/tx/9eeeabe912d23ef1cbae0dbb10b7451adaa4bff7e64a64bd48e05a229a093f21) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/a723e86e6656fafd9b257f87f42e218827051114c2180a85f34ffcd18b2ac897) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/b6439d4659808ed5cdaaa7d270e98bee27bedae691cee582c13c5257e41360a4) [2](https://stellar.expert/explorer/testnet/tx/926a7d50b6f63da4c15d31a1e9ec0645c92dfd96a21d14a8e6b14769d23a43fc) [3](https://stellar.expert/explorer/testnet/tx/565e03ce267a7ea6cdc132db0e3edf8072f09866fe65acb7a990c15a820df4c9) … | [tx](https://stellar.expert/explorer/testnet/tx/4c6769f65fbf6598f2dd7157fcdb4736e1b45eb6abd65d62e4e21a2641e08694) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `9e4939d7cfbf8c33…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/8a95d6623afa394f142ffe520fc9d033f35fc2b7652f6b615c82792ed5621c2c) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3b523ed6bcb181415bea4b5b09f36b79c46f10a62dc22fa1f325d4425772a16e) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/1e037036261334e2e78541001fd2f82e1b7ce6e14483e1f5dc3c3092f513a222) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/221cf550f636d2d402fa2b7e88919869d63c07c798dca18ea4c0ae7eb13675b2)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/38252401c309065c6e0267340faf06d8a474f0a2298604b7295de39c1b75cf39)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/070cc4ebc5228f8b6626e29b60bda8140e8a07b9c6c93d407ccda3aadd416e04) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/9d703fd7c4cc165cf9b097d7b369f153d9be677defa948156faaf4d228f22b38) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CAHK24…MSJW](https://stellar.expert/explorer/testnet/contract/CAHK24EP7CJATRRKIUWNK6HIECA2HPX4RHRGTQHTARTGHR537WZ2MSJW) ([deposit](https://stellar.expert/explorer/testnet/tx/2dfc1017e495864fa755c8fef862e7358c1aa7e0ef5001267b4869897c6bc0bf)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/e242cb1e03e4912a9b683d38d2235a917337a6296dbd18a9c44c4f9776833666)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDZOGS…CCHK](https://stellar.expert/explorer/testnet/contract/CDZOGSNQORZ4MKNAIT4UWQGXS4Q2UHZWKQ7VB3M4ZUZVXPKYDL5ACCHK) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/8ebde3db44799975367eef862c7f0146135b456439792c55c0af190151df1f62)) | **released** | 4.6 s |
| `/escrow-stale` | 4.9 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/d5dc6560d82c18355622c531e7eecf53a0bf6013c798673dd950e2e31a114a0a)) | **refunded** | 5.8 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
