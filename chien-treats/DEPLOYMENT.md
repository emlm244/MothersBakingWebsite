# Deployment Guide - VPS with nginx

This guide covers deploying Chien's Treats to a VPS (Virtual Private Server) with nginx as a reverse proxy.

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Domain name pointed to your VPS IP
- Root or sudo access to the VPS
- Node.js 18+ installed on the VPS

## 1. Server Setup

### Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install pnpm

```bash
npm install -g pnpm
```

### Install nginx

```bash
sudo apt update
sudo apt install nginx
```

### Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## 2. Application Deployment

### Clone and Build

```bash
# Navigate to your deployment directory
cd /var/www

# Clone your repository
git clone <your-repo-url> chien-treats
cd chien-treats

# Install dependencies
pnpm install

# Build the Next.js application
pnpm build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Create PM2 Ecosystem File

Create `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [{
    name: 'chien-treats',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/chien-treats',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 3. nginx Configuration

### Basic Configuration

Create a new nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/chien-treats
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be updated with Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Client upload size (for product images)
    client_max_body_size 10M;

    # Static files from Next.js
    location /_next/static {
        alias /var/www/chien-treats/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    location /static {
        alias /var/www/chien-treats/public;
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Enable the Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/chien-treats /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## 4. SSL Certificate with Let's Encrypt

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain Certificate

Before running certbot, temporarily comment out the SSL lines in your nginx config, then:

```bash
# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# The certificate will auto-renew. Test the renewal:
sudo certbot renew --dry-run
```

After obtaining the certificate, update the nginx configuration with the correct paths and reload nginx.

## 5. Firewall Configuration

```bash
# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

## 6. Environment Variables

For production deployment, create a `.env.local` file (or use environment variables):

```bash
# /var/www/chien-treats/.env.local
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Then restart PM2:

```bash
pm2 restart chien-treats
```

## 7. Monitoring and Logs

### PM2 Monitoring

```bash
# View application logs
pm2 logs chien-treats

# Monitor application status
pm2 monit

# View process list
pm2 list
```

### nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## 8. Updates and Maintenance

### Deploy Updates

```bash
cd /var/www/chien-treats

# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Build
pnpm build

# Restart application
pm2 restart chien-treats

# If nginx config changed
sudo nginx -t
sudo systemctl reload nginx
```

### Automated Deployments

Create a deployment script `deploy.sh`:

```bash
#!/bin/bash
set -e

cd /var/www/chien-treats

echo "📦 Pulling latest changes..."
git pull origin main

echo "📥 Installing dependencies..."
pnpm install

echo "🏗️  Building application..."
pnpm build

echo "🔄 Restarting application..."
pm2 restart chien-treats

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy.sh
```

## 9. Performance Optimization

### Enable Next.js Caching

In your `next.config.ts`, ensure these are configured:

```typescript
const config: NextConfig = {
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
};
```

### Add nginx Caching (Optional)

```nginx
# Add to http block in /etc/nginx/nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=nextjs_cache:10m max_size=1g
                 inactive=60m use_temp_path=off;

# Then in your server block:
location / {
    proxy_cache nextjs_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_bypass $http_cache_control;
    add_header X-Cache-Status $upstream_cache_status;

    # ... rest of proxy configuration
}
```

## 10. Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs chien-treats --lines 100

# Check if port 3000 is in use
sudo netstat -tlnp | grep 3000
```

### 502 Bad Gateway

```bash
# Ensure application is running
pm2 status

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy_pass URL matches application port
```

### SSL Certificate Issues

```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

## 11. Security Checklist

- [ ] Firewall configured (ufw)
- [ ] SSL certificate installed and auto-renewing
- [ ] Security headers configured in nginx
- [ ] Application running as non-root user
- [ ] SSH key authentication enabled (password auth disabled)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Fail2ban installed for brute-force protection: `sudo apt install fail2ban`
- [ ] Regular backups configured

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
