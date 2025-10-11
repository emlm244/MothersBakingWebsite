#!/usr/bin/env bash
# Coral Hosts deployment script
# Usage: bash deploy.sh [site-name]

set -euo pipefail

SITE_NAME="${1:-coralhosts}"
SITES_ROOT="/srv/sites"
SITE_DIR="${SITES_ROOT}/${SITE_NAME}"
REPO_URL="https://github.com/emlm244/MothersBakingWebsite.git"
REPO_BRANCH="main"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${SITE_DIR}/releases/${TIMESTAMP}"
APP_DIR="${RELEASE_DIR}/chien-treats"

log() {
  printf "[%s] %s\n" "$1" "$2"
}

abort() {
  log ERROR "$1"
  exit 1
}

[[ -d "${SITE_DIR}" ]] || abort "Site directory ${SITE_DIR} not found. Bootstrap first."
[[ -f "${SITE_DIR}/shared/.env" ]] || abort "Missing ${SITE_DIR}/shared/.env"

command -v git >/dev/null 2>&1 || abort "git not installed"
command -v pnpm >/dev/null 2>&1 || abort "pnpm not installed"
command -v node >/dev/null 2>&1 || abort "node not installed"

log INFO "Creating release directory ${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}"
cd "${RELEASE_DIR}"

log INFO "Cloning repository"
git clone --depth 1 --branch "${REPO_BRANCH}" "${REPO_URL}" . >/dev/null 2>&1 || abort "git clone failed"
cd chien-treats

log INFO "Installing dependencies"
pnpm install --frozen-lockfile >/dev/null || abort "pnpm install failed"

log INFO "Linking environment file"
ln -sf "${SITE_DIR}/shared/.env" .env.local

log INFO "Building Next.js static output"
pnpm build >/dev/null || abort "pnpm build failed"

log INFO "Switching current symlink"
ln -sfn "${APP_DIR}" "${SITE_DIR}/current.tmp"
mv -Tf "${SITE_DIR}/current.tmp" "${SITE_DIR}/current"

log INFO "Restarting frontend service"
sudo systemctl restart ${SITE_NAME}-frontend.service

log INFO "Cleaning old releases"
cd "${SITE_DIR}/releases"
ls -1t | tail -n +6 | xargs -r rm -rf

log INFO "Deployment complete: ${RELEASE_DIR}"
