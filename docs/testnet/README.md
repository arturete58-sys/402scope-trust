# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T08:53:55.771Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CCZS23…WMB3](https://stellar.expert/explorer/testnet/contract/CCZS235EQXNTZLECE4SIQZVSFDPQ4D7LUZQUZWDBUXSJB7CZERJGWMB3) |
| Trust policy (OpenZeppelin `Policy`) | [CCGSSV…4ZD6](https://stellar.expert/explorer/testnet/contract/CCGSSVDCYV7GHO5IPO2T7UU357KITD5PZEOBNXTUWIKANLRWNZK24ZD6) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCLG66…IMPY](https://stellar.expert/explorer/testnet/contract/CCLG664ZXX4HWIS2NXBFJHXOJLPMZI2J4UU64337C7A2S2VQZ3RIIMPY) |
| ed25519 verifier | [CBFXDO…DKAT](https://stellar.expert/explorer/testnet/contract/CBFXDO2HBULN76QPZVXF6RNSXCOIMCMKOOVV4OSIDWQ35DV6U3ADDKAT) |
| Test token SCOPE (SEP-41) | [CC5Q7G…UUU7](https://stellar.expert/explorer/testnet/contract/CC5Q7GS6DYTDFS3J534LZUCBL7OEPGPLL5ONQ3GXXNYAV6HNFHAVUUU7) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GD6AMC…FXXW](https://stellar.expert/explorer/testnet/account/GD6AMCDHXGHBVO76BQFFZ53FCDM7KGRQYQ7VVXOYM7CD72L7TILMFXXW) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/e6e9b0d44336a802e2dc2327f88f567e0fc36de4a4673eadc1fb4705f0ffac2e) |
| [GDUOQZ…67VG](https://stellar.expert/explorer/testnet/account/GDUOQZOBX3IBNGQX4WE5MHYZU4XJSZSKFNQ6JZPD5DAWFA3EVLNF67VG) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/8a05fdfbacacf0c8bec92ecf8dc66e2f44bbf2a9cf605c58141898871e0e8746) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GD6AMC…FXXW](https://stellar.expert/explorer/testnet/account/GD6AMCDHXGHBVO76BQFFZ53FCDM7KGRQYQ7VVXOYM7CD72L7TILMFXXW) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/e500a2bd60db8d0a3f4daa93a6a1d28fca85946b2d2e2c061b98e2f6f45e0fa1) |
| good seller | [GDUOQZ…67VG](https://stellar.expert/explorer/testnet/account/GDUOQZOBX3IBNGQX4WE5MHYZU4XJSZSKFNQ6JZPD5DAWFA3EVLNF67VG) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/4035d4bbc15f5aaf412e70d9f0dd709a0304aea2723730a15042a908238b1a53) |
| bad seller | [GD6AMC…FXXW](https://stellar.expert/explorer/testnet/account/GD6AMCDHXGHBVO76BQFFZ53FCDM7KGRQYQ7VVXOYM7CD72L7TILMFXXW) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/ead1c577b77860b2f7ff340397a18d217b14aa1a49c3be6c85412d35aa706cb5) |
| bad seller | [GDUOQZ…67VG](https://stellar.expert/explorer/testnet/account/GDUOQZOBX3IBNGQX4WE5MHYZU4XJSZSKFNQ6JZPD5DAWFA3EVLNF67VG) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/800813b46cef4b8a691a74c014cd131ed2db9e1605a7739d82830348c939a0c2) |
| stale seller | [GD6AMC…FXXW](https://stellar.expert/explorer/testnet/account/GD6AMCDHXGHBVO76BQFFZ53FCDM7KGRQYQ7VVXOYM7CD72L7TILMFXXW) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/95409c11c5c5b1e696ac18c7c80db08bf4b69f08fb3e052674d4dcb8b755e489) |
| stale seller | [GDUOQZ…67VG](https://stellar.expert/explorer/testnet/account/GDUOQZOBX3IBNGQX4WE5MHYZU4XJSZSKFNQ6JZPD5DAWFA3EVLNF67VG) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/c9ecbfb931895f2c7f06d393bb3ea18ce5e28364ef6d35df824116de31a94a68) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/9863802a482b1e8eb2c74daefc3f088656ad8bddb19c82a3c8b0b0ef670952fc) [2](https://stellar.expert/explorer/testnet/tx/ef5f30cb4b52febbec5fdde282255ff86034e94ce7142969ebe317385f25013f) [3](https://stellar.expert/explorer/testnet/tx/9958adcded3dc7e94b0b37a4c3a0bae23cc741aaf1487e08996c785e897cc457) … | [tx](https://stellar.expert/explorer/testnet/tx/af6165ef06a4a1898eee88dac6c3d9d5486e02e5e82d2cd6501d85c1e337b0b5) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/31b2fea483746c22a9a18c0dc0f404b0d0d3b7a3f24114ee365ff1062500f585) [2](https://stellar.expert/explorer/testnet/tx/9ca7e6342ce765fe4de872fc68841abb5dc66cbbd1882e4f6c95f872ce84ae1d) [3](https://stellar.expert/explorer/testnet/tx/f1b37a1271e8bb1f0920565008470198fc2b40456fa145e6ec9a27665f7cda99) … | [tx](https://stellar.expert/explorer/testnet/tx/9b2429ce05f3a5aa51ca27301162f0a9a5eae3fb00fbe6d242973bee07f54b55) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/095b9ae30159036ca910ee13a81e717f870e7ada41fc76f4e46f5f738b940bfe) [2](https://stellar.expert/explorer/testnet/tx/2296f79b62e051c09a8b702ccd0d2ab1a7b25eb15793a9d57953f65a581ce566) [3](https://stellar.expert/explorer/testnet/tx/b22bc4767580fba0443f10e394c187088f1efe6d4cebac4610a12dd83eb91e90) … | [tx](https://stellar.expert/explorer/testnet/tx/d1530c409a8de85167ebcda6aee2564366a3f7181137c2522bf7e25bd03fc907) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/f7e9f7f7cf4fdd77e478b3cd73c620c3b1f472d1c6fffb74a2519a292d9796dc) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/b7c795cd3c63e3b133310140cfd656919414c813ee164a877c7bf7ad99e7795f) [2](https://stellar.expert/explorer/testnet/tx/aa1515fd7bd6fbbd36b27104489ca4970fd6d615de5fd7e58b71e16431cf1bdc) [3](https://stellar.expert/explorer/testnet/tx/9692beb471a2299912ef99b05a0fd24206f55ba4474c9e3b6d6db5eb400c945b) … | [tx](https://stellar.expert/explorer/testnet/tx/ed94c3ea7ee587010d4f3f054b253b3824cea011f5c683e057c68ff1eddbd892) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `2b24eff44225223d…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/19ae3a5515c1370f8a701dd271e354fe8203d98d7a00dcf273202c0143f59cc5) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/1407b20128630d55b886331f175de74a15146174c5a5743cb11306946c7010ee) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/5f311aac4004849e119ee4a8c046978f2729ff98467fccf492248a3c0a206508) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
