#!/usr/bin/env bash
# Builds the contracts and deploys the attestation registry, the trust policy
# and the ed25519 verifier to Stellar testnet. Bonds are in testnet XLM.
# Needs the Stellar CLI (>= 25.2): https://developers.stellar.org/docs/tools/cli
# Usage: bash scripts/deploy-testnet.sh
# For a full run with sellers, attesters and an agent wallet, see src/demo/testnet.ts.
set -euo pipefail
cd "$(dirname "$0")/../contracts"

command -v stellar >/dev/null || { echo "Install the Stellar CLI first."; exit 1; }

for id in scope-admin scope-attester; do
  stellar keys address "$id" >/dev/null 2>&1 || stellar keys generate "$id" --network testnet --fund
done

stellar contract build
OUT=target/wasm32v1-none/release
XLM=$(stellar contract id asset --asset native --network testnet)
MIN_BOND=1000000000   # 100 XLM (7 decimals)
UNBOND=17280          # about one day

REGISTRY=$(stellar contract deploy --wasm "$OUT/scope_attestations.wasm" --source scope-admin --network testnet -- \
  --admin "$(stellar keys address scope-admin)" --bond_token "$XLM" --min_bond "$MIN_BOND" --unbond_ledgers "$UNBOND")
POLICY=$(stellar contract deploy --wasm "$OUT/scope_trust_policy.wasm" --source scope-admin --network testnet)
VERIFIER=$(stellar contract deploy --wasm "$OUT/scope_ed25519_verifier.wasm" --source scope-admin --network testnet)

# Register one attester with the minimum bond.
stellar contract invoke --id "$REGISTRY" --source scope-attester --network testnet -- \
  register --attester "$(stellar keys address scope-attester)" --amount "$MIN_BOND"

cat <<EOT
Registry:  $REGISTRY
Policy:    $POLICY
Verifier:  $VERIFIER
Attester:  $(stellar keys address scope-attester) (bond 100 XLM)

Write scores:  TRUST_CONTRACT_ID=$REGISTRY TRUST_ATTESTER_SECRET=\$(stellar keys show scope-attester) node dist/cli.js attest
Check one:     stellar contract invoke --id $REGISTRY --network testnet --source scope-admin -- attester --attester $(stellar keys address scope-attester)
EOT
