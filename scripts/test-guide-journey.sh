#!/usr/bin/env bash
# Simple runner script to exercise guide endpoints against API_URL
set -euo pipefail
API_URL=${API_URL:-http://localhost:3000}
EMAIL="guide+test@kamhub.local"
PASS="Password123!"

echo "1) Register guide (if not exists)"
RESP=$(curl -s -o /dev/stderr -w "%{http_code}" -X POST "$API_URL/api/auth/register" -H 'Content-Type: application/json' -d '{"name":"Test Guide","email":"'