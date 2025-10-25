#!/usr/bin/env bash
set -euo pipefail

ENV_NAME="${1:-Production}"
FILE="${2:-.env.vercel.production}"

if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI не найден. Установите: https://cli.github.com/" >&2
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "[ERROR] Файл $FILE не найден. Сначала выполните scripts/vercel_env_pull_all.sh" >&2
  exit 1
fi

# Создание окружения, если отсутствует (игнорируем ошибку)
(gh api repos/:owner/:repo/environments/"$ENV_NAME" >/dev/null 2>&1) || gh api -X PUT repos/:owner/:repo/environments/"$ENV_NAME" >/dev/null

echo "[info] Загружаю секреты в окружение: $ENV_NAME из $FILE"

while IFS= read -r line; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  gh secret set "$key" --env "$ENV_NAME" --body "$val"
  echo "Set env($ENV_NAME) secret: $key"
done < "$FILE"
