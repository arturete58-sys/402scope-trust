"""Run by the testnet demo workflow after each run: the Python package reads the
contract it just deployed and must agree with what the TypeScript side wrote.
Usage: python tests/onchain_check.py demo-result.json"""
import json
import sys

from scope_trust import Registry

r = json.load(open(sys.argv[1]))
reg = Registry(r["contracts"]["registry"])
attesters = [a["address"] for a in r["attesters"]]
good, bad = r["accounts"]["sellerGood"], r["accounts"]["sellerBad"]
checks = {
    "good seller trusted by 2 of 2": reg.trusted_by(good, attesters, 80, 2),
    "bad seller not trusted": not reg.trusted_by(bad, attesters, 80, 1),
    "attester 1 score for the good seller": (reg.get_seller(attesters[0], good) or {}).get("score"),
}
print(json.dumps(checks))
ok = checks["good seller trusted by 2 of 2"] and checks["bad seller not trusted"] and isinstance(checks["attester 1 score for the good seller"], int)
print(f"::{'notice' if ok else 'error'} title=python verifier::{json.dumps(checks)}")
sys.exit(0 if ok else 1)
