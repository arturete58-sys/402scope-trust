# 402Scope Trust on Stellar testnet

Run finished 2026-10-07T08:37:53.839Z. Every link below is a real testnet transaction or contract on Stellar Expert.

## What happened

1. Two independent attesters locked a bond and measured 5 x402 endpoints from 3 sellers with real paid calls.
2. Sellers published delivery terms in their 402 challenge (`extensions.declarations`) and declared each response (`X-402-Declaration`), signed with the delivery receipt. The stale seller promised data under 60 s old and served 20-minute-old data, under its own signature.
3. The attesters wrote signed scores onchain, per endpoint and per seller, each with the Merkle root of its evidence.
4. An agent wallet (OpenZeppelin smart account) with the 402Scope Trust policy installed paid over x402: **1 payment(s) went through, 3 were refused by the wallet itself.**
5. A standard x402 facilitator with 402Scope trust hooks refused to settle a plain payment to the stale seller.

## Contracts

| Contract | Address |
| --- | --- |
| Attestation registry (bonds, scores, evidence) | [CCGWOV…6PDJ](https://stellar.expert/explorer/testnet/contract/CCGWOVPYUY73BIUWSDDEECRAPLAHTTW7TZUCNHIRRS6ZC7J5OZDZ6PDJ) |
| Trust policy (OpenZeppelin `Policy`) | [CBIZJ4…XRRQ](https://stellar.expert/explorer/testnet/contract/CBIZJ4YEPLFUJHBFGMNRDKHMWGRHTF2EKKEP4QPWDGJ7A4Q3H6KTXRRQ) |
| Agent wallet (OpenZeppelin smart account, policy: 2 of 2 attesters, score ≥ 80) | [CBCQCS…4ESB](https://stellar.expert/explorer/testnet/contract/CBCQCSWCIR5G3LAKOMI7B3FW6MX73H5DJ52DEQCSWUF7BAAKZKHK4ESB) |
| ed25519 verifier | [CCXCEY…VEBX](https://stellar.expert/explorer/testnet/contract/CCXCEYHAWHQV3R7XUJRA2AAIDKUJXX6XEQMJT6WMO2Z2HFOOJFRGVEBX) |
| Test token SCOPE (SEP-41) | [CBSLDF…KHUG](https://stellar.expert/explorer/testnet/contract/CBSLDF7XPU6H2DUKMLOOMCXDRASNAMCFF2OQBRK726DRPNOVNA5WKHUG) |

## Attesters

| Attester | Bond | Registration |
| --- | --- | --- |
| [GB5SWO…U6FH](https://stellar.expert/explorer/testnet/account/GB5SWOYDB4NFK77HCNMYIEQVCFZHOBK3OFNXDREXTWUU4OXCROHIU6FH) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/bae6dcc9ba03ca87c809453e8e0b97db5637af65fec19e1eb8eb47087abaa54b) |
| [GAXG5R…XJHF](https://stellar.expert/explorer/testnet/account/GAXG5RMBCQ4HLFOMZG47TIOUEUVMBEXV5SUBVMWNR7BAJBU5ZAFIXJHF) | 500 SCOPE | [tx](https://stellar.expert/explorer/testnet/tx/fa61219317546cdf169b831dcbf6859846f2cfa8492ba20fb7e7862a9abe617f) |

## Seller scores (onchain)

| Seller | Attester | Score | Paid calls | Delivered | Signed receipts | Attestation |
| --- | --- | --- | --- | --- | --- | --- |
| good seller | [GB5SWO…U6FH](https://stellar.expert/explorer/testnet/account/GB5SWOYDB4NFK77HCNMYIEQVCFZHOBK3OFNXDREXTWUU4OXCROHIU6FH) | 98 | 10 | 10 | 10 | [tx](https://stellar.expert/explorer/testnet/tx/6977324671dea3cc7ee4eae6e01905be7572762bf77d3dd6144ac46ef0695864) |
| good seller | [GAXG5R…XJHF](https://stellar.expert/explorer/testnet/account/GAXG5RMBCQ4HLFOMZG47TIOUEUVMBEXV5SUBVMWNR7BAJBU5ZAFIXJHF) | 98 | 6 | 6 | 6 | [tx](https://stellar.expert/explorer/testnet/tx/5587f8b803fb8326e6be269963c97cda5a4e7230d82058c1f8ad5de67dbdd076) |
| bad seller | [GB5SWO…U6FH](https://stellar.expert/explorer/testnet/account/GB5SWOYDB4NFK77HCNMYIEQVCFZHOBK3OFNXDREXTWUU4OXCROHIU6FH) | 18 | 10 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/b66b14a6d3e335c9bcd74cc2260837d8a2b91a9b4b17908276d594377f6a7347) |
| bad seller | [GAXG5R…XJHF](https://stellar.expert/explorer/testnet/account/GAXG5RMBCQ4HLFOMZG47TIOUEUVMBEXV5SUBVMWNR7BAJBU5ZAFIXJHF) | 18 | 6 | 0 | 0 | [tx](https://stellar.expert/explorer/testnet/tx/13e7713bee4d9439d75224dbd21adc0aaa387b446237370083833462118a075f) |
| stale seller | [GB5SWO…U6FH](https://stellar.expert/explorer/testnet/account/GB5SWOYDB4NFK77HCNMYIEQVCFZHOBK3OFNXDREXTWUU4OXCROHIU6FH) | 50 | 5 | 0 | 5 | [tx](https://stellar.expert/explorer/testnet/tx/44878d468f8343b61105a02522dd4599b09a2d4fb493674713577ec2b8771782) |
| stale seller | [GAXG5R…XJHF](https://stellar.expert/explorer/testnet/account/GAXG5RMBCQ4HLFOMZG47TIOUEUVMBEXV5SUBVMWNR7BAJBU5ZAFIXJHF) | 50 | 3 | 0 | 3 | [tx](https://stellar.expert/explorer/testnet/tx/6864d44c6e05bb05662256d9e68f7d8be6f8667809a09fff9f8827000e1f36e4) |

Trusted by 2 of 2 attesters at score 80 (contract `trusted_by`): good seller **yes**, bad seller **no**, stale seller **no**.

## Endpoints (attester 1)

| Endpoint | Seller | Score | Paid calls | Delivered | Valid receipts | Terms | Broke own declaration | Settlements | Attestation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/good` | good seller | 100 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/f8025839e39f990c216f411a4cc5b39b788574644f8023b968df52a7e31f2f8f) [2](https://stellar.expert/explorer/testnet/tx/33ae93a5bfd3e0118cc028c8d5030bf54c19ded977ec592d6227ef01012b9fa5) [3](https://stellar.expert/explorer/testnet/tx/6226a455ff2b5f3bad0c3414923a432acc6f584cc3cbf8b2c53ff3e1b485ebb9) … | [tx](https://stellar.expert/explorer/testnet/tx/704124e166cf78566d61a31d4d74bc7d2e9009efafea19b208c45c812a48de5b) |
| `/slow` | good seller | 95 | 5 | 5 | 5 | yes | 0 | [1](https://stellar.expert/explorer/testnet/tx/681cfded907a0368f697e10634a3f069ee22e75df17a7b8b2f2a0e45cb604587) [2](https://stellar.expert/explorer/testnet/tx/7de1d2d85fd02bacad2c9c979112b104e09c1c6a4d42e1ba0840d2b3c7e1455f) [3](https://stellar.expert/explorer/testnet/tx/fbceb2fda62fcf31a353799a5b0782169247377ee89168fc71b2dccdbdbe5772) … | [tx](https://stellar.expert/explorer/testnet/tx/a4bc8e9e48cb427805c89fe44d5db9ee5cae4e34b07fbca1730ebb78a796242b) |
| `/wrong-type` | bad seller | 30 | 5 | 0 | 0 | no | 0 | [1](https://stellar.expert/explorer/testnet/tx/87c85b844b63c74e4ddbefcfab1bd2e46be217ba3632bb894cb382a6a1720179) [2](https://stellar.expert/explorer/testnet/tx/838a68f6608159aaf4be5fe3b30c2582e29eca028eb970964fc3ac9a81e4a353) [3](https://stellar.expert/explorer/testnet/tx/8adf8faac44259beaf6ef9c2061b6ffed0971900f11c37defa3d9775a86e97d6) … | [tx](https://stellar.expert/explorer/testnet/tx/6da5bd28affc5cf3dc66dd46020694ed30b96382606c9fc4bea3fb8f6306362d) |
| `/broken` | bad seller | 5 | 5 | 0 | 0 | no | 0 | none | [tx](https://stellar.expert/explorer/testnet/tx/c89ff1ae968b22c6956eb6c1f8ebef03fa4765d08343d73e17d8d33d651c390e) |
| `/stale` | stale seller | 50 | 5 | 0 | 5 | yes | 5 of 5 (EXCEEDS_DECLARED_MAX) | [1](https://stellar.expert/explorer/testnet/tx/ba61f35a8408cdcb2e058775b238b84afb2857db2abc3dc815e43e893d1fb328) [2](https://stellar.expert/explorer/testnet/tx/d2c56a2559ad6c381e30134a2733f1c6291131f31300c799cc78c0ac408d329d) [3](https://stellar.expert/explorer/testnet/tx/036e39564a251f4a902c0eadebfa8953add2dd580a255b484c7ba80ed1168620) … | [tx](https://stellar.expert/explorer/testnet/tx/632be79543c6f1be71faabc25f3fbca159b85fdc0eb708a80b69b07877aaa157) |

Score parts, method v3 (delivery 50, signed receipts 15, price 15, latency 10, declaration 10: 5 for publishing delivery terms, 5 for a conformant challenge):

- `/good`: {"delivery":50,"receipts":15,"price":15,"latency":10,"declaration":10}
- `/slow`: {"delivery":50,"receipts":15,"price":15,"latency":5,"declaration":10}
- `/wrong-type`: {"delivery":0,"receipts":0,"price":15,"latency":10,"declaration":5} — errors seen: declared application/json, got text/html; charset=utf-8
- `/broken`: {"delivery":0,"receipts":0,"price":0,"latency":0,"declaration":5} — errors seen: no PAYMENT-RESPONSE header
- `/stale`: {"delivery":0,"receipts":15,"price":15,"latency":10,"declaration":10} — errors seen: broke its own declaration: EXCEEDS_DECLARED_MAX

## Evidence checked onchain

The good seller's attestation from attester 1 commits to 10 pieces of evidence (Merkle root `3d9e5a02738af761…`).

- A real piece of evidence, verified by the contract (`verify_seller_evidence`): **true**
- The same evidence with the delivery result flipped: **false**

## The agent wallet pays over x402

| Endpoint | Outcome | Detail |
| --- | --- | --- |
| `/good` | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3eddb7cc0750b5be701d252132453f81aa64cb51720e405170abfe598819bbc1) |
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

The same seller code, pointed at https://channels.openzeppelin.com/x402/testnet instead of a local facilitator. Supported: exact stellar:testnet. Testnet USDC: bought on the testnet DEX.

| Asset | Payer | Outcome | Detail |
| --- | --- | --- | --- |
| SCOPE | classic account | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| SCOPE | agent wallet | **HTTP 402** | unsupported_asset · verify: unsupported_asset  |
| USDC | classic account | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/4f5cdfa228cfddff5867ecaaf80648a4acb21ad4d4e5e3871ef42f3e4baf908b) |
| USDC | agent wallet | **paid** | [settlement](https://stellar.expert/explorer/testnet/tx/3f011534e53c2d35b3464d4c878a6d4d2b0264b9c9d55582b974d0ef1373c438) |

## Stellar's official x402 demo (unpaid conformance check)

Discovered through [its manifest](https://stellar.org/x402-demo/api/.well-known/x402).

| Resource | HTTP | Stellar networks | Conformance issues | Delivery terms |
| --- | --- | --- | --- | --- |
| https://stellar.org/x402-demo/api/weather/testnet?city=Valencia | 402 | stellar:testnet | none | not published |
| https://stellar.org/x402-demo/api/weather/mainnet?city=Valencia | 402 | stellar:pubnet | none | not published |
