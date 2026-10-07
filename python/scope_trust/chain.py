"""Reads the 402Scope Trust attestation registry on Stellar by simulation (no fees, no funded account)."""
from __future__ import annotations

from typing import List, Optional

from stellar_sdk import Account, Keypair, Network, SorobanServer, TransactionBuilder, scval
from stellar_sdk import xdr as stellar_xdr

TESTNET_RPC = "https://soroban-testnet.stellar.org"
MAINNET_RPC = "https://mainnet.sorobanrpc.com"


def _native(v: stellar_xdr.SCVal):
    """Plain Python value of an SCVal (enough for the registry's return types)."""
    t = v.type
    T = stellar_xdr.SCValType
    if t == T.SCV_BOOL:
        return v.b
    if t == T.SCV_VOID:
        return None
    if t == T.SCV_U32:
        return v.u32.uint32
    if t == T.SCV_I128 or t == T.SCV_U64 or t == T.SCV_I64 or t == T.SCV_U128:
        return scval.to_native(v)
    if t == T.SCV_VEC:
        return [_native(x) for x in (v.vec.sc_vec if v.vec else [])]
    if t == T.SCV_MAP:
        return {scval.from_symbol(e.key) if e.key.type == T.SCV_SYMBOL else _native(e.key): _native(e.val) for e in (v.map.sc_map if v.map else [])}
    return scval.to_native(v)


class Registry:
    """The attestation contract. ``Registry(contract_id)`` reads testnet; pass ``rpc_url`` and ``network_passphrase`` for mainnet."""

    def __init__(self, contract_id: str, rpc_url: str = TESTNET_RPC, network_passphrase: str = Network.TESTNET_NETWORK_PASSPHRASE):
        self.contract_id = contract_id
        self.server = SorobanServer(rpc_url)
        self.passphrase = network_passphrase

    def _call(self, method: str, args: list):
        source = Account(Keypair.random().public_key, 0)
        tx = (
            TransactionBuilder(source, self.passphrase, base_fee=100)
            .append_invoke_contract_function_op(self.contract_id, method, args)
            .set_timeout(30)
            .build()
        )
        sim = self.server.simulate_transaction(tx)
        if sim.error:
            raise RuntimeError(f"{method} failed: {sim.error}")
        return _native(stellar_xdr.SCVal.from_xdr(sim.results[0].xdr))

    def trusted_by(self, seller: str, attesters: List[str], min_score: int = 80, quorum: int = 1) -> bool:
        """True when at least ``quorum`` of ``attesters`` hold a live score >= ``min_score`` for ``seller``."""
        return bool(self._call("trusted_by", [scval.to_address(seller), scval.to_vec([scval.to_address(a) for a in attesters]), scval.to_uint32(min_score), scval.to_uint32(quorum)]))

    def count_trusted(self, seller: str, attesters: List[str], min_score: int = 80) -> int:
        return int(self._call("count_trusted", [scval.to_address(seller), scval.to_vec([scval.to_address(a) for a in attesters]), scval.to_uint32(min_score)]))

    def get_seller(self, attester: str, seller: str) -> Optional[dict]:
        """The attester's latest seller attestation (score, calls, evidence root...), or None."""
        return self._call("get_seller", [scval.to_address(attester), scval.to_address(seller)])

    def verify_seller_evidence(self, attester: str, seller: str, leaf: bytes, proof: List[bytes]) -> bool:
        """Has the contract check a piece of evidence against the attester's onchain root."""
        return bool(self._call("verify_seller_evidence", [scval.to_address(attester), scval.to_address(seller), scval.to_bytes(leaf), scval.to_vec([scval.to_bytes(p) for p in proof])]))
