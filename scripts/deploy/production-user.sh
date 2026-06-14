#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$HOME/recruitimate"
PG_DIR="$HOME/pgsql"
PGDATA="$HOME/pgdata"
PGPORT=5432
NODE_VERSION=20

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

log() { echo "[deploy] $*"; }

install_nvm() {
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    log "Installing nvm..."
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
  fi
  nvm install "$NODE_VERSION"
  nvm alias default "$NODE_VERSION"
  node -v
  npm -v
}

install_postgres() {
  if [ -x "$PG_DIR/bin/postgres" ]; then
    log "PostgreSQL binaries already present"
    return
  fi
  log "Installing PostgreSQL binaries (user-space)..."
  mkdir -p "$PG_DIR"
  cd "$HOME"
  curl -fsSL -o pg-binaries.tar.gz \
    "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-linux-x64-binaries.tar.gz"
  tar -xzf pg-binaries.tar.gz -C "$PG_DIR" --strip-components=1
  rm -f pg-binaries.tar.gz
}

start_postgres() {
  export PATH="$PG_DIR/bin:$PATH"
  if [ ! -d "$PGDATA" ]; then
    log "Initializing PostgreSQL data directory..."
    initdb -D "$PGDATA" -U recruitimate --auth-local=trust --auth-host=trust
    echo "listen_addresses = '127.0.0.1'" >> "$PGDATA/postgresql.conf"
    echo "port = $PGPORT" >> "$PGDATA/postgresql.conf"
  fi
  if ! pg_isready -h 127.0.0.1 -p "$PGPORT" >/dev/null 2>&1; then
    log "Starting PostgreSQL..."
    pg_ctl -D "$PGDATA" -l "$HOME/pg.log" start
    sleep 2
  fi
  psql -h 127.0.0.1 -p "$PGPORT" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='recruitimate'" | grep -q 1 || \
    createuser -h 127.0.0.1 -p "$PGPORT" recruitimate || true
  psql -h 127.0.0.1 -p "$PGPORT" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='recruitimate'" | grep -q 1 || \
    createdb -h 127.0.0.1 -p "$PGPORT" -O recruitimate recruitimate
}

setup_env() {
  log "Writing .env..."
  AUTH_SECRET=$(openssl rand -base64 32)
  cat > "$APP_DIR/.env" <<EOF
DATABASE_URL="postgresql://recruitimate@127.0.0.1:${PGPORT}/recruitimate?schema=public"
LLM_PROVIDER="google"
GOOGLE_API_KEY="${GOOGLE_API_KEY:-}"
GOOGLE_CHAT_MODEL="gemini-2.5-flash"
NEXT_PUBLIC_APP_URL="http://172.105.19.153:3000"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://172.105.19.153:3000"
SUPER_ADMIN_EMAIL="superadmin@recruitimate.io"
SUPER_ADMIN_PASSWORD="12345678"
UPLOAD_DIR="${APP_DIR}/uploads"
EOF
  mkdir -p "$APP_DIR/uploads"
}

build_app() {
  cd "$APP_DIR"
  log "Installing npm dependencies..."
  npm ci
  log "Generating Prisma client..."
  npm run db:generate
  log "Pushing database schema..."
  npm run db:push
  log "Seeding database..."
  npm run db:seed || true
  log "Building production bundle..."
  NODE_OPTIONS="--max-old-space-size=2048" npm run build
}

start_app() {
  cd "$APP_DIR"
  if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
  fi
  pm2 delete recruitimate 2>/dev/null || true
  HOSTNAME=0.0.0.0 PORT=3000 pm2 start npm --name recruitimate -- start
  pm2 save
  pm2 status
}

install_nvm
install_postgres
start_postgres
setup_env
build_app
start_app
log "Done. App should be at http://172.105.19.153:3000"
