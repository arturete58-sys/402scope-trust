# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T07:42:53.931Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured four x402 endpoints from two sellers with real paid calls.
2. They wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
3. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 2 were refused by the wallet itself.**

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CA2FU3…CGOP](https://stellar.expert/explorer/testnet/contract/CA2FU3TYC6PYKFGLO2V6GYU77NFLXHFD6SIKTRHP23HWVPSG2LP3CGOP) |
| Trust policy (OpenZeppelin `Policy`) | [CCCXVB…FBOM](https://stellar.expert/explorer/testnet/contract/CCCXVBOF4EI2KDCPZALYCDATRBSGQYVQ2B6J3MKXFWDXRVOVRA6NFBOM) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CCJKJI…63GP](https://stellar.expert/explorer/testnet/contract/CCJKJIA7JXAYL46XAYYPF5OYKURWTSPAQKUPSJ4V5K3CGC55TUH563GP) |
| ed25519 verifier | [CDOSLL…RSNA](https://stellar.expert/explorer/testnet/contract/CDOSLLKR6XWA4LCFMEZ3SVM6HMOCN4G235HVKO6GISO3YCU5GWG4RSNA) |
| Test token SCOPE (SEP-41) | [CAT55D…5HVB](https://stellar.expert/explorer/testnet/contract/CAT55DI5JGLXTHLQHMAB6CCECAN6HPBLSXEVGQOLLPS5BZTYNVJF5HVB) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GCPK2V…YEDT](https://stellar.expert/explorer/testnet/account/GCPK2VIFPKRDYRCQDIUR5UN7QPRQKOEGVQGINH4GIKER4CAG33OPYEDT) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/15a8666e4bae0440405511da1ae3544af5ae8debaf2702bf6d9a4c9202aeade6) |
| [GCYBPR…XR6X](https://stellar.expert/explorer/testnet/account/GCYBPR2NEOLOQB2FGMRUCSZ3NFXNP2OOCNUGNW2QIYHZMZMX3R55XR6X) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/7b73876fecb464947a9de735b9df28af02538a0043d5d06a666303d108338728) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GCPK2V…YEDT](https://stellar.expert/explorer/testnet/account/GCPK2VIFPKRDYRCQDIUR5UN7QPRQKOEGVQGINH4GIKER4CAG33OPYEDT) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/be5b9675fb3709071a892a03c4de6b3d371b5ba3cee92e32a6149a261ff476fb) |
| good seller | [GCYBPR…XR6X](https://stellar.expert/explorer/testnet/account/GCYBPR2NEOLOQB2FGMRUCSZ3NFXNP2OOCNUGNW2QIYHZMZMX3R55XR6X) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/c5619d9696159edada9411dfd1518e7662b4514405820acd90cbc4f4cb513e09) |
| bad seller | [GCPK2V…YEDT](https://stellar.expert/explorer/testnet/account/GCPK2VIFPKRDYRCQDIUR5UN7QPRQKOEGVQGINH4GIKER4CAG33OPYEDT) | 23 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/734b6c49811affc0bc9e5d33a4762b4b94aba7462b28c0b676864afe3ef49d1a) |
| bad seller | [GCYBPR…XR6X](https://stellar.expert/explorer/testnet/account/GCYBPR2NEOLOQB2FGMRUCSZ3NFXNP2OOCNUGNW2QIYHZMZMX3R55XR6X) | 23 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/2658a3f342f5daf8d0036ffd2bb94a1d0791ea5776e4552885fea39121e94ef7) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/61abac3c526a9d25e6a7b2e409d594256a3f2dc68245c11c0f66419650ddda47) [2](https://stellar.expert/explorer/testnet/tx/af38c26c9476c09a0fc96942850515f2e3dd56a2b8a065768eb289ba0dece0a1) [3](https://stellar.expert/explorer/testnet/tx/8f9cc403c2635a4d48a0b62d00a33ed601658a052ace8812ce29bf160c2d1aa4) [4](https://stellar.expert/explorer/testnet/tx/c8c6a4c0c8895e3274e8f0a8fdb14c460050a4928594d6c0b0090c6d559d9086) [5](https://stellar.expert/explorer/testnet/tx/5ab702ac7c353a87abe9b0304eaa03f2515d68bfbe67cb53fc863c5bbf199ae0) | [tx](https://stellar.expert/explorer/testnet/tx/9172a59341215126a9a699a53948a21c9bbaaace63741ebc6770efe7eaeebe4f) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/d082c223a4c10a54d5b822f795c35dc49497881627ee147deddcfd3ed36f6d85) [2](https://stellar.expert/explorer/testnet/tx/22fbdc4bbb416c890de6b22bfe8a0cb47a24161b8b50791336c8f8bbf3869468) [3](https://stellar.expert/explorer/testnet/tx/af04c92797b91708907ebd8c9c98823ba4d28360d472e7d084d6db1b68ef9903) [4](https://stellar.expert/explorer/testnet/tx/596726e42c755f4131d579473b67c91bc17e972763af6c8784b5224a55397b5b) [5](https://stellar.expert/explorer/testnet/tx/a4162b62cea519dd3ab82053e51085a958ed2c86077d941ca1d12461abcb9de9) | [tx](https://stellar.expert/explorer/testnet/tx/c3fefed10378d454c39b31db02e201ad0b21a2450a0e638d2522fcde632eb8ee) |
| `/wrong-type` | bad seller | 35 | 5 | 0 | 0 | [1](https://stellar.expert/explorer/testnet/tx/b19da7194986134f8e33ccc74f433b55ad466317ff0cea3768319926a106fdf2) [2](https://stellar.expert/explorer/testnet/tx/921ef8485e79d439078d7eacf3623b7cee8f889c6844b3872ba36373107e85e2) [3](https://stellar.expert/explorer/testnet/tx/5024567f0b88bd68dbd6629c6f3fe890f205a6db3ebd48e79952862e68b426b4) [4](https://stellar.expert/explorer/testnet/tx/10aecfc1fb260438430be289e2e8ad073f07977c7ff790912f0c2f7e951d2ffa) [5](https://stellar.expert/explorer/testnet/tx/3f5d18630f28f6b1d4d5f6e106e0b3d276c62b2149466e146d0b0d8b06ce7955) | [tx](https://stellar.expert/explorer/testnet/tx/5b48d94bd5cec11d95cdecfa3317d688c8ae6f5725b40f7fac900e8e0710e274) |
| `/broken` | bad seller | 10 | 5 | 0 | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/c59bef6289c8d33e73bce264f7f6fe33690a8d8eea02c9063a2ae15d2b634506) |

Score parts (delivery 50, signed receipts 15, price 15, latency 10, declaration 10):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":10} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":10} — errors seen: no PAYMENT-RESPONSE header

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `9b783423ea482d9f…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/35f2f01755a5c14f6e556fbf03126ab85a87bf5f9dcc3959a6bc61f29de4d187) |
| `/broken` | **refused by the wallet policy** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction)

Event log (newest first):
   0: [Diagnostic Event] contract |
| `/wrong-type` | **refused by the wallet policy** | Failed to create payment payload: wallet refused the payment: HostError: Error(Auth, InvalidAction)

Event log (newest first):
   0: [Diagnostic Event] contract |

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
