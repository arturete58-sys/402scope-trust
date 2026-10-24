# 402Scope Trust on Stellar testnet

Run finished 2026-10-24T09:45:29.670Z. Every link below is a real testnet transaction or contract on Stellar Expert.

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
| Attestation registry (bonds, scores, evidence) | [CBDAHY…6FWA](https://stellar.expert/explorer/testnet/contract/CBDAHYWVLEKGYJ6XXYUKLK4QNCXGRSJRJJVSLM5HNC2OMQLRWVIQ6FWA) |
| Trust policy (OpenZeppelin `Policy`) | [CDC7UV…4VSR](https://stellar.expert/explorer/testnet/contract/CDC7UVP5HWBNQVKM2B2RQQJHY6YQRBNAUIWPO2ATXW4TLU2AEMEV4VSR) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAD5TT…MMS3](https://stellar.expert/explorer/testnet/contract/CAD5TTQGA74AIEAKV4YYAYSONTQGQ4W3HOUSOO4XJGJS4EFJSS6GMMS3) |
| Spending limit policy (rolling window, x402-compatible) | [CDKPWJ…RUAL](https://stellar.expert/explorer/testnet/contract/CDKPWJYSSQ4Q6NVFHWCOKTV53R3G7RZNMWIUXFP3XGIMHIJCSTBCRUAL) |
| Budgeted agent wallet (trust policy + spending limit, payments in SCOPE only; owner rule signed by a passkey) | [CAS4CB…FSQ3](https://stellar.expert/explorer/testnet/contract/CAS4CBDMZX67H6JKRWJT7BV5ADDGBABPR7TLAH3DJ6SJRXPGWZ2PFSQ3) |
| WebAuthn (passkey) verifier | [CAW2HC…Z3LB](https://stellar.expert/explorer/testnet/contract/CAW2HCUOGPS74QWR7TVRG2B25DQ2R4KCBU3YGOPQOUQC3NV5SBCWZ3LB) |
| Refund bond (optional seller bonds, no admin) | [CA54U5…ANUX](https://stellar.expert/explorer/testnet/contract/CA54U5XXM34PHFZSBGTJFW4XIJ6FMJ2VJNOVSPPQKXQO5PBAARAGANUX) |
| Escrow (x402 scheme `escrow`, no admin) | [CD4KKL…4FTW](https://stellar.expert/explorer/testnet/contract/CD4KKLL7XC2JNHJPN467XLVJ7XUIZWRTIYRO7UDJDOIR6WRXZX574FTW) |
| ed25519 verifier | [CCEC7U…44TE](https://stellar.expert/explorer/testnet/contract/CCEC7U5DCAPSR25GGBCHSWBHJC2RTLDQQRJ7IV6XMRNVCS27CMLL44TE) |
| Test token SCOPE (SEP-41) | [CCREML…SEGW](https://stellar.expert/explorer/testnet/contract/CCREMLY6YI4Z5LOYYWCRBLMLDZI2LS6BBQMJRNZYLWG2WL4NPHMZSEGW) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GD4E25…HQQM](https://stellar.expert/explorer/testnet/account/GD4E25RM5QV74CGP5KSWIDA2LR7ERLZMZMXI747D2F4A4QVJCUYDHQQM) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/24877b6059076ba965cdc828e35d93d2aca1b1156ea5a1380d25a3a151ad0143) |
| [GAERCM…N3LC](https://stellar.expert/explorer/testnet/account/GAERCMJQ7WUSNGRYXUBRJGRWTWZ2FVO5XX4IG3RQ64HWVR6AIMFCN3LC) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/e48aa245c2f855ba45cac1420e7d04f8ec67edd485ca5e350f2fb6276ebdd4d2) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GD4E25…HQQM](https://stellar.expert/explorer/testnet/account/GD4E25RM5QV74CGP5KSWIDA2LR7ERLZMZMXI747D2F4A4QVJCUYDHQQM) | 95 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/ee0ca5821d01c065059b7a5f004d8b7fcd0e656d34f5b4e92e41f8a94f957bf0) |
| good seller | [GAERCM…N3LC](https://stellar.expert/explorer/testnet/account/GAERCMJQ7WUSNGRYXUBRJGRWTWZ2FVO5XX4IG3RQ64HWVR6AIMFCN3LC) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/5474eb374091c3bb1bc1df7ba2f8edb0205fc691caa11e37b1f5b0ed1b2cefdf) |
| bad seller | [GD4E25…HQQM](https://stellar.expert/explorer/testnet/account/GD4E25RM5QV74CGP5KSWIDA2LR7ERLZMZMXI747D2F4A4QVJCUYDHQQM) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/5280a46f5371c483b7ba43db3621b60c16255fce585e0320bd3e86edcb505c73) |
| bad seller | [GAERCM…N3LC](https://stellar.expert/explorer/testnet/account/GAERCMJQ7WUSNGRYXUBRJGRWTWZ2FVO5XX4IG3RQ64HWVR6AIMFCN3LC) | 15 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/ed49669fa405a1fd0822bec0ece2c9b6378b22326ec74da21499eca1b3e3d753) |
| stale seller | [GD4E25…HQQM](https://stellar.expert/explorer/testnet/account/GD4E25RM5QV74CGP5KSWIDA2LR7ERLZMZMXI747D2F4A4QVJCUYDHQQM) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/7b97074fdb33bd4f3b9571787dfbbfda69975a1d3aefd1b883bd73335cc82d60) |
| stale seller | [GAERCM…N3LC](https://stellar.expert/explorer/testnet/account/GAERCMJQ7WUSNGRYXUBRJGRWTWZ2FVO5XX4IG3RQ64HWVR6AIMFCN3LC) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/9460b47723d3636b6013d2d8b14aedbcc5ab1e7c41f56104e262c978496bcd0d) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/5ecf30f7b2fc40b1c49a03f9cef6059dac81bb7e604c832553e8fb5b06cf36b0) [2](https://stellar.expert/explorer/testnet/tx/849f17f16457dd0940bd419c4073afe3cf6bb82cf5a810681086b4ae5ad6922c) [3](https://stellar.expert/explorer/testnet/tx/339242d0c2feae6a30d0b7ec229abc103dd4197ae62e1199e8f119a31f1ec9fa) … | [tx](https://stellar.expert/explorer/testnet/tx/75a2a8615f6501b2aa219e9d5453b4c4bc11a34c6c3e89a2723d6352381d26b8) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/8c573f27a98064183070ccfa3271911fdf55df2c5ae8494e04bcba2fe1764bea) [2](https://stellar.expert/explorer/testnet/tx/8349b6c0eb5538d74868ff02debf0c80678694b35ef45cc7d64a014b5c01b95a) [3](https://stellar.expert/explorer/testnet/tx/abc6a9074bfeae48dcbb64bb01544ac39b4c4ba6a9b3e97800e0c0dfa199177b) … | [tx](https://stellar.expert/explorer/testnet/tx/0c222d66cd40d18ac80b66519ce1760abb04a0dfc102627e0931a7c1d15e8888) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/1d2db7cfc055dc72252ea688507edcd55c7cb30313cf265d2f5bba40f3eed25f) [2](https://stellar.expert/explorer/testnet/tx/8595146d993941051a703b5d0c6e866d960351fc29c9b9d336a3d1b3d9f3eded) [3](https://stellar.expert/explorer/testnet/tx/6d17bebba5913005b3f2925410adeb54a7e03bda2f380e1d62e84c9a8f928af9) … | [tx](https://stellar.expert/explorer/testnet/tx/24e693bc1dd404acecada7477ab7b9c69b46ed3fe170fd9b8a866a2b994c9345) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/4b59aefdb1b37a66d157072489191ce973c576617c5b356f7cb7f285ac1937e1) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/32582ca81bc892bead5367383d7cf172704181d95fd2b7bf952e7f2ac68ca744) [2](https://stellar.expert/explorer/testnet/tx/3acd292844e6c1ed7e6ec97e2e685c3f3f6652fb705a404f0c6f7f365cb5a492) [3](https://stellar.expert/explorer/testnet/tx/da04238a86192f2b5ab47d5438fe16d6bf85b1658ff9bea2241cc977957af5e9) … | [tx](https://stellar.expert/explorer/testnet/tx/df8837b1a409bef77da630b50cbba6d8c13a8ae310a5ea39b9fefe38049b9560) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `da3ac105355b097e…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/b06b139d4b0583faaa3ae403dad9686ab348f02fcb6e066dd8e1466a476cce16) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/stale` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## Who and how much: trust policy plus spending limit

The budgeted wallet may pay sellers trusted by the quorum, and at most 0.0025 SCOPE in any 17,280 ledgers (about a day). Each call costs 0.001 SCOPE. Its agent key can only authorize payments in this token: the rule is scoped to the token contract.

| Call | Endpoint | Outcome | Detail |
| --- | --- | --- | --- |
| 1 | `/broken` | **refused by the wallet: seller not trusted** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |
| 2 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/b50f3dbc062545046f0e8692f46048e217cd49547cb0c26974b65299d915562e) |
| 3 | `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4b3cf6ee316900c1b42cca239671817f90ce56f24ec427d88909b3b847e59931) |
| 4 | `/good` | **refused by the wallet: over the spending limit** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction) |

Then the owner doubled the budget to 0.005 SCOPE, signing with a passkey (WebAuthn, P-256) under the wallet's admin rule ([tx](https://stellar.expert/explorer/testnet/tx/3ece02bdc4b5035e7ea1a7edee3887ae77faf9fdf07df400ca578d853a73f358)). The agent key cannot do this: its rule covers the token only. The next call: **paid** ([settlement](https://stellar.expert/explorer/testnet/tx/eac9aa85665b6005d114e997650e27f0af1f06aba4b7616e16972ab651e0ffe6)).

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
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/34c6a8c2a2d8f3e7add08fbf3840c0b781090f160df9d7d7f89b83cbbef76c7e) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/156f9e5aaa019507d49c30b2c8c8934c1e32961711a0db7fb86fdc5075403591) |

## Automatic refunds (optional seller bond)

The stale seller opted in: it locked 0.01 SCOPE in the refund bond [CA54U5…ANUX](https://stellar.expert/explorer/testnet/contract/CA54U5XXM34PHFZSBGTJFW4XIJ6FMJ2VJNOVSPPQKXQO5PBAARAGANUX) ([deposit](https://stellar.expert/explorer/testnet/tx/89238766af3eb06002a57451cecea5baf3a326bf0da3ab4de8f5b4f82f559264)), a contract with no admin, and added `refund` to the terms in its 402 challenge. An agent using `scopeFetch` then paid two endpoints:

| Endpoint | Receipt | Seller at fault | Refund |
| --- | --- | --- | --- |
| `/stale` | valid | yes (EXCEEDS_DECLARED_MAX) | **refunded** ([tx](https://stellar.expert/explorer/testnet/tx/a6fbefad0bec9ea53cae4312df76f11665a719488e87b6d415bea3c9d32f7101)) |
| `/good` | valid | no | none needed |

The seller's own x402-receipt/3, a SEP-53 signature over the payment, the declared age (1,200 s) and the maximum it promised (60 s), was the proof: the contract checked it and refunded the payer in the same transaction. Bond before: 0.01 SCOPE, after: 0.009 SCOPE.

## Escrow: held until delivery, settled in seconds

The buyer's agent paid the escrow [CD4KKL…4FTW](https://stellar.expert/explorer/testnet/contract/CD4KKLL7XC2JNHJPN467XLVJ7XUIZWRTIYRO7UDJDOIR6WRXZX574FTW) (x402 scheme `escrow`) instead of the seller. The data arrived at once; only the money was held. The agent checked each response: it confirmed the good one, so the seller was paid in the next ledger, and posted the seller's own breach receipt for the stale one, so it was refunded. A seller that posts no receipt within 60 s is refunded by anyone; a posted receipt is released after 120 s, or at once if the seller's refund bond covers it.

| Endpoint | Paid response received | Seller at fault | Agent | Escrow | Released or refunded after the response |
| --- | --- | --- | --- | --- | --- |
| `/escrow-good` | 5.2 s | no | confirmed ([tx](https://stellar.expert/explorer/testnet/tx/1d5118a3658b77a21794c015d595f11585d8df98752808f4a802d321d922f17c)) | **released** | 4.1 s |
| `/escrow-stale` | 5.1 s | yes (EXCEEDS_DECLARED_MAX) | refunded ([tx](https://stellar.expert/explorer/testnet/tx/2b3b22543f1bc5d5ca0b5565698177ebf8213a071fa90375033e7c3d22bf002c)) | **refunded** | 5.5 s |

The time to the paid response includes the x402 payment itself, which the facilitator settles on-chain before the seller answers, as with `exact`. The escrow step runs after the agent already has the data.

## Prepaid ledgers (batch-settlement)

Fermah Pay's prepaid ledger on testnet, [CD3GES…7PSI](https://stellar.expert/explorer/testnet/contract/CD3GESMYMJ3MNWNSKS6P7TEDHL5HYEWSGTFX7A3ENDB5MXTQ5TED7PSI), names its seller role onchain: [GDLT7M…EVYN](https://stellar.expert/explorer/testnet/account/GDLT7M7IAMPMGMDOQ2C6XOKTBLZ7Q7AXEZ6WFWRFKIMTGPOCPAN4EVYN). A delivery receipt from a seller paid through that ledger is checked against this key, since the ledger contract (the `payTo`) cannot sign.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
