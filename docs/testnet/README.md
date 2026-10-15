# 402Scope Trust on Stellar testnet

Run finished 2026-10-15T10:06:52.573Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CB2Z6R…CXOE](https://stellar.expert/explorer/testnet/contract/CB2Z6R3W5PF6XCIFA2HJJX6VN72DIUIX5VQW74MGZFZ7MQ2C6HVQCXOE) |
| Trust policy (OpenZeppelin `Policy`) | [CDZXP2…HSOC](https://stellar.expert/explorer/testnet/contract/CDZXP2M7VXVYTUR5M4MEVRLOOHOQMNKIXVHY3V4PCIVOU3CK36UMHSOC) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBSYUF…P7PY](https://stellar.expert/explorer/testnet/contract/CBSYUFXWDAV5I4HP2FWBKNB6QVA7VLPHD2KL7SQCFVQZPNYL2NJBP7PY) |
| Spending limit policy (rolling window, x402-compatible) | [CAJE5E…XHVJ](https://stellar.expert/explorer/testnet/contract/CAJE5EKMEPFJVR5KDCIDFILWQ4BJFJLKF6M5CJIQIX54YJJTEPJTXHVJ) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAYQ4E…DHN7](https://stellar.expert/explorer/testnet/contract/CAYQ4EF7GBUCXXWZ7DY4ZCQBQ32H35SCVY2ZOH4WGWATE3THBUTJDHN7) |
| WebAuthn (passkey) verifier | [CBILU3…BT3T](https://stellar.expert/explorer/testnet/contract/CBILU3YXLVA3ZTWNYSL5OEQE7FPJDYV2A2ED4UZMWCG5U5DZMR2HBT3T) |
| Refund bond (optional seller bonds, no admin) | [CCH5W3…2EAZ](https://stellar.expert/explorer/testnet/contract/CCH5W3TC4TYTZYY27Q7JFHU6QJYGBCMRZRJIM24CXDN5UC6TMTQT2EAZ) |
| Escrow (x402 scheme `escrow`, no admin) | [CDOUWC…IQTF](https://stellar.expert/explorer/testnet/contract/CDOUWCFQJ6VCKMPD7YYRPZHDIGWIZXNIHTU6JKSXBATYVIMNYDDYIQTF) |
| ed25519 verifier | [CAS446…IZGI](https://stellar.expert/explorer/testnet/contract/CAS446QIFJCWSLHNYTUR2CWXDLMGTDP2QEK4KZRK5H5ZA4IXNIGJIZGI) |
| Test token SCOPE (SEP-41) | [CCJOUO…63XY](https://stellar.expert/explorer/testnet/contract/CCJOUOGGCXOSPSMSP3GDYQMUPBZHGEPKYLAWPYXM3VNYL7IZHP5P63XY) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDDFZF…7RJK](https://stellar.expert/explorer/testnet/account/GDDFZFOVTMDBELCPVQ5XDMBRVZIMCMAIDVV5JG3OIV3NRFWCRPBX7RJK) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/ab94440941d2f1e479d829087dc0d6244b8c4e1bbbbede37da5e29d5830eacb3) |
| [GBPN2X…V5GG](https://stellar.expert/explorer/testnet/account/GBPN2XOX5YPAZHP5LDK2V7UKSOXS74CVGGCWTYHLENIV4M4LCJATV5GG) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/fec52fdbfe1cff60bd705b844c67b5bd10726f6e4cfdae02091d9a8928bafab4) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDDFZF…7RJK](https://stellar.expert/explorer/testnet/account/GDDFZFOVTMDBELCPVQ5XDMBRVZIMCMAIDVV5JG3OIV3NRFWCRPBX7RJK) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/015c670c8e9866bc2712c378fe762da1c6f0f885ed8b91e1eb3614e7dd749c1f) |
| good seller | [GBPN2X…V5GG](https://stellar.expert/explorer/testnet/account/GBPN2XOX5YPAZHP5LDK2V7UKSOXS74CVGGCWTYHLENIV4M4LCJATV5GG) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/3b4be276e99874c8880a82079a73789e2549459b19e681c79cf77418a62e0388) |
| bad seller | [GDDFZF…7RJK](https://stellar.expert/explorer/testnet/account/GDDFZFOVTMDBELCPVQ5XDMBRVZIMCMAIDVV5JG3OIV3NRFWCRPBX7RJK) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/99f04349c9d950d5cb9c1361bd50eeb77cb7cdb4e2d06b53fef46b5b80033af6) |
| bad seller | [GBPN2X…V5GG](https://stellar.expert/explorer/testnet/account/GBPN2XOX5YPAZHP5LDK2V7UKSOXS74CVGGCWTYHLENIV4M4LCJATV5GG) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/413dba7129f1fa9a47b487328e0a264d9550eafa29f8e0145fa8297bb4764ab4) |
| stale seller | [GDDFZF…7RJK](https://stellar.expert/explorer/testnet/account/GDDFZFOVTMDBELCPVQ5XDMBRVZIMCMAIDVV5JG3OIV3NRFWCRPBX7RJK) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/8d83dce43f63bb6cdc3079c6ee95f9874249610d6ca61eb7c7077e5e0d832449) |
| stale seller | [GBPN2X…V5GG](https://stellar.expert/explorer/testnet/account/GBPN2XOX5YPAZHP5LDK2V7UKSOXS74CVGGCWTYHLENIV4M4LCJATV5GG) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/d68608f45fdc462f6b69332dcacc8cbfaef174dabaf31b37668356498d37e599) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/e00586a8cc307cf6284fdd49cb06643efd5e4a01dcf322771a4cf39aaa1dcb68) [2](https://stellar.expert/explorer/testnet/tx/1726f76524943a61cda360f0be9dc778864e70725c171433cce497a90fd6b3cb) [3](https://stellar.expert/explorer/testnet/tx/83361fc66b0f0f158e1e0b463b188d57df8d7e7083741ba293a5109f2ec5e358) … | [tx](https://stellar.expert/explorer/testnet/tx/60a731680e5ee1284c46b4a87788e508e0e33d5a30b561cbe360eed28990caa5) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/6505fa964bab6d8935862c9fd07adfdba443def415030db3de2d63d1a67d66ff) [2](https://stellar.expert/explorer/testnet/tx/a68ddf667122d078b3db3ca264b6ce7a5efb7852a0338368c26347a0e47196ff) [3](https://stellar.expert/explorer/testnet/tx/99036b6ea91a5534315dbe18348b81daa2fdee4cb1db32a3136e3d373ad01a9b) … | [tx](https://stellar.expert/explorer/testnet/tx/9254f758f8aee29bfd82d1402cfffc77598c96cb02b4f5f53398ade34d9eaca2) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/f00664ddcf4212ead85a9fc2bbc5f692ad6be6ad372fdac14056b2167f5d3486) [2](https://stellar.expert/explorer/testnet/tx/a11a349dcff581cf53c8dd85a05b0b0c929c8875805c363f5824a581fc4a0c54) [3](https://stellar.expert/explorer/testnet/tx/7a2ad16715c03e38e2b1c40970caa7150e08f42fdc446d1003689befdf8a473d) … | [tx](https://stellar.expert/explorer/testnet/tx/7f4060a3a2d4445042cdde2275a932d8860edbe1e311e218cb7ec723c12aa05b) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/f928e1a106ce80fab6f257f348b55979273e879d8271b9d47d6c62b2a8530354) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/787a2a3e9c41e7e6f24a3ee05ba36fa954230997f0114d1acc91bc952c233591) [2](https://stellar.expert/explorer/testnet/tx/08a95cd42d8ca9f6dfa3ef9e167a1c4ce3d29b213635f6443ec84b30821dcf38) [3](https://stellar.expert/explorer/testnet/tx/331f0697c6c49f796a08bc4870e7966ccee88047ad6d86707f629222877c8c58) … | [tx](https://stellar.expert/explorer/testnet/tx/f64d66b87272a407a135f17255dbc8914a928e1512d7c266107b638477684e49) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `9818f0b810b5a57d…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/011165fcfdb8d6319429b5d811be5180175e6a0af8c7daae3372d78e2eb46e24) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3a6e5ebb0f675c3aab65b3a40463259f574d9e0154adb05beab351394392f50d) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/0a607167da622bc08ac1b7ca3c0b322e87a5f06a3a225971f38c9e8f881c9218) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/ee6723ccd3f80420dfc90b998ee41869b53e15e78ebdd6103f3ee4912150fc4b)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/5c075a8494ff138b600c40200ca398358f8483a5914ca49895d17c5b0b0256c9)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
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

Facilitator decisions: good seller allowed (score 95); good seller allowed (score 95); stale seller blocked (score 50).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 95 |
| 2 | `/slow` | yes | 95 |
| 3 | `/stale` | no | 50 |
| 4 | `/wrong-type` | no | 18 |
| 5 | `/broken` | no | 18 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a0af072445267e4e6b0de104d756ae715df5f972013b6f242158131de30985ec) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/170d839ca41304ac958b9bd514ba8c7f94835465cfc11dfb47b77ea6fcf01804) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCH5W3…2EAZ](https://stellar.expert/explorer/testnet/contract/CCH5W3TC4TYTZYY27Q7JFHU6QJYGBCMRZRJIM24CXDN5UC6TMTQT2EAZ) ([deposit](https://stellar.expert/explorer/testnet/tx/26c28c72f8929163cc7595c45623cfc8c0164921ac08edda9e789dbf89e4b1b9)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/449e87352f811f00df3a0f67f6b362b7e376ea9f0d28ede0c2a2ba60aa28a038)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDOUWC…IQTF](https://stellar.expert/explorer/testnet/contract/CDOUWCFQJ6VCKMPD7YYRPZHDIGWIZXNIHTU6JKSXBATYVIMNYDDYIQTF) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.8 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/b16b51547c8ba56851142327bbe5668b7cd2f81f7273c84beeec096710d1c72c)) | **released** | 4.8 s |
| `/escrow-stale` | 4.1 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/5cf85bca2523995b19acdee5710b18d68d37c33f5e3386c82e59398435cfcba6)) | **refunded** | 5.3 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
