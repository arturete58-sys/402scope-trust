# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T08:26:29.271Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CAXABI…LEZ5](https://stellar.expert/explorer/testnet/contract/CAXABII6N74AST5UOSNSEGPL3OQVWABYSNWIMVF2IFOWPFAMDPO2LEZ5) |
| Trust policy (OpenZeppelin `Policy`) | [CAT5GV…PGME](https://stellar.expert/explorer/testnet/contract/CAT5GVIJ4PWGBZWDK7MH4WOQ4JU5USA4RUVVOMQPJX6Z56A4UTBSPGME) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAXULV…3PHY](https://stellar.expert/explorer/testnet/contract/CAXULVRGRRG3QJNEAZK3LWMNZXB2USEZAFFFNVHTP4YE6F7PLUEB3PHY) |
| ed25519 verifier | [CCMKXP…7GBW](https://stellar.expert/explorer/testnet/contract/CCMKXPXDKI4SNNJTRJJGAQKDEPB7YVSX4J3EV5G2FQEEIPEMB5CR7GBW) |
| Test token SCOPE (SEP-41) | [CA4Z52…4HZP](https://stellar.expert/explorer/testnet/contract/CA4Z52L373GQ7P2VVVQE4XR27H4VVFJQGK6WHSTJWIAOMPQK6UI24HZP) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDDY7F…ANDI](https://stellar.expert/explorer/testnet/account/GDDY7F6CCR2UYU6MNSRXENFAQYYH4YSNL55SB4457CN7IM5IGPGOANDI) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/20d19830c66c925545141c090508943347763d70cb54ee3d9016bf1be9121e6d) |
| [GAHWSS…L242](https://stellar.expert/explorer/testnet/account/GAHWSSUBJEKTK5CMIFXXHCDSPAWUFVMKUNSPUUQ5ZVP2QRR5ZAZ7L242) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/fb6c829c6498a828b0816d78494136cdcca83436f6f4fbf60eed2f0eede70823) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDDY7F…ANDI](https://stellar.expert/explorer/testnet/account/GDDY7F6CCR2UYU6MNSRXENFAQYYH4YSNL55SB4457CN7IM5IGPGOANDI) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/16b879e313185809706fcb006c456c58a1b2fa34cd108a95937a8117119ef967) |
| good seller | [GAHWSS…L242](https://stellar.expert/explorer/testnet/account/GAHWSSUBJEKTK5CMIFXXHCDSPAWUFVMKUNSPUUQ5ZVP2QRR5ZAZ7L242) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/2cc4b0927ad33532e494c0fde1b47b23cbe6d8e25baeb9ccb52d3bd6e9496397) |
| bad seller | [GDDY7F…ANDI](https://stellar.expert/explorer/testnet/account/GDDY7F6CCR2UYU6MNSRXENFAQYYH4YSNL55SB4457CN7IM5IGPGOANDI) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/26f7e07d0cd9c02f2fc89ab1e01b6e73c5dae54c88426a59f07b8b1a8598adf7) |
| bad seller | [GAHWSS…L242](https://stellar.expert/explorer/testnet/account/GAHWSSUBJEKTK5CMIFXXHCDSPAWUFVMKUNSPUUQ5ZVP2QRR5ZAZ7L242) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/7064d5c771b114f08d38979db3e870e11fc3bc7418797c270e848554981ff27a) |
| stale seller | [GDDY7F…ANDI](https://stellar.expert/explorer/testnet/account/GDDY7F6CCR2UYU6MNSRXENFAQYYH4YSNL55SB4457CN7IM5IGPGOANDI) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/a25f8234dc6f5ece11c27499363fad65ebba76144203fff45ba36517538c683e) |
| stale seller | [GAHWSS…L242](https://stellar.expert/explorer/testnet/account/GAHWSSUBJEKTK5CMIFXXHCDSPAWUFVMKUNSPUUQ5ZVP2QRR5ZAZ7L242) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/b0de200ba0e5482b1b337c2cd4e508febb4b18cb2a67dad90aee2b3fe1bb46ff) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/ae5ca8163af1f43c199710cc07460b724a97d8cfca1a613968dd557f54f6550a) [2](https://stellar.expert/explorer/testnet/tx/2579237dbcb5e44bf36c4e17782767911e998fb75bfed5ae421cc1a12fb03bd0) [3](https://stellar.expert/explorer/testnet/tx/2e8b5cd62fcb893e480896a990cbbdeceb043fb6e80b38ebc2d4ed5f277cedc4) … | [tx](https://stellar.expert/explorer/testnet/tx/92679fd86f554712d3702794a50c20eb0155d246a80840b91eea170d5065f224) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/e4655c98e231d41f45c35c3c45372b9ac6f76d8d32616218005b1449295b0b8a) [2](https://stellar.expert/explorer/testnet/tx/ed795d9fd36c292483d302abda85e7a3864348f0a698e7e7ce88736035b3fe4c) [3](https://stellar.expert/explorer/testnet/tx/8a0514ab478dad42242b8437f64b8427ef1e854faa279a96574c2c755b815148) … | [tx](https://stellar.expert/explorer/testnet/tx/d999d2ead123f8bbbfe50f8565a19fb3e40568b81bc99222177c5451a80b8f3a) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/83196ac92492838264bcba6ce70c33358e42b3f1ca4e31caae94eb3e4f40a502) [2](https://stellar.expert/explorer/testnet/tx/a912ca23a3379caaba32ba36ed5c1b3c2450e1e83cb52441a589427172a5277b) [3](https://stellar.expert/explorer/testnet/tx/7f33806156fb292f0095e913f3617457993cffe7f079a958ca6ac105e1a81425) … | [tx](https://stellar.expert/explorer/testnet/tx/56cda0ab4013a94cf0359049ed1cd8c4cff428679cfcf491ad17051b9919f9ce) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/ebeb75f7c96a4787f66a3556a9f7c2340c3283218e44e2e48013eea11d97d61e) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/60be532d578d21921a4d5fa66e0b3fb409418ceca2045def9a1cfcaed7b407fd) [2](https://stellar.expert/explorer/testnet/tx/0f142d20d1afc88ab1ecc7dca15a48d5d15f37f04d6b9f56d7f20b40df24f7f4) [3](https://stellar.expert/explorer/testnet/tx/f71a9d811e647bb5543e01d58f09e9259e24fc0dc6eefd81e108768f050c2b23) … | [tx](https://stellar.expert/explorer/testnet/tx/8d76533365ff5de2a016c24aa08f43c18fc73f05d9be1555df730fcc4191df1c) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `eca03f0bdf376d28…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/aa3d526e5c80cf40f30d72f28dd014877fa602609f3919e41ac4699fd9150c53) |
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
| USDC | classic account | **error** | Failed to create payment payload: Stellar simulation failed with error message: HostError: Error(Contract, #13)  Event log (newest first):    0: [Diagnostic Event] contract:CBIELTK6YBZJU5UP2WWQEUCYKLP |
| USDC | agent wallet | **error** | Failed to create payment payload: simulation failed: HostError: Error(Contract, #13)  Event log (newest first):    0: [Diagnostic Event] contract:CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDA |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
