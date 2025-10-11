#!/usr/bin/env bash
# Coral Hosts bootstrap script for Ubuntu 22.04+
# Run as root on a fresh VPS

set -euo pipefail

SITE_NAME="coralhosts"
SITE_USER="coralhosts"
SITE_DIR="/srv/sites/${SITE_NAME}"

log() { printf "[%s] %s\n" "$1" "$2"; }

[[ $EUID -eq 0 ]] || { log ERROR "Run as root"; exit 1; }

log INFO "Updating packages"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

log INFO "Installing dependencies"
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl git nginx certbot python3-certbot-nginx ufw logrotate

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm@9
fi

log INFO "Creating service user"
if ! id -u "${SITE_USER}" >/dev/null 2>&1; then
  useradd -r -m -s /usr/sbin/nologin -d "${SITE_DIR}" "${SITE_USER}"
fi

log INFO "Creating directory structure"
mkdir -p "${SITE_DIR}/"{releases,shared/logs,current}
chown -R "${SITE_USER}:${SITE_USER}" "${SITE_DIR}"
chmod 750 "${SITE_DIR}"

log INFO "Configuring firewall"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

log INFO "Bootstrap complete. Upload deployment artifacts and run deploy.sh"
