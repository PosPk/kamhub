#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "[ERROR] vercel CLI не найден. Установите: npm i -g vercel" >&2
  exit 1
fi

echo "[info] Вытягиваю ENV из Vercel..."

vercel env pull .env.vercel.production   --environment=production
vercel env pull .env.vercel.preview      --environment=preview
vercel env pull .env.vercel.development  --environment=development

echo "[ok] Файлы созданы: .env.vercel.production, .env.vercel.preview, .env.vercel.development"
