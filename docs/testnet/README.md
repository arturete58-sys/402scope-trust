# 402Scope Trust on Stellar testnet

Run finished 2026-10-08T17:45:04.224Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CDLHM6…VKOO](https://stellar.expert/explorer/testnet/contract/CDLHM6QGNNYMXPWCH2BDL4WRVFGPTKHPOFBM6FRGLS2BRM7UFIRTVKOO) |
| Trust policy (OpenZeppelin `Policy`) | [CC2BKF…67C6](https://stellar.expert/explorer/testnet/contract/CC2BKF4XIOPRR7EOUOAG6RCH54ELPFITFIQCKLLLFQYPHVTWRXAV67C6) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBI4YG…HWCP](https://stellar.expert/explorer/testnet/contract/CBI4YGL446LDBSTWNJ7KCWM34Q5U2XBLGMIFO2FGWMJNKD4S4V6ZHWCP) |
| Spending limit policy (rolling window, x402-compatible) | [CARYZZ…YKR4](https://stellar.expert/explorer/testnet/contract/CARYZZ7TF3EEB56V4HA4F6OBTPMJN3QW7FQNALSH475NWEHGIV66YKR4) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAFB3I…56IU](https://stellar.expert/explorer/testnet/contract/CAFB3ICFX53RIFSANVWQCBVDHTBHLWDHYOTPP2H2D6GCR5OAU7TB56IU) |
| WebAuthn (passkey) verifier | [CBW7B4…WH7A](https://stellar.expert/explorer/testnet/contract/CBW7B4XSYONIWGPLKCV45PD2SVJPJTWQ7N6ZOLMWZBPM6N7YLOI2WH7A) |
| Refund bond (optional seller bonds, no admin) | [CCWMHJ…JYGN](https://stellar.expert/explorer/testnet/contract/CCWMHJELQJIMJ5XDY6AJ2UQBOZL4BFBDU675R5GFANMKDZDERFWWJYGN) |
| ed25519 verifier | [CDIF7O…NULD](https://stellar.expert/explorer/testnet/contract/CDIF7OWEOZ4CF3SVKJ54BDHFIHQVXF7A6IS7HMK53HAZUBVTW6ILNULD) |
| Test token SCOPE (SEP-41) | [CAFXLU…SDCU](https://stellar.expert/explorer/testnet/contract/CAFXLUWCD6DIMTS67P4USMYSGFFL3IMAGUS62HQNWK2K7HQ3CBZWSDCU) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GAK57P…XWXJ](https://stellar.expert/explorer/testnet/account/GAK57P2OAXO5OUYD7ZQBHETMW3JZCK4BOWT2NY3EV36S5HOMKE7EXWXJ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/766bb4ac7cbd1be25e8bb8ec8aa30a698911e9dd2e7b9338e71d7553e36ffc87) |
| [GDPVWO…OQT7](https://stellar.expert/explorer/testnet/account/GDPVWOBO3ON2E76CLVFYXXASL3AUJSVJNEAJITON4QKZCHUXWLSUOQT7) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/c64a815e7675ebce2778e34833e5d84a21212a9075d102d88d80eb021e54a8cf) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GAK57P…XWXJ](https://stellar.expert/explorer/testnet/account/GAK57P2OAXO5OUYD7ZQBHETMW3JZCK4BOWT2NY3EV36S5HOMKE7EXWXJ) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/8c9b683754fd7b8e75edde73dd020f6f4159a8d7f9b7c731b9f201f43d0b8077) |
| good seller | [GDPVWO…OQT7](https://stellar.expert/explorer/testnet/account/GDPVWOBO3ON2E76CLVFYXXASL3AUJSVJNEAJITON4QKZCHUXWLSUOQT7) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/ca8bb94cfcbc01fd59149e4162ae57cc92d7f3b92114e7950d87318ca2d2def0) |
| bad seller | [GAK57P…XWXJ](https://stellar.expert/explorer/testnet/account/GAK57P2OAXO5OUYD7ZQBHETMW3JZCK4BOWT2NY3EV36S5HOMKE7EXWXJ) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/aa25dd17f4a065fc993de8bc704da0423953be1db2be335d7a9a66fc9e1f6885) |
| bad seller | [GDPVWO…OQT7](https://stellar.expert/explorer/testnet/account/GDPVWOBO3ON2E76CLVFYXXASL3AUJSVJNEAJITON4QKZCHUXWLSUOQT7) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/f9df008909e7c512d1aaab2e272a5360ba0435d983befd1af42a34d83807a5ff) |
| stale seller | [GAK57P…XWXJ](https://stellar.expert/explorer/testnet/account/GAK57P2OAXO5OUYD7ZQBHETMW3JZCK4BOWT2NY3EV36S5HOMKE7EXWXJ) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/084acb03fc4d042f43ed8de59e0c911f4d1e54949f3a3fb88f1a91398f98215e) |
| stale seller | [GDPVWO…OQT7](https://stellar.expert/explorer/testnet/account/GDPVWOBO3ON2E76CLVFYXXASL3AUJSVJNEAJITON4QKZCHUXWLSUOQT7) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/46b65dd014fde3a684ef7aeae7b0ce56559875bae602a0b8c714c024bcdab1d9) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/903b358d5c8408a26955b878632f3d1df98349cf7bf7f615c719aff155aa8fb3) [2](https://stellar.expert/explorer/testnet/tx/e53b8aca2aa6b96b3256067ec69e81562fa246e5bc0eec2bff1b31ef67181bd2) [3](https://stellar.expert/explorer/testnet/tx/8f24ebcc4077f0a44bcca72d062c22064ae92396cb5df629f7cefa297c5e367a) … | [tx](https://stellar.expert/explorer/testnet/tx/76395915c3d91d4c2d02e7e07bd4a22a75e762d544aaa204db8dd5fbcf2c40e7) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/87822359adf26c3f96d90a9a85c20039bacec0bae01fea66b8cd64ed3184fed0) [2](https://stellar.expert/explorer/testnet/tx/e0af3b7c20016620b9bc7c34dc3f694331d33a71664767a92930b6abeb4e5cfb) [3](https://stellar.expert/explorer/testnet/tx/bcbdef00209b826f5ae8266b2e5a18f64c9f885f7f1595c4d6c74d5dc17b08b7) … | [tx](https://stellar.expert/explorer/testnet/tx/abeb146ed18d2686d8e197c4cf67cbe9fac0e1a417976f09e04fd7834dcee7bf) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/f78d7f37d6b2460a4807dc1c3c81363eebc78a9877443121bf4981001b212262) [2](https://stellar.expert/explorer/testnet/tx/bcfe2b9670532e5dc202328b345471ab5028a91995810c133d12c31b4626c825) [3](https://stellar.expert/explorer/testnet/tx/4c13c061674687bf1628357b4e0ce5da4efa8db367c32355647bba1a6f44a0b2) … | [tx](https://stellar.expert/explorer/testnet/tx/b465f75bc5541faca642b23cec4932346edf58ff811f153cc8803c5111600804) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/038d80ec8405650fed363b355283a66775410a80e1fc1ac14a1ff8f4c63bc913) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/b93ef76a2a644ca7b95a962c969492d4145e3efac03c4f734e9d30fb8e97eee6) [2](https://stellar.expert/explorer/testnet/tx/415925a4cce3ccaf5ed9ee7bb0283e164548b215d2d0ed6598ab8440aac49e71) [3](https://stellar.expert/explorer/testnet/tx/49475a8437d8aa96a71f199878618e65b8f8d0a08f4199f0752a3458a0be1b70) … | [tx](https://stellar.expert/explorer/testnet/tx/f9fbf8beea3bb22ebea5c0948667a7c67cb04bebfe780369a418715ae0121feb) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `8dfcf5feb3f76dd3…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/e8629fcc847fdd075f244e3fd416ce9d7c0598b83cc1353732ba6ba4aa9de975) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/afd2aa324858f1c112c01deadd211951552583010a6f8c203afe7a725c2690f1) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/46242577129c3a7cf9c9d18ac74648c7dc415f94775a85873cf01bddab6aa040) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/4d1728fc3464d42df7f5e760859a456ca5427868ef7515ab6d41f65f0317d274)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/c258f52a5e680df01448005b73aa49b9c44eca0d8b2973aa1794b7ddd4f2da35)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/617310d18ff830028710e33e52b3dad05856b18b4f7672d3b17bb4f4d3a2e660) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/2c89d77aab45cde52bad978b9a56d8bc0e55e1c251ee18952beb718f65be6b2f) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CCWMHJ…JYGN](https://stellar.expert/explorer/testnet/contract/CCWMHJELQJIMJ5XDY6AJ2UQBOZL4BFBDU675R5GFANMKDZDERFWWJYGN) ([deposit](https://stellar.expert/explorer/testnet/tx/61de4a5fd6e6c4ed8df65c3daa6a90d5aa92a204a846a1a8b2e96997df15eaee)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/6e0735ac0b2a0148d737ac49d84090e3b68078c97b1234ec8561cf9f11994fc6)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
