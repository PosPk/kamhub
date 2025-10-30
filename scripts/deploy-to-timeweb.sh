#!/usr/bin/env bash
set -euo pipefail

# Deploys the Next.js app to a Timeweb VDS via SSH. (auto-trigger)
# Requirements (one of auth methods):
# - (preferred) TIMEWEB_SSH_KEY: private key content (with TIMEWEB_SSH_HOST, TIMEWEB_SSH_USER)
# - (alternative) TIMEWEB_SSH_PASSWORD: password for SSH (with TIMEWEB_SSH_HOST, TIMEWEB_SSH_USER)
# Optional: TIMEWEB_APP_DIR (default /opt/kamhub)

APP_DIR=${TIMEWEB_APP_DIR:-/opt/kamhub}
SERVICE_NAME=${SERVICE_NAME:-kamhub}

if [[ -z "${TIMEWEB_SSH_HOST:-}" || -z "${TIMEWEB_SSH_USER:-}" ]]; then
  echo "TIMEWEB_SSH_HOST and TIMEWEB_SSH_USER are required" >&2
  exit 1
fi

# Prepare SSH auth
if [[ -n "${TIMEWEB_SSH_KEY:-}" ]]; then
  mkdir -p ~/.ssh
  KEY_FILE=~/.ssh/timeweb_key
  printf "%s" "$TIMEWEB_SSH_KEY" > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  AUTH_PREFIX=""
  SSH="ssh -i $KEY_FILE -o StrictHostKeyChecking=no ${TIMEWEB_SSH_USER}@${TIMEWEB_SSH_HOST}"
  SCP="scp -i $KEY_FILE -o StrictHostKeyChecking=no"
elif [[ -n "${TIMEWEB_SSH_PASSWORD:-}" ]]; then
  # sshpass should be preinstalled by workflow step
  AUTH_PREFIX="sshpass -p \"$TIMEWEB_SSH_PASSWORD\""
  SSH="$AUTH_PREFIX ssh -o StrictHostKeyChecking=no ${TIMEWEB_SSH_USER}@${TIMEWEB_SSH_HOST}"
  SCP="$AUTH_PREFIX scp -o StrictHostKeyChecking=no"
else
  echo "Provide either TIMEWEB_SSH_KEY or TIMEWEB_SSH_PASSWORD" >&2
  exit 1
fi

# Remote setup
$SSH "sudo mkdir -p ${APP_DIR} && sudo chown -R $TIMEWEB_SSH_USER:$TIMEWEB_SSH_USER ${APP_DIR}"
$SSH "command -v node >/dev/null 2>&1 || curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get update && sudo apt-get install -y nodejs"
$SSH "command -v nginx >/dev/null 2>&1 || (sudo apt-get update && sudo apt-get install -y nginx)"
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

# Configure Nginx reverse proxy
$SSH "sudo bash -c 'cat >/etc/nginx/sites-available/kamhub <<\"EOF\"
server {
  listen 80;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection \"upgrade\";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF'"
$SSH "sudo ln -sf /etc/nginx/sites-available/kamhub /etc/nginx/sites-enabled/kamhub && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx"

echo "Deploy completed to ${TIMEWEB_SSH_HOST}"