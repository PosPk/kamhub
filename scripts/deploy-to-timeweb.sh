#!/usr/bin/env bash
set -euo pipefail

# Deploys the Next.js app to a Timeweb VDS via SSH.
# Requirements:
# - TIMEWEB_SSH_HOST, TIMEWEB_SSH_USER, TIMEWEB_SSH_KEY (private key content) in CI secrets
# - Optionally TIMEWEB_APP_DIR (default /opt/kamhub)

APP_DIR=${TIMEWEB_APP_DIR:-/opt/kamhub}
SERVICE_NAME=${SERVICE_NAME:-kamhub}

if [[ -z "${TIMEWEB_SSH_HOST:-}" || -z "${TIMEWEB_SSH_USER:-}" || -z "${TIMEWEB_SSH_KEY:-}" ]]; then
  echo "TIMEWEB_SSH_HOST/TIMEWEB_SSH_USER/TIMEWEB_SSH_KEY are required" >&2
  exit 1
fi

# Prepare SSH key
mkdir -p ~/.ssh
KEY_FILE=~/.ssh/timeweb_key
printf "%s" "$TIMEWEB_SSH_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

SSH="ssh -i $KEY_FILE -o StrictHostKeyChecking=no ${TIMEWEB_SSH_USER}@${TIMEWEB_SSH_HOST}"
SCP="scp -i $KEY_FILE -o StrictHostKeyChecking=no"

# Remote setup
$SSH "sudo mkdir -p ${APP_DIR} && sudo chown -R $TIMEWEB_SSH_USER:$TIMEWEB_SSH_USER ${APP_DIR}"
$SSH "command -v node >/dev/null 2>&1 || curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
$SSH "command -v pm2 >/dev/null 2>&1 || sudo npm i -g pm2"

# Upload project bundle (artifact expected in CI)
# Using rsync if available; fallback to tarball copy
if command -v rsync >/dev/null 2>&1; then
  rsync -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" -az --delete ./ ${TIMEWEB_SSH_USER}@${TIMEWEB_SSH_HOST}:${APP_DIR}/
else
  TAR_FILE=/tmp/kamhub.tar.gz
  tar -czf $TAR_FILE --exclude node_modules --exclude .git .
  $SCP $TAR_FILE ${TIMEWEB_SSH_USER}@${TIMEWEB_SSH_HOST}:/tmp/
  $SSH "mkdir -p ${APP_DIR} && tar -xzf /tmp/kamhub.tar.gz -C ${APP_DIR} && rm -f /tmp/kamhub.tar.gz"
fi

# Install deps, build, migrate
$SSH "cd ${APP_DIR} && npm ci --omit=dev && npm run build || (npm i && npm run build)"
$SSH "cd ${APP_DIR} && npm run migrate:up || true"

# Create systemd service via PM2 (if not exists), or restart
$SSH "pm2 start npm --name ${SERVICE_NAME} -- start || pm2 restart ${SERVICE_NAME} && pm2 save"

echo "Deploy completed to ${TIMEWEB_SSH_HOST}"