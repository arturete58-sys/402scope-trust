# 402Scope Trust on Stellar testnet

Run finished 2026-11-01T12:01:38.518Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CD3TGN…ZV4P](https://stellar.expert/explorer/testnet/contract/CD3TGN3MV6WJ6IOES2UTYXJXXRXNIV7GJQDADBMQEKAPPBOWDS7TZV4P) |
| Trust policy (OpenZeppelin `Policy`) | [CCP6RU…DUM5](https://stellar.expert/explorer/testnet/contract/CCP6RUQX2ECVUA7HF6VKGHETSUJII7SQQ36YLEZJEN72LKKHQI5IDUM5) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBV66V…3WKR](https://stellar.expert/explorer/testnet/contract/CBV66VIBLAEWMQV4U2YAQOMEOTSBWVA4LLPMBUEKFCHF4FDS5F2T3WKR) |
| Spending limit policy (rolling window, x402-compatible) | [CDYOYB…VVK4](https://stellar.expert/explorer/testnet/contract/CDYOYB5VMYI2L3CSVYLH3T7TXNDG6WCYNE2ZN5U3BYTHBQTTNWKUVVK4) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CB6ML3…GJ76](https://stellar.expert/explorer/testnet/contract/CB6ML3IWHFPJLV5LT4ZFY3IPS2FI5LP34KWBFB5LOA3AOZTTS7BZGJ76) |
| WebAuthn (passkey) verifier | [CB2IG4…6OJ6](https://stellar.expert/explorer/testnet/contract/CB2IG4O32ZHNGCPJVNZAHPWD4LJGLYMNVOIFUSE4GUZ5CMQHAOKT6OJ6) |
| Refund bond (optional seller bonds, no admin) | [CABWKR…YXD6](https://stellar.expert/explorer/testnet/contract/CABWKR423LDOMMUI2DXAREHRCVRAEQX2JRUVCIJQGFNULV432K2UYXD6) |
| Escrow (x402 scheme `escrow`, no admin) | [CDOIXW…LPP2](https://stellar.expert/explorer/testnet/contract/CDOIXWS434QMPAQOK6L7LSSSQ4573SZSGDLHGELL5UTCCAF7KNGMLPP2) |
| ed25519 verifier | [CAHQ3G…OEFM](https://stellar.expert/explorer/testnet/contract/CAHQ3GANJH7M6OCXTWGZPUBQHKYQO2Q6HTS5WUUHBB274GNMH4JUOEFM) |
| Test token SCOPE (SEP-41) | [CDWCDF…75SA](https://stellar.expert/explorer/testnet/contract/CDWCDFK6CUPAOZTGZPH4GQM4AWHCECUO4EUMFN5HFX64YLPRXGCX75SA) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDG7EF…7JGO](https://stellar.expert/explorer/testnet/account/GDG7EFEOLIGCDONHPNCAQBOJLRNP3CI7VYVYM46B66MXT7FHWV4R7JGO) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/430a13747064ea5db298dba375a99aa271cb5d5a82dbb04e5029fc315b79364b) |
| [GBDGHV…PEVP](https://stellar.expert/explorer/testnet/account/GBDGHV7LHTIQLW6S3F3DGZ3D4R452MFVIKF2RLBKREPV62BL3HE2PEVP) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/f2195fbaf8be4c3bf86ca0b26f4e9445bf35ec1c885d9c9a68d05c67bceb2e17) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDG7EF…7JGO](https://stellar.expert/explorer/testnet/account/GDG7EFEOLIGCDONHPNCAQBOJLRNP3CI7VYVYM46B66MXT7FHWV4R7JGO) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/f2c8a10902c32212e06a4a34559d79fcf33a22ada52b50c7ca95af906a585b0c) |
| good seller | [GBDGHV…PEVP](https://stellar.expert/explorer/testnet/account/GBDGHV7LHTIQLW6S3F3DGZ3D4R452MFVIKF2RLBKREPV62BL3HE2PEVP) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/070735a4cc49ec88ad30889ad7482549769ab42317382258a76fcfc93c766a49) |
| bad seller | [GDG7EF…7JGO](https://stellar.expert/explorer/testnet/account/GDG7EFEOLIGCDONHPNCAQBOJLRNP3CI7VYVYM46B66MXT7FHWV4R7JGO) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/9dbb97e6aae2948c63438371da205ba3d4f9857a83209b43064b2ce85e54251c) |
| bad seller | [GBDGHV…PEVP](https://stellar.expert/explorer/testnet/account/GBDGHV7LHTIQLW6S3F3DGZ3D4R452MFVIKF2RLBKREPV62BL3HE2PEVP) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/5511e5524fdbc83aca7356be5f9325ee5475f4a5af756fce7c6a2f5ee5d23eb8) |
| stale seller | [GDG7EF…7JGO](https://stellar.expert/explorer/testnet/account/GDG7EFEOLIGCDONHPNCAQBOJLRNP3CI7VYVYM46B66MXT7FHWV4R7JGO) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/c9db2e6489cf5c804672937effb1bd2b21095295865f31b6bb9ef75d549f93a5) |
| stale seller | [GBDGHV…PEVP](https://stellar.expert/explorer/testnet/account/GBDGHV7LHTIQLW6S3F3DGZ3D4R452MFVIKF2RLBKREPV62BL3HE2PEVP) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/8ebeafad7fabf085c4d2a7f40ba29355f7995cf955fd953d40929348cef5ed95) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/a3453514a849f5e72ac5553fcc25fa9ad4b844b60483e9952c6095a02e2187bc) [2](https://stellar.expert/explorer/testnet/tx/6ab2dc9efb308ae7d6662c0f35efcb966cadd50953ea77064af2f96e38a34e23) [3](https://stellar.expert/explorer/testnet/tx/f3408e093ba444b315d96840b3b271823bc31c45ac2608bb6276beefacc8486e) … | [tx](https://stellar.expert/explorer/testnet/tx/144914bfabd5a303c0085b3ed832c229168093f42c6347120ff46c98f905ebee) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/f0ac54b5321dfd1a0f6c436cc20d319d0ab2c09544b0690737ed66b8c254704d) [2](https://stellar.expert/explorer/testnet/tx/b5bf606986aeb1c0d25bc9f181ea0bb2158f95705a5a709f1460dd7e36d5bdab) [3](https://stellar.expert/explorer/testnet/tx/b09a16c2c9a9af497056cff9c01de3fc5b43120518a0d44ddef1559ce811b981) … | [tx](https://stellar.expert/explorer/testnet/tx/f101e55697592ae052d10d04f9b3b078e0e3f649dae93ae6e3c9639abf85586c) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/aebae2c9efde699e70d41aa1fd60f2e944cce85ce1a5eed724e4aca525b93ba3) [2](https://stellar.expert/explorer/testnet/tx/fb2ce7ada03eda764c3c35aad51dee2d9decd2585efb684678256f0258686fc2) [3](https://stellar.expert/explorer/testnet/tx/1dfdb9bdfb489f8b6eac75d34167b2a9f111869c4ea1b0a0e1128963a2097aef) … | [tx](https://stellar.expert/explorer/testnet/tx/c86c463b96682b925261015be6155a59f8ebb7d2d251b37be126a709694c9b0b) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/2a5e120b44b521bb9c9772fd40b551fcc2ad0aabc1112d5cac7ef2cc0071f81d) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/0f724b883d9dbe6db091eac2b3575ad1fcfe4f022fe01fb36af3fcb853a360bc) [2](https://stellar.expert/explorer/testnet/tx/c67e122b562304cc6488ae70aa6a3249583f475bbb8633b43d6b598647ab3ef3) [3](https://stellar.expert/explorer/testnet/tx/390c65b088d5b9c086d2f758d061d2d62392839b32235730c53f9f9e4d271d56) … | [tx](https://stellar.expert/explorer/testnet/tx/bf4fafeea1be4aa6e1bb760c60b7aade5b6e1f77d551bb7d3e81dedb95cbc946) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `61973a64777226d5…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/667307cd603d69c697ee71a56994078b5cd07a2b190f1e8e3ab57eac220cad2a) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e6445d5213d5c687d7625564c065d407be0e810c0500f8ec0d770f59640d570d) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/297dbe1a2c2919e9bbba65609a738339beafaee9eed73a254ca04500955c5f1a) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/b6bc7fce1282d59bbda82554880a44fbbb47ed27bede75753fac6904e72bac06)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/16fe813fc0b6976c0e77d9d3b6b5af36a40fb041d446b9f99417c1c153a87acd)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/16221ef3aae12a1488eec5776844c6ad72ec8368484798f81c923f3288ddf4af) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/a38a3d23b7eed02acfd01d8ae7ed4faf96684aa16115c1746e2f6bc2a39e006f) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CABWKR…YXD6](https://stellar.expert/explorer/testnet/contract/CABWKR423LDOMMUI2DXAREHRCVRAEQX2JRUVCIJQGFNULV432K2UYXD6) ([deposit](https://stellar.expert/explorer/testnet/tx/129d6e025e9a9d71f48d525ee3224f3203d941f1d26f51f4ba0d89603a9c9351)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/d5806f61f4dcd14177b8612d6321bf99fdacb5c3f48f00bd45dd87859e6d29fd)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CDOIXW…LPP2](https://stellar.expert/explorer/testnet/contract/CDOIXWS434QMPAQOK6L7LSSSQ4573SZSGDLHGELL5UTCCAF7KNGMLPP2) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/ba7f874fa8237b68ecb4219ace25b2234c7c0ef82009f521643d2697bcda9472)) | **released** | 5.1 s |
| `/escrow-stale` | 4.7 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/c56a253730add1a0d13071948ea771307260156d56dbbfdb8ad50803ee571e5f)) | **refunded** | 4.4 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
