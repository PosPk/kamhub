#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-.env.vercel.production}"

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI не найден. Установите: https://cli.github.com/" >&2
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "[ERROR] Файл $FILE не найден. Сначала выполните scripts/vercel_env_pull_all.sh" >&2
  exit 1
fi

while IFS= read -r line; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  gh secret set "$key" --body "$val"
  echo "Set repo secret: $key"
done < "$FILE"
