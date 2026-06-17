#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-recruitimate.app}"
EMAIL="${EMAIL:-superadmin@recruitimate.io}"
APP_DIR="${APP_DIR:-$HOME/recruitimate}"
APP_URL="${APP_URL:-https://recruitimate.app}"
SUDO_PASS="${SUDO_PASS:?SUDO_PASS required}"
DEPLOY_DIR="${APP_DIR}/scripts/deploy"

sudo_cmd() { echo "$SUDO_PASS" | sudo -S "$@"; }
log() { echo "[https] $*"; }

log "Installing certbot (if needed)..."
sudo_cmd apt-get update -qq
sudo_cmd DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot python3-certbot-nginx

log "Opening port 443..."
sudo_cmd ufw allow 443/tcp

log "Staging HTTP nginx with domain..."
sudo_cmd cp "${DEPLOY_DIR}/nginx-http-staging.conf" /etc/nginx/sites-available/recruitimate
sudo_cmd ln -sf /etc/nginx/sites-available/recruitimate /etc/nginx/sites-enabled/recruitimate
sudo_cmd rm -f /etc/nginx/sites-enabled/default
sudo_cmd nginx -t
sudo_cmd systemctl reload nginx

log "Obtaining certificate and configuring HTTPS (certbot)..."
sudo_cmd certbot --nginx \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  -m "${EMAIL}" \
  --no-eff-email \
  --redirect

sudo_cmd systemctl enable --now certbot.timer 2>/dev/null || true

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
curl -s -o /dev/null -w "https HTTP %{http_code}\n" "https://${DOMAIN}/login"

log "Done — https://${DOMAIN}"
