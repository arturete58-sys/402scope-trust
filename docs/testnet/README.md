# 402Scope Trust on Stellar testnet

Run finished 2026-10-09T12:05:31.282Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CATKUF…XUUC](https://stellar.expert/explorer/testnet/contract/CATKUFGWBOG7MTUCH6RPQJPCA5MGNYHFZNEGBTUB3EWNCWRLVASNXUUC) |
| Trust policy (OpenZeppelin `Policy`) | [CC4ZBG…VTC3](https://stellar.expert/explorer/testnet/contract/CC4ZBGWSNCR53AKVGG34XPCAVALOLV4FK2M2JDSCUC7WMQSYAAJOVTC3) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDCW4J…Q7TW](https://stellar.expert/explorer/testnet/contract/CDCW4JP3FEXWW4VXVQLEVAFLW4VXPSTVWXI3QTTYYOAM3U4AXTL4Q7TW) |
| Spending limit policy (rolling window, x402-compatible) | [CBRWWT…2FTN](https://stellar.expert/explorer/testnet/contract/CBRWWTPZKYIUDBRWT2OKZMDZGM4ZWDUXFTNB3YWSVNCQTHARCYQD2FTN) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CBXSBW…7H7F](https://stellar.expert/explorer/testnet/contract/CBXSBWZUYPJAAH2ZNYRJSLMA5BUNKQ6572IYVRTFV74PS4FWOK7P7H7F) |
| WebAuthn (passkey) verifier | [CASYHC…SDGV](https://stellar.expert/explorer/testnet/contract/CASYHCAF7FUPNNKPKRARQKLGNES572BVTEVB7RXXBJ4IHVYBWL3SSDGV) |
| Refund bond (optional seller bonds, no admin) | [CBHXOK…2X7K](https://stellar.expert/explorer/testnet/contract/CBHXOKRMXXS6TDX5ORS343TIWQC3FJPBECNYRGSZC4T5K2A6TVN32X7K) |
| Escrow (x402 scheme `escrow`, no admin) | [CBHQQO…CVB4](https://stellar.expert/explorer/testnet/contract/CBHQQOBGZT3FY53NY46ZT42SRKYZGOGSEIEW2K4WOUSTTKGP3M57CVB4) |
| ed25519 verifier | [CCOEEN…EIKC](https://stellar.expert/explorer/testnet/contract/CCOEEN4PJQLPUIVO3JXGM4C7KPO6C42E62B3HCSBQ6PCCXZJ6YSUEIKC) |
| Test token SCOPE (SEP-41) | [CDNX7K…H5UQ](https://stellar.expert/explorer/testnet/contract/CDNX7KCWRX6UIASO2P63JT53UGC443LBENSL47WJEXD67UPZ6DVMH5UQ) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GC4JIR…374I](https://stellar.expert/explorer/testnet/account/GC4JIR5OUMM3JD4BSR5AY2PN33H5TMOMZHHEOD7MKE6R2PFIO46L374I) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/b3db924f949e17f3ef26966e36653bc69e011cd81459fee168efca2ef38965d9) |
| [GCI4FF…RZEJ](https://stellar.expert/explorer/testnet/account/GCI4FF32J2ZDBCF3DCM7VZ4YVTTMHB424E5XYM74NCOFA6WUVQAGRZEJ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/c2b4c698322a87b4516af7ad5924d8f739f6a984ca78fb1755527edad18b8363) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GC4JIR…374I](https://stellar.expert/explorer/testnet/account/GC4JIR5OUMM3JD4BSR5AY2PN33H5TMOMZHHEOD7MKE6R2PFIO46L374I) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/5ad45dd500e938c70305ad52647d9bbb682e3137809217ddce1e6de38eec6120) |
| good seller | [GCI4FF…RZEJ](https://stellar.expert/explorer/testnet/account/GCI4FF32J2ZDBCF3DCM7VZ4YVTTMHB424E5XYM74NCOFA6WUVQAGRZEJ) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/8474e4ff4ad728fd834e5071ccc7f435faaa58c0d23927b1357ba6d26208fde4) |
| bad seller | [GC4JIR…374I](https://stellar.expert/explorer/testnet/account/GC4JIR5OUMM3JD4BSR5AY2PN33H5TMOMZHHEOD7MKE6R2PFIO46L374I) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/05057e9f0d404f82ec5ca244185fd212651eb5fd7bf06cfe1e5c69d0cdb6fdf6) |
| bad seller | [GCI4FF…RZEJ](https://stellar.expert/explorer/testnet/account/GCI4FF32J2ZDBCF3DCM7VZ4YVTTMHB424E5XYM74NCOFA6WUVQAGRZEJ) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/37b62ca05af3c77b74e72df8d3610529b91222ad640a505dc8b7077c399fec37) |
| stale seller | [GC4JIR…374I](https://stellar.expert/explorer/testnet/account/GC4JIR5OUMM3JD4BSR5AY2PN33H5TMOMZHHEOD7MKE6R2PFIO46L374I) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/dfaf9179a18a9bf4f785c9e1d62520fb97f1f77a80c6e768370f41b2d2b523d4) |
| stale seller | [GCI4FF…RZEJ](https://stellar.expert/explorer/testnet/account/GCI4FF32J2ZDBCF3DCM7VZ4YVTTMHB424E5XYM74NCOFA6WUVQAGRZEJ) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/ef2d5c44a690832fde4a91dd5bda10ca627d010e4b2925ce21ea4bf3607d39d3) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/52ac11703db8015beec0edb58eaa78d72df26b3f3119610020e5af8ac6b6f342) [2](https://stellar.expert/explorer/testnet/tx/9a9f855f7b515677ba81cb9c1496d341b6dcdfa5664cc1775661e2a2275338f1) [3](https://stellar.expert/explorer/testnet/tx/1b7e728c6222440e0c32119ac0a317b131d6b27e23edb59c3e70f82d000048e7) … | [tx](https://stellar.expert/explorer/testnet/tx/d9b51b3755f448bd670511f4e101ccc99cccefdf1c4bcb908b41f8534e671465) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/b1bdd1bddca006f9b32f8e82cabcd7b9f8b0b385d37455542b35734cb5cce666) [2](https://stellar.expert/explorer/testnet/tx/eae3adc049a3a2232db6167bdfc9954d6cbb36fd86105d888d75dd5e63e2143c) [3](https://stellar.expert/explorer/testnet/tx/f4744b8785d70350d1746f4a7e1e24a6b6639190c960f1eb225bcea9dad3ad82) … | [tx](https://stellar.expert/explorer/testnet/tx/176276cd8cd1f2a9caa5157c9d30b92a943a54d5bcf70c555ac355e63d5763ee) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/3af57469ad859d35d5e2c292fe8709cf94537734d965d9b81ebb2329c531518a) [2](https://stellar.expert/explorer/testnet/tx/33210db063e5e5f8659d8efbfeced8bb5692496e129cad6ee60440ad439289f3) [3](https://stellar.expert/explorer/testnet/tx/2df3908f0ad3943e23c8ff9f1c29bff3614b1dbea136eadf8a48ccdbbc473808) … | [tx](https://stellar.expert/explorer/testnet/tx/a82afb7b68c642e05bbe934fa2b7044b311d46525c3a961021d617e2c03807e8) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/37e30f3c3e28636405834ffb1440f8c50f57e767b10d1162c86aa28f2eb41daf) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/af3a9a8f15300d37957993f05dbfde1416ebbd785516470d55674810718b77f0) [2](https://stellar.expert/explorer/testnet/tx/1cbf00b5556bc400d40e0c32ef1068e050f27b98ad0cc8bd5a7304c9efe350b7) [3](https://stellar.expert/explorer/testnet/tx/9311123a09bf107dd7866cef525f74feb6c89475012fae47612a359218581ffb) … | [tx](https://stellar.expert/explorer/testnet/tx/62b4f8c9388f476c5005eff4c8223170c67f769b926c00c9abb71b180e99a604) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `5d7304408cc090cf…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/410533f63e96adf34c4b45ae2b286bb872a71308c620be31d0bb1040dc0c7633) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2e82d16f7f4904d78b1ad5649ab885cda570fc9d0bb89b1ef4cafd3b4d2b5585) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/d232aec1ad488b2f3030c3faa792f2590e7ad9c5d7451ae4fa9165aecd9cdfb1) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/e46cd97047f3297f6bb3e19ed12b01cf93a1dcfbe8864fbbbb5203328a3c1bbe)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/3b8dc89967ed70f23733abecc94ae4d7a84c439dbc8bd2df8850e94dbacfd769)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4f331f45a699fecabe49273d762262b8796889f32c0a57bde0d6e86673e1d110) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/8760d7a223f12b8a1278f0b643b3909efee046f0d003ef9dfcee8c62b3ab7d4a) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CBHXOK…2X7K](https://stellar.expert/explorer/testnet/contract/CBHXOKRMXXS6TDX5ORS343TIWQC3FJPBECNYRGSZC4T5K2A6TVN32X7K) ([deposit](https://stellar.expert/explorer/testnet/tx/9810f71207f7bb8dc1527edb2725f1044dccc8559ba2e4f61726cb78c6a205bb)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/0271d61fff67852134e011509d9e78010893a0c83515ac35944758075d6566e4)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CBHQQO…CVB4](https://stellar.expert/explorer/testnet/contract/CBHQQOBGZT3FY53NY46ZT42SRKYZGOGSEIEW2K4WOUSTTKGP3M57CVB4) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.9 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/88f4d49ff87fd9f90a7fd2aa697fcc7d544fedde6966dc0554595229f3f1779e)) | **released** | 4.9 s |
| `/escrow-stale` | 4.6 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/31e0e9938d60b5d201e4fa9a5287fcebf4c7308470b7da1186fbe867bd5ca059)) | **refunded** | 5.1 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
