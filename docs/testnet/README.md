# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T08:14:35.119Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CBTMWO…LZNR](https://stellar.expert/explorer/testnet/contract/CBTMWO7ROF5I4LM66B3KULC2UBOKVIRJGKPLKJGPYPBYR2T5TI7ULZNR) |
| Trust policy (OpenZeppelin `Policy`) | [CDKYVD…QUN7](https://stellar.expert/explorer/testnet/contract/CDKYVD4X6QXXVI4VEPOTRBOJP7GXYF6ZCJ35EAXYEBBE4OILBYXVQUN7) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CAESX6…GQSQ](https://stellar.expert/explorer/testnet/contract/CAESX6QLEB7WKPIB7N3RR3C4A3BIIXVQ6FN22EWYNSF44INTLUAIGQSQ) |
| ed25519 verifier | [CA6YPU…KGOE](https://stellar.expert/explorer/testnet/contract/CA6YPUHBPUKAMI7WDVATFMR7D63VBVFCFEYSHYSGHCB6AHQKGCC3KGOE) |
| Test token SCOPE (SEP-41) | [CDJPF3…SFR4](https://stellar.expert/explorer/testnet/contract/CDJPF3DT2UMQYJW37FPMUNZNXT4GG4M744BQ4L6DYAKULXFFDGAISFR4) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GDCF2O…I6X4](https://stellar.expert/explorer/testnet/account/GDCF2OBBG55RORJSONDZETGDYRIQHZSAUWKPPVRSOW57ZFE46NCII6X4) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/a821aa924d5ab78a75f029dcf512ce7fc78823b3cc42d55c0dafc665ea52f32b) |
| [GC5GOZ…3GNO](https://stellar.expert/explorer/testnet/account/GC5GOZ2RNJ2M3C4NOOWQT6X52S6MRGD5PEGWCIFNX7VTTYE3YXKH3GNO) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/2c923524ea6fb26e3a27639ec3f7a3a2ccfe32266181acdb2ae343fb40372861) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GDCF2O…I6X4](https://stellar.expert/explorer/testnet/account/GDCF2OBBG55RORJSONDZETGDYRIQHZSAUWKPPVRSOW57ZFE46NCII6X4) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/a29f7104a5ff520e34c0781aa2f16c2b3f6f6cd630fb7595edeac26d705e8a1d) |
| good seller | [GC5GOZ…3GNO](https://stellar.expert/explorer/testnet/account/GC5GOZ2RNJ2M3C4NOOWQT6X52S6MRGD5PEGWCIFNX7VTTYE3YXKH3GNO) | 100 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/204c12344f6205f113bc3f3027f63b4f866b13318008abfa1fdeba69644ce502) |
| bad seller | [GDCF2O…I6X4](https://stellar.expert/explorer/testnet/account/GDCF2OBBG55RORJSONDZETGDYRIQHZSAUWKPPVRSOW57ZFE46NCII6X4) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/c0525787152b7cc9021ff0eee2cba426fac7adc218c1008738c4ab833413eb0e) |
| bad seller | [GC5GOZ…3GNO](https://stellar.expert/explorer/testnet/account/GC5GOZ2RNJ2M3C4NOOWQT6X52S6MRGD5PEGWCIFNX7VTTYE3YXKH3GNO) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/9a9be85a26a8676ea1a225f2ae5ff021a40169287a6e40547cf5658f35aca5b7) |
| stale seller | [GDCF2O…I6X4](https://stellar.expert/explorer/testnet/account/GDCF2OBBG55RORJSONDZETGDYRIQHZSAUWKPPVRSOW57ZFE46NCII6X4) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/b6efd2abbaeeb8d17415fdec1683ae5dc63edcb51774d8d69b1b22c7400d5e52) |
| stale seller | [GC5GOZ…3GNO](https://stellar.expert/explorer/testnet/account/GC5GOZ2RNJ2M3C4NOOWQT6X52S6MRGD5PEGWCIFNX7VTTYE3YXKH3GNO) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/898d8e9d104b9a3a8da3c0d575b326673e32deda4b4a2088ad934a321df3935f) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/aa54d5f4822dc1c81b6513ad0436ac7cd6ecf0cd746796e6d3a6f97553a935f1) [2](https://stellar.expert/explorer/testnet/tx/8ff9983e3aa24b29f55f8fab91cd477844606ddb277606016358caf7f802b493) [3](https://stellar.expert/explorer/testnet/tx/292589d897ee3605e6579ca94c248362470b2ed11442219a6dcb5006ec5554cb) … | [tx](https://stellar.expert/explorer/testnet/tx/7c0ed650e99c78ed91d1cbc1c29700e81a248fb2d609fd18b2c52864678a20da) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/f4965eb4ccf1673f3c982808c783a8f2029aad1a61a524c1344a9a0a4a4cc2cf) [2](https://stellar.expert/explorer/testnet/tx/545cf8bfa8e61b7bdb7b68f6f27f3ba25a89ca650cd16ccb62559b06fafb8947) [3](https://stellar.expert/explorer/testnet/tx/1e3fb6d684190dae2b7a4a87949a2e5af4b85c7099b630a2822d851549bce41c) … | [tx](https://stellar.expert/explorer/testnet/tx/6a0fc1fa8bb31c8a992bca65805416d76f1e3ab42448fcdbee334d34f7b22654) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/5b1b00e4186ce190a36f431235b58f000d44f391672888a4faab5439c0f2a9e0) [2](https://stellar.expert/explorer/testnet/tx/eeb9c284f2a112cc41481e6e06fdae15b1afa8af15d67aa19ae06962822be5fe) [3](https://stellar.expert/explorer/testnet/tx/99009e8af34ec842d238ecf7811a3931de1a6d5f2bfc5c86e94df213c6889a14) … | [tx](https://stellar.expert/explorer/testnet/tx/520d1066f6e6dbef84232d07a778001c0ca6fbdb577b034dbbd24eb0a02582ab) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/048ad04289af38a858d16ab0fdc6b65dae566ad2309d359cd53d1f9666d4cd02) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/7f8b2fd710559ea132cddbaedcb8f09f7d82eb4a20e8e32ceb6eec169f72839d) [2](https://stellar.expert/explorer/testnet/tx/7dad8bb5c3218b2f86ceb5909aaeca8380e23cb0d27f527025ed7e3acd7f8253) [3](https://stellar.expert/explorer/testnet/tx/f76b733951002c06cecea4d1af0ae1ddaab0d42fcf76b28545fe26f0f6e6c110) … | [tx](https://stellar.expert/explorer/testnet/tx/a699f6e03bab2739de9dc369fefa4e0356df43531bbc525bb9fa9eb48d1a79c2) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `90f49e6e435d164b…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/86968abc4bbaed75fe5f30e49088bae4bc92f2c863f300c547e8c36e5c591dae) |
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

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet.

| Payer | Outcome | Detail |
| --- | --- | --- |
| classic account | **HTTP 402** | {} |
| agent wallet | **HTTP 402** | {} |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
