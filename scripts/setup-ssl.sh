#!/bin/bash
# setup-ssl.sh — issue Let's Encrypt cert and switch nginx to HTTPS mode
# Run once after first deploy on the Linode.
set -e

DOMAIN="${1:-recruitimate.app}"
cd "$(dirname "$0")/.."

echo "==> Step 1: Start with HTTP-only nginx config"
cp nginx/nginx-http-only.conf nginx/nginx.conf
docker compose restart nginx

echo "==> Step 2: Issue certificate for $DOMAIN and www.$DOMAIN"
docker compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email admin@"$DOMAIN" \
  --agree-tos --no-eff-email

echo "==> Step 3: Switch to HTTPS nginx config"
cp nginx/nginx-https.conf nginx/nginx.conf 2>/dev/null || \
  echo "WARN: Copy nginx/nginx.conf manually to enable HTTPS — the HTTPS config is nginx/nginx.conf by default"

docker compose restart nginx

echo "==> SSL setup complete. Verify at https://$DOMAIN"
