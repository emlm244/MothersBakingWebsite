# Chien's Treats Production Runbook

**Version:** 1.0
**Last Updated:** 2025-01-09
**Maintainer:** DevOps Team

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Architecture Overview](#architecture-overview)
3. [Initial VPS Setup](#initial-vps-setup)
4. [DNS & Cloudflare Configuration](#dns--cloudflare-configuration)
5. [First Deployment](#first-deployment)
6. [Ongoing Deployments](#ongoing-deployments)
7. [Rollback Procedure](#rollback-procedure)
8. [Health Monitoring](#health-monitoring)
9. [Log Management](#log-management)
10. [Backup & Restore](#backup--restore)
11. [Troubleshooting](#troubleshooting)
12. [Security Maintenance](#security-maintenance)
13. [Adding a Second Site](#adding-a-second-site)

---

## Quick Reference

### Essential Commands

```bash
# Service management
sudo systemctl status chienstreats-frontend
sudo systemctl status chienstreats-api
sudo systemctl restart chienstreats-api
sudo systemctl restart chienstreats-frontend

# View logs
journalctl -u chienstreats-frontend.service -f
journalctl -u chienstreats-api.service -f
tail -f /srv/sites/chienstreats/shared/logs/error.log

# Deploy
cd /srv/sites/chienstreats
sudo -u deploy bash deployment/deploy.sh chienstreats

# Rollback
sudo -u deploy bash deployment/deploy.sh chienstreats rollback

# Database
cd /srv/sites/chienstreats/current/apps/api
source /srv/sites/chienstreats/shared/.env.api
npx prisma studio # Open DB GUI
npx prisma migrate deploy # Run migrations
```

### Key Paths

| Component | Path |
|-----------|------|
| Site root | `/srv/sites/chienstreats` |
| Current release | `/srv/sites/chienstreats/current` (symlink) |
| Releases | `/srv/sites/chienstreats/releases/` |
| Logs | `/srv/sites/chienstreats/shared/logs/` |
| Uploads | `/srv/sites/chienstreats/shared/uploads/` |
| Env files | `/srv/sites/chienstreats/shared/.env.{frontend,api}` |
| Nginx config | `/etc/nginx/sites-enabled/chienstreats.conf` |
| Systemd services | `/etc/systemd/system/chienstreats-{frontend,api}.service` |

### Ports

| Service | Port | Access |
|---------|------|--------|
| Next.js Frontend | 3101 | localhost only |
| NestJS API | 3102 | localhost only |
| Nginx HTTP | 80 | public (redirects to HTTPS) |
| Nginx HTTPS | 443 | public |
| PostgreSQL | 5432 | localhost only |
| Redis | 6379 | localhost only |

### Environment Variables

See `/srv/sites/chienstreats/shared/.env.{frontend,api}` for production values.

Critical secrets:
- `JWT_SECRET` – Must be 32+ characters, never commit to git
- `DATABASE_URL` – PostgreSQL connection string with password
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – Stripe API keys
- `SMTP_PASS` – Email service password

---

## Architecture Overview

### Multi-Site Structure

```
/srv/sites/
├── chienstreats/
│   ├── releases/
│   │   ├── 20250109_103045/    # Timestamped releases
│   │   ├── 20250109_141230/
│   │   └── 20250109_163522/
│   ├── shared/
│   │   ├── .env.frontend       # Frontend environment variables
│   │   ├── .env.api            # API environment variables
│   │   ├── logs/
│   │   │   ├── access.log
│   │   │   ├── error.log
│   │   │   └── emails/         # Dev email output
│   │   └── uploads/            # User-uploaded files
│   ├── current -> releases/20250109_163522/chien-treats  # Symlink to active release
│   └── deployment/             # Deployment scripts (cloned from repo)
└── _placeholder/               # Placeholder for future sites
```

### Process Flow

```
Internet
   ↓
Cloudflare CDN/Proxy (SSL/DDoS protection)
   ↓
VPS: 109.205.180.240
   ↓
Nginx (reverse proxy, TLS termination, rate limiting)
   ├── /api/v1/*  → NestJS API (localhost:3102)
   │                 ├── PostgreSQL (localhost:5432)
   │                 └── Redis (localhost:6379)
   └── /*         → Next.js Frontend (localhost:3101)
                     └── Calls API via same-origin /api/v1
```

### Tech Stack

- **Frontend:** Next.js 15 (SSR), React 19, Redux Toolkit, Tailwind CSS
- **Backend API:** NestJS, Fastify, Prisma ORM
- **Database:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Web Server:** Nginx 1.18+
- **Process Manager:** systemd
- **Runtime:** Node.js 20 LTS, pnpm 9

---

## Initial VPS Setup

### Prerequisites

- Fresh Ubuntu 22.04 LTS VPS
- Root SSH access
- VPS IP: `109.205.180.240`
- Domain: `chienstreats.com` (DNS not yet configured)

### Step 1: Bootstrap the Server

1. **Transfer bootstrap script to VPS:**

```bash
# From local machine (Windows)
scp C:\Users\bc200\MotherWebsite\chien-treats\deployment\bootstrap.sh root@109.205.180.240:/root/

# SSH into VPS
ssh root@109.205.180.240
```

2. **Run bootstrap script:**

```bash
cd /root
chmod +x bootstrap.sh
bash bootstrap.sh
```

This script will:
- Update system packages
- Install Node.js 20, pnpm, Nginx, PostgreSQL, Redis, fail2ban
- Configure firewall (ufw)
- Set up automatic security updates
- Create deploy user
- Configure multi-site directory structure
- Set up Cloudflare real-IP restoration for logs

**Duration:** ~10-15 minutes

3. **Generate SSH key for deploy user:**

```bash
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@chienstreats.com"
sudo cat /home/deploy/.ssh/id_ed25519.pub
```

4. **Add deploy key to GitHub:**

- Go to https://github.com/emlm244/MothersBakingWebsite/settings/keys
- Click "Add deploy key"
- Title: "Chien's Treats VPS Deploy Key"
- Paste the public key
- ✅ Enable "Allow write access" (for CI/CD)

### Step 2: Configure Environment Variables

1. **Create frontend environment file:**

```bash
sudo cp /root/MotherWebsite/chien-treats/deployment/env/.env.frontend.example /srv/sites/chienstreats/shared/.env.frontend
sudo nano /srv/sites/chienstreats/shared/.env.frontend
```

Minimal required config:
```env
NODE_ENV=production
PORT=3101
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_BASE_URL=/api/v1
```

2. **Create API environment file:**

```bash
sudo cp /root/MotherWebsite/chien-treats/deployment/env/.env.api.example /srv/sites/chienstreats/shared/.env.api
sudo nano /srv/sites/chienstreats/shared/.env.api
```

**Critical: Update these values:**
```env
DATABASE_URL=postgresql://chiens_app:YOUR_SECURE_PASSWORD@localhost:5432/chiens_prod?schema=public
JWT_SECRET=GENERATE_A_SECURE_32_CHAR_SECRET_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
SMTP_PASS=YOUR_SMTP_PASSWORD
```

Generate secure secrets:
```bash
# JWT_SECRET (32+ characters)
openssl rand -base64 32

# Database password
openssl rand -base64 24
```

3. **Update PostgreSQL password:**

```bash
sudo -u postgres psql -c "ALTER USER chiens_app WITH PASSWORD 'YOUR_SECURE_PASSWORD_FROM_ABOVE';"
```

4. **Set correct permissions:**

```bash
sudo chown deploy:www-data /srv/sites/chienstreats/shared/.env.*
sudo chmod 640 /srv/sites/chienstreats/shared/.env.*
```

### Step 3: Install Nginx Configuration

```bash
# Copy Nginx site config
sudo cp /root/MotherWebsite/chien-treats/deployment/nginx/chienstreats.conf /etc/nginx/sites-available/

# Enable site
sudo ln -s /etc/nginx/sites-available/chienstreats.conf /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Note: Don't reload yet - need TLS certificates first
```

### Step 4: Install Systemd Services

```bash
# Copy service files
sudo cp /root/MotherWebsite/chien-treats/deployment/systemd/chienstreats-frontend.service /etc/systemd/system/
sudo cp /root/MotherWebsite/chien-treats/deployment/systemd/chienstreats-api.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Note: Don't start services yet - no code deployed
```

---

## DNS & Cloudflare Configuration

### Current DNS State (Before Changes)

From Cloudflare zone export:
```
chienstreats.com.    1    IN    A    109.205.180.240  ; cf_tags=cf-proxied:true
www.chienstreats.com.    1    IN    CNAME    chienstreats.com.  ; cf_tags=cf-proxied:true
```

**Status:** Already correctly configured! ✅

### Verification Steps

1. **Check DNS propagation:**

```bash
# From your local machine
nslookup chienstreats.com
nslookup www.chienstreats.com

# Should resolve to 109.205.180.240 (may show Cloudflare IPs)
```

2. **Verify Cloudflare proxy status:**

- Go to https://dash.cloudflare.com/
- Select `chienstreats.com` domain
- Navigate to DNS → Records
- Ensure both records show **orange cloud** (Proxied)

### Cloudflare SSL/TLS Settings

1. **Navigate to SSL/TLS settings:**
   - https://dash.cloudflare.com/ → `chienstreats.com` → SSL/TLS

2. **Set encryption mode to "Full (strict)":**
   - Overview → SSL/TLS encryption mode → **Full (strict)**
   - This requires a valid TLS certificate on the origin server

3. **Enable "Always Use HTTPS":**
   - Edge Certificates → Always Use HTTPS → **On**

4. **Configure HSTS (after testing):**
   - Edge Certificates → HTTP Strict Transport Security (HSTS)
   - Enable HSTS → **On**
   - Max Age: 6 months
   - Apply to subdomains: **Yes**
   - Preload: **No** (optional, can enable later)

5. **Minimum TLS Version:**
   - Edge Certificates → Minimum TLS Version → **TLS 1.2**

### Legacy Record Cleanup

The zone export shows NS records for `ns21/ns22.domaincontrol.com`. These appear to be legacy GoDaddy records. If you're fully on Cloudflare:

1. Remove any NS records other than Cloudflare's assigned nameservers
2. Keep `_domainconnect` record only if actively using GoDaddy's DomainConnect feature

---

## First Deployment

### Obtain TLS Certificates (Let's Encrypt)

**Important:** Do this BEFORE deploying the application, but AFTER DNS points to the VPS.

```bash
# On VPS, run as root
sudo certbot certonly --nginx -d chienstreats.com -d www.chienstreats.com --email admin@chienstreats.com --agree-tos --no-eff-email

# Verify certificates
sudo ls -la /etc/letsencrypt/live/chienstreats.com/
```

Expected output:
```
cert.pem
chain.pem
fullchain.pem
privkey.pem
```

**Auto-renewal:** Certbot automatically configures a systemd timer:
```bash
sudo systemctl status certbot.timer
```

### Deploy Application

```bash
# Switch to deploy user
sudo su - deploy

# Clone deployment scripts from repo
cd /srv/sites/chienstreats
git clone https://github.com/emlm244/MothersBakingWebsite.git deployment-temp
cp -r deployment-temp/chien-treats/deployment/* ./
rm -rf deployment-temp

# Run first deployment
bash deployment/deploy.sh chienstreats
```

The deploy script will:
1. Clone code from GitHub
2. Install dependencies (`pnpm install --frozen-lockfile --prod`)
3. Build Next.js frontend (`pnpm build`)
4. Build NestJS API (`pnpm api:build`)
5. Generate Prisma client
6. Run database migrations (`prisma migrate deploy`)
7. Seed database (if applicable)
8. Update `current` symlink atomically
9. Restart systemd services
10. Run health checks

**Duration:** ~5-10 minutes

### Enable and Start Services

```bash
# Enable services to start on boot
sudo systemctl enable chienstreats-frontend.service
sudo systemctl enable chienstreats-api.service

# Services should already be running from deploy script
# If not, start them manually:
sudo systemctl start chienstreats-api.service
sudo systemctl start chienstreats-frontend.service

# Check status
sudo systemctl status chienstreats-api.service
sudo systemctl status chienstreats-frontend.service
```

### Reload Nginx

```bash
sudo nginx -t && sudo nginx -s reload
```

### Verify Deployment

```bash
# Test API health
curl http://localhost:3102/healthz
# Expected: {"status":"ok","timestamp":"..."}

# Test frontend
curl http://localhost:3101/
# Expected: HTML content

# Test via Nginx (HTTPS)
curl -I https://chienstreats.com/
# Expected: HTTP/2 200

# Test API via Nginx
curl https://chienstreats.com/api/v1/products
# Expected: JSON product list
```

### Seed Initial Data (Optional)

```bash
cd /srv/sites/chienstreats/current/apps/api
source /srv/sites/chienstreats/shared/.env.api
npx prisma db seed
```

---

## Ongoing Deployments

### Automatic Deployment (CI/CD)

**On every push to `main` branch:**

1. GitHub Actions runs tests (lint, typecheck, unit, API tests)
2. If tests pass, connects to VPS via SSH
3. Runs `deploy.sh` script
4. Zero-downtime restart

**GitHub Actions Secrets Required:**

Go to https://github.com/emlm244/MothersBakingWebsite/settings/secrets/actions

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | `109.205.180.240` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contents of `/home/deploy/.ssh/id_ed25519` (private key) |
| `VPS_SSH_PORT` | `22` (default) |

To get the private key:
```bash
sudo cat /home/deploy/.ssh/id_ed25519
```

### Manual Deployment

```bash
# SSH into VPS
ssh deploy@109.205.180.240

# Run deploy
cd /srv/sites/chienstreats
bash deployment/deploy.sh chienstreats
```

---

## Rollback Procedure

### Automatic Rollback

If GitHub Actions deployment fails, it automatically triggers a rollback to the previous release.

### Manual Rollback

```bash
# SSH as deploy user
ssh deploy@109.205.180.240

# Rollback to previous release
cd /srv/sites/chienstreats
bash deployment/deploy.sh chienstreats rollback
```

This will:
1. Identify the previous release directory
2. Update the `current` symlink
3. Restart services
4. Verify health

**Duration:** ~30 seconds

### Rollback to Specific Release

```bash
# List available releases
ls -lht /srv/sites/chienstreats/releases/

# Manually update symlink
sudo ln -sfn /srv/sites/chienstreats/releases/20250109_103045/chien-treats /srv/sites/chienstreats/current

# Restart services
sudo systemctl restart chienstreats-api.service
sudo systemctl restart chienstreats-frontend.service
```

---

## Health Monitoring

### Service Status

```bash
# Quick status check
sudo systemctl is-active chienstreats-frontend
sudo systemctl is-active chienstreats-api

# Detailed status
sudo systemctl status chienstreats-frontend.service
sudo systemctl status chienstreats-api.service
```

### Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/healthz` | Liveness check (is process alive?) |
| `/readyz` | Readiness check (can handle traffic?) |
| `/metrics` | Prometheus metrics |

```bash
# API health
curl http://localhost:3102/healthz

# Metrics
curl http://localhost:3102/metrics
```

### Log Monitoring

```bash
# Real-time logs
journalctl -u chienstreats-api.service -f
journalctl -u chienstreats-frontend.service -f

# Last 50 lines
journalctl -u chienstreats-api.service -n 50

# Nginx access logs
tail -f /srv/sites/chienstreats/shared/logs/access.log

# Nginx error logs
tail -f /srv/sites/chienstreats/shared/logs/error.log

# Search for errors in API logs
journalctl -u chienstreats-api.service --since "1 hour ago" | grep -i error
```

### Uptime Monitoring (External)

**Recommended:** Set up external uptime monitoring with:
- [UptimeRobot](https://uptimerobot.com/) (free tier)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

Monitor these endpoints:
- `https://chienstreats.com/` (200 OK)
- `https://chienstreats.com/api/v1/products` (200 OK)

Alert channels: Email, Slack, Discord

### Resource Usage

```bash
# CPU and memory
top
htop

# Disk usage
df -h
du -sh /srv/sites/chienstreats/releases/*

# Network connections
sudo netstat -tulpn | grep -E ':(80|443|3101|3102)'
```

---

## Log Management

### Log Locations

| Log Type | Path |
|----------|------|
| Frontend (systemd) | `journalctl -u chienstreats-frontend` |
| API (systemd) | `journalctl -u chienstreats-api` |
| Nginx access | `/srv/sites/chienstreats/shared/logs/access.log` |
| Nginx error | `/srv/sites/chienstreats/shared/logs/error.log` |
| PostgreSQL | `/var/log/postgresql/` |

### Log Rotation

Configured via `/etc/logrotate.d/chienstreats`:

- **Nginx logs:** Rotated daily, kept for 14 days, compressed
- **Journald logs:** Max size 500MB system, 100MB runtime

Manual rotation:
```bash
sudo logrotate -f /etc/logrotate.d/chienstreats
sudo journalctl --vacuum-size=500M
```

### Viewing Logs

```bash
# API errors in last hour
journalctl -u chienstreats-api --since "1 hour ago" --priority err

# Frontend logs with timestamps
journalctl -u chienstreats-frontend -o short-iso -n 100

# Nginx 5xx errors
grep " 5[0-9][0-9] " /srv/sites/chienstreats/shared/logs/access.log | tail -20

# Rate limit hits
grep "limiting requests" /srv/sites/chienstreats/shared/logs/error.log
```

---

## Backup & Restore

### What to Back Up

1. **Database** (critical)
2. **Uploaded files** (`/srv/sites/chienstreats/shared/uploads/`)
3. **Environment files** (`/srv/sites/chienstreats/shared/.env.*`)
4. **Nginx configs** (`/etc/nginx/sites-available/`)
5. **TLS certificates** (`/etc/letsencrypt/`)

### Database Backup

```bash
# Create backup directory
sudo mkdir -p /srv/backups/chienstreats

# Backup database
sudo -u postgres pg_dump chiens_prod | gzip > /srv/backups/chienstreats/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Automated daily backup (add to crontab)
sudo crontab -e
# Add:
0 2 * * * /usr/bin/pg_dump -U postgres chiens_prod | gzip > /srv/backups/chienstreats/db_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Restore Database

```bash
# Stop API to prevent writes
sudo systemctl stop chienstreats-api

# Restore from backup
gunzip < /srv/backups/chienstreats/db_20250109_020000.sql.gz | sudo -u postgres psql chiens_prod

# Restart API
sudo systemctl start chienstreats-api
```

### File Backup

```bash
# Backup uploads
sudo tar -czf /srv/backups/chienstreats/uploads_$(date +%Y%m%d).tar.gz \
  /srv/sites/chienstreats/shared/uploads/

# Backup environment files (sensitive!)
sudo tar -czf /srv/backups/chienstreats/env_$(date +%Y%m%d).tar.gz \
  /srv/sites/chienstreats/shared/.env.*
```

### Off-site Backup

**Recommended:** Use `rclone` to sync backups to cloud storage (S3, Google Drive, Backblaze B2).

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status chienstreats-api.service

# View full logs
journalctl -u chienstreats-api.service -n 100 --no-pager

# Common issues:
# 1. Port already in use
sudo lsof -i :3102

# 2. Database connection failed
psql -U chiens_app -d chiens_prod -h localhost
# If this fails, check DATABASE_URL in .env.api

# 3. Missing dependencies
cd /srv/sites/chienstreats/current
pnpm install

# 4. Prisma client not generated
cd /srv/sites/chienstreats/current/apps/api
npx prisma generate
```

### 502 Bad Gateway

Nginx can't reach backend. Check:

```bash
# Is API running?
sudo systemctl status chienstreats-api

# Is API listening on correct port?
sudo lsof -i :3102

# Test API directly
curl http://localhost:3102/healthz

# Check Nginx error log
tail -f /srv/sites/chienstreats/shared/logs/error.log
```

### 504 Gateway Timeout

Backend is slow or hung. Check:

```bash
# API logs for errors
journalctl -u chienstreats-api -n 100

# Database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# CPU/memory usage
top
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U chiens_app -d chiens_prod -h localhost

# Check connection limit
sudo -u postgres psql -c "SHOW max_connections;"

# View active connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Find large directories
du -sh /srv/sites/chienstreats/releases/*

# Clean old releases manually
rm -rf /srv/sites/chienstreats/releases/20250101_*

# Clean package manager cache
pnpm store prune
```

### High CPU/Memory Usage

```bash
# Identify process
top
htop

# Restart service
sudo systemctl restart chienstreats-api

# Review recent changes
cd /srv/sites/chienstreats/current
git log -5
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test HTTPS
curl -I https://chienstreats.com/

# Check Cloudflare SSL mode
# Must be "Full (strict)" with valid origin cert
```

---

## Security Maintenance

### Regular Updates

```bash
# Update system packages (automatic via unattended-upgrades)
sudo apt update && sudo apt upgrade -y

# Update Node.js/pnpm
sudo npm install -g pnpm@latest

# Check for security advisories
pnpm audit --audit-level=high
```

### SSH Hardening (After Deploy Key Setup)

```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no

# Reload SSH
sudo systemctl reload sshd
```

### Firewall Status

```bash
# Check firewall rules
sudo ufw status verbose

# Should show:
# 22/tcp (SSH) - ALLOW
# 80/tcp (HTTP) - ALLOW
# 443/tcp (HTTPS) - ALLOW
```

### Fail2ban Status

```bash
# Check banned IPs
sudo fail2ban-client status sshd
sudo fail2ban-client status nginx-http-auth

# Unban an IP
sudo fail2ban-client set sshd unbanip 1.2.3.4
```

### Certificate Renewal

Certbot auto-renews via systemd timer. Verify:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## Adding a Second Site

The infrastructure is designed for multi-site hosting. To add a second site:

### 1. Create Site Structure

```bash
sudo mkdir -p /srv/sites/secondsite/{releases,shared/{logs,uploads}}
sudo chown -R deploy:www-data /srv/sites/secondsite
```

### 2. Create Environment Files

```bash
sudo cp /srv/sites/chienstreats/shared/.env.frontend /srv/sites/secondsite/shared/.env.frontend
sudo cp /srv/sites/chienstreats/shared/.env.api /srv/sites/secondsite/shared/.env.api

# Edit with site-specific values
sudo nano /srv/sites/secondsite/shared/.env.frontend
sudo nano /srv/sites/secondsite/shared/.env.api
```

**Key changes:**
- `PORT`: Use 3201 (frontend), 3202 (API)
- `DATABASE_URL`: Create new DB (`secondsite_prod`)
- All secrets should be unique per site

### 3. Create Nginx Config

```bash
sudo cp /etc/nginx/sites-available/chienstreats.conf /etc/nginx/sites-available/secondsite.conf
sudo nano /etc/nginx/sites-available/secondsite.conf

# Update:
# - server_name to secondsite.com
# - upstream ports to 3201, 3202
# - log paths to /srv/sites/secondsite/shared/logs/
# - TLS certificate paths

# Enable site
sudo ln -s /etc/nginx/sites-available/secondsite.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

### 4. Create Systemd Services

```bash
sudo cp /etc/systemd/system/chienstreats-frontend.service /etc/systemd/system/secondsite-frontend.service
sudo cp /etc/systemd/system/chienstreats-api.service /etc/systemd/system/secondsite-api.service

# Edit each file:
sudo nano /etc/systemd/system/secondsite-frontend.service
# Update:
# - Description
# - WorkingDirectory to /srv/sites/secondsite/current
# - EnvironmentFile to /srv/sites/secondsite/shared/.env.frontend
# - SyslogIdentifier to secondsite-frontend

sudo systemctl daemon-reload
sudo systemctl enable secondsite-frontend secondsite-api
```

### 5. Deploy Second Site

```bash
# Use same deploy script with different site name
bash deployment/deploy.sh secondsite
```

### 6. DNS Configuration

- Add A record: `secondsite.com` → `109.205.180.240` (Proxied)
- Add CNAME: `www.secondsite.com` → `secondsite.com` (Proxied)

### 7. Obtain TLS Certificates

```bash
sudo certbot certonly --nginx -d secondsite.com -d www.secondsite.com
```

---

## Emergency Contacts

- **VPS Provider:** [Provider Name] - [Support URL]
- **Domain Registrar:** Cloudflare - https://dash.cloudflare.com/
- **On-call Engineer:** [Contact Info]

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-09 | 1.0 | Initial production runbook |

---

**End of Runbook**
