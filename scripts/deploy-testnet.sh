#!/usr/bin/env bash
# Builds the attestation contract and deploys it to Stellar testnet.
# Needs the Stellar CLI: https://developers.stellar.org/docs/tools/cli
# Usage: bash scripts/deploy-testnet.sh
set -euo pipefail
cd "$(dirname "$0")/../contracts/attestations"

command -v stellar >/dev/null || { echo "Install the Stellar CLI first."; exit 1; }

# Two testnet identities: admin (rotates signer, revokes) and signer (writes attestations).
for id in scope-admin scope-signer; do
  stellar keys address "$id" >/dev/null 2>&1 || stellar keys generate "$id" --network testnet --fund
done

stellar contract build
WASM=target/wasm32v1-none/release/scope_attestations.wasm

CONTRACT_ID=$(stellar contract deploy --wasm "$WASM" --source scope-admin --network testnet -- \
  --admin "$(stellar keys address scope-admin)" --signer "$(stellar keys address scope-signer)")

echo "Contract deployed on testnet: $CONTRACT_ID"
echo "Check it: stellar contract invoke --id $CONTRACT_ID --source scope-admin --network testnet -- signer"
