# 402Scope Trust on Stellar testnet

Run finished 2026-10-06T15:59:07.823Z. Everything below is a real testnet transaction you can open on Stellar Expert.

- Attestation contract: [CC7CQCVV6DZBX3DZM3YNYQTKP4JXIHVGAYF6SZ3HXGD2AFYP3LJKOR7U](https://stellar.expert/explorer/testnet/contract/CC7CQCVV6DZBX3DZM3YNYQTKP4JXIHVGAYF6SZ3HXGD2AFYP3LJKOR7U)
- Test token (SEP-41, SCOPE): [CAUQCJGNJMDWZTJZCS6ZIZMEMTGF3USOKWZPKHFHC65GS63J7YXRP6DO](https://stellar.expert/explorer/testnet/contract/CAUQCJGNJMDWZTJZCS6ZIZMEMTGF3USOKWZPKHFHC65GS63J7YXRP6DO)
- Seller: [GDK2FS…XL2M](https://stellar.expert/explorer/testnet/account/GDK2FSR3RVU77DJCWM64D67WOWXX2VE3GFVD3YOPGMBB6B6SLAAXXL2M) · Measurer: [GAQOOL…HQ5C](https://stellar.expert/explorer/testnet/account/GAQOOLORDUBLVOA73FYMB5OM7DR4W6XA7NTKLQ2IWRC3YAXQ4RIMHQ5C) · Facilitator: [GDRCYG…MXIA](https://stellar.expert/explorer/testnet/account/GDRCYGCHFJH2BSQYBLDBYKDPJLIQT653KFEVH5JHWW2ZKLRE7FGXMXIA) · Signer: [GDGQEN…JD6Z](https://stellar.expert/explorer/testnet/account/GDGQEN7YABDDOUT6SQDTYGLHCAGZRVIJUOXY6GKP2XXO4GICNLBWJD6Z)

## Measured endpoints

| Endpoint | What it does | Score | Verdict | Paid calls | Delivered | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | Fast JSON, as declared | 100 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/47712ba238a0930e08f741d08ec5d65da152b02c0e82306444ec7a9b49c1b8fe) [2](https://stellar.expert/explorer/testnet/tx/b9917e6f4f4386f101ba7d1b7142c313fcb86fe5df45402871d998e72177f370) [3](https://stellar.expert/explorer/testnet/tx/ab45268ad5ae3bf4bc0d13d21277c8c828f53c8ca04544a5d8a6c3e6b24a2feb) [4](https://stellar.expert/explorer/testnet/tx/1f4188f199987a6727871388890fe0f5916a86387cd5f1dcd07abff8338fe882) [5](https://stellar.expert/explorer/testnet/tx/995937ca91e0cf6d90e68599827f2a93db6d0328cb3b622f79e9c4d22628234a) | [tx](https://stellar.expert/explorer/testnet/tx/fe2741752c495f045ba3422f058e06df37d22810993a1236f454a1e3bf6c72e5) |
| `/slow` | Correct JSON after 3.5 s | 95 | **trusted** | 5 | 5 | [1](https://stellar.expert/explorer/testnet/tx/756160ce9053fb0f6da8631646b03361725e9748f4da658d8812b14a3a82405b) [2](https://stellar.expert/explorer/testnet/tx/f028b62c34602fbb5fbddca6f57a25370fc315e1b43b09cbac5d6d2e38e7a57d) [3](https://stellar.expert/explorer/testnet/tx/8fec6f747cf653e3a6a5170ad7c74c2bbbf5f2e9232e3ca44576336d410fb54f) [4](https://stellar.expert/explorer/testnet/tx/3355f2cf6481d3b04dfbe131977cedc9b23468505de351bcb16c9aaa47df9d10) [5](https://stellar.expert/explorer/testnet/tx/cd62ede215162455e0cf05d1aa022a6e9fb409a6be0a98bf83be733d16537378) | [tx](https://stellar.expert/explorer/testnet/tx/1a002383bd691cc3a89fbe66db29ccefb81d80fb0460a1f04bb9ffcb86b81f07) |
| `/wrong-type` | Declares JSON, returns HTML | 40 | **caution** | 5 | 0 | [1](https://stellar.expert/explorer/testnet/tx/9cbc2bc3ea4ea44a80bf10f00ef8712283715dca59aa4dac67d89964ff6abdb0) [2](https://stellar.expert/explorer/testnet/tx/99cee299a0950146cb69302c9c548cd35f473ae49b4f40a917b5c3b0b243af1e) [3](https://stellar.expert/explorer/testnet/tx/c735a0eb19fabcea2bff988fc9caddf1ca39570b6eb5c26df057adf02a1de764) [4](https://stellar.expert/explorer/testnet/tx/a67cb13b1bd49d0af2101e014c9dd808d735160a7747c448a854e09fdae4fd96) [5](https://stellar.expert/explorer/testnet/tx/ca09557934ddebf79e2cd170d39cf743f8c747a01ae9d57ad54ce60bb236b46a) | [tx](https://stellar.expert/explorer/testnet/tx/241590dc160cdcbeadcca6301962ad6ee9d551d32e9f043ce7e1203e8c6e4774) |
| `/broken` | Returns HTTP 500 | 10 | **avoid** | 5 | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/8f8946de958fede85daafa12facd1a0a8e05591865e4d739813180b66ff24965) |

Score parts (delivery 60, price 20, latency 10, declaration 10):

- `/good`: {"delivery":60,"price":20,"latency":10,"declaration":10}
- `/slow`: {"delivery":60,"price":20,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"price":20,"latency":10,"declaration":10} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"price":0,"latency":0,"declaration":10} — errors seen: no PAYMENT-RESPONSE header

## Agent with the trust guard

- `/good`: paid
- `/broken`: refused — verdict avoid: onchain attestation: score 10, 0 of 5 paid calls delivered (contract CC7CQCVV6DZBX3DZM3YNYQTKP4JXIHVGAYF6SZ3HXGD2AFYP3LJKOR7U)
