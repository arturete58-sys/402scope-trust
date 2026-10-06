# 402Scope Trust on Stellar testnet

Run finished 2026-10-06T15:53:42.530Z. Everything below is a real testnet transaction you can open on Stellar Expert.

- Attestation contract: [CAX3I25VUGV2M324AWZ3BAD7L7XIC7EW2U3LXVUGPRJ3KBDNB3G52EAQ](https://stellar.expert/explorer/testnet/contract/CAX3I25VUGV2M324AWZ3BAD7L7XIC7EW2U3LXVUGPRJ3KBDNB3G52EAQ)
- Test token (SEP-41, SCOPE): [CDY4VDMKC2QPKOCYBS5TQCAL6MNQ7KQO3KV32H7POMBQJN7TAOYRLZOJ](https://stellar.expert/explorer/testnet/contract/CDY4VDMKC2QPKOCYBS5TQCAL6MNQ7KQO3KV32H7POMBQJN7TAOYRLZOJ)
- Seller: [GDZX6T…WPLY](https://stellar.expert/explorer/testnet/account/GDZX6THTOFTG2CLKAP54EWQQKMVWAEQUT5RL277BSIGXE7LIUHSPWPLY) · Measurer: [GCNU72…5KG7](https://stellar.expert/explorer/testnet/account/GCNU72DMJOD7YO4DFKJRVQ6P5YUQLRM7M4W64UWYXSVOGKCPFMBG5KG7) · Facilitator: [GCQHMV…IDSV](https://stellar.expert/explorer/testnet/account/GCQHMVY2SCFAUVFZUSTPZYWT5XL6U4QRRL2Z2QJMJECCS2KKXDOEIDSV) · Signer: [GADE6M…QO33](https://stellar.expert/explorer/testnet/account/GADE6MQT6F5Q5DXBASISVM7G7SMTTTXRYTSRUE6D7OEHHRQRCHTTQO33)

## Measured endpoints

| Endpoint | What it does | Score | Verdict | Paid calls | Delivered | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | Fast JSON, as declared | 90 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/f13dab2d4e5b02205962dcd51c8183988c40303978f15a06658fb6674fb14b9f) [2](https://stellar.expert/explorer/testnet/tx/f25125c8f767ed8f405c3ab73fcf6d274d00810075d8f00b4949b9550c57f912) [3](https://stellar.expert/explorer/testnet/tx/67a637450ed9eb2465a463cc7fab4a4baba88cb2380808e7b42d24e91218ad0a) [4](https://stellar.expert/explorer/testnet/tx/0fe8ebcddcbd513076051dc910ad7484219f30da225c6456aa70e6eae6abfacd) [5](https://stellar.expert/explorer/testnet/tx/a4b1f715888a4c4f85007511adbe1fd657f7aebd82a15f5dfabbf9558eb3378a) | [tx](https://stellar.expert/explorer/testnet/tx/98cbf7554e61fde324d2d73d151c279629285b69df30d8c0243e3e196fbefef9) |
| `/slow` | Correct JSON after 3.5 s | 90 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/b1c8c6ef233aed6ca489e8d76c56ab37de87e77874370c7cdbb428df6d486278) [2](https://stellar.expert/explorer/testnet/tx/1bbd8f39af065df6ba2e5dbb93a6f7d1f68e863e49e1b40b36fcc25490994fdb) [3](https://stellar.expert/explorer/testnet/tx/7b06c3b6c78768be05fc4eabbf72696bf7a92a05ed880dd1826d5fe1ad565466) [4](https://stellar.expert/explorer/testnet/tx/a0dae2863ce2ba53fd6981c7b4f1b1534d472c544dc2cfd073920d158bb8cc48) [5](https://stellar.expert/explorer/testnet/tx/677631865ed9433313a9c9cc21b3970d6e0fd13d60427bcaefc56942f1564987) | [tx](https://stellar.expert/explorer/testnet/tx/ea4e6418ebc70c029dec5cdd9b752a4e01c891f9f7f1d15b60ede8a84fac9cbf) |
| `/wrong-type` | Declares JSON, returns HTML | 30 | **avoid** | 5 | 0 | [1](https://stellar.expert/explorer/testnet/tx/6346822174be0c850bfd00040f1113f60742ca39850e9b5874e3c160f605a2ca) [2](https://stellar.expert/explorer/testnet/tx/35ff8a772f48fc7619d6cac20684551bc57a00126ceb20ffcbc2c0723022d2be) [3](https://stellar.expert/explorer/testnet/tx/9e30ab5c14b50bbc1fc22a9693f8e9666df13278519e5fb9d9bac169a440eaf6) [4](https://stellar.expert/explorer/testnet/tx/5c804dc835cada0b06b4b28903191598a9a46136713dd95078241af6c5638349) [5](https://stellar.expert/explorer/testnet/tx/033cee6668abe9bdf85bb591328f7a81cce7d5e61cae5c4e5f339e009ffced73) | [tx](https://stellar.expert/explorer/testnet/tx/00d49cb78d4c70fe41f22eacb1d0cbbf97a46564fd86bb0f7340c1bf1949d965) |
| `/broken` | Returns HTTP 500 | 10 | **avoid** | 5 | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/6b5628c7879952f130d8c6fc66c7ea8fef60595b123d1f075d82e3fed304d0a5) |

Score parts (delivery 60, price 20, latency 10, declaration 10):

- `/good`: {"delivery":60,"price":20,"latency":0,"declaration":10}
- `/slow`: {"delivery":60,"price":20,"latency":0,"declaration":10}
- `/wrong-type`: {"delivery":0,"price":20,"latency":0,"declaration":10} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"price":0,"latency":0,"declaration":10} — errors seen: no PAYMENT-RESPONSE header

## Agent with the trust guard

- `/good`: paid
- `/broken`: refused — verdict avoid: onchain attestation: score 10, 0 of 5 paid calls delivered (contract CAX3I25VUGV2M324AWZ3BAD7L7XIC7EW2U3LXVUGPRJ3KBDNB3G52EAQ)
