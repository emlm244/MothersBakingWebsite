#!/usr/bin/env bash
#
# VPS Bootstrap Script for Chien's Treats (Multi-Site Ready)
# Run as root on fresh Ubuntu/Debian VPS
#
# Usage: bash bootstrap.sh
#

set -euo pipefail

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

log_info "Starting VPS bootstrap for Chien's Treats..."

# Update system
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install core tools
log_info "Installing core tools..."
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    logrotate \
    build-essential \
    certbot \
    python3-certbot-nginx \
    nginx \
    postgresql \
    postgresql-contrib \
    redis-server \
    unattended-upgrades \
    apt-listchanges

# Configure automatic security updates
log_info "Configuring automatic security updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Install Node.js LTS (v20)
log_info "Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install pnpm
log_info "Installing pnpm..."
npm install -g pnpm@9

# Verify installations
log_info "Verifying installations..."
node --version
pnpm --version
nginx -v
psql --version

# Configure timezone
log_info "Setting timezone to UTC..."
timedatectl set-timezone UTC

# Configure firewall
log_info "Configuring firewall (ufw)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose

# Configure fail2ban
log_info "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
destemail = admin@chienstreats.com
sendername = Fail2Ban

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Create multi-site directory structure
log_info "Creating multi-site directory structure..."
mkdir -p /srv/sites/chienstreats/{releases,shared/{logs,uploads}}
mkdir -p /srv/sites/_placeholder

# Create deploy user
log_info "Creating deploy user..."
if ! id -u deploy &>/dev/null; then
    useradd -m -s /bin/bash deploy
    usermod -aG www-data deploy
fi

# Set permissions
chown -R deploy:www-data /srv/sites
chmod -R 755 /srv/sites

# Configure PostgreSQL
log_info "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE USER chiens_app WITH PASSWORD 'CHANGEME';" || true
sudo -u postgres psql -c "CREATE DATABASE chiens_prod OWNER chiens_app;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chiens_prod TO chiens_app;" || true

# Configure Redis
log_info "Configuring Redis..."
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl restart redis-server

# Create Cloudflare real-IP restoration config for Nginx
log_info "Configuring Nginx for Cloudflare..."
cat > /etc/nginx/conf.d/cloudflare-realip.conf <<'EOF'
# Cloudflare IP ranges for real_ip restoration
# Updated: 2025-01-01
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

real_ip_header CF-Connecting-IP;
real_ip_recursive on;
EOF

# Configure logrotate for multi-site
log_info "Configuring logrotate..."
cat > /etc/logrotate.d/chienstreats <<'EOF'
/srv/sites/*/shared/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Tune system limits for Node.js
log_info "Tuning system limits..."
cat >> /etc/security/limits.conf <<'EOF'
deploy soft nofile 65536
deploy hard nofile 65536
EOF

# Configure journald limits
log_info "Configuring journald limits..."
mkdir -p /etc/systemd/journald.conf.d
cat > /etc/systemd/journald.conf.d/size-limit.conf <<'EOF'
[Journal]
SystemMaxUse=500M
RuntimeMaxUse=100M
EOF
systemctl restart systemd-journald

log_info "Bootstrap complete!"
log_info ""
log_info "Next steps:"
log_info "1. Generate SSH key for deploy user: sudo -u deploy ssh-keygen -t ed25519"
log_info "2. Add deploy key to GitHub repo"
log_info "3. Update PostgreSQL password in /srv/sites/chienstreats/shared/.env"
log_info "4. Run deploy script to install the application"
log_info "5. Configure DNS to point to this server"
log_info "6. Obtain Let's Encrypt certificates"
log_info ""
log_info "Security checklist:"
log_info "  [x] Firewall configured (22, 80, 443)"
log_info "  [x] Fail2ban enabled"
log_info "  [x] Automatic security updates enabled"
log_info "  [ ] SSH key authentication (do this manually)"
log_info "  [ ] Disable SSH password auth after key setup"
log_info "  [ ] Change PostgreSQL password"
