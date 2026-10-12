# 402Scope Trust on Stellar testnet

Run finished 2026-10-12T13:22:32.912Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CAO7F6…SBZ5](https://stellar.expert/explorer/testnet/contract/CAO7F63RWN3DDNIE54JFI6DONN6MZ26QPUNGITI4ZZBUADVSEAY5SBZ5) |
| Trust policy (OpenZeppelin `Policy`) | [CBZUBT…HQOD](https://stellar.expert/explorer/testnet/contract/CBZUBTWXIMEAK7EQZSZVEHTOCJO54PE5MWXHXEHIHSX6FMVMLKMNHQOD) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAGQYH…6NDO](https://stellar.expert/explorer/testnet/contract/CAGQYHL3D4CWOZN44K2UMRKLKQY7SL7WXQ6MEQS65664Z2NJICIN6NDO) |
| Spending limit policy (rolling window, x402-compatible) | [CDC45A…FOVF](https://stellar.expert/explorer/testnet/contract/CDC45ADR25Q2Z3D3APDFGNL5A3C5BWG2GLANZ72DZKUIS6PG4JVUFOVF) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CBM5QX…AICM](https://stellar.expert/explorer/testnet/contract/CBM5QXK5GMRHA6YNXZFWVEXA7B3TLU3UMGXQPGZOGXXGWK7XZKA7AICM) |
| WebAuthn (passkey) verifier | [CA36HM…VJF3](https://stellar.expert/explorer/testnet/contract/CA36HMI5GUDID3HD2Y3W3SFKF7DVZXWISABJVL6BSFFTFRFQ6TBLVJF3) |
| Refund bond (optional seller bonds, no admin) | [CAGHF2…BFW3](https://stellar.expert/explorer/testnet/contract/CAGHF2IYLAOQ22KA63AGIQQHH6ZHIMGEUHGL7NYN56GFJ2BQSG5ABFW3) |
| Escrow (x402 scheme `escrow`, no admin) | [CD6SGP…PEIP](https://stellar.expert/explorer/testnet/contract/CD6SGP6KOIJ2YBAGNFJEWWRRRPSIHFZGTBSLXQWNQH7XRNPIV5EEPEIP) |
| ed25519 verifier | [CBMT7K…QR34](https://stellar.expert/explorer/testnet/contract/CBMT7KYC5QAWMFACSXWA2UQBFA6BW2DHQBPV5APZ2E35ODRLCQVZQR34) |
| Test token SCOPE (SEP-41) | [CAAVLB…AXHB](https://stellar.expert/explorer/testnet/contract/CAAVLB3K4GD3QLFVY5U3LP5ZXXMQWLPYHWCIBBV4L2556GBDIDVUAXHB) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GD37VH…4OEQ](https://stellar.expert/explorer/testnet/account/GD37VHCVCCWRBDO3WL7OPZUUAM4C4T3QW5ILC3W3ODDIGIVVJMH74OEQ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/52e7b8eb05d2895a3eb65e36adb2f8e9515f2779d1b0fdd35a0a0581311c0294) |
| [GBPEGI…OQNW](https://stellar.expert/explorer/testnet/account/GBPEGIYXNQZH6ALH35XQBQ5P24724NRGBTYNHCVJMLYTE7WGANMKOQNW) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/76621e76c1b37948429307ed65e3b73aab6fb277b8ff5b4d8eac9885461c2ddb) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GD37VH…4OEQ](https://stellar.expert/explorer/testnet/account/GD37VHCVCCWRBDO3WL7OPZUUAM4C4T3QW5ILC3W3ODDIGIVVJMH74OEQ) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/ae16df969e5b20867b6d95ed479a3d5d105cb4a413935b0375f88c2b46f5eef2) |
| good seller | [GBPEGI…OQNW](https://stellar.expert/explorer/testnet/account/GBPEGIYXNQZH6ALH35XQBQ5P24724NRGBTYNHCVJMLYTE7WGANMKOQNW) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/3ea4677191254fecb2fa795e291d26a831d775810da0cc10a4794ac33441c4da) |
| bad seller | [GD37VH…4OEQ](https://stellar.expert/explorer/testnet/account/GD37VHCVCCWRBDO3WL7OPZUUAM4C4T3QW5ILC3W3ODDIGIVVJMH74OEQ) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/788e4c480ec77b9a9fbe05050bfe9f9967c99adf913dee9ddd711bc5114f058b) |
| bad seller | [GBPEGI…OQNW](https://stellar.expert/explorer/testnet/account/GBPEGIYXNQZH6ALH35XQBQ5P24724NRGBTYNHCVJMLYTE7WGANMKOQNW) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/97161c2b3db3e7a68b7cf8a156e04171bb73e2636d96f86b595d663161786e63) |
| stale seller | [GD37VH…4OEQ](https://stellar.expert/explorer/testnet/account/GD37VHCVCCWRBDO3WL7OPZUUAM4C4T3QW5ILC3W3ODDIGIVVJMH74OEQ) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/422d2d71ef7d837e722b631a2b1e318f1b1177d53f96bbe9edc6fcb73fe72e84) |
| stale seller | [GBPEGI…OQNW](https://stellar.expert/explorer/testnet/account/GBPEGIYXNQZH6ALH35XQBQ5P24724NRGBTYNHCVJMLYTE7WGANMKOQNW) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/c5a97d4fbb58bb35451897c3c73f90db97457183726ebfad0d9805651f5f6974) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/12774640d2249b0345eca38fd783cc42f2c978d52c4231898bde63ee55c80a20) [2](https://stellar.expert/explorer/testnet/tx/061bf62253c86913ca2c0e16763f8c57c2b513e0e40251ffc453bf5cb811e24d) [3](https://stellar.expert/explorer/testnet/tx/3f959c1b9d00b306b260aaf05ecd1432cb009f0a17f89f7190acd6b4e8cf8b27) … | [tx](https://stellar.expert/explorer/testnet/tx/3b9145bcef54fe011af63b348884920c92ebf920bf1aef4f5537ea760178beb3) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/76292f79d1684d18d1d3411843cc70021c71875370b0308462d966cd80899b80) [2](https://stellar.expert/explorer/testnet/tx/da32094b467ec983901db4bb9c8e555509cdca9a9ef631f0b972e95562d8cb3c) [3](https://stellar.expert/explorer/testnet/tx/2be51d305f476ea690f7b2ab9d99d39458291dd308d4b658bd462141bd15e4eb) … | [tx](https://stellar.expert/explorer/testnet/tx/71859768277f1db7aa631fa76a0e51f8bc68534a1093a46b412d9cef90bd443a) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/2a0fd5a4000916e16f4ae051cf3b908b5aa201d435b1f06d7d65a3db1b01c990) [2](https://stellar.expert/explorer/testnet/tx/aa485629aa03ead6469d39a3f23aef60fcfd70fb9a752e4dc541d7d75265f19e) [3](https://stellar.expert/explorer/testnet/tx/0611d72182e75c1c4237847e465db9568686f29053d4175685248c605a87a657) … | [tx](https://stellar.expert/explorer/testnet/tx/0a6287143b3d3e140e25af89ff9a3f5e4d9918ff9b682ce1308c622917623c22) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/d2e2637154517f2f2beab63b22e7c3624188732172163e75083f43c774e14074) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/7d6d61a9e14fdd4420c10ed1c6544bd41f38fc5dcfa35fee4e29e7507c394c8a) [2](https://stellar.expert/explorer/testnet/tx/c81e5f0cb5e2237d0032f11cc7fa3fbfe70371d01332dc3edee103e486e04d8f) [3](https://stellar.expert/explorer/testnet/tx/609c9ca8644bb9d7a9e3e1155dfdcbaca7db6cb61c6b344c44e23b203b11610b) … | [tx](https://stellar.expert/explorer/testnet/tx/8dc2fe5d275cc94d33374d7a4ae7cf2eb3b479c694a0f83e241f88ae5f7dc40e) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `95e5f4c728e56c2e…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e867324895243d998c028cad740f9253dfb39f1e3cd9d06097b62a1f8f4e3df1) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/d43943abf0f70d8ec62c909dac70debc5bcc2112173a6178eb1feb2b47640adb) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/40e80506d2e46a9105ff099d9c7f68caa723eaef421d83f975bd2fd994bd1a7d) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/fca442524fd93d6e72310f311286cffeea55929c4c9c14985611823e7fb32358)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/faf1a456fdcad8a392e86f4889048142d04ba899809054bfd320db0373dc3f2d)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/cebba8d11040f55a8006d2dac59631d4e1d77db01c7d6327c45a5d75ae92cecb) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/f3416fd0ecefe220ccc932faf6f9a4a26a23190b18ee50a56112342d75de256f) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CAGHF2…BFW3](https://stellar.expert/explorer/testnet/contract/CAGHF2IYLAOQ22KA63AGIQQHH6ZHIMGEUHGL7NYN56GFJ2BQSG5ABFW3) ([deposit](https://stellar.expert/explorer/testnet/tx/ad95c359a14ea55395baaaf9499773ec9b898bda65d6ced918f6203101313c93)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/b9f9c80382e96e1326b45a295c564a90d3a447ab519821aaeca237b84abb7029)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CD6SGP…PEIP](https://stellar.expert/explorer/testnet/contract/CD6SGP6KOIJ2YBAGNFJEWWRRRPSIHFZGTBSLXQWNQH7XRNPIV5EEPEIP) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.1 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/de9897d99988696f2a0f213111e8f8a0939e1c9cfa70c297a8b9d2249b6b180a)) | **released** | 4.9 s |
| `/escrow-stale` | 4 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/d0967609d7876bac08ae7d5ab7be51d8a62b8c959ae56e6d2f9c52b05c7e01d2)) | **refunded** | 5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
