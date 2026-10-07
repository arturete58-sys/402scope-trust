# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T07:55:12.668Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured four x402 endpoints from two sellers with real paid calls.
2. They wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
3. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 2 were refused by the wallet itself.**

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CDZXSM…HV43](https://stellar.expert/explorer/testnet/contract/CDZXSMQXVMEHO3AXT4MDV4LCSRRFFK23WGSX7IPNXGBD2OWVFUR3HV43) |
| Trust policy (OpenZeppelin `Policy`) | [CBGWEL…FHWC](https://stellar.expert/explorer/testnet/contract/CBGWEL7LQVYXMVF2ODQBGRIZDA3VCWIF7LSDXISFTRYM64RX3Q3QFHWC) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CC65T2…YPOA](https://stellar.expert/explorer/testnet/contract/CC65T25V56N5ZH3M4HRYZBDOKMB2EDSWTO2OTBNFKPPXLKBEMDLNYPOA) |
| ed25519 verifier | [CDILAR…W5QP](https://stellar.expert/explorer/testnet/contract/CDILARGRAZUONO3RAA6UPDHKNHTJ3HOL5KA72DS7PQTRTF2OUJQHW5QP) |
| Test token SCOPE (SEP-41) | [CCMNPY…ECAF](https://stellar.expert/explorer/testnet/contract/CCMNPY2XTSGNT2CTRT3CDQ32MREX46QQJHL5BLZBHJM6LPPXZO56ECAF) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GACSZ3…KBVQ](https://stellar.expert/explorer/testnet/account/GACSZ3F5BMWCG2DAFDY3CVQBKWHQCCFEULHHOUCMJO4ZWESJE3X3KBVQ) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/be36ebdbcd5bac7316db9425fc2a0546948cc45c8d28fdb3f9853c45169857e3) |
| [GDJT7S…S5K4](https://stellar.expert/explorer/testnet/account/GDJT7S6JTUQYT64YO573XGFCQFHM3LH744ULEF3MZWXPSMNQOESES5K4) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/487fb988309bf6beb8f679a81f5e9caee660b0b1868a560ebd5f1f5066cb7162) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GACSZ3…KBVQ](https://stellar.expert/explorer/testnet/account/GACSZ3F5BMWCG2DAFDY3CVQBKWHQCCFEULHHOUCMJO4ZWESJE3X3KBVQ) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/cb0862cdc9da88622b0c8a7a861c72029c1f029dc75366ae2f8510943fe59ecd) |
| good seller | [GDJT7S…S5K4](https://stellar.expert/explorer/testnet/account/GDJT7S6JTUQYT64YO573XGFCQFHM3LH744ULEF3MZWXPSMNQOESES5K4) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/0b83ce9409a089e8cce3344ed9c022b57ef71efa82117e0a8e7fa460968737e3) |
| bad seller | [GACSZ3…KBVQ](https://stellar.expert/explorer/testnet/account/GACSZ3F5BMWCG2DAFDY3CVQBKWHQCCFEULHHOUCMJO4ZWESJE3X3KBVQ) | 23 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/f53a265c83acc27bdda5410fbaeacf0f81ea3e9592da5819cf5def54dd7e9616) |
| bad seller | [GDJT7S…S5K4](https://stellar.expert/explorer/testnet/account/GDJT7S6JTUQYT64YO573XGFCQFHM3LH744ULEF3MZWXPSMNQOESES5K4) | 23 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/5fe0ed421aa78d63eedfccda5a96ba6dabd916a0bc9e3fa55679d10baf41e5b3) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/685f492d2940570d46e005f636ee06b520e52b611ce9437c98eef3f2f4449699) [2](https://stellar.expert/explorer/testnet/tx/d17939539d9949e3e3da161edf3e062766270e39e60284d14e770f0cd0da0e40) [3](https://stellar.expert/explorer/testnet/tx/a3ab35d93689671f4f134e19073a959dc47fdefa6fcb254cbe91e739e02442e4) [4](https://stellar.expert/explorer/testnet/tx/a36ff21658ce748a4d6702f38dd9a083b43f070f470b0be4149a119802d11322) [5](https://stellar.expert/explorer/testnet/tx/a5d0f8dd0d79d7252a3df0059f464c48c292c5f110293515bdb43da31483e003) | [tx](https://stellar.expert/explorer/testnet/tx/234dc27d5c86f692e26620b35e8e59fc5cbaec73dd87a63fffadc479975738c7) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/9c47a856e61aa3142b5a84a5113a0316ed6bb32a27b02fecc52c1abde4a3a029) [2](https://stellar.expert/explorer/testnet/tx/8dad5aa2b1edff2644204243d2f8564295d8395c3abd93c58b23a84f0848bbc2) [3](https://stellar.expert/explorer/testnet/tx/479eb6133c06bbdc3506416ac9ddd5ff64fcc88c00ba228d7bad0ed71b1d79f1) [4](https://stellar.expert/explorer/testnet/tx/7ceac9770f9be69829bf408d09244b1c7e311eea52be5c72ea04a83253965c78) [5](https://stellar.expert/explorer/testnet/tx/d4badb057c4000f529546a81ecb8cc02ab7bf45bea749acd3f28bdaff39cbafd) | [tx](https://stellar.expert/explorer/testnet/tx/14e42ea8dc9042b1c29432add6a808ff76b882111e6e283328a8339ca0d2a67b) |
| `/wrong-type` | bad seller | 35 | 5 | 0 | 0 | [1](https://stellar.expert/explorer/testnet/tx/07b53a43433b0f977f1cbbe29e65da3745db08cd8b278483cf397a77e621e6b6) [2](https://stellar.expert/explorer/testnet/tx/ce8348306a53499d6e144d367ae88c441186591ec2a9e7e456ac73c2241c2c32) [3](https://stellar.expert/explorer/testnet/tx/227993979dd3df1ce1532151e351ccd6e7374161fd677b672f9e49e72f5079d7) [4](https://stellar.expert/explorer/testnet/tx/732c3f73c2f7d725870bc22be948e5f4a9bd59f6fbd29a6e83e54d81d941a34b) [5](https://stellar.expert/explorer/testnet/tx/986e3770479aac4e6db93faa921e74120cb3e8f01ec1b0b0c4a26938f73656c4) | [tx](https://stellar.expert/explorer/testnet/tx/1439d9c0f16a6ca4af794c7c7f94969a331cc71c6d55c9fa5455d2ecb76b1170) |
| `/broken` | bad seller | 10 | 5 | 0 | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/12aa4dd7e6b409437fdc9102870fc1c450e89962dce2b8d34dab858cede332b9) |

Score parts (delivery 50, signed receipts 15, price 15, latency 10, declaration 10):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":10} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":10} — errors seen: no PAYMENT-RESPONSE header

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `f64a7e6ee91ab2b5…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/69e2c74c157407bf8922a4ae34cad745da4ab940b94dc74a47176392806e0fa3) |
| `/broken` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |
| `/wrong-type` | **refused by the wallet policy** | `__check_auth` failed: the trust policy found no 2-of-2 quorum at score 80 for this seller (`Error(Auth, InvalidAction)`) |

The refusal happens inside the wallet's own `__check_auth`: the trust policy runs on the signed `transfer` authorization, so the payment cannot be made, whatever the agent's code does.

## check_before_pay (onchain quorum)

| Endpoint | Verdict | Score | Trusted by quorum |
| --- | --- | --- | --- |
| `/good` | trusted | 98 | true |
| `/slow` | trusted | 98 | true |
| `/wrong-type` | avoid | 23 | false |
| `/broken` | avoid | 23 | false |

Off-chain trust guard for classic accounts: `/good` paid, `/broken` refused.

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Issues |
| --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none |
