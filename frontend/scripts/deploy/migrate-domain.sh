#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-recruitimate.app}"
EMAIL="${EMAIL:-superadmin@recruitimate.io}"
APP_DIR="${APP_DIR:-$HOME/recruitimate}"
APP_URL="${APP_URL:-https://${DOMAIN}}"
SUDO_PASS="${SUDO_PASS:?SUDO_PASS required}"
DEPLOY_DIR="${APP_DIR}/scripts/deploy"

sudo_cmd() { echo "$SUDO_PASS" | sudo -S "$@"; }
log() { echo "[domain] $*"; }

log "Staging HTTP nginx..."
sudo_cmd cp "${DEPLOY_DIR}/nginx-http-staging.conf" /etc/nginx/sites-available/recruitimate
sudo_cmd ln -sf /etc/nginx/sites-available/recruitimate /etc/nginx/sites-enabled/recruitimate
sudo_cmd nginx -t
sudo_cmd systemctl reload nginx

if ! sudo_cmd test -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"; then
  log "Issuing certificate for ${DOMAIN}..."
  sudo_cmd certbot --nginx \
    -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    -m "${EMAIL}" \
    --no-eff-email \
    --redirect
fi

log "Installing production nginx (app + legacy redirect)..."
sudo_cmd cp "${DEPLOY_DIR}/nginx-recruitimate.conf" /etc/nginx/sites-available/recruitimate
sudo_cmd nginx -t
sudo_cmd systemctl reload nginx

log "Updating .env → ${APP_URL}"
sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"${APP_URL}\"|" "${APP_DIR}/.env"
sed -i "s|^AUTH_URL=.*|AUTH_URL=\"${APP_URL}\"|" "${APP_DIR}/.env"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

log "Rebuilding app..."
cd "$APP_DIR"
NODE_OPTIONS="--max-old-space-size=2048" npm run build
pm2 restart recruitimate

log "Health check..."
sleep 3
curl -s -o /dev/null -w "${DOMAIN} login: %{http_code}\n" "https://${DOMAIN}/login"

log "Done — https://${DOMAIN}"
