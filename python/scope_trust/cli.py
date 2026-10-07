"""scope-trust-py: verify a receipt, or ask the registry or the observatory."""
from __future__ import annotations

import argparse
import json
import sys

from . import Registry, decision, decode_receipt, verify_receipt


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="scope-trust-py", description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("verify-receipt", help="check an X-402-Receipt header against what you sent and received")
    r.add_argument("--receipt", required=True, help="the X-402-Receipt header value")
    r.add_argument("--payment", required=True, help="the PAYMENT-SIGNATURE header you sent")
    r.add_argument("--body", required=True, help="file with the response body you received")
    r.add_argument("--pay-to", help="the payTo address you paid")
    r.add_argument("--declaration", help="the X-402-Declaration header, if the response had one")
    t = sub.add_parser("trusted-by", help="ask the registry whether a quorum of attesters trusts a seller")
    t.add_argument("--contract", required=True)
    t.add_argument("--seller", required=True)
    t.add_argument("--attesters", required=True, help="comma-separated G... addresses")
    t.add_argument("--min-score", type=int, default=80)
    t.add_argument("--quorum", type=int, default=1)
    t.add_argument("--rpc", default="https://soroban-testnet.stellar.org")
    t.add_argument("--passphrase", default="Test SDF Network ; September 2015")
    d = sub.add_parser("decision", help="the observatory's sell / sell_and_warn / hold for an endpoint")
    d.add_argument("endpoint")
    a = p.parse_args(argv)
    if a.cmd == "verify-receipt":
        with open(a.body, "rb") as f:
            body = f.read()
        res = verify_receipt(decode_receipt(a.receipt), a.payment, body, a.pay_to, a.declaration)
        print(res)
        return 0 if res == "valid" else 1
    if a.cmd == "trusted-by":
        ok = Registry(a.contract, a.rpc, a.passphrase).trusted_by(a.seller, a.attesters.split(","), a.min_score, a.quorum)
        print(json.dumps({"trusted": ok}))
        return 0 if ok else 1
    print(json.dumps(decision(a.endpoint), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
