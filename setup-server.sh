#!/bin/bash
set -e

cd /var/www/kamchatour

# Create .env file
cat > .env << 'EOF'
# Kamchatour Hub - Production
DATABASE_URL=postgresql://kamuser:kampass2024@localhost:5432/kamchatour
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20
JWT_SECRET=kamchatour-production-secret-$(openssl rand -hex 32 | head -c 32)
JWT_EXPIRES_IN=7d
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://5.129.248.224
PORT=3002
HOSTNAME=0.0.0.0
EOF

# Install dependencies
npm ci --production=false

# Apply database schemas
if [ -f lib/database/schema.sql ]; then
    PGPASSWORD=kampass2024 psql -h localhost -U kamuser -d kamchatour -f lib/database/schema.sql 2>/dev/null || true
fi

if [ -f lib/database/transfer_schema.sql ]; then
    PGPASSWORD=kampass2024 psql -h localhost -U kamuser -d kamchatour -f lib/database/transfer_schema.sql 2>/dev/null || true
fi

if [ -f lib/database/loyalty_schema.sql ]; then
    PGPASSWORD=kampass2024 psql -h localhost -U kamuser -d kamchatour -f lib/database/loyalty_schema.sql 2>/dev/null || true
fi

# Build project
rm -rf .next
npm run build

# Restart PM2
pm2 restart kamchatour-hub --update-env || pm2 start ecosystem.config.js --name kamchatour-hub
pm2 save

echo "✅ Deployment complete!"
