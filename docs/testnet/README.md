# 402Scope Trust on Stellar testnet

Run finished 2026-10-27T10:46:07.705Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CD3BEN…F4PP](https://stellar.expert/explorer/testnet/contract/CD3BENZ4LPKMWBBILMIYICJ2SZUL2BI3H5YMWFSSVENTDV7VMLTOF4PP) |
| Trust policy (OpenZeppelin `Policy`) | [CALAII…TQHM](https://stellar.expert/explorer/testnet/contract/CALAIIOCLYEQH45BNPKAPXG27JFUFU7C3KBN324JFDMYW2JQ6WQOTQHM) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDF5R5…FQEI](https://stellar.expert/explorer/testnet/contract/CDF5R5K4LBJYZU3DPR5TVJMGQOI7NR4BBXYHHXSHS7FA3LG6K5S7FQEI) |
| Spending limit policy (rolling window, x402-compatible) | [CCJKER…U2LO](https://stellar.expert/explorer/testnet/contract/CCJKERDPKKWTYT6K5NK4I2EQCWS4UGK7A2QPM5IWR5GXLC3HWHKMU2LO) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CD2NEZ…ETRZ](https://stellar.expert/explorer/testnet/contract/CD2NEZQBON4FRSFDCAC2XYKJEZ5QNKRTLFWJVHSB6736YJNY6NMHETRZ) |
| WebAuthn (passkey) verifier | [CAYHVP…JYKZ](https://stellar.expert/explorer/testnet/contract/CAYHVPFQNQ76VE7BVSZBBCUXOFA4XM5MEYC2W3IAAACZDLYRP4A3JYKZ) |
| Refund bond (optional seller bonds, no admin) | [CB4RK5…5EKB](https://stellar.expert/explorer/testnet/contract/CB4RK5NKY364RXHVEAO7V37Z6UKITSBSEJOPKYNTCZ45VR6DJ4FZ5EKB) |
| Escrow (x402 scheme `escrow`, no admin) | [CDFVB4…N6SH](https://stellar.expert/explorer/testnet/contract/CDFVB4PTECFBWMKOZFYARYB2DRD6KFJ4RH73QRE3WZJNMXXL5L26N6SH) |
| ed25519 verifier | [CBCTEI…USMG](https://stellar.expert/explorer/testnet/contract/CBCTEI4OFMT23J74DYTAJKO7S5QVQLIGPA6D4U2RCICGHNSTE2QBUSMG) |
| Test token SCOPE (SEP-41) | [CDLR2T…VVL4](https://stellar.expert/explorer/testnet/contract/CDLR2TWJXF5TVJBGRSZPQXW64BWCAWW25RZWGQWLEDMFAZLCUBT4VVL4) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GA33XS…Y5UR](https://stellar.expert/explorer/testnet/account/GA33XSP6Y4JWE3Y3WCPRFSIRUABP3UEDODYZRRW62SOUO7MEWIARY5UR) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/dbd4a4e8f50ef577eb1cc7a9ea7e78f239b0cdefbaf55569d702d9a9244aecfd) |
| [GAK77H…L2U2](https://stellar.expert/explorer/testnet/account/GAK77HVJJC2UAO3HR25FLG447RQ3JFV724GSG7SGYOEKUVEEPYSQL2U2) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/7ea7589b61b4d3c1ba392cc14d041405f70a4b43e94e2d963c5a4dbb99a119ee) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GA33XS…Y5UR](https://stellar.expert/explorer/testnet/account/GA33XSP6Y4JWE3Y3WCPRFSIRUABP3UEDODYZRRW62SOUO7MEWIARY5UR) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/c6f577cbc729bb6a1287b277d3c26147d4d5a2a574d6d3d2e115e2f49604dc54) |
| good seller | [GAK77H…L2U2](https://stellar.expert/explorer/testnet/account/GAK77HVJJC2UAO3HR25FLG447RQ3JFV724GSG7SGYOEKUVEEPYSQL2U2) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/0f4186f279c7133db9019a3c26c862cbd5d18e2f5e632ea17026d950b0610707) |
| bad seller | [GA33XS…Y5UR](https://stellar.expert/explorer/testnet/account/GA33XSP6Y4JWE3Y3WCPRFSIRUABP3UEDODYZRRW62SOUO7MEWIARY5UR) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/61bfe984ebfd9bbfa3a827f9b15cc39885d55545db74ab7ddbd53d96207586f1) |
| bad seller | [GAK77H…L2U2](https://stellar.expert/explorer/testnet/account/GAK77HVJJC2UAO3HR25FLG447RQ3JFV724GSG7SGYOEKUVEEPYSQL2U2) | 15 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/0d31133f5eed97298dcae5b7b125f96864586709ee07d3f2821f8ccafcdedb33) |
| stale seller | [GA33XS…Y5UR](https://stellar.expert/explorer/testnet/account/GA33XSP6Y4JWE3Y3WCPRFSIRUABP3UEDODYZRRW62SOUO7MEWIARY5UR) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/7d8866416dfe897d1e1b077794f9ed717b0b65a5a46f284f19e7392d0a11f64b) |
| stale seller | [GAK77H…L2U2](https://stellar.expert/explorer/testnet/account/GAK77HVJJC2UAO3HR25FLG447RQ3JFV724GSG7SGYOEKUVEEPYSQL2U2) | 45 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/0a8772d09288dbedfcfc01d502a306a4a0d092827466c17ad036a3d7c85f5236) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/2b1dd05c21039d96300966b1a231f0dab88ae0502d6fc7bdbd52628549dc0442) [2](https://stellar.expert/explorer/testnet/tx/b7458225438a6967a79b9382dfbbd2fa7b7cfb0d5c50405328efb91783339f62) [3](https://stellar.expert/explorer/testnet/tx/c33fc963ed62879af636ec38c44d019b0a79fae3c2d5f480bee5c6959b75080f) … | [tx](https://stellar.expert/explorer/testnet/tx/32ea6e3a3535ea1af619e9f87e648d247565051b68b5cfaae76d83808526f838) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/6e542a037f062cd810b2ba03dc59f034a312009620077af49bd2f5d0bd108d5a) [2](https://stellar.expert/explorer/testnet/tx/8ac157833bf9882c3d5b4c251a250931a923322df35c5bc5de08e6fdc44ed936) [3](https://stellar.expert/explorer/testnet/tx/0877876f671a4597796c9ce7e6a595e37720aa149f0258c15d7cfb65d3e95ae5) … | [tx](https://stellar.expert/explorer/testnet/tx/f54a2600692eae366ebddfc5a7c3cbcfd216dbe32bab0d853b5a05f5a796ba13) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/4bce70c1d515f362672c0a8305b3d4b043c34f7fa9bcf6ace58c65bc80641030) [2](https://stellar.expert/explorer/testnet/tx/0aa57f0180db31dcbe22567d59f21f4c70be64e81c62871587f1fa778d68aaef) [3](https://stellar.expert/explorer/testnet/tx/ad11d09a944f04066fd900e705e42f5c16d0680307c69cdd5f00449a14106669) … | [tx](https://stellar.expert/explorer/testnet/tx/d4e2210d45a3a3d86ca2ca691e7cb99c5350fc6b62d02fe9031d802db74603fa) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/87bf5aa90b601a0b6e0919bbdbefa53c2dc60a24ddb0a57577d3aabce6fa3310) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/ceabf2dfe730e96a5c68ae1dd3090bb40aee7f907f53e103eba1b35fd8d53210) [2](https://stellar.expert/explorer/testnet/tx/a5f6b77732886f4f022e6b0993168f751ee268f5698ba452f00970e074b58e58) [3](https://stellar.expert/explorer/testnet/tx/61406c89900e303397d36f321c63cf0b81b9bbead9c430fa9a96d3d874a5cf4e) … | [tx](https://stellar.expert/explorer/testnet/tx/20874af9a23f8be850ef275cda3e11a2126826d3d0ce9679813e2577a07c43d8) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `08001ccc05081ba8…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6a17f95cdc2e52ca686b3fe451b450ef30d07c049ab8d0b441d726a7f59fe7ec) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e0e06d92f94fa68b2ba5444c2ce43735898ede164ecf246e5194a1b582d56e71) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/c9920e4cf14d92b891d16abac3c3c1a03e2d08e091b91348bb35f7f5e1e3e9b7) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/3e46207d39c5cf77f5d787578c9c8b0402451a788cf783e7fcc8bfbd3a06f48c)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/628993335afdb33f090ea908dc3caecf5dfb02436ae500ef6acda219df4c7208)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 98 | true |
| `/slow` | trusted | 98 | true |
| `/wrong-type` | avoid | 15 | false |
| `/broken` | avoid | 15 | false |
| `/stale` | caution | 45 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 98); good seller allowed (score 98); stale seller blocked (score 45).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 98 |
| 2 | `/slow` | yes | 98 |
| 3 | `/stale` | no | 45 |
| 4 | `/wrong-type` | no | 15 |
| 5 | `/broken` | no | 15 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/eb5b7eb0c5f4d578bb41fbd556b563a0284c300de1433894bf87fff3fec5eb83) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/d7c24523b680f0739573d088f2a2c9a75653c10d241d58b9a4f5368c2f626fc3) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CB4RK5…5EKB](https://stellar.expert/explorer/testnet/contract/CB4RK5NKY364RXHVEAO7V37Z6UKITSBSEJOPKYNTCZ45VR6DJ4FZ5EKB) ([deposit](https://stellar.expert/explorer/testnet/tx/fbb836473b24786f27968f60f24cfcfe700baf669e60f20d503f455ac62f199e)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/5761de644fcb67b654634660148a04e19cf9eb770f87ad1b766e363d673e4047)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDFVB4…N6SH](https://stellar.expert/explorer/testnet/contract/CDFVB4PTECFBWMKOZFYARYB2DRD6KFJ4RH73QRE3WZJNMXXL5L26N6SH) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/4487a018fdd724f60b08188e2139906a6ba871b3173acecbf47b5d341c6aa416)) | **released** | 5.7 s |
| `/escrow-stale` | 3.8 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/7a641f5f094cf266610803e765c1651f213a63d2e707e8b270223e2c9b3534c6)) | **refunded** | 5.8 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
