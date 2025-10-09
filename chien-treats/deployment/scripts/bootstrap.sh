#!/bin/bash
#
# VPS Bootstrap Script for Chien's Treats Multi-Site Production Deployment
# Usage: Run as root on fresh Ubuntu 20.04/22.04 VPS
#   curl -fsSL <url-to-this-script> | bash
# Or:
#   bash bootstrap.sh 2>&1 | tee bootstrap.log
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root"
   exit 1
fi

log_info "=== VPS Bootstrap for Chien's Treats Production Deployment ==="
log_info "Starting at $(date)"

# System update
log_info "Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

# Install core utilities
log_info "Installing core utilities..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    logrotate \
    certbot \
    python3-certbot-nginx \
    htop \
    ntp

# Install Node.js 20.x LTS
log_info "Installing Node.js 20.x LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi
node --version
npm --version

# Install pnpm
log_info "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@9
fi
pnpm --version

# Install PostgreSQL 14
log_info "Installing PostgreSQL 14..."
if ! command -v psql &> /dev/null; then
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-14 postgresql-contrib-14
fi

# Install Redis
log_info "Installing Redis..."
if ! command -v redis-cli &> /dev/null; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq redis-server
    systemctl enable redis-server
    systemctl start redis-server
fi

# Install Nginx
log_info "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx
    systemctl enable nginx
fi

# Create system users for sites
log_info "Creating system users..."
if ! id -u chienstreats &>/dev/null; then
    useradd -r -m -s /bin/bash -d /srv/sites/chienstreats chienstreats
    log_info "Created user: chienstreats"
fi

# Create multi-site directory structure
log_info "Creating multi-site directory structure..."

mkdir -p /srv/sites/chienstreats/{releases,shared/{logs,uploads},current}
chown -R chienstreats:chienstreats /srv/sites/chienstreats

# Placeholder for second site
mkdir -p /srv/sites/second-site-placeholder
touch /srv/sites/second-site-placeholder/README.txt
echo "This directory is reserved for the second site deployment." > /srv/sites/second-site-placeholder/README.txt

log_info "Directory structure created:"
tree -L 3 /srv/sites/ 2>/dev/null || ls -la /srv/sites/

# Configure PostgreSQL
log_info "Configuring PostgreSQL..."
sudo -u postgres psql -c "SELECT 1" &>/dev/null || {
    log_warn "PostgreSQL not ready, waiting..."
    sleep 3
}

# Create database and user for chienstreats
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='chienstreats'" | grep -q 1 || {
    sudo -u postgres psql <<EOF
CREATE USER chienstreats WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE chienstreats OWNER chienstreats;
GRANT ALL PRIVILEGES ON DATABASE chienstreats TO chienstreats;
EOF
    log_info "PostgreSQL database 'chienstreats' created"
    echo "DB_PASSWORD=$DB_PASSWORD" >> /root/.env.chienstreats.secrets
    log_warn "Database password saved to /root/.env.chienstreats.secrets"
}

# Configure firewall (ufw)
log_info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status

# Configure fail2ban
log_info "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sendername = Fail2Ban

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Set timezone
log_info "Setting timezone to UTC..."
timedatectl set-timezone UTC

# Enable automatic security updates
log_info "Enabling automatic security updates..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unattended-upgrades
cat > /etc/apt/apt.conf.d/50unattended-upgrades <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# Create log rotation config for sites
log_info "Configuring log rotation..."
cat > /etc/logrotate.d/chienstreats <<'EOF'
/srv/sites/chienstreats/shared/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 chienstreats chienstreats
    sharedscripts
    postrotate
        systemctl reload chienstreats-frontend >/dev/null 2>&1 || true
        systemctl reload chienstreats-api >/dev/null 2>&1 || true
    endscript
}
EOF

# Generate SSH key for GitHub deployments (if not exists)
if [ ! -f /root/.ssh/id_ed25519 ]; then
    log_info "Generating SSH key for deployments..."
    ssh-keygen -t ed25519 -C "deploy@chienstreats-vps" -f /root/.ssh/id_ed25519 -N ""
    log_warn "Add this public key to GitHub as a deploy key:"
    cat /root/.ssh/id_ed25519.pub
fi

# Create deployment helper scripts
log_info "Creating deployment helper scripts..."

cat > /usr/local/bin/chienstreats-deploy <<'DEPLOYSCRIPT'
#!/bin/bash
# Quick deployment helper for chienstreats
set -e

SITE_DIR=/srv/sites/chienstreats
REPO_URL=${1:-https://github.com/emlm244/MothersBakingWebsite.git}
BRANCH=${2:-main}

echo "Deploying chienstreats from $REPO_URL ($BRANCH)..."

RELEASE_DIR="$SITE_DIR/releases/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RELEASE_DIR"

cd "$RELEASE_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" .

cd chien-treats
pnpm install --frozen-lockfile --prod
pnpm build
pnpm api:build
cd apps/api && npx prisma migrate deploy && cd ../..

# Symlink shared resources
ln -sf "$SITE_DIR/shared/.env" "$RELEASE_DIR/chien-treats/.env"
ln -sf "$SITE_DIR/shared/.env" "$RELEASE_DIR/chien-treats/apps/api/.env"
ln -sf "$SITE_DIR/shared/uploads" "$RELEASE_DIR/chien-treats/uploads"

# Update current symlink
ln -sfn "$RELEASE_DIR/chien-treats" "$SITE_DIR/current"

# Restart services
systemctl restart chienstreats-frontend
systemctl restart chienstreats-api

echo "Deployment complete! Release: $RELEASE_DIR"
echo "Current: $SITE_DIR/current -> $(readlink $SITE_DIR/current)"
DEPLOYSCRIPT

chmod +x /usr/local/bin/chienstreats-deploy

# Summary
log_info "=== Bootstrap Complete ==="
log_info "Node.js: $(node --version)"
log_info "pnpm: $(pnpm --version)"
log_info "PostgreSQL: $(psql --version | head -n1)"
log_info "Redis: $(redis-cli --version)"
log_info "Nginx: $(nginx -v 2>&1)"
log_info ""
log_info "Next steps:"
log_info "1. Create /srv/sites/chienstreats/shared/.env with production config"
log_info "2. Upload Nginx site configs to /etc/nginx/sites-available/"
log_info "3. Upload systemd service files to /etc/systemd/system/"
log_info "4. Run: chienstreats-deploy"
log_info "5. Configure SSL: certbot --nginx -d chienstreats.com -d www.chienstreats.com"
log_info ""
log_warn "IMPORTANT: Database credentials saved to /root/.env.chienstreats.secrets"
log_warn "SSH public key for GitHub deploy key:"
cat /root/.ssh/id_ed25519.pub || true
