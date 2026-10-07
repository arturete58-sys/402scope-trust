"""The observatory's decision for an endpoint (GET /v1/decision)."""
from __future__ import annotations

import json
import urllib.parse
import urllib.request

OBSERVATORY = "https://402scope.org"


def decision(endpoint: str, warn_max: float = 0.15, hold_max: float = 0.30, base: str = OBSERVATORY, timeout: float = 15) -> dict:
    """sell | sell_and_warn | hold | unknown, with the fault rate upper bound and sample behind it."""
    q = urllib.parse.urlencode({"endpoint": endpoint, "warnMax": warn_max, "holdMax": hold_max})
    with urllib.request.urlopen(f"{base}/v1/decision?{q}", timeout=timeout) as r:
        return json.loads(r.read())
