#!/usr/bin/env bash
# Kamchatour Hub - One-click production deploy to Vercel
# Requirements:
# - vercel CLI installed: npm i -g vercel
# - a file named "token" in repo root with your VERCEL_TOKEN
# - git configured with access to your GitHub repo

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v vercel >/dev/null 2>&1; then
  echo "[ERROR] vercel CLI is not installed. Install with: npm i -g vercel"
  exit 1
fi

if [[ ! -f token ]]; then
  echo "[ERROR] token file not found in repo root. Put your VERCEL_TOKEN into ./token"
  exit 1
fi

export VERCEL_TOKEN="$(cat token)"
if [[ -z "${VERCEL_TOKEN}" ]]; then
  echo "[ERROR] token file is empty. Put your VERCEL_TOKEN into ./token"
  exit 1
fi

APP_NAME="kamchatour-hub-prod-$(date +%s)"

echo "[1/6] Ensure we are on main and up-to-date"
git checkout main || true
git pull || true

# Optional: remove root vercel.json if present (we rely on ext/kamchatour-hub/vercel.json)
if [[ -f vercel.json ]]; then
  echo "[2/6] Removing root vercel.json to avoid conflicts"
  git rm -f vercel.json || true
  git add -A
  git commit -m "chore(vercel): use ext/kamchatour-hub/vercel.json only" || true
  git push origin main || true
fi

if [[ ! -f ext/kamchatour-hub/vercel.json ]]; then
  echo "[WARN] ext/kamchatour-hub/vercel.json not found. Deploy may fail to route correctly."
fi

if [[ ! -d ext/kamchatour-hub/public ]]; then
  echo "[ERROR] ext/kamchatour-hub/public not found. Wrong repo layout?"
  exit 1
fi

echo "[3/6] Deploying new production project from ext/kamchatour-hub (Root Directory)"
vercel --cwd ext/kamchatour-hub --prod --confirm --force --name "$APP_NAME" --token "$VERCEL_TOKEN"

APP_URL="https://$APP_NAME.vercel.app"
echo "[INFO] Deployed: $APP_URL"

echo "[4/6] Adding domain tourhab.ru (if not already)"
vercel domains add tourhab.ru --token "$VERCEL_TOKEN" || true

echo "[5/6] Pointing domain to the new project"
if ! vercel alias set "$APP_NAME" tourhab.ru --token "$VERCEL_TOKEN"; then
  echo "[WARN] Could not alias tourhab.ru to $APP_NAME automatically."
  echo "       It may be attached to another project. You can detach with:"
  echo "       vercel domains rm tourhab.ru --token \"$VERCEL_TOKEN\""
  echo "       and then rerun alias: vercel alias set \"$APP_NAME\" tourhab.ru --token \"$VERCEL_TOKEN\""
fi

echo "[6/6] Quick checks (open these URLs):"
echo "  Main:           $APP_URL/?v=24"
echo "  Stay (route):   $APP_URL/hub/stay?v=24"
echo "  Upload:         $APP_URL/media/upload?v=24"
echo "  Health:         $APP_URL/api/health"
echo "  Domain (once DNS propagates): https://tourhab.ru/?v=24"

echo "Done. If any 404 persists, wait a minute and refresh with Ctrl/Cmd+Shift+R."