# 402Scope Trust on Stellar testnet

Run finished 2026-10-08T12:13:46.876Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CCTO3Y…KGIO](https://stellar.expert/explorer/testnet/contract/CCTO3Y6Z5WQGY6NWCISKB4CM6RZCQAAYMPG6XJWLBR2ACQXNKDOTKGIO) |
| Trust policy (OpenZeppelin `Policy`) | [CDPH65…27KL](https://stellar.expert/explorer/testnet/contract/CDPH65EDVZODB7KIMTTYKWC7PTWQ4CX7P4C2ZQ5L7XAHFSEUFP5627KL) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CC7KXC…FXJE](https://stellar.expert/explorer/testnet/contract/CC7KXCAI4WCUNXWTREDGKA5AWAEYKCEPM4TUVE7OPAILXBCOJOCFFXJE) |
| Spending limit policy (rolling window, x402-compatible) | [CBOFRN…XKR5](https://stellar.expert/explorer/testnet/contract/CBOFRNNPA5N2AQOCQIN2VTRYFUULQVPAYESAYZWWOV7N6SFJ3BY5XKR5) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAZM7U…LZBA](https://stellar.expert/explorer/testnet/contract/CAZM7UF5RED6U2ALAPAC5YMUB6256GQTILLG2SVJLILZT6FLVJFPLZBA) |
| WebAuthn (passkey) verifier | [CC5Z5H…JIGO](https://stellar.expert/explorer/testnet/contract/CC5Z5HXWE5SMYQE7MZ3CFLRZ4BRZSEZRSJ3WWNSFQ3PC6XDRT3N2JIGO) |
| ed25519 verifier | [CD4JSL…2V2Z](https://stellar.expert/explorer/testnet/contract/CD4JSLV5QSA77XQLURRTWZKZMN3QG74DDCKGK73NHWAOR2NDVMV42V2Z) |
| Test token SCOPE (SEP-41) | [CCYUZ2…OLAW](https://stellar.expert/explorer/testnet/contract/CCYUZ2CDDEUMHIXKCKWJCYM5CTK3Q6J45C4RH4ZS3LLRVOG7Q7F5OLAW) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GB2MPM…EAOI](https://stellar.expert/explorer/testnet/account/GB2MPM73PKVMSJ3RKSEORGIUXFM6FPQZPZTTUM4YJ4A2NCYED4ZCEAOI) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f731fe0a80ae2062f629e4ae40b9a9ef4f750f5cdfcfacdff4102653383346cd) |
| [GCVJKS…ZX4N](https://stellar.expert/explorer/testnet/account/GCVJKS6T2F5SYRP25WWLH776CFJXEOFB4VGWLIUZ3RDMLX6KAEFJZX4N) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/31cbc8b2312021a32455569aa4468ba06cb13d8306d1cf31e360e5bf26412ac0) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GB2MPM…EAOI](https://stellar.expert/explorer/testnet/account/GB2MPM73PKVMSJ3RKSEORGIUXFM6FPQZPZTTUM4YJ4A2NCYED4ZCEAOI) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/2c31e90dec7983041b723ce80e100102cccf41f1b0ec27d9bc4d7dc8bbc8a7ec) |
| good seller | [GCVJKS…ZX4N](https://stellar.expert/explorer/testnet/account/GCVJKS6T2F5SYRP25WWLH776CFJXEOFB4VGWLIUZ3RDMLX6KAEFJZX4N) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/e6997e1f291e1044dcaf30a65f174663ffed31777651bdfb1fef3dc6ecd1f092) |
| bad seller | [GB2MPM…EAOI](https://stellar.expert/explorer/testnet/account/GB2MPM73PKVMSJ3RKSEORGIUXFM6FPQZPZTTUM4YJ4A2NCYED4ZCEAOI) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/cf90edea3590a092e92a20a7a348308fbc37b8ad74ae1c52cf23cc34e409402e) |
| bad seller | [GCVJKS…ZX4N](https://stellar.expert/explorer/testnet/account/GCVJKS6T2F5SYRP25WWLH776CFJXEOFB4VGWLIUZ3RDMLX6KAEFJZX4N) | 15 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/7956d9978ba6fa8c29709010a18976a20a7fcddae79beffae4451aaf7c842796) |
| stale seller | [GB2MPM…EAOI](https://stellar.expert/explorer/testnet/account/GB2MPM73PKVMSJ3RKSEORGIUXFM6FPQZPZTTUM4YJ4A2NCYED4ZCEAOI) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/2bcfd5295e5e7913244a174b855f7233edd4493bf3a1bcfd6734c4676bf3f1d4) |
| stale seller | [GCVJKS…ZX4N](https://stellar.expert/explorer/testnet/account/GCVJKS6T2F5SYRP25WWLH776CFJXEOFB4VGWLIUZ3RDMLX6KAEFJZX4N) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/eacc9812a2aff4669243b2dbafd01bb9ebc6e3fa8992a1200a5752f8bb3c8734) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/d80e8c6b8397da4ed863f6e73121985dfe230953379fdf6b4a98e32d0ce33e39) [2](https://stellar.expert/explorer/testnet/tx/c0c052458f6f0c632eb4287b28e5e265b6d7694522283e2e1ff14af50cdd2c2e) [3](https://stellar.expert/explorer/testnet/tx/210cc59e051326d8fa2ac6593374d81c104f5d3d5bf785c80acd811fbfe55e26) … | [tx](https://stellar.expert/explorer/testnet/tx/17577720eddf7efed0a456477f899a25af2c9328b0f8d054b54dc003a8377acd) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/7e61bb80e0a2a640cfa0b003ff5c78f2cceda7be4e42ccd2d65617459dc65e5a) [2](https://stellar.expert/explorer/testnet/tx/195726f9eb98b93bf88979441a3116b992f39d7e7d2bef98c40d35e626f6289f) [3](https://stellar.expert/explorer/testnet/tx/9f76f5be5de264afd1b73595da8343987ebec2642104fee33d753f22e97e3731) … | [tx](https://stellar.expert/explorer/testnet/tx/ce8eb7ef1d9aff66235687c3263f173e60f4068cec57a0c7db84f179c5074990) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/b6bf2eb47e58903858bad5b980956fd785aa1f9dd64ada068134187815cd66e7) [2](https://stellar.expert/explorer/testnet/tx/e5a405d5076cfd921587acaeb8196415e7e883aad37857766ee00fe1790726a4) [3](https://stellar.expert/explorer/testnet/tx/8f13548109958dd5dda3041dc7672f373738438cc345d9c53a77edfb2756e5b6) … | [tx](https://stellar.expert/explorer/testnet/tx/ddd0022677e14bc7ae55627a2db7b0288d1c13b32bba265a39179f0b29ec0d7c) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/459c6b0277a81fa1f87ccf7920fafb93df83d4e3972dfc07182284f072c53679) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/9805d25d425a74e452a3df4fe9da248b2a4bb7a17b368b10221c71f7cad31a6c) [2](https://stellar.expert/explorer/testnet/tx/de1925e671f3c525c9054785fddaa1c49458eeabcb4286d5e0256260842c8be4) [3](https://stellar.expert/explorer/testnet/tx/691308fc9af2dabcd8a12929030ce653bfb0f98b7d7e3972fa4a079aabc6c1f5) … | [tx](https://stellar.expert/explorer/testnet/tx/80099c635be153f7ebf17c49b01f94717094f8559a34617a33e537aca2491350) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `f87bc20127e20a24…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a4d9d1513d257e7da6c148494679af3ef73f84ed438e4a0ed690066afdac1d4c) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/016d8dd63e888de119a942bb322b443704a166f7aad37e03edba5a18c401dfad) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/719b927f7b665ecc43d2a89d70e64bc216d8f64f7d5f21a032db7391667726dc) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/e027c967a1cc39424e1ba0c6b7ce4cdeaeaf34ec2d598ff50f0c90060394e2f9)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/3ef6bd33a5c28fbb740a88c7502895f08dac736bd48554795c4e9c08b998385a)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 95 | true |
| `/slow` | trusted | 95 | true |
| `/wrong-type` | avoid | 15 | false |
| `/broken` | avoid | 15 | false |
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
| 4 | `/wrong-type` | no | 15 |
| 5 | `/broken` | no | 15 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/5bc3dbc905f088ce114286bceb0a58ec3c8ff5fb96e763552883081e008e34ba) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/b61bd1351fadc70a7a774c034772bdebc7e8cf806230680886e88794c9e275f2) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
