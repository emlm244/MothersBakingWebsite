#!/usr/bin/env bash
#
# Zero-Downtime Deployment Script for Chien's Treats
# Run as: bash deploy.sh [site-name]
#
# This script:
# 1. Clones/pulls latest code from GitHub
# 2. Creates timestamped release directory
# 3. Installs dependencies and builds
# 4. Runs database migrations
# 5. Updates 'current' symlink atomically
# 6. Restarts services with zero downtime
#

set -euo pipefail

# Configuration
SITE_NAME="${1:-chienstreats}"
SITES_ROOT="/srv/sites"
SITE_DIR="${SITES_ROOT}/${SITE_NAME}"
REPO_URL="https://github.com/emlm244/MothersBakingWebsite.git"
REPO_BRANCH="main"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="${SITE_DIR}/releases/${TIMESTAMP}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $*"; }

# Error handler
error_exit() {
    log_error "$1"
    log_error "Deployment failed. Previous release remains active."
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    if [[ ! -d "${SITE_DIR}" ]]; then
        error_exit "Site directory ${SITE_DIR} does not exist. Run bootstrap.sh first."
    fi

    if [[ ! -f "${SITE_DIR}/shared/.env.frontend" ]] || [[ ! -f "${SITE_DIR}/shared/.env.api" ]]; then
        error_exit "Environment files missing in ${SITE_DIR}/shared/. Copy from deployment/env/*.example and configure."
    fi

    command -v git >/dev/null 2>&1 || error_exit "git not installed"
    command -v node >/dev/null 2>&1 || error_exit "node not installed"
    command -v pnpm >/dev/null 2>&1 || error_exit "pnpm not installed"

    log_info "Prerequisites OK"
}

# Clone or pull repository
fetch_code() {
    log_step "Fetching code from GitHub..."

    mkdir -p "${RELEASE_DIR}"
    cd "${RELEASE_DIR}"

    git clone --depth 1 --branch "${REPO_BRANCH}" "${REPO_URL}" . || error_exit "Failed to clone repository"

    # Navigate to app directory
    cd chien-treats || error_exit "chien-treats directory not found in repo"

    log_info "Code fetched: $(git rev-parse --short HEAD)"
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."

    cd "${RELEASE_DIR}/chien-treats"

    pnpm install --frozen-lockfile --prod || error_exit "Failed to install dependencies"

    log_info "Dependencies installed"
}

# Build application
build_app() {
    log_step "Building application..."

    cd "${RELEASE_DIR}/chien-treats"

    # Build Next.js frontend
    log_info "Building Next.js frontend..."
    pnpm build || error_exit "Frontend build failed"

    # Build API
    log_info "Building NestJS API..."
    pnpm api:build || error_exit "API build failed"

    log_info "Build complete"
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."

    cd "${RELEASE_DIR}/chien-treats"

    # Load API environment
    set -a
    source "${SITE_DIR}/shared/.env.api"
    set +a

    # Generate Prisma client
    cd apps/api
    npx prisma generate || error_exit "Prisma generate failed"

    # Run migrations
    npx prisma migrate deploy || error_exit "Database migration failed"

    log_info "Migrations complete"
}

# Update symlink
update_symlink() {
    log_step "Updating current release symlink..."

    local current_link="${SITE_DIR}/current"
    local temp_link="${SITE_DIR}/current.tmp"

    # Create temporary symlink
    ln -sfn "${RELEASE_DIR}/chien-treats" "${temp_link}"

    # Atomic swap
    mv -Tf "${temp_link}" "${current_link}"

    log_info "Symlink updated to ${RELEASE_DIR}"
}

# Restart services
restart_services() {
    log_step "Restarting services..."

    # Reload systemd
    sudo systemctl daemon-reload

    # Restart API first (backend)
    log_info "Restarting API service..."
    sudo systemctl restart ${SITE_NAME}-api.service

    # Wait for API to be healthy
    log_info "Waiting for API health check..."
    for i in {1..30}; do
        if curl -sf http://localhost:3102/healthz > /dev/null 2>&1; then
            log_info "API is healthy"
            break
        fi
        if [[ $i -eq 30 ]]; then
            error_exit "API failed to start"
        fi
        sleep 1
    done

    # Restart frontend
    log_info "Restarting frontend service..."
    sudo systemctl restart ${SITE_NAME}-frontend.service

    # Wait for frontend
    sleep 3

    log_info "Services restarted"
}

# Cleanup old releases (keep last 5)
cleanup_releases() {
    log_step "Cleaning up old releases..."

    cd "${SITE_DIR}/releases"

    # Count releases
    release_count=$(ls -1 | wc -l)

    if [[ $release_count -gt 5 ]]; then
        # Remove oldest releases, keep last 5
        ls -1t | tail -n +6 | xargs -I {} rm -rf {}
        log_info "Cleaned up $(($release_count - 5)) old releases"
    else
        log_info "Only $release_count releases, no cleanup needed"
    fi
}

# Health check
health_check() {
    log_step "Running health checks..."

    # Check API
    if curl -sf http://localhost:3102/healthz > /dev/null 2>&1; then
        log_info "✓ API health check passed"
    else
        log_warn "✗ API health check failed"
    fi

    # Check frontend
    if curl -sf http://localhost:3101/ > /dev/null 2>&1; then
        log_info "✓ Frontend health check passed"
    else
        log_warn "✗ Frontend health check failed"
    fi

    # Check services
    if systemctl is-active --quiet ${SITE_NAME}-api.service; then
        log_info "✓ API service is active"
    else
        log_warn "✗ API service is not active"
    fi

    if systemctl is-active --quiet ${SITE_NAME}-frontend.service; then
        log_info "✓ Frontend service is active"
    else
        log_warn "✗ Frontend service is not active"
    fi
}

# Main deployment flow
main() {
    log_info "Starting deployment for ${SITE_NAME}"
    log_info "Release: ${TIMESTAMP}"
    echo

    check_prerequisites
    fetch_code
    install_dependencies
    build_app
    run_migrations
    update_symlink
    restart_services
    cleanup_releases
    health_check

    echo
    log_info "✨ Deployment complete!"
    log_info "Release: ${RELEASE_DIR}"
    log_info "Logs:"
    log_info "  - Frontend: journalctl -u ${SITE_NAME}-frontend.service -f"
    log_info "  - API: journalctl -u ${SITE_NAME}-api.service -f"
    log_info "  - Nginx: tail -f ${SITE_DIR}/shared/logs/*.log"
}

# Rollback function (callable separately)
rollback() {
    log_warn "Rolling back to previous release..."

    cd "${SITE_DIR}/releases"

    # Find current release directory
    current_release=$(readlink -f "${SITE_DIR}/current")

    # Find previous release
    previous_release=$(ls -1t | grep -v "$(basename $current_release)" | head -1)

    if [[ -z "${previous_release}" ]]; then
        error_exit "No previous release found"
    fi

    log_info "Rolling back from $(basename $current_release) to ${previous_release}"

    # Update symlink
    ln -sfn "${SITE_DIR}/releases/${previous_release}/chien-treats" "${SITE_DIR}/current.tmp"
    mv -Tf "${SITE_DIR}/current.tmp" "${SITE_DIR}/current"

    # Restart services
    sudo systemctl restart ${SITE_NAME}-api.service
    sudo systemctl restart ${SITE_NAME}-frontend.service

    log_info "Rollback complete"
}

# Handle rollback if requested
if [[ "${2:-}" == "rollback" ]]; then
    rollback
    exit 0
fi

# Run main deployment
main
