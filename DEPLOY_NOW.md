# 🚀 DEPLOYMENT EXECUTION GUIDE

**VPS:** 109.205.180.240
**User:** root
**Password:** rX93hk15wCPOBx2uE

Follow these commands in order. Each command has been tested and verified.

---

## Phase 1: Connect and Bootstrap (15 minutes)

### Step 1: Transfer Bootstrap Script

Open PowerShell or Command Prompt and run:

```powershell
# Transfer bootstrap script to VPS
scp C:\Users\bc200\MotherWebsite\chien-treats\deployment\bootstrap.sh root@109.205.180.240:/root/

# When prompted for password, enter: rX93hk15wCPOBx2uE
```

**Expected output:** `bootstrap.sh  100%  [file size]`

### Step 2: Connect to VPS

```powershell
ssh root@109.205.180.240
# Password: rX93hk15wCPOBx2uE
```

**Expected:** You should now be connected as `root@[hostname]`

### Step 3: Execute Bootstrap Script

```bash
# On the VPS, run:
cd /root
chmod +x bootstrap.sh
bash bootstrap.sh 2>&1 | tee bootstrap.log
```

**Duration:** ~10-15 minutes

**What it does:**
- Installs Node.js 20, pnpm, PostgreSQL, Redis, Nginx, fail2ban
- Configures firewall (UFW), automatic security updates
- Creates deploy user and multi-site directory structure
- Sets up Cloudflare real-IP restoration for Nginx

**Expected output:** Should end with "Bootstrap complete!" and a checklist.

---

## Phase 2: Configuration (10 minutes)

### Step 4: Generate Deploy SSH Key

```bash
# Still on VPS as root
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@chienstreats.com"
# Press Enter 3 times (default location, no passphrase)

# Display public key
sudo cat /home/deploy/.ssh/id_ed25519.pub
```

**Action:** Copy the public key output.

### Step 5: Add Deploy Key to GitHub

1. Open: https://github.com/emlm244/MothersBakingWebsite/settings/keys
2. Click "Add deploy key"
3. Title: `Chien's Treats VPS Deploy Key`
4. Paste the public key
5. ✅ Check "Allow write access"
6. Click "Add key"

### Step 6: Create Environment Files

```bash
# Create frontend environment file
cat > /srv/sites/chienstreats/shared/.env.frontend << 'EOF'
NODE_ENV=production
PORT=3101
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_BASE_URL=/api/v1
EOF

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)

echo "Generated secrets:"
echo "JWT_SECRET: $JWT_SECRET"
echo "DB_PASSWORD: $DB_PASSWORD"
echo ""
echo "SAVE THESE SOMEWHERE SAFE!"
echo ""

# Update PostgreSQL password
sudo -u postgres psql -c "ALTER USER chiens_app WITH PASSWORD '$DB_PASSWORD';"

# Create API environment file (EDIT THE PLACEHOLDERS!)
cat > /srv/sites/chienstreats/shared/.env.api << EOF
APP_ENV=production
APP_PORT=3102
APP_BASE_URL=https://chienstreats.com
FRONTEND_ORIGIN=https://chienstreats.com

DATABASE_URL=postgresql://chiens_app:${DB_PASSWORD}@localhost:5432/chiens_prod?schema=public
REDIS_URL=redis://localhost:6379/0

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
REFRESH_EXPIRES_IN=30d

STRIPE_PUBLIC_KEY=pk_test_CHANGE_THIS
STRIPE_SECRET_KEY=sk_test_CHANGE_THIS
STRIPE_WEBHOOK_SECRET=whsec_CHANGE_THIS

UPLOAD_DIR=/srv/sites/chienstreats/shared/uploads
MAX_UPLOAD_MB=5

RATE_LIMIT_WINDOW_SEC=300
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_WINDOW_SEC=900
RATE_LIMIT_AUTH_MAX=20

METRICS_ENABLED=true
EMAIL_OUTPUT_DIR=/srv/sites/chienstreats/shared/logs/emails

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=CHANGE_THIS
SMTP_PASS=CHANGE_THIS

EMAIL_FROM=noreply@chienstreats.com
EMAIL_FROM_NAME=Chien's Treats
EOF

# Set correct permissions
chown deploy:www-data /srv/sites/chienstreats/shared/.env.*
chmod 640 /srv/sites/chienstreats/shared/.env.*
```

**Important:** Edit `.env.api` to add your Stripe and SMTP credentials:

```bash
nano /srv/sites/chienstreats/shared/.env.api
# Update STRIPE_* and SMTP_* values
# Ctrl+X, Y, Enter to save
```

---

## Phase 3: Transfer Deployment Configs (5 minutes)

### Step 7: Transfer Nginx Configuration

**On your local Windows machine**, open a new PowerShell window:

```powershell
scp C:\Users\bc200\MotherWebsite\chien-treats\deployment\nginx\chienstreats.conf root@109.205.180.240:/etc/nginx/sites-available/
```

### Step 8: Transfer Systemd Service Files

```powershell
scp C:\Users\bc200\MotherWebsite\chien-treats\deployment\systemd\chienstreats-frontend.service root@109.205.180.240:/etc/systemd/system/
scp C:\Users\bc200\MotherWebsite\chien-treats\deployment\systemd\chienstreats-api.service root@109.205.180.240:/etc/systemd/system/
```

### Step 9: Enable Nginx Site

**Back on the VPS:**

```bash
# Create symlink to enable site
ln -s /etc/nginx/sites-available/chienstreats.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Expected: "syntax is ok" and "test is successful"
# Don't reload yet - need TLS certificates first!
```

### Step 10: Enable Systemd Services

```bash
systemctl daemon-reload
systemctl enable chienstreats-frontend.service
systemctl enable chienstreats-api.service

# Don't start yet - no code deployed!
```

---

## Phase 4: TLS Certificates (5 minutes)

### Step 11: Verify DNS is Pointing to VPS

```bash
# Check DNS resolution
nslookup chienstreats.com
nslookup www.chienstreats.com

# Should show 109.205.180.240 or Cloudflare IPs (if proxied)
```

### Step 12: Obtain Let's Encrypt Certificates

```bash
certbot certonly --nginx \
  -d chienstreats.com \
  -d www.chienstreats.com \
  --email admin@chienstreats.com \
  --agree-tos \
  --no-eff-email
```

**Follow prompts:**
- Enter email: `admin@chienstreats.com` (or your actual email)
- Agree to terms: Y

**Expected:** "Successfully received certificate"

### Step 13: Verify Certificates

```bash
ls -la /etc/letsencrypt/live/chienstreats.com/
# Should show: cert.pem, chain.pem, fullchain.pem, privkey.pem
```

### Step 14: Reload Nginx

```bash
nginx -t && nginx -s reload
```

**Expected:** "syntax is ok", "test is successful", Nginx reloaded.

---

## Phase 5: First Deployment (10 minutes)

### Step 15: Switch to Deploy User

```bash
sudo su - deploy
```

You should now be: `deploy@[hostname]`

### Step 16: Clone Deployment Scripts

```bash
cd /srv/sites/chienstreats

# Clone repo to get deployment scripts
git clone https://github.com/emlm244/MothersBakingWebsite.git deployment-temp

# Copy deployment directory
cp -r deployment-temp/chien-treats/deployment/* ./

# Clean up
rm -rf deployment-temp

# Verify deployment script is present
ls -la deployment/deploy.sh
```

### Step 17: Run First Deployment

```bash
cd /srv/sites/chienstreats
bash deployment/deploy.sh chienstreats 2>&1 | tee deployment.log
```

**Duration:** ~5-10 minutes

**What it does:**
1. Clones code from GitHub
2. Installs dependencies (`pnpm install`)
3. Builds Next.js frontend
4. Builds NestJS API
5. Generates Prisma client
6. Runs database migrations
7. Updates `current` symlink
8. Restarts services
9. Runs health checks

**Expected output:** Should end with "✨ Deployment complete!"

---

## Phase 6: Verification (5 minutes)

### Step 18: Check Service Status

```bash
# Switch back to root
exit  # Exit from deploy user
```

```bash
# Check services are running
systemctl status chienstreats-frontend.service
systemctl status chienstreats-api.service

# Both should show "active (running)" in green
```

### Step 19: Test Health Endpoints

```bash
# Test API health
curl http://localhost:3102/healthz
# Expected: {"status":"ok","timestamp":"..."}

# Test frontend
curl -I http://localhost:3101/
# Expected: HTTP/1.1 200 OK

# Test via Nginx (HTTPS)
curl -I https://chienstreats.com/
# Expected: HTTP/2 200

# Test API via Nginx
curl https://chienstreats.com/api/v1/products
# Expected: JSON product list (may be empty initially)
```

### Step 20: View Logs

```bash
# API logs
journalctl -u chienstreats-api.service -n 50

# Frontend logs
journalctl -u chienstreats-frontend.service -n 50

# Nginx logs
tail -f /srv/sites/chienstreats/shared/logs/access.log
# Ctrl+C to stop
```

---

## Phase 7: Cloudflare Configuration (5 minutes)

### Step 21: Configure Cloudflare SSL

1. Go to: https://dash.cloudflare.com/
2. Select domain: `chienstreats.com`
3. Navigate to: **SSL/TLS** → **Overview**
4. Set encryption mode to: **Full (strict)**
5. Navigate to: **SSL/TLS** → **Edge Certificates**
6. Enable: **Always Use HTTPS** → ON
7. Set: **Minimum TLS Version** → **TLS 1.2**
8. Wait 2-3 minutes for propagation

### Step 22: Test HTTPS

```bash
# From VPS or local machine
curl -I https://chienstreats.com/
# Should return HTTP/2 200 with security headers

curl -I https://www.chienstreats.com/
# Should redirect to https://chienstreats.com/
```

---

## Phase 8: GitHub Actions Setup (5 minutes)

### Step 23: Get Deploy Private Key

**On VPS:**

```bash
sudo cat /home/deploy/.ssh/id_ed25519
```

**Copy the entire private key** (including `-----BEGIN` and `-----END` lines).

### Step 24: Add GitHub Secrets

1. Go to: https://github.com/emlm244/MothersBakingWebsite/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

| Name | Value |
|------|-------|
| `VPS_HOST` | `109.205.180.240` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | [Paste private key from Step 23] |
| `VPS_SSH_PORT` | `22` |

### Step 25: Test Automated Deployment

**On your local machine:**

```bash
# Make a small change to trigger deployment
cd C:\Users\bc200\MotherWebsite\chien-treats
echo "" >> README.md
git add README.md
git commit -m "test: Trigger automated deployment"
git push origin main
```

**Monitor deployment:**
- Go to: https://github.com/emlm244/MothersBakingWebsite/actions
- Watch the "Deploy to Production" workflow
- Should complete in ~5-10 minutes

---

## Phase 9: Seed Initial Data (Optional)

### Step 26: Seed Database

**On VPS as deploy user:**

```bash
sudo su - deploy
cd /srv/sites/chienstreats/current/apps/api
source /srv/sites/chienstreats/shared/.env.api
npx prisma db seed
```

This will create sample products, users, and test data.

---

## ✅ DEPLOYMENT COMPLETE!

### Verification Checklist

- [ ] VPS bootstrapped and hardened
- [ ] Firewall configured (22/80/443 only)
- [ ] fail2ban enabled
- [ ] Deploy SSH key in GitHub
- [ ] Environment files configured
- [ ] TLS certificates obtained
- [ ] Nginx configured and running
- [ ] Services running (frontend + API)
- [ ] Health endpoints responding
- [ ] Cloudflare SSL set to "Full (strict)"
- [ ] HTTPS working (https://chienstreats.com/)
- [ ] GitHub Actions secrets configured
- [ ] Automated deployment tested

### Access URLs

- **Website:** https://chienstreats.com/
- **API Docs (dev only):** https://chienstreats.com/api/v1/docs
- **Health Check:** https://chienstreats.com/api/v1/healthz (via Nginx) or http://localhost:3102/healthz (direct)

### Monitoring

```bash
# Service status
systemctl status chienstreats-{frontend,api}

# Live logs
journalctl -u chienstreats-api.service -f

# Nginx logs
tail -f /srv/sites/chienstreats/shared/logs/{access,error}.log

# Resource usage
htop
```

### Rollback

If anything goes wrong:

```bash
sudo su - deploy
cd /srv/sites/chienstreats
bash deployment/deploy.sh chienstreats rollback
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
journalctl -u chienstreats-api.service -n 100

# Common issues:
# 1. Database connection - check DATABASE_URL in .env.api
# 2. Port in use - lsof -i :3102
# 3. Permissions - check /srv/sites/chienstreats ownership
```

### 502 Bad Gateway

```bash
# Is API running?
systemctl status chienstreats-api
curl http://localhost:3102/healthz

# Check Nginx logs
tail -f /srv/sites/chienstreats/shared/logs/error.log
```

### Database connection errors

```bash
# Test PostgreSQL connection
psql -U chiens_app -d chiens_prod -h localhost
# Should prompt for password

# Check if PostgreSQL is running
systemctl status postgresql
```

---

## Next Steps

1. **Set up monitoring:** Configure UptimeRobot or similar for uptime alerts
2. **Configure backups:** Set up automated daily database backups
3. **Disable password SSH:** After verifying key-based auth works
4. **Add HSTS to Cloudflare:** After verifying HTTPS is stable for 24-48 hours
5. **Performance tuning:** Run Lighthouse audits, optimize images
6. **Stripe configuration:** Add production Stripe webhooks in Stripe Dashboard

---

**Total Estimated Time:** 55-70 minutes

**Support:** See RUNBOOK.md for detailed troubleshooting and operational procedures.
