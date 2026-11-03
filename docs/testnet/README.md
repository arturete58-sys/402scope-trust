# 402Scope Trust on Stellar testnet

Run finished 2026-11-03T13:13:43.529Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CD7MAJ…NLH7](https://stellar.expert/explorer/testnet/contract/CD7MAJLHGYDXK564THPOYXIVNEAFB2ACR7FSYG5CYXKVNTNPYXERNLH7) |
| Trust policy (OpenZeppelin `Policy`) | [CDNDOC…LIS7](https://stellar.expert/explorer/testnet/contract/CDNDOCCDKAAGWZBY42XEKAYXWHUF6VNWVB536I33SV36SUHEIFW2LIS7) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CDKUFI…U24V](https://stellar.expert/explorer/testnet/contract/CDKUFIBR6VGCBQTLCUWRX6HQ344DU5XGBUYAEYOK57IRNNM4OHNVU24V) |
| Spending limit policy (rolling window, x402-compatible) | [CB34KJ…WVKX](https://stellar.expert/explorer/testnet/contract/CB34KJE2WGWX74G7MAYD6LDTCUVGXLILIRGIVWEJGUEIQKLHBWDIWVKX) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CDZGPC…LUBT](https://stellar.expert/explorer/testnet/contract/CDZGPCHFSAAT5PKKFVTKY6L3SNNIFYKUIXIW4FCBO3333MI7WU5PLUBT) |
| WebAuthn (passkey) verifier | [CCQHBY…Q2CF](https://stellar.expert/explorer/testnet/contract/CCQHBYWBJMSGAHFKW2V3TFSHXULMLU44U3CWKNDYF6TKYA3KTX5QQ2CF) |
| Refund bond (optional seller bonds, no admin) | [CD47BC…GJ6J](https://stellar.expert/explorer/testnet/contract/CD47BCXXUAXW5YNYGEQGBEZ3VFRGJOVSFGEMEILYBEIME2OLINPAGJ6J) |
| Escrow (x402 scheme `escrow`, no admin) | [CADHUJ…UJBC](https://stellar.expert/explorer/testnet/contract/CADHUJ2UUVU3PJXDMUZ4C65XQXAOLBYVNLNEFXSX27XG446OLIF7UJBC) |
| ed25519 verifier | [CCIKGJ…WBTU](https://stellar.expert/explorer/testnet/contract/CCIKGJV7HS22FGMAN7HTKNZIKFSGVHGRYOJCGBCE6P2J4W6LRQ2OWBTU) |
| Test token SCOPE (SEP-41) | [CCOBM5…NVQV](https://stellar.expert/explorer/testnet/contract/CCOBM5SFDTR5JR5W5OKG3XRU3RADHNL3BDBNS5OP4T7HNOFM27D3NVQV) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GBDJBW…6LHR](https://stellar.expert/explorer/testnet/account/GBDJBWQCZCYL4GGEEBH2KYZSUT43D4XQC3MIO2BEBT5V5BJKZIK26LHR) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/1d77980461dcf5b3b6964a2e963e55870c6258c875a1e2f1615eb5a9201e1d2e) |
| [GDWIGX…RLZY](https://stellar.expert/explorer/testnet/account/GDWIGXDHPMKOJDPOIDXOTVLVE3ATMJMHQ5WNVSD5TZWYKXVR7RNGRLZY) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/fd62bce960f888ee2d307acd1d4b23482ea13f06eac88b99ad79a8c7f7725924) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GBDJBW…6LHR](https://stellar.expert/explorer/testnet/account/GBDJBWQCZCYL4GGEEBH2KYZSUT43D4XQC3MIO2BEBT5V5BJKZIK26LHR) | 90 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/da5b60b94f185e8569717e485b6d9627d942c5eef2a8844ab366d2909dfb9173) |
| good seller | [GDWIGX…RLZY](https://stellar.expert/explorer/testnet/account/GDWIGXDHPMKOJDPOIDXOTVLVE3ATMJMHQ5WNVSD5TZWYKXVR7RNGRLZY) | 90 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/387c311b4dab2226c482dd0c752c3f6e7a32cea0fe0383663a86f928a0d0f47b) |
| bad seller | [GBDJBW…6LHR](https://stellar.expert/explorer/testnet/account/GBDJBWQCZCYL4GGEEBH2KYZSUT43D4XQC3MIO2BEBT5V5BJKZIK26LHR) | 13 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/35af594df20e5ee83ee7dd9f7dfbe0010299e1e3d6a2fc1d9fa87c1470fcb6a8) |
| bad seller | [GDWIGX…RLZY](https://stellar.expert/explorer/testnet/account/GDWIGXDHPMKOJDPOIDXOTVLVE3ATMJMHQ5WNVSD5TZWYKXVR7RNGRLZY) | 13 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/c58f9997218d1373b4b050ace12526d2569e7c5e80cf49f0b5afd4e40bc06aa6) |
| stale seller | [GBDJBW…6LHR](https://stellar.expert/explorer/testnet/account/GBDJBWQCZCYL4GGEEBH2KYZSUT43D4XQC3MIO2BEBT5V5BJKZIK26LHR) | 40 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/12f31c2cdad9d5f33044bb2d9c8e67c16349feb0ed9fa22e47e2b1847f3ef380) |
| stale seller | [GDWIGX…RLZY](https://stellar.expert/explorer/testnet/account/GDWIGXDHPMKOJDPOIDXOTVLVE3ATMJMHQ5WNVSD5TZWYKXVR7RNGRLZY) | 40 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/724066f89514e1adb0d81048da15f47594962128c59698b1cd763cf1803185cf) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/28490d7cca33577538d1e5576ab4a8e5e56e257d24b883a748e59b7e8769a1ee) [2](https://stellar.expert/explorer/testnet/tx/7ac56fcd1a18d3e44bf428f56baaf6781369e03c5458f13dd0537e9c4357bed1) [3](https://stellar.expert/explorer/testnet/tx/eab18c9734bec1a61ee600789c6bf80d6d408400cd13778b2c7df7cbdf33caba) … | [tx](https://stellar.expert/explorer/testnet/tx/da3d66c89b6b46992c095c53a903aedfde03012bdcd4f80fac3ef3145bb5dc07) |
| `/slow` | good seller | 90 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/521df32f50ac633795d8eea29177a951ffc934c0b3f9ce23cbf7ef5da196e0ac) [2](https://stellar.expert/explorer/testnet/tx/6c4ce25f91ae5a27fcf9d5c73457a681701d448391965a581104948ea1dff59a) [3](https://stellar.expert/explorer/testnet/tx/90a5f2763c9d28a5030cba715a96d5cecbf1baf67cd321a8cae226495f148626) … | [tx](https://stellar.expert/explorer/testnet/tx/6e5aca73579c0a18350c8481de63bc6ec56596a7a270473e54c5ea3dc5857a4b) |
| `/wrong-type` | bad seller | 20 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/c164ce6a077adb7ae4eb08ab5eb0d6f762de0b8b2c7afab48c3ff061bde8d988) [2](https://stellar.expert/explorer/testnet/tx/e832264bfd80973b073df03d4780849df48afd0f184cd494aac140b45436d0eb) [3](https://stellar.expert/explorer/testnet/tx/4a3dba44c7bbb3efe88bae693e355b784acdea003f6a44a3ff1671240411ead7) … | [tx](https://stellar.expert/explorer/testnet/tx/d8a5995b82f5e47dbd04d1022acea47e1dcfdb5f2bf817f3a5aad06a0ff34baa) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/0be1a79eb0250e9c51c01693436de0449bb98c0dd950134f30cf69cb9886c122) |
| `/stale` | stale seller | 40 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/d62599e846e9e350bfcb01f4e8cade242100a7bdc3c0ad94a2f288ba594760f8) [2](https://stellar.expert/explorer/testnet/tx/129fbbb7d599f953dd2ddee26d74b01e1a9e987144e050a935c561bee38d48d0) [3](https://stellar.expert/explorer/testnet/tx/7649c0cc73fb5853694aa09e222636e87906c4ae356c18ecb63052bf5911acfa) … | [tx](https://stellar.expert/explorer/testnet/tx/1c287f5523d56475e92b05e47c99e59e129c8f18b6d823f1def6f8fa08cbf912) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":0,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":0,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `2d978406cf39adb3…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/42b0a1eb43043c52e92ce9823349dd9bcecc6d59c88dd4264a26a9ff36c7a68b) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3f457950dfac3e9cbcc12320c50c75915a02a20105ed3ff43a119e98c2747b1f) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/dc982fb1c34bcff34fa9aae9ae89d3f33a62376fb699fda387b42a3e5601e2c0) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/386b4da03ab3087ded4abbe480253c62f4f69b0cde5fe4ae674a722a4437ce9f)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/073078dca373d1acf5713870b6643b33a1e963282d1de3fe42ff59c42acd3612)).

Both checks run inside the wallet's `__check_auth`, so neither depends on the agent's code behaving. The spending limit emits no event when it lets a payment through: the x402 facilitator for Stellar accepts a payment only if its simulation emits the token transfer and nothing else, which OpenZeppelin's own spending-limit policy does not meet (it emits `SpendingLimitEnforced` on every payment).

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 90 | true |
| `/slow` | trusted | 90 | true |
| `/wrong-type` | avoid | 13 | false |
| `/broken` | avoid | 13 | false |
| `/stale` | caution | 40 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Any facilitator: trust hooks and ranked discovery

A standard `x402Facilitator` from `@x402/core` with `withTrustHooks` in `block` mode, reading the onchain registry. A buyer **without** any trust guard pays:

| Endpoint | Outcome |
| --- | --- |
| `/good` | **paid** |
| `/stale` | **refused by the facilitator** (HTTP 402) |

Facilitator decisions: good seller allowed (score 90); good seller allowed (score 90); stale seller blocked (score 40).

A Bazaar listing of these endpoints, ranked by `rankResources` (trusted first, then by score):

| Rank | Endpoint | Trusted | Score |
| --- | --- | --- | --- |
| 1 | `/good` | yes | 90 |
| 2 | `/slow` | yes | 90 |
| 3 | `/stale` | no | 40 |
| 4 | `/wrong-type` | no | 13 |
| 5 | `/broken` | no | 13 |

## OpenZeppelin's Built on Stellar facilitator

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/286d6a38ab5d915c158d05957ec278f83a2eb30651e2c988d94fe12a781f3cf3) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/de95f882d05cc8a4b627e9c0ed0f8e12935b0dba1dafef80225458b1568908fd) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CD47BC…GJ6J](https://stellar.expert/explorer/testnet/contract/CD47BCXXUAXW5YNYGEQGBEZ3VFRGJOVSFGEMEILYBEIME2OLINPAGJ6J) ([deposit](https://stellar.expert/explorer/testnet/tx/db8afb979cf1205537c33fb72e3db0090508d340cd110c5a720892174093e8e2)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/6647a3aa9eba59ddaf732baa53891f00c7e21f8b6ed378a41169a9dbca25a878)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CADHUJ…UJBC](https://stellar.expert/explorer/testnet/contract/CADHUJ2UUVU3PJXDMUZ4C65XQXAOLBYVNLNEFXSX27XG446OLIF7UJBC) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 11.3 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/3b92f7c9c2e5648604c48fd0c99dc63dd531c303314ff96950b14abe1b053f2b)) | **released** | 14.1 s |
| `/escrow-stale` | 18.6 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/cbc8ddfb8cba4ad995eaa06373e5e6bfe5997410c10190f7e62e320b33d53fdc)) | **refunded** | 10.9 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
