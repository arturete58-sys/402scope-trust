# 402Scope Trust on Stellar testnet

Run finished 2026-10-23T10:14:54.285Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBB3ET…3ZSZ](https://stellar.expert/explorer/testnet/contract/CBB3ETATCRV5ABNMTS5MLJ5TPA33VSIRCRLD4D3VO6PL3RU7M5D53ZSZ) |
| Trust policy (OpenZeppelin `Policy`) | [CCQXJM…JFLU](https://stellar.expert/explorer/testnet/contract/CCQXJMYQE6X7NL3BF56HHWYTTFJ7GMDQ5QDLFC6HYMAON2QLUJJYJFLU) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDOG3V…5MPX](https://stellar.expert/explorer/testnet/contract/CDOG3VOHND7NUM5UIZUYTYF5KB3LRYUMPGWR4CJTK3UQ5LZRCG6Z5MPX) |
| Spending limit policy (rolling window, x402-compatible) | [CBWUJD…3J3A](https://stellar.expert/explorer/testnet/contract/CBWUJD6GZTZTLHURVK3TBBGLUKEV4NDU5HBGC6Y7C4BOQYVDQN2Z3J3A) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CABNG5…RLRV](https://stellar.expert/explorer/testnet/contract/CABNG5YS4MV345XYLUNXRE77LNIIFCVEPM42RFHVDMO7GZFHAIB5RLRV) |
| WebAuthn (passkey) verifier | [CDTONR…XITG](https://stellar.expert/explorer/testnet/contract/CDTONR3BTWHOREH3VNLEFAUNEXJDG7YYK6MM3D6G2F3T7NH4R3BIXITG) |
| Refund bond (optional seller bonds, no admin) | [CC6N7U…JCCU](https://stellar.expert/explorer/testnet/contract/CC6N7UNY4KAVF3XBXJ7MGPROGOXOOGDELKZQUQK2BOD6TEYVWGOUJCCU) |
| Escrow (x402 scheme `escrow`, no admin) | [CCMLOY…BLSP](https://stellar.expert/explorer/testnet/contract/CCMLOYOXD43DKHLFUJHML7Z2XC7UAOF4GFLMYDIQULQL72R4NOQ7BLSP) |
| ed25519 verifier | [CC6BH6…7XUT](https://stellar.expert/explorer/testnet/contract/CC6BH645AXBOGWODBIUFECC27VVZI4PPC34H5DVJ6LW6GZGYRAGJ7XUT) |
| Test token SCOPE (SEP-41) | [CC6JEM…QAOX](https://stellar.expert/explorer/testnet/contract/CC6JEMSXJAHX4H3LOHYU5CFMS675WMELPY5ZHV2HU2I63O2A3FCYQAOX) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GCVSJV…HZBJ](https://stellar.expert/explorer/testnet/account/GCVSJVOCITWMLEOWYHTN5LYISVIEEBQPOMAR4U6SQOZH5ORLUUCNHZBJ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/a73fc5762c37bb4ef220e8532bf0713e8ef735ce786ad9f8d912044a10cc5684) |
| [GB3JR4…CYLE](https://stellar.expert/explorer/testnet/account/GB3JR4PPXKBU5IUVFHABYFNDVEQ7JID7AO2K56GME3C3CLPLIWNWCYLE) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/aa625e96de1b8cb06f19663a2d4564c4e5f10004415440cdd6e3325a8575f3be) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GCVSJV…HZBJ](https://stellar.expert/explorer/testnet/account/GCVSJVOCITWMLEOWYHTN5LYISVIEEBQPOMAR4U6SQOZH5ORLUUCNHZBJ) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/5e301ced8d0468fb2be9e688fd57f64e7df87e3fb5860d7d6ea9be5c0ad554c8) |
| good seller | [GB3JR4…CYLE](https://stellar.expert/explorer/testnet/account/GB3JR4PPXKBU5IUVFHABYFNDVEQ7JID7AO2K56GME3C3CLPLIWNWCYLE) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/b8acca8767e64a07c6846a1b0bbf17eb91c22d58f3f496b5d4118cee9afcc3b4) |
| bad seller | [GCVSJV…HZBJ](https://stellar.expert/explorer/testnet/account/GCVSJVOCITWMLEOWYHTN5LYISVIEEBQPOMAR4U6SQOZH5ORLUUCNHZBJ) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/0d760654461dcf983e0b4cc09797660f2774fa19fe733ac97fd776871a5cb709) |
| bad seller | [GB3JR4…CYLE](https://stellar.expert/explorer/testnet/account/GB3JR4PPXKBU5IUVFHABYFNDVEQ7JID7AO2K56GME3C3CLPLIWNWCYLE) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/68a290aa2344fd21a4bc6179482fe8596ff579a629b17c9f729563e7c9f972f1) |
| stale seller | [GCVSJV…HZBJ](https://stellar.expert/explorer/testnet/account/GCVSJVOCITWMLEOWYHTN5LYISVIEEBQPOMAR4U6SQOZH5ORLUUCNHZBJ) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/e212121c4064c3b4b38a7a9ce51299cd38d9bd7116cb7722e868ddd48f83dad3) |
| stale seller | [GB3JR4…CYLE](https://stellar.expert/explorer/testnet/account/GB3JR4PPXKBU5IUVFHABYFNDVEQ7JID7AO2K56GME3C3CLPLIWNWCYLE) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/94a27eb7935533abc2415a171975bdf04860ecf09fb150df5a18b36738b7e977) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/7acbf3f58a5c1b179124571e7ce24907f06c97a4b62f066863cd9dca93d8fe6d) [2](https://stellar.expert/explorer/testnet/tx/3a53c950e397dc00cdaee1d45eca7eb183fd27422b4de4478d5e3addb53cdfdc) [3](https://stellar.expert/explorer/testnet/tx/e9099abaf1b2c785869a88e32b9f6a6aa1bf45cf6ed23eddda9ac9a2f00d7d17) … | [tx](https://stellar.expert/explorer/testnet/tx/10f34de5311f7cf9fec3ab755acad889f2f4bce1863297cdb71be8a90c5d40d2) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/85b9ae83c86e650f28d180b336e01cefc879e8ab48ad96826b6e99fe7efe0595) [2](https://stellar.expert/explorer/testnet/tx/1c744bd1bdfb6d81aa51f90d5446cbb6b9682740c84b09053e5d27c8d702ba0b) [3](https://stellar.expert/explorer/testnet/tx/dcf6baf938c811c35dc0e9a5a1840990ff58db392855fa18c397ddf46e23e5ec) … | [tx](https://stellar.expert/explorer/testnet/tx/adc8f3aa88f5593379da8b6087f6e0be17822ebbdd58928e5bcc0d5216c618f6) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/d10f5a807350313195b3ae0a3d4038b301894de374ff9f88d1809af9cb4a905c) [2](https://stellar.expert/explorer/testnet/tx/e002f4137e1358fbeb945f0672f99d0e9782a2a130f4cf43da3f785177775221) [3](https://stellar.expert/explorer/testnet/tx/2e977ce16e67c4f0224606c46dabc4a18cf60bd41d2210d860181e2306d81374) … | [tx](https://stellar.expert/explorer/testnet/tx/2fb55bbc3103d81ba9f04e947f98a45f8fb19ee349384c98b94653662de26402) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/1b9a952703ba057d0678b881f830826933a54c8a657966fd74af2fce76e42d2a) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/254aeeeaa48c9b12875323922f972bc06f780b46206cf7d826654d4f806f05a6) [2](https://stellar.expert/explorer/testnet/tx/bdd5b1cb4955387b5c0b73dab193af018ca313b2d663de94bbb7bdb9a2f86323) [3](https://stellar.expert/explorer/testnet/tx/b02a0964f96d4ab45efba4c32060d6b599a744cd235f8ce45f27e65911df6bbe) … | [tx](https://stellar.expert/explorer/testnet/tx/bb31ad0a916863c571d15a7fefbb54d4261e71feb5bb05f41f16d3b728810c8a) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `d8bd9311d822a19d…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/744121f8799016cc82d5c4878ecca2f25681179bd33e170cd54d717fccf70de6) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/423b0dbd54f9137573981d803fa7d770497cdbfb5efe2f810f237387d03f621f) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/b3d9798699ef17146961865ca90a33e0593984917cf1148362f89f2a7b121d61) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/677d5cee89e1d560b1348c5ee00266700327d99a1c0a88077f8715067726bd7c)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/8e2fc612a8dedfb8b36f9b325be5a9ecdbf57d7e87951f18473d24efa6e659ec)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/000f425a5a0b82f368c456220ebb5d2ecc6bfd69e04f6c48ebdfc90ba57091ac) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2ba9946468cb87a0aba9d1e14bb4f0a7b7565dbb8c2332bf5ba25aa4f1ab08f5) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CC6N7U…JCCU](https://stellar.expert/explorer/testnet/contract/CC6N7UNY4KAVF3XBXJ7MGPROGOXOOGDELKZQUQK2BOD6TEYVWGOUJCCU) ([deposit](https://stellar.expert/explorer/testnet/tx/119a6d25bc8ebd736e0b176e555ab73a2e241fea437f2344dffb4dc6eb9ff01c)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/11702386c2d844f239c60c4748ef638636966fcb080b87398cbc5ad480067d96)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CCMLOY…BLSP](https://stellar.expert/explorer/testnet/contract/CCMLOYOXD43DKHLFUJHML7Z2XC7UAOF4GFLMYDIQULQL72R4NOQ7BLSP) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.1 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/920eeee2f55c2e30c282746cf7ac56a4c7e7f6947117a77389c0ec911569a083)) | **released** | 4.6 s |
| `/escrow-stale` | 5.2 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/2181b129fef77f6b1a0076033472504a29f1c308813f82a9dd8070b5ff39639b)) | **refunded** | 5.7 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
