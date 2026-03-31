#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

SERVICE_NAME="receipt-frontend.service"

echo "[1/3] Building Next.js app..."
npm run build

echo "[2/3] Restarting ${SERVICE_NAME}..."
systemctl restart "${SERVICE_NAME}"

echo "[3/3] Checking ${SERVICE_NAME} status..."
systemctl --no-pager --full status "${SERVICE_NAME}"
