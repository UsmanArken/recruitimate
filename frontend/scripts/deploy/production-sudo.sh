#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/recruitimate"
SUDO_PASS="${SUDO_PASS:?SUDO_PASS required}"
APP_URL="${APP_URL:-https://recruitimate.app}"

sudo_cmd() { echo "$SUDO_PASS" | sudo -S "$@"; }

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

log() { echo "[deploy] $*"; }

log "Installing system packages..."
sudo_cmd apt-get update -qq
sudo_cmd DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  docker.io docker-compose-v2 nginx ufw curl ca-certificates

log "Starting Docker..."
sudo_cmd systemctl enable --now docker

log "Starting PostgreSQL via Docker Compose..."
cd "$APP_DIR"
sudo_cmd docker compose up -d

log "Waiting for Postgres..."
for i in $(seq 1 30); do
  if sudo_cmd docker compose exec -T postgres pg_isready -U recruitimate >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

log "Writing .env..."
AUTH_SECRET=$(openssl rand -base64 32)
cat > "$APP_DIR/.env" <<EOF
DATABASE_URL="postgresql://recruitimate:recruitimate@127.0.0.1:5432/recruitimate?schema=public"
LLM_PROVIDER="google"
GOOGLE_API_KEY="${GOOGLE_API_KEY:-}"
GOOGLE_CHAT_MODEL="gemini-2.5-flash"
NEXT_PUBLIC_APP_URL="${APP_URL}"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="${APP_URL}"
SUPER_ADMIN_EMAIL="superadmin@recruitimate.io"
SUPER_ADMIN_PASSWORD="12345678"
UPLOAD_DIR="${APP_DIR}/uploads"
EOF
mkdir -p "$APP_DIR/uploads"

log "Installing dependencies and building..."
cd "$APP_DIR"
npm ci
npm run db:generate
npm run db:push
npm run db:seed || true
NODE_OPTIONS="--max-old-space-size=2048" npm run build

log "Configuring PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
pm2 delete recruitimate 2>/dev/null || true
HOSTNAME=0.0.0.0 PORT=3000 pm2 start npm --name recruitimate -- start
pm2 save

log "Configuring nginx..."
sudo_cmd tee /etc/nginx/sites-available/recruitimate >/dev/null <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
sudo_cmd ln -sf /etc/nginx/sites-available/recruitimate /etc/nginx/sites-enabled/recruitimate
sudo_cmd rm -f /etc/nginx/sites-enabled/default
sudo_cmd nginx -t
sudo_cmd systemctl enable --now nginx
sudo_cmd systemctl reload nginx

log "Configuring firewall..."
sudo_cmd ufw allow OpenSSH
sudo_cmd ufw allow 80/tcp
sudo_cmd ufw --force enable

log "Done — ${APP_URL}"
