# Add-A-Site Playbook

This guide shows how to add a second site to the VPS without affecting chienstreats.com.

## Prerequisites

- VPS already running with chienstreats deployed
- New domain DNS pointed to VPS IP
- SSL certificate obtainable for new domain

## Steps

### 1. Create Site User & Directory

```bash
# As root on VPS
SITE_NAME="secondsite"  # Change this
SITE_DOMAIN="example.com"  # Change this
SITE_PORT="3102"  # Increment for each new site
API_PORT="4001"  # Increment for each new site

# Create user
useradd -r -m -s /bin/bash -d /srv/sites/$SITE_NAME $SITE_NAME

# Create directory structure
mkdir -p /srv/sites/$SITE_NAME/{releases,shared/{logs,uploads},current}
chown -R $SITE_NAME:$SITE_NAME /srv/sites/$SITE_NAME
```

### 2. Create Database

```bash
# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER $SITE_NAME WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $SITE_NAME OWNER $SITE_NAME;
GRANT ALL PRIVILEGES ON DATABASE $SITE_NAME TO $SITE_NAME;
EOF

# Save credentials
echo "DB_PASSWORD=$DB_PASSWORD" >> /root/.env.$SITE_NAME.secrets
```

### 3. Create Environment File

```bash
cat > /srv/sites/$SITE_NAME/shared/.env <<EOF
APP_ENV=production
APP_PORT=$API_PORT
APP_BASE_URL=https://$SITE_DOMAIN
FRONTEND_ORIGIN=https://$SITE_DOMAIN,https://www.$SITE_DOMAIN

PORT=$SITE_PORT
NEXT_PUBLIC_SITE_URL=https://$SITE_DOMAIN
NEXT_PUBLIC_API_BASE_URL=/api/v1

DATABASE_URL=postgresql://$SITE_NAME:$DB_PASSWORD@localhost:5432/$SITE_NAME
REDIS_URL=redis://localhost:6379

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=30d

# Add other site-specific variables...
EOF

chown $SITE_NAME:$SITE_NAME /srv/sites/$SITE_NAME/shared/.env
chmod 600 /srv/sites/$SITE_NAME/shared/.env
```

### 4. Create Systemd Services

```bash
# Frontend service
cat > /etc/systemd/system/$SITE_NAME-frontend.service <<EOF
[Unit]
Description=$SITE_NAME Frontend (Next.js)
After=network.target $SITE_NAME-api.service
Wants=$SITE_NAME-api.service

[Service]
Type=simple
User=$SITE_NAME
Group=$SITE_NAME
WorkingDirectory=/srv/sites/$SITE_NAME/current
Environment=NODE_ENV=production
Environment=PORT=$SITE_PORT
EnvironmentFile=/srv/sites/$SITE_NAME/shared/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10s
StandardOutput=append:/srv/sites/$SITE_NAME/shared/logs/frontend.log
StandardError=append:/srv/sites/$SITE_NAME/shared/logs/frontend-error.log

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/sites/$SITE_NAME/shared/logs /srv/sites/$SITE_NAME/shared/uploads

[Install]
WantedBy=multi-user.target
EOF

# API service
cat > /etc/systemd/system/$SITE_NAME-api.service <<EOF
[Unit]
Description=$SITE_NAME API (NestJS)
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service

[Service]
Type=simple
User=$SITE_NAME
Group=$SITE_NAME
WorkingDirectory=/srv/sites/$SITE_NAME/current/apps/api
Environment=NODE_ENV=production
EnvironmentFile=/srv/sites/$SITE_NAME/shared/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10s
StandardOutput=append:/srv/sites/$SITE_NAME/shared/logs/api.log
StandardError=append:/srv/sites/$SITE_NAME/shared/logs/api-error.log

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/sites/$SITE_NAME/shared/logs /srv/sites/$SITE_NAME/shared/uploads

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SITE_NAME-frontend $SITE_NAME-api
```

### 5. Create Nginx Config

```bash
cat > /etc/nginx/sites-available/$SITE_NAME <<EOF
upstream ${SITE_NAME}_frontend {
    server 127.0.0.1:$SITE_PORT fail_timeout=10s max_fails=3;
    keepalive 32;
}

upstream ${SITE_NAME}_api {
    server 127.0.0.1:$API_PORT fail_timeout=10s max_fails=3;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name $SITE_DOMAIN www.$SITE_DOMAIN;
    
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SITE_DOMAIN www.$SITE_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$SITE_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$SITE_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security headers...
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    client_max_body_size 10M;
    
    access_log /srv/sites/$SITE_NAME/shared/logs/nginx-access.log combined;
    error_log /srv/sites/$SITE_NAME/shared/logs/nginx-error.log warn;
    
    location /api/v1/ {
        proxy_pass http://${SITE_NAME}_api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        proxy_pass http://${SITE_NAME}_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/$SITE_NAME /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6. Obtain SSL Certificate

```bash
certbot --nginx -d $SITE_DOMAIN -d www.$SITE_DOMAIN
```

### 7. Deploy Site Code

Deploy using the same GitHub Actions workflow pattern, or manually:

```bash
git clone <repo-url> /srv/sites/$SITE_NAME/releases/$(date +%Y%m%d_%H%M%S)
cd /srv/sites/$SITE_NAME/releases/<timestamp>
pnpm install --frozen-lockfile --prod
pnpm build
pnpm api:build
ln -sfn $(pwd) /srv/sites/$SITE_NAME/current

# Start services
systemctl start $SITE_NAME-frontend $SITE_NAME-api
```

### 8. Configure Cloudflare

1. Add A record: `@` → VPS_IP (Proxied)
2. Add CNAME: `www` → `@` (Proxied)
3. SSL/TLS: Full (strict)
4. Always Use HTTPS: On

### 9. Verify Isolation

Test that restarting one site doesn't affect the other:

```bash
# Restart new site
systemctl restart $SITE_NAME-frontend $SITE_NAME-api

# Verify chienstreats still responds
curl -f https://chienstreats.com/healthz
```

## Site Matrix Reference

| Site | Domain | Frontend Port | API Port | User | DB |
|------|--------|--------------|----------|------|-----|
| chienstreats | chienstreats.com | 3101 | 4000 | chienstreats | chienstreats |
| secondsite | example.com | 3102 | 4001 | secondsite | secondsite |

## Rollback

To remove a site without affecting others:

```bash
systemctl stop $SITE_NAME-frontend $SITE_NAME-api
systemctl disable $SITE_NAME-frontend $SITE_NAME-api
rm /etc/systemd/system/$SITE_NAME-*.service
rm /etc/nginx/sites-enabled/$SITE_NAME
nginx -t && systemctl reload nginx
```
