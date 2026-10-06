# 402Scope Trust on Stellar testnet

Run finished 2026-10-06T16:20:33.753Z. Everything below is a real testnet transaction you can open on Stellar Expert.

- Attestation contract: [CBIWC2RJLR2SLEL2SUCKLZ5SZVLX7ET2CFPNPI23F6SQ6FFVIUOWSKUO](https://stellar.expert/explorer/testnet/contract/CBIWC2RJLR2SLEL2SUCKLZ5SZVLX7ET2CFPNPI23F6SQ6FFVIUOWSKUO)
- Test token (SEP-41, SCOPE): [CCABNNRIW75K4CHA2TV7FSYCMKXY3ZQVKAYEWVFCQ7WHFCQSS55VO7PG](https://stellar.expert/explorer/testnet/contract/CCABNNRIW75K4CHA2TV7FSYCMKXY3ZQVKAYEWVFCQ7WHFCQSS55VO7PG)
- Seller: [GBYN2O…33ZM](https://stellar.expert/explorer/testnet/account/GBYN2O45KFW7R6JOYCWJTFB2UKBQSLR26IT67JZSMUDKJF7N5CDI33ZM) · Measurer: [GA745D…OCAP](https://stellar.expert/explorer/testnet/account/GA745DCULZX32FXIFVUFVB4P254W2KDRETO65EBYJ2X2MODRT7XQOCAP) · Facilitator: [GDZLDZ…B4HB](https://stellar.expert/explorer/testnet/account/GDZLDZOVZTBPGFMP452AGCDCME7AYNTFSMX7GQY5QSG5XCFKOHKGB4HB) · Signer: [GDDNUO…2WDT](https://stellar.expert/explorer/testnet/account/GDDNUOXPN6MQKNUEK7BYXKKBMDBY7ILOR24HKMBHMR4N4GX3B2XQ2WDT)

## Measured endpoints

| Endpoint | What it does | Score | Verdict | Paid calls | Delivered | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | Fast JSON, as declared | 100 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/d563619199aa06c669aef2206427abcc4dc2b2d9e686a19c9037e52e96f25916) [2](https://stellar.expert/explorer/testnet/tx/69a2e98e2d51143db0c3be01fad8efc3990f39352cf05446593484a080473de4) [3](https://stellar.expert/explorer/testnet/tx/af34c6d75692844256e7de2f86181e1bbd8f51a72047961f9cfedf74e7ce5a74) [4](https://stellar.expert/explorer/testnet/tx/90ef00a36c0e2abc8e73f1fb320a1186aeedb20a45ee3fdce1404492072aafd2) [5](https://stellar.expert/explorer/testnet/tx/bcdfa474c190b58a91929681e1717a83b10bf9a65aca285105b3109262d1de80) | [tx](https://stellar.expert/explorer/testnet/tx/4bf350560af1f474282a93966937dd7c9f934db097ae97d660541f34fcdcdeeb) |
| `/slow` | Correct JSON after 3.5 s | 95 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/39b02e881c69414ee8549c5ab27db74bf5b577d3c85560596750e81bfb28a259) [2](https://stellar.expert/explorer/testnet/tx/15e0413e329dc239e5014a920a96b7479e16b8b69283ed7fa2c8df945079c607) [3](https://stellar.expert/explorer/testnet/tx/ef245a16c6af2d12aca12464e401f7ef860a70d18d9c27edb45fb3836aa060f5) [4](https://stellar.expert/explorer/testnet/tx/c656b1cf43ad4681f1d34f73832ad537a9f1a7195ae5278f9367c4942cde31eb) [5](https://stellar.expert/explorer/testnet/tx/696e1ab14187fb39ac81d7cfbf2fab236810f24b76fc2314698f0bdbeeae52c6) | [tx](https://stellar.expert/explorer/testnet/tx/38160aad3a69b28319b43cd49b91c55ff2b30d3a3e453e6d133a2a1ca7a32b83) |
| `/wrong-type` | Declares JSON, returns HTML | 40 | **caution** | 5 | 0 | [1](https://stellar.expert/explorer/testnet/tx/6b73f146beb856777148db7e5f7e57925ddea18b2719e8d0d207153fcf56bd5b) [2](https://stellar.expert/explorer/testnet/tx/4801d5eaa3d758922abb3cdd30b817675dc176238126075deface82d3464bf60) [3](https://stellar.expert/explorer/testnet/tx/94a55f678350b45b13b86abad2d628d9b6b3df620241cf8f14212b00da416e85) [4](https://stellar.expert/explorer/testnet/tx/16dbcd1cfe57aa3927af6053bbf2032a9373132c4e5e75678fe2ca68123a7a66) [5](https://stellar.expert/explorer/testnet/tx/dfc4a25aa92a314110fc8dd827cc5e137450f1f76845387e86e3c5e29377e2e1) | [tx](https://stellar.expert/explorer/testnet/tx/459f05acdf4d710540171f2ce9081f57b4eafe2b42db88c1380add7a80090785) |
| `/broken` | Returns HTTP 500 | 10 | **avoid** | 5 | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/e554d200fee2f7adf5b9c915eede504eea2ff076e040acefbb9a0c03c798d414) |

Score parts (delivery 60, price 20, latency 10, declaration 10):

- `/good`: {"delivery":60,"price":20,"latency":10,"declaration":10}
- `/slow`: {"delivery":60,"price":20,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"price":20,"latency":10,"declaration":10} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"price":0,"latency":0,"declaration":10} — errors seen: no PAYMENT-RESPONSE header

## Agent with the trust guard

- `/good`: paid
- `/broken`: refused — verdict avoid: onchain attestation: score 10, 0 of 5 paid calls delivered (contract CBIWC2RJLR2SLEL2SUCKLZ5SZVLX7ET2CFPNPI23F6SQ6FFVIUOWSKUO)

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Issues |
| --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none |
