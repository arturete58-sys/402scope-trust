# 402Scope Trust on Stellar testnet

Run finished 2026-10-13T12:54:13.637Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBAYJC…J2AE](https://stellar.expert/explorer/testnet/contract/CBAYJCTBRZF37CGKMTCG57FFI3464ANUN55HY3LMNCCTRICO4DN4J2AE) |
| Trust policy (OpenZeppelin `Policy`) | [CBQUPN…S7K4](https://stellar.expert/explorer/testnet/contract/CBQUPNKHP5KRM7SEZSTKZ5SJKIK434MKF64UDKEX4FCRQCEQC7NKS7K4) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAFLAV…AEIA](https://stellar.expert/explorer/testnet/contract/CAFLAVV3ICI3NIMD6YRB5T54KCNXLHKUV7PBWNBBVOTKMYU2TG4HAEIA) |
| Spending limit policy (rolling window, x402-compatible) | [CCTARD…G3JH](https://stellar.expert/explorer/testnet/contract/CCTARDYRHK2YUEDZISQY5KGXWJ6TQSZ53ALEELSLFG5ABEM75C62G3JH) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CCB2WR…TRK3](https://stellar.expert/explorer/testnet/contract/CCB2WRE2WAKAGOGDGOBNBTATLYMYLSHQTF24JNYV5M645JF6IWKKTRK3) |
| WebAuthn (passkey) verifier | [CCZRZT…IH2J](https://stellar.expert/explorer/testnet/contract/CCZRZTHNNEZDGU6PFVZSHTCF3CUCRSQSO4UTOT55DKVSJ45X46KCIH2J) |
| Refund bond (optional seller bonds, no admin) | [CATZYM…LX4Y](https://stellar.expert/explorer/testnet/contract/CATZYM5MUDJ4WDBMZEVH4ZOSP4UANO5IS3MLN7A3V7445WRMIWKILX4Y) |
| Escrow (x402 scheme `escrow`, no admin) | [CCZTUR…N22S](https://stellar.expert/explorer/testnet/contract/CCZTUR4XLZM3EFFPUTRELK2DU4DKWJDU5O23TTZZJKUY3WZ2XCGZN22S) |
| ed25519 verifier | [CAMFND…RNMZ](https://stellar.expert/explorer/testnet/contract/CAMFND47NKQRRHKDN7KW5UY4CIGLXUKWBELK6HSREN4OIDPWUDCYRNMZ) |
| Test token SCOPE (SEP-41) | [CBHLHO…6O25](https://stellar.expert/explorer/testnet/contract/CBHLHOBBO5AZTQZYKFWVMVYNO4XRNGCXWZSGYBT2TZA367ULMOCU6O25) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GATSAD…IJZG](https://stellar.expert/explorer/testnet/account/GATSADFH7PBSIMZXV5X3VPCEBWCGH4ZJJGRWG2N5FIYH2Y2DZEFHIJZG) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/cddd4496cc4fdbe05a88e5add8527aceea3471b18b0814ea9ce86b699c9379ce) |
| [GBHPIS…3GOV](https://stellar.expert/explorer/testnet/account/GBHPISDNZG4MOB74I2EKFZWC4THMJUICLY2VJYMO54SSEPS5J2A53GOV) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/db157fc067041f11b260e28c8b5d5390b2c22d60b1380b8ae703cac09ac713d2) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GATSAD…IJZG](https://stellar.expert/explorer/testnet/account/GATSADFH7PBSIMZXV5X3VPCEBWCGH4ZJJGRWG2N5FIYH2Y2DZEFHIJZG) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/7b3689e4ccfca42ae9bddb20234f8b8481ac6ce124ec9ce4d5741ea3995b46e5) |
| good seller | [GBHPIS…3GOV](https://stellar.expert/explorer/testnet/account/GBHPISDNZG4MOB74I2EKFZWC4THMJUICLY2VJYMO54SSEPS5J2A53GOV) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/9ec4c96b0da203715b81b360c034cf022a5d60755650fda2be5a20f44b2e9016) |
| bad seller | [GATSAD…IJZG](https://stellar.expert/explorer/testnet/account/GATSADFH7PBSIMZXV5X3VPCEBWCGH4ZJJGRWG2N5FIYH2Y2DZEFHIJZG) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/5dccb65e9c8cc80963a00354ec938116e4f76bca38bd291998376ffe2a9ae190) |
| bad seller | [GBHPIS…3GOV](https://stellar.expert/explorer/testnet/account/GBHPISDNZG4MOB74I2EKFZWC4THMJUICLY2VJYMO54SSEPS5J2A53GOV) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/17301320831d135f6840234c2032f980e0e59cbca1960704fea924f5d5236052) |
| stale seller | [GATSAD…IJZG](https://stellar.expert/explorer/testnet/account/GATSADFH7PBSIMZXV5X3VPCEBWCGH4ZJJGRWG2N5FIYH2Y2DZEFHIJZG) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/3550ede683818d641fd0272adde24b64cd6ef0eb7377b0c48a288fc6a0e19727) |
| stale seller | [GBHPIS…3GOV](https://stellar.expert/explorer/testnet/account/GBHPISDNZG4MOB74I2EKFZWC4THMJUICLY2VJYMO54SSEPS5J2A53GOV) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/30cb60b81ac76ecd89b47b3077325b018b027460bbb908157289488705e728fe) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/731f8968cd8d5d48890d4b43736b9de9ec08728ff02b4fb40a6330ec4679c437) [2](https://stellar.expert/explorer/testnet/tx/dee5fe4f62ba185edc42611a1b1029034ce92c66e8afdb2a55c8df52a0567fff) [3](https://stellar.expert/explorer/testnet/tx/467820a834b6de19229eff263415bb13a7213cf3ca7df97d1713449e53db139e) … | [tx](https://stellar.expert/explorer/testnet/tx/0eb230322ae0feb1ab6ef5bdf2043d70cb450f70930c4ad58eb79a66f5074bb4) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/cd6f27ddddf6ecfa461d4daa0baeced7497cde9faacaebf0422a6e9ba9775b58) [2](https://stellar.expert/explorer/testnet/tx/9cff40ba2800a9e08e67cc572cf0eeb751e4ac2d7a5878fe4cacaad2cbaa73d1) [3](https://stellar.expert/explorer/testnet/tx/3d8b69678cc60c2bb508f0483b258d47ee43dda8eec5d04e3e87bc100ff3ee5f) … | [tx](https://stellar.expert/explorer/testnet/tx/15ac01dddf1069d66fb1febf1e85ec6cf1faacc6b78251a9b7f75e0440bc9b66) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/566206c923dbf565e8c0a7f36ef319c49199fbd3e7ff395cfe62b5f61ebafef7) [2](https://stellar.expert/explorer/testnet/tx/fc3359ac4944e3ca1a07e278723dab54c2966a6d78c23c2ae5c914224ab3f1ef) [3](https://stellar.expert/explorer/testnet/tx/560e9ba73df6d77c474479c1401c907a6d3cf0eedff2b7d8b97620ecb371b9ff) … | [tx](https://stellar.expert/explorer/testnet/tx/0b94aa1e56ff475d9a6acdc70c8c5b5ef88141fc9f0feec6c947711614a3948f) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/040b31a98c15aa6a7436121f7ccc495efe537b0b4a8bcc715136c1aa9630a894) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/ea614621577af07e03ca7a27e7917fb969bd6daee98b355186538e219faf42e0) [2](https://stellar.expert/explorer/testnet/tx/34dede1dfeb52e82d9064fe3fe3bcf216d21d7365c2192a4c6c4b51b9c778826) [3](https://stellar.expert/explorer/testnet/tx/1d879e1e5de08cbba09a4dceebee800f1287a0382936142ed37fa0ed148f3088) … | [tx](https://stellar.expert/explorer/testnet/tx/a50bfa8a5cdd0286262bf4fd3eb8dd834a65ca81e2ee1123433223bf9b40a08a) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `3ac0422ed4d0b019…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/d272e8e9edd438bbfcef7539920506195e37a8067af8cd3a75c2204234db4814) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/876d42558e1f4234ef6af2f31c0065cc41058f4b441f57ca439ce7e5b7f782a1) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/6b3dfebe2ce3172610cbd0b9edefabb711b64299a8818126d98faca103a60577) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/1c5be6283db1f0aaee4d8985ced8f71bcbb7353dc7b2a70df79e5b4d72606585)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/8be1bbde05efc80d74e952d8a0071309d76b1cea4936b978e8f7f92477d781ce)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/45caea5846fc7ff39c9b64d1332c637b4d8939c05043bc14e3704224e7e4f57c) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/5c7d08edb93c6782e177afbda3c47e34785ebc26d806e900ff18d272992b9489) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CATZYM…LX4Y](https://stellar.expert/explorer/testnet/contract/CATZYM5MUDJ4WDBMZEVH4ZOSP4UANO5IS3MLN7A3V7445WRMIWKILX4Y) ([deposit](https://stellar.expert/explorer/testnet/tx/5fc82d9d6d332259824ccae92556f6855e8a625de4692c05c52d302e907069ab)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/efd44e943bd104d3c50633aa1fcbf5a14dbb83ba9fec8b2a2bd793c3fa129e56)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CCZTUR…N22S](https://stellar.expert/explorer/testnet/contract/CCZTUR4XLZM3EFFPUTRELK2DU4DKWJDU5O23TTZZJKUY3WZ2XCGZN22S) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 4.9 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/f5ffb6b03bd5e511d954912203cdca01831a8affaf7ca20189dc1a16c880ca84)) | **released** | 4.3 s |
| `/escrow-stale` | 5.7 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/bf72d6724845d6efc5bcf834b01c23a1c1b96b4ba05c7f2005e48dca0821e7c8)) | **refunded** | 4.3 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
