# VPS Multi-Site Architecture Reference
**Last Updated:** 2025-10-09
**VPS IP:** 109.205.180.240
**Operating System:** Ubuntu 24.04 LTS
**Purpose:** Multi-tenant web hosting with complete site isolation

---

## Table of Contents
1. [Overview & Philosophy](#overview--philosophy)
2. [Architectural Design Principles](#architectural-design-principles)
3. [System Infrastructure](#system-infrastructure)
4. [Multi-Site Isolation Model](#multi-site-isolation-model)
5. [Filesystem Architecture](#filesystem-architecture)
6. [Network & Port Architecture](#network--port-architecture)
7. [Process Isolation (systemd Services)](#process-isolation-systemd-services)
8. [Database Architecture](#database-architecture)
9. [Web Server (Nginx) Architecture](#web-server-nginx-architecture)
10. [Security Model](#security-model)
11. [Logging Architecture](#logging-architecture)
12. [Deployment Model](#deployment-model)
13. [Resource Allocation & Limits](#resource-allocation--limits)
14. [**ACTIVE SITES REGISTRY** (Editable)](#active-sites-registry-editable)
15. [Common Questions & Architecture Decisions](#common-questions--architecture-decisions)

---

## Overview & Philosophy

This VPS is architected as a **multi-tenant hosting platform** where multiple independent websites coexist on the same physical server without interfering with each other. Each website is treated as a completely isolated tenant with its own resources, processes, users, databases, and configurations.

### What This Is NOT

This is **not** a shared hosting environment where sites share processes or resources. This is **not** a containerized environment using Docker or Kubernetes. This is **not** a virtual machine host running multiple VMs.

### What This IS

This **is** a single-server multi-site architecture using Unix user isolation, systemd service management, dedicated network ports, and Nginx reverse proxying to achieve complete logical separation between sites. Each site operates as if it were the only site on the server, with dedicated resources and zero awareness of other sites.

### Design Goals

1. **Complete Isolation**: One site's failure cannot affect another site
2. **Resource Transparency**: Each site's resource usage is independently measurable
3. **Security Boundaries**: Compromising one site does not grant access to others
4. **Developer Independence**: Developers can work on their site without knowledge of other sites
5. **Operations Simplicity**: Standard Linux tools (systemd, nginx, postgres) without added complexity
6. **Scalability**: Adding a new site follows a repeatable pattern
7. **Professional Standards**: Production-grade setup suitable for customer-facing applications

---

## Architectural Design Principles

### 1. Unix User Isolation

Each website runs under its own dedicated Unix user account. This user:
- Has a home directory at `/srv/sites/<sitename>/`
- Has `nologin` shell (cannot SSH in)
- Has UID/GID unique to that site
- Owns all files related to that site
- Runs all processes for that site

**Why:** Unix filesystem permissions provide kernel-level access control. A process running as `user_A` literally cannot read files owned by `user_B` with `0600` permissions. This is enforced by the operating system kernel, not application logic.

### 2. Port Isolation

Each website binds to unique TCP ports that are:
- Not exposed to the public internet
- Only accessible via localhost (127.0.0.1)
- Reverse-proxied by Nginx on ports 80/443

**Why:** This allows multiple Node.js/Python/Ruby applications to run simultaneously without port conflicts. All bind to `127.0.0.1:PORT` so they're not directly accessible from outside the server.

### 3. Service Isolation (systemd)

Each website component (frontend, API) is a separate systemd service unit:
- Has its own service file in `/etc/systemd/system/`
- Can be started/stopped/restarted independently
- Has its own restart policies and failure handling
- Generates its own logs via `journald`

**Why:** systemd provides process supervision, automatic restarts, dependency management, and resource control (via cgroups). Each service is a first-class system component.

### 4. Database Isolation

Each website has its own PostgreSQL database and database user:
- Database name matches site name
- Database user has access only to that database
- No shared tables or schemas between sites

**Why:** Database-level isolation prevents SQL injection or application bugs in one site from affecting another site's data. Each database is logically independent.

### 5. Reverse Proxy Isolation (Nginx)

Nginx acts as a reverse proxy, routing requests based on:
- Domain name (Host header)
- URL path (location blocks)

Each site has its own Nginx configuration file that:
- Defines upstream servers (backend ports)
- Routes requests to the correct backend
- Applies site-specific rate limiting, caching, and security rules

**Why:** This provides a single public-facing entry point (ports 80/443) while allowing unlimited internal services. Nginx handles SSL termination, static asset serving, and request routing.

### 6. Zero-Dependency Between Sites

Sites do not:
- Share code or libraries
- Share environment variables
- Share database connections
- Share Redis instances
- Share file uploads directories
- Share log files
- Share SSL certificates

**Why:** This ensures that updating one site's dependencies, changing one site's configuration, or restarting one site's services has zero impact on other sites.

---

## System Infrastructure

### Installed Software Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | v20.19.5 | JavaScript runtime for Next.js/NestJS applications |
| **pnpm** | 9.15.9 | Package manager (faster than npm, disk-efficient) |
| **PostgreSQL** | 14.19 | Relational database system |
| **Redis** | 7.0.15 | In-memory data store (caching, sessions) |
| **Nginx** | 1.24.0 | Reverse proxy & web server |
| **UFW** | (latest) | Uncomplicated Firewall |
| **fail2ban** | 1.0.2 | Intrusion prevention (bans IPs after failed attempts) |
| **certbot** | (latest) | Let's Encrypt SSL certificate manager |
| **logrotate** | (latest) | Log rotation and compression |
| **unattended-upgrades** | (latest) | Automatic security updates |

### System Users

| User | UID | Shell | Purpose |
|------|-----|-------|---------|
| `root` | 0 | `/bin/bash` | System administration (SSH key-only) |
| `deploy` | 1000 | `/bin/bash` | Deployment operations (has passwordless sudo) |
| `chienstreats` | 1001 | `/sbin/nologin` | Runs Chien's Treats site processes |
| `secondsite` | 1002 | `/sbin/nologin` | Reserved for second site |

**Note:** Site users have `nologin` shell, meaning they cannot be used for SSH login. They exist purely to run processes and own files.

### Network Configuration

- **External IP:** 109.205.180.240
- **Firewall (UFW):**
  - Port 22 (SSH): Open
  - Port 80 (HTTP): Open
  - Port 443 (HTTPS): Open
  - All other ports: Blocked by default
- **Internal Services:**
  - PostgreSQL: `localhost:5432` (not exposed externally)
  - Redis: `localhost:6379` (not exposed externally)
  - Site backends: `127.0.0.1:310x`, `127.0.0.1:400x` (not exposed externally)

**Why:** Only Nginx is exposed to the internet. All backend services are localhost-only, preventing direct external access.

---

## Multi-Site Isolation Model

### Isolation Layers

Each site is isolated at **six distinct layers**:

1. **Filesystem Isolation**: Unix user ownership and permissions
2. **Process Isolation**: Separate systemd services running as different users
3. **Network Isolation**: Unique port assignments
4. **Database Isolation**: Separate PostgreSQL databases and users
5. **Configuration Isolation**: Independent environment files (`.env`)
6. **Log Isolation**: Separate log directories

### How Isolation Prevents Cross-Site Impact

| Scenario | Isolation Mechanism | Result |
|----------|---------------------|--------|
| Site A crashes due to out-of-memory | Process isolation (systemd) | Site B continues running normally |
| Site A's database is corrupted | Database isolation | Site B's database is unaffected |
| Site A's developer makes a breaking code change | User/filesystem isolation | Site B's code is unchanged |
| Site A is under DDoS attack | Nginx rate limiting (per-site) | Site B can implement different rate limits |
| Site A's SSL certificate expires | Certificate isolation | Site B's SSL is independent |
| Site A has a security vulnerability | User isolation | Attacker gains access only to Site A's files/data |
| Site A's logs fill the disk | Log isolation (logrotate per-site) | Site B's logs are separate and managed independently |
| Site A needs to restart | Service isolation | `systemctl restart siteA-frontend` does not affect Site B |

### Resource Sharing (What IS Shared)

The following resources **are** shared between sites and must be considered:

1. **CPU Time**: All sites compete for CPU cycles (no hard limits by default)
2. **RAM**: All sites share the same physical memory pool
3. **Disk I/O**: All sites share the same storage device
4. **Network Bandwidth**: All sites share the same network interface
5. **PostgreSQL Connections**: Global connection pool (default 100 connections)
6. **System Load**: One site's high load can affect server responsiveness for all sites

**Note:** systemd service files can be configured with `MemoryLimit`, `CPUQuota`, etc., to impose hard limits on resource usage. This is not currently configured but is available if needed.

---

## Filesystem Architecture

### Directory Structure Standard

Every site follows this exact structure:

```
/srv/sites/<sitename>/
├── releases/
│   ├── 20251009_121725/          # Timestamped release directory
│   │   └── <git-repo-contents>   # Full clone of site's repository
│   ├── 20251008_143022/          # Previous release (for rollback)
│   └── ...                       # Keep last 5 releases
├── shared/
│   ├── .env                      # Production environment variables (chmod 600)
│   ├── logs/                     # Site-specific logs
│   │   ├── frontend.log
│   │   ├── frontend-error.log
│   │   ├── api.log
│   │   ├── api-error.log
│   │   ├── nginx-access.log
│   │   └── nginx-error.log
│   └── uploads/                  # User-uploaded files (persistent across deployments)
└── current -> releases/20251009_121725/  # Symlink to active release
```

### Why This Structure?

- **releases/**: Atomic deployments. Deploy to new directory, then change symlink.
- **shared/**: Data that persists across deployments (configs, uploads, logs)
- **current**: Symlink allows instant rollback: `ln -sfn releases/<old> current`

### File Ownership Pattern

```bash
# All site files owned by site user
/srv/sites/chienstreats/           # drwxr-x--- chienstreats:chienstreats
/srv/sites/chienstreats/releases/  # drwxr-xr-x chienstreats:chienstreats
/srv/sites/chienstreats/shared/    # drwxr-xr-x chienstreats:chienstreats
/srv/sites/chienstreats/shared/.env  # -rw------- chienstreats:chienstreats (600)
```

**Why 600 on .env?** Prevents any user except the owner (and root) from reading secrets.

### Disk Space Allocation

- **No hard quotas by default**: Sites share the same filesystem
- **Monitoring**: Use `du -sh /srv/sites/*` to see per-site disk usage
- **Cleanup**: Old releases are auto-deleted (keep last 5) during deployments

---

## Network & Port Architecture

### Port Allocation Scheme

Ports are allocated in **blocks of 10** per site to allow for future expansion:

| Port Range | Usage | Current Allocation |
|------------|-------|-------------------|
| **3100-3109** | Site #1 Frontend Instances | 3101: Chien's Treats frontend |
| **3110-3119** | Site #2 Frontend Instances | Reserved (secondsite) |
| **3120-3129** | Site #3 Frontend Instances | Available |
| **4000-4009** | Site #1 API Instances | 4000: Chien's Treats API |
| **4010-4019** | Site #2 API Instances | Reserved (secondsite) |
| **4020-4029** | Site #3 API Instances | Available |
| **5000-5009** | Site #1 Additional Services | Available |
| **5010-5019** | Site #2 Additional Services | Available |

**Why blocks of 10?** Allows each site to run multiple instances (e.g., multiple frontend workers) if needed for load balancing.

### Localhost Binding

All application ports bind to `127.0.0.1:PORT`, not `0.0.0.0:PORT`.

**Example:**
```javascript
// Correct
app.listen(3101, '127.0.0.1', () => { ... });

// Incorrect (exposes port to internet if firewall misconfigured)
app.listen(3101, '0.0.0.0', () => { ... });
```

**Why:** Defense in depth. Even if UFW is misconfigured, applications are not directly accessible from the internet.

### Nginx Upstream Configuration

Nginx is configured with upstream blocks for each backend:

```nginx
upstream chienstreats_frontend {
    server 127.0.0.1:3101 fail_timeout=10s max_fails=3;
    keepalive 32;
}

upstream chienstreats_api {
    server 127.0.0.1:4000 fail_timeout=10s max_fails=3;
    keepalive 32;
}
```

**Why:** Nginx can automatically mark backends as down after 3 failed requests in 10 seconds, and will retry after a cooldown period.

---

## Process Isolation (systemd Services)

### Service Naming Convention

Each site has services named: `<sitename>-<component>.service`

**Examples:**
- `chienstreats-frontend.service`
- `chienstreats-api.service`
- `secondsite-frontend.service`
- `secondsite-api.service`

### Service File Location

All service files are stored in: `/etc/systemd/system/`

### Standard Service File Structure

Every service file follows this template:

```ini
[Unit]
Description=<Site Name> <Component> (<Technology>)
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service

[Service]
Type=simple
User=<sitename>
Group=<sitename>
WorkingDirectory=/srv/sites/<sitename>/current
Environment=NODE_ENV=production
EnvironmentFile=/srv/sites/<sitename>/shared/.env
ExecStart=/usr/bin/pnpm <command>
Restart=always
RestartSec=10s
StandardOutput=append:/srv/sites/<sitename>/shared/logs/<component>.log
StandardError=append:/srv/sites/<sitename>/shared/logs/<component>-error.log

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/sites/<sitename>/shared/logs /srv/sites/<sitename>/shared/uploads
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true
RestrictNamespaces=true

[Install]
WantedBy=multi-user.target
```

### Key Service File Directives

| Directive | Purpose |
|-----------|---------|
| `User=<sitename>` | Runs process as site user (filesystem isolation) |
| `WorkingDirectory=` | Sets CWD for process (where it expects to find files) |
| `EnvironmentFile=` | Loads environment variables from `.env` file |
| `Restart=always` | Automatically restart if process crashes |
| `RestartSec=10s` | Wait 10 seconds before restarting (prevents rapid crash loops) |
| `StandardOutput=append:` | Redirects stdout to log file (append mode) |
| `NoNewPrivileges=true` | Prevents process from gaining additional privileges |
| `ProtectSystem=strict` | Mounts `/usr`, `/boot`, `/efi` as read-only |
| `ProtectHome=true` | Makes `/home`, `/root`, `/run/user` inaccessible |
| `ReadWritePaths=` | Explicitly allows write access to specific directories |

### Service Management Commands

```bash
# View service status
systemctl status <sitename>-frontend

# Start service
systemctl start <sitename>-frontend

# Stop service
systemctl stop <sitename>-frontend

# Restart service
systemctl restart <sitename>-frontend

# Enable service (start on boot)
systemctl enable <sitename>-frontend

# View live logs
journalctl -u <sitename>-frontend -f

# View logs from last hour
journalctl -u <sitename>-frontend --since "1 hour ago"
```

### Service Dependencies

Services can depend on other services:

```ini
[Unit]
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service
```

- `After=`: Starts this service **after** listed services start
- `Wants=`: If listed services fail, this service continues (soft dependency)
- `Requires=`: If listed services fail, this service also stops (hard dependency)

**Current setup uses `Wants`**: If PostgreSQL fails, site services continue running (but may fail when trying to connect to database).

---

## Database Architecture

### PostgreSQL Database Isolation

Each site has:
- **One database**: Named after the site (e.g., `chienstreats`)
- **One database user**: Same name as database (e.g., `chienstreats`)
- **One password**: Randomly generated, stored in site's `.env` file

### Database User Permissions

```sql
-- Example for chienstreats site
CREATE DATABASE chienstreats;
CREATE USER chienstreats WITH PASSWORD '<random-password>';
GRANT ALL PRIVILEGES ON DATABASE chienstreats TO chienstreats;

-- User can only access their own database
-- User cannot see other databases
-- User cannot create new databases
```

### Connection String Format

Stored in `/srv/sites/<sitename>/shared/.env`:

```env
DATABASE_URL=postgresql://chienstreats:<password>@localhost:5432/chienstreats
```

**Format:** `postgresql://<user>:<password>@<host>:<port>/<database>`

### PostgreSQL Global Configuration

- **Max Connections:** 100 (shared across all sites)
- **Shared Buffers:** 25% of RAM (default)
- **Connection Pooling:** Handled by application (e.g., Prisma)

**Important:** If 5 sites each open 20 database connections, that's 100 connections total (hitting the limit). Consider increasing `max_connections` in `/etc/postgresql/14/main/postgresql.conf` if adding many sites.

### Database Backups

**Current Status:** Not automated.

**Recommendation:** Each site should implement its own backup strategy:
```bash
# Example: Daily backup via cron
0 2 * * * sudo -u postgres pg_dump chienstreats | gzip > /srv/sites/chienstreats/shared/backups/$(date +\%Y\%m\%d).sql.gz
```

---

## Web Server (Nginx) Architecture

### Nginx Role

Nginx acts as a **reverse proxy** and **SSL terminator**:
- Listens on ports 80 (HTTP) and 443 (HTTPS)
- Routes requests to backend applications based on domain/path
- Handles SSL/TLS encryption (Let's Encrypt certificates)
- Serves static files directly (bypassing Node.js)
- Applies rate limiting per site
- Logs requests per site

### Configuration Structure

```
/etc/nginx/
├── nginx.conf                        # Global nginx configuration
├── sites-available/                  # All available site configs
│   ├── chienstreats.conf             # Chien's Treats site config
│   ├── secondsite.conf               # Second site config
│   └── default                       # Disabled default site
└── sites-enabled/                    # Symlinks to active configs
    ├── chienstreats.conf -> ../sites-available/chienstreats.conf
    └── secondsite.conf -> ../sites-available/secondsite.conf
```

**Pattern:** Create config in `sites-available/`, then symlink to `sites-enabled/` to activate.

### Standard Nginx Site Configuration

Every site config contains:

1. **Rate Limiting Zones** (defined once, at top of file):
```nginx
limit_req_zone $binary_remote_addr zone=<sitename>_api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=<sitename>_general:10m rate=30r/s;
```

2. **Upstream Definitions** (backend servers):
```nginx
upstream <sitename>_frontend {
    server 127.0.0.1:3101 fail_timeout=10s max_fails=3;
    keepalive 32;
}

upstream <sitename>_api {
    server 127.0.0.1:4000 fail_timeout=10s max_fails=3;
    keepalive 32;
}
```

3. **HTTP Server Block** (port 80):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    # ACME challenge for Let's Encrypt
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/html;
    }

    # Cloudflare IP restoration
    set_real_ip_from 173.245.48.0/20;
    # ... (more Cloudflare IP ranges)
    real_ip_header CF-Connecting-IP;

    # Proxy to backends
    location /api/v1/ {
        limit_req zone=<sitename>_api burst=20 nodelay;
        proxy_pass http://<sitename>_api;
        # ... (proxy headers)
    }

    location / {
        limit_req zone=<sitename>_general burst=50 nodelay;
        proxy_pass http://<sitename>_frontend;
        # ... (proxy headers)
    }
}
```

4. **HTTPS Server Block** (port 443):
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Same proxy configuration as HTTP block
    # ...
}
```

### Request Flow

1. Client makes HTTPS request to `https://example.com/api/v1/products`
2. DNS resolves to VPS IP (109.205.180.240)
3. Request hits Nginx on port 443
4. Nginx matches `server_name example.com`
5. Nginx decrypts TLS
6. Nginx matches `location /api/v1/`
7. Nginx applies rate limiting (10 req/sec for API)
8. Nginx forwards request to `http://127.0.0.1:4000/api/v1/products`
9. Backend application processes request
10. Backend returns response to Nginx
11. Nginx encrypts response and sends to client
12. Nginx logs request to `/srv/sites/<sitename>/shared/logs/nginx-access.log`

### Cloudflare Integration

If site uses Cloudflare DNS with proxy enabled:
- Cloudflare sits in front of Nginx
- Client → Cloudflare → Nginx → Backend
- Nginx must restore real client IP from `CF-Connecting-IP` header
- Nginx config includes Cloudflare IP ranges in `set_real_ip_from` directives

**Why:** Without IP restoration, all requests appear to come from Cloudflare's IPs, breaking rate limiting and logging.

### SSL Certificate Management

- **Provider:** Let's Encrypt (free, auto-renewable)
- **Tool:** certbot
- **Renewal:** Automatic (systemd timer runs twice daily)
- **Certificate Location:** `/etc/letsencrypt/live/<domain>/`

**Per-Site Certificates:**
Each domain has its own certificate. Certificates are **not** shared between sites.

---

## Security Model

### Defense in Depth Layers

1. **Network Firewall (UFW)**: Blocks all ports except 22, 80, 443
2. **Localhost Binding**: Applications only listen on 127.0.0.1
3. **Nginx Reverse Proxy**: Single public entry point
4. **SSL/TLS Encryption**: All production traffic encrypted
5. **Unix User Isolation**: Each site runs as different user
6. **File Permissions**: Site files chmod 600-755, owned by site user
7. **systemd Security Flags**: NoNewPrivileges, ProtectSystem, etc.
8. **Database User Isolation**: Each site has own database user
9. **fail2ban**: Bans IPs after failed SSH/HTTP attempts
10. **Automatic Updates**: Unattended security patches

### SSH Access

- **Root User:** Key-based authentication only (password disabled)
- **Deploy User:** Key-based authentication, passwordless sudo
- **Site Users:** No SSH access (nologin shell)

**SSH Keys:**
- Stored on local machine: `~/.ssh/id_ed25519`
- Public key on server: `/root/.ssh/authorized_keys`, `/home/deploy/.ssh/authorized_keys`

### Secret Management

Secrets are stored in: `/srv/sites/<sitename>/shared/.env`

**File Permissions:** `-rw------- (600)` - only site user can read

**Secrets Include:**
- Database passwords
- JWT signing keys
- API keys (Stripe, SMTP, etc.)
- Session secrets

**Never:**
- Commit secrets to Git
- Store secrets in code
- Share secrets between sites
- Use weak/default secrets in production

### Rate Limiting

Nginx applies rate limiting per site:
- **API endpoints:** 10 requests/second, burst 20
- **General endpoints:** 30 requests/second, burst 50

**What happens when limit exceeded?**
- Client receives `503 Service Unavailable`
- Request is not forwarded to backend
- Protects backend from overload

---

## Logging Architecture

### Log Types

Each site generates multiple log streams:

| Log File | Content | Source |
|----------|---------|--------|
| `frontend.log` | Frontend stdout (systemd) | Next.js console output |
| `frontend-error.log` | Frontend stderr (systemd) | Next.js uncaught errors |
| `api.log` | API stdout (systemd) | NestJS console output |
| `api-error.log` | API stderr (systemd) | NestJS uncaught errors |
| `nginx-access.log` | HTTP requests | Nginx access log (per site) |
| `nginx-error.log` | Nginx errors | Nginx error log (per site) |

### Log Location

All logs stored in: `/srv/sites/<sitename>/shared/logs/`

**Why `shared/`?** Logs persist across deployments (releases come and go, logs stay).

### Log Rotation

`logrotate` automatically rotates logs:
- **Frequency:** Daily
- **Retention:** 14 days
- **Compression:** gzip after 1 day
- **Configuration:** `/etc/logrotate.d/nginx` (Nginx), systemd handles application logs

### Viewing Logs

```bash
# Real-time systemd logs
journalctl -u chienstreats-frontend -f

# Last 100 lines of systemd logs
journalctl -u chienstreats-frontend -n 100

# Nginx access logs
tail -f /srv/sites/chienstreats/shared/logs/nginx-access.log

# Nginx error logs
tail -f /srv/sites/chienstreats/shared/logs/nginx-error.log

# Application logs (if writing to file)
tail -f /srv/sites/chienstreats/shared/logs/frontend.log
```

### Log Format (Nginx)

```
# Combined format
$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"

# Example
173.245.48.1 - - [09/Oct/2025:12:30:45 +0000] "GET /api/v1/products HTTP/1.1" 200 4523 "https://chienstreats.com/" "Mozilla/5.0..."
```

### Centralized Logging (Not Implemented)

Currently, each site's logs are stored locally on the VPS. For centralized logging (aggregating all sites into one dashboard):
- **Option 1:** Grafana + Loki
- **Option 2:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Option 3:** Cloud service (Datadog, Loggly, Papertrail)

---

## Deployment Model

### Atomic Deployment Strategy

Deployments follow this pattern:

1. **Create new release directory:** `/srv/sites/<sitename>/releases/<timestamp>/`
2. **Clone repository:** `git clone <repo-url> <release-dir>`
3. **Install dependencies:** `pnpm install --frozen-lockfile`
4. **Build application:** `pnpm build`
5. **Update symlink:** `ln -sfn <release-dir> /srv/sites/<sitename>/current`
6. **Restart services:** `systemctl restart <sitename>-frontend <sitename>-api`

**Atomicity:** Symlink change is atomic. Old version serves requests until symlink is updated, then new version takes over immediately.

### Rollback Procedure

If new deployment is broken:

```bash
# List available releases
ls -lt /srv/sites/<sitename>/releases/

# Switch to previous release
sudo ln -sfn /srv/sites/<sitename>/releases/<previous-timestamp> \
  /srv/sites/<sitename>/current

# Restart services
sudo systemctl restart <sitename>-frontend <sitename>-api
```

**Recovery Time:** Seconds (just symlink change + service restart).

### Zero-Downtime Deployments (Not Implemented)

Current deployment has brief downtime (service restart). For zero-downtime:
1. Run multiple frontend/API instances on different ports
2. Configure Nginx upstream with multiple servers
3. Deploy to one instance, wait for health check, then deploy to next
4. Requires load balancing and health checks

---

## Resource Allocation & Limits

### Current Resource Limits

**None configured by default.** All sites share:
- CPU cores
- RAM
- Disk I/O
- Network bandwidth

### Monitoring Resource Usage

```bash
# CPU usage per process
ps aux --sort=-%cpu | head -20

# Memory usage per process
ps aux --sort=-%mem | head -20

# Disk usage per site
du -sh /srv/sites/*

# Network connections per site
ss -tulpn | grep <port>

# systemd resource usage
systemd-cgtop
```

### Imposing Resource Limits (If Needed)

Edit service file `/etc/systemd/system/<sitename>-<component>.service`:

```ini
[Service]
# Limit memory to 512MB
MemoryLimit=512M

# Limit CPU to 50% of one core
CPUQuota=50%

# Limit tasks (threads/processes) to 128
TasksMax=128
```

Then reload systemd and restart service:
```bash
sudo systemctl daemon-reload
sudo systemctl restart <sitename>-<component>
```

**When to impose limits?**
- One site is using excessive resources
- Need to guarantee resources for critical site
- Prevent runaway processes from affecting other sites

---

## ACTIVE SITES REGISTRY (Editable)

> **⚠️ IMPORTANT:** This section is the **ONLY** part of this document that should be regularly updated as new sites are deployed. All other sections describe the universal architecture and should remain unchanged.

---

### Site #1: Chien's Treats (Bakery E-Commerce)

**Status:** 🟢 **ACTIVE**
**Deployed:** 2025-10-09
**Release ID:** 20251009_121725

#### Domain Configuration
- **Primary Domain:** chienstreats.com (A record → 109.205.180.240)
- **WWW Subdomain:** www.chienstreats.com (CNAME → chienstreats.com)
- **DNS Provider:** Cloudflare (proxy enabled, Full SSL mode)
- **SSL Certificate:** `/etc/letsencrypt/live/chienstreats.com/`

#### Port Allocation
| Service | Port | Status |
|---------|------|--------|
| Frontend (Next.js) | 3101 | ✅ Running |
| API (NestJS) | 4000 | ⚠️ Disabled (build issues - see notes) |

#### System Resources
- **Unix User:** `chienstreats` (UID 1001)
- **Home Directory:** `/srv/sites/chienstreats/`
- **systemd Services:**
  - `chienstreats-frontend.service` (enabled, active)
  - `chienstreats-api.service` (disabled - pending fix)
- **Database:** `chienstreats` (PostgreSQL)
- **Database User:** `chienstreats`

#### Network Configuration
- **Nginx Config:** `/etc/nginx/sites-available/chienstreats.conf`
- **Reverse Proxy Rules:**
  - `/api/v1/*` → `http://127.0.0.1:4000` (currently unused)
  - `/*` → `http://127.0.0.1:3101`
- **Rate Limits:**
  - API: 10 req/sec (burst 20)
  - General: 30 req/sec (burst 50)
- **Cloudflare IP Restoration:** ✅ Configured

#### Application Details
- **Tech Stack:** Next.js 15 (frontend), NestJS (API - disabled)
- **Package Manager:** pnpm
- **Node.js Version:** v20.19.5
- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start` (frontend), `tsx src/main.ts` (API)
- **Data Provider:** Client-side (IndexedDB) - API not required for basic operation

#### Filesystem Paths
- **Release Directory:** `/srv/sites/chienstreats/releases/20251009_121725/chien-treats/`
- **Current Symlink:** `/srv/sites/chienstreats/current` → `releases/20251009_121725/chien-treats`
- **Environment File:** `/srv/sites/chienstreats/shared/.env` (chmod 600)
- **Logs Directory:** `/srv/sites/chienstreats/shared/logs/`
- **Uploads Directory:** `/srv/sites/chienstreats/shared/uploads/`

#### External Service Dependencies
- **Stripe:** Configured but using test keys (payments disabled in production)
- **SMTP/Email:** Placeholder credentials (email disabled in production)
- **Redis:** Available but not currently used

#### Known Issues / Notes
- **API Service:** TypeScript compilation fails due to Fastify plugin version mismatches. Service is disabled. Site operates in client-side mode using IndexedDB.
- **Email Verification:** Disabled due to missing SMTP credentials
- **Payments:** Using test Stripe keys; not processing real payments

#### Developer Contacts
- **Repository:** https://github.com/emlm244/MothersBakingWebsite
- **Branch:** `main`
- **Deployment Key:** SSH key stored in `/root/.ssh/id_ed25519`

---

### Site #2: (Reserved Placeholder)

**Status:** 🔵 **RESERVED (Not Deployed)**
**Placeholder Active:** http://109.205.180.240:8080 (static "Coming Soon" page)

#### Port Allocation
| Service | Port | Status |
|---------|------|--------|
| Frontend | 3102 | 🔒 Reserved |
| API | 4001 | 🔒 Reserved |

#### System Resources
- **Unix User:** `secondsite` (UID 1002) - created but unused
- **Home Directory:** `/srv/sites/second-site-placeholder/` (skeleton only)

#### Network Configuration
- **Nginx Config:** `/etc/nginx/sites-available/second-site-placeholder.conf`
- **Current Behavior:** Serves static HTML "Coming Soon" page on port 8080
- **Ready for Production:** No (needs actual application deployment)

---

### Port Allocation Summary

| Port Range | Allocated To | Status |
|------------|--------------|--------|
| 3101 | Chien's Treats Frontend | ✅ In Use |
| 3102 | Site #2 Frontend | 🔒 Reserved |
| 3103-3109 | Available | ⚪ Free |
| 4000 | Chien's Treats API | 🔒 Reserved (service disabled) |
| 4001 | Site #2 API | 🔒 Reserved |
| 4002-4009 | Available | ⚪ Free |
| 5000+ | Available | ⚪ Free |
| 8080 | Site #2 Placeholder | 🔵 Temporary (remove when site #2 deploys) |

---

### Domain Registry

| Domain | Points To | Site | SSL Status |
|--------|-----------|------|------------|
| chienstreats.com | 109.205.180.240 | Chien's Treats | ✅ Valid (Let's Encrypt) |
| www.chienstreats.com | chienstreats.com (CNAME) | Chien's Treats | ✅ Valid (Let's Encrypt) |

---

### Database Registry

| Database Name | Owner User | Tables | Status |
|---------------|------------|--------|--------|
| `chienstreats` | `chienstreats` | ~15 (Prisma schema) | ✅ Active |
| `postgres` | `postgres` | (default) | System database |
| `template0` | `postgres` | (default) | System template |
| `template1` | `postgres` | (default) | System template |

---

### Shared Resource Usage

**As of 2025-10-09:**

| Resource | Usage | Notes |
|----------|-------|-------|
| **PostgreSQL Connections** | ~10/100 | Chien's Treats uses ~10 connections |
| **Disk Space** | ~2.5GB / 40GB | Chien's Treats: ~2.5GB (code + dependencies) |
| **RAM** | ~200MB / 4GB | Chien's Treats frontend: ~180MB resident |
| **CPU** | < 5% avg | Mostly idle (Next.js handles static pages efficiently) |
| **Network Bandwidth** | < 1Mbps | Low traffic (not yet publicly announced) |

---

### SSL Certificate Renewal Schedule

| Domain | Expires | Auto-Renewal | Last Renewed |
|--------|---------|--------------|--------------|
| chienstreats.com | 2026-01-07 | ✅ Yes (certbot) | 2025-10-09 |

**Renewal Process:** Automatic via certbot systemd timer (runs twice daily)

---

### Nginx Configuration Files

| File | Site | Lines | Last Modified |
|------|------|-------|---------------|
| `/etc/nginx/sites-available/chienstreats.conf` | Chien's Treats | 142 | 2025-10-09 12:42 |
| `/etc/nginx/sites-available/second-site-placeholder.conf` | Placeholder | 68 | 2025-10-09 12:10 |

---

### systemd Services Status

| Service | Site | Status | Uptime |
|---------|------|--------|--------|
| `chienstreats-frontend.service` | Chien's Treats | ✅ Active | Since 2025-10-09 12:29 UTC |
| `chienstreats-api.service` | Chien's Treats | ❌ Disabled | N/A |

---

## Common Questions & Architecture Decisions

### Q: Why not use Docker containers for site isolation?

**A:** Docker adds operational complexity (container orchestration, image management, networking) without providing additional isolation benefits for this use case. Unix users + systemd provide sufficient process isolation. Docker is better suited for:
- Microservices architectures with many small services
- Applications requiring specific OS-level dependencies
- Development environment standardization

This VPS hosts full-stack monoliths (Next.js + NestJS) that run fine directly on the host OS.

---

### Q: Why not use separate VMs or LXC containers?

**A:** VMs have significant resource overhead (~500MB RAM per VM minimum). For a 4GB VPS, that limits you to ~4-5 sites. LXC containers are lighter but add management complexity. Unix user isolation provides 90% of the benefits with 10% of the overhead.

---

### Q: Why not use PM2 instead of systemd?

**A:** systemd is the native init system on Ubuntu. Benefits over PM2:
- Integrated with operating system (no extra daemon)
- Automatic restart policies
- Resource limits (cgroups)
- Log management (journald)
- Dependency management (start after network/database)
- Security features (filesystem protection, capabilities)

PM2 is good for development but systemd is better for production on Linux.

---

### Q: Why pnpm instead of npm or yarn?

**A:** pnpm is more disk-efficient (uses content-addressable storage) and faster than npm. For multiple sites on one VPS, disk space matters. pnpm shares packages between sites at the OS level, reducing duplication.

---

### Q: Why bind to 127.0.0.1 instead of 0.0.0.0?

**A:** Defense in depth. If UFW firewall is accidentally disabled or misconfigured, applications are still not exposed to the internet. Only Nginx can access them (Nginx runs on the same machine).

---

### Q: Why are site users `nologin`?

**A:** Site users exist only to run processes and own files. They should never be used for SSH login. If an attacker compromises a site's code, they gain access to that site's files but cannot SSH in or switch users.

---

### Q: Why symlink-based deployments instead of in-place updates?

**A:** Atomic deployments. Changing a symlink is atomic (either old or new, never half-updated). Allows instant rollback by changing symlink back. Keeps old releases for forensics if something breaks.

---

### Q: Why keep old releases?

**A:** Rollback capability. If deployment introduces a bug, you can instantly roll back without re-deploying code. Also useful for comparing "what changed" between releases.

---

### Q: Why separate frontend and API services?

**A:** Independence. Frontend and API can be restarted independently. If API crashes, frontend can still serve static pages. If frontend needs restart, API connections stay alive.

---

### Q: Can sites share a Redis instance?

**A:** Technically yes, but use different Redis databases:
- Site A: `redis://localhost:6379/0`
- Site B: `redis://localhost:6379/1`

OR use key prefixes:
- Site A keys: `siteA:session:123`
- Site B keys: `siteB:session:456`

Better: Run separate Redis instances on different ports (not yet implemented).

---

### Q: What happens if one site maxes out CPU?

**A:** Without resource limits, it can slow down other sites. Solution:
1. Impose CPU limits via systemd `CPUQuota`
2. Identify and fix performance issues in offending site
3. Upgrade VPS to more cores

---

### Q: What happens if one site fills the disk?

**A:** All sites fail (can't write logs, can't upload files). Prevention:
1. Monitor disk usage: `df -h`
2. Set up disk usage alerts
3. Impose disk quotas (complex on single filesystem)
4. Add more disk space

---

### Q: Can sites communicate with each other?

**A:** Not directly. They run as different users with different ports. They could:
1. Use HTTP requests between localhost ports (discouraged - tight coupling)
2. Use shared PostgreSQL database (discouraged - breaks isolation)
3. Use message queue (Redis pub/sub, RabbitMQ)
4. Use shared filesystem (discouraged - breaks isolation)

**Best practice:** Sites should be independent. If they need to share data, use APIs over HTTP(S).

---

### Q: Why are rate limits different for API vs general endpoints?

**A:** APIs are more expensive (database queries, computation) than serving static HTML. Limiting API requests to 10/sec protects backend from overload while allowing 30/sec for static content.

---

### Q: What if I need to run a site on port 3101 but it's taken?

**A:** Don't. Use the next available port (3102, 3103, etc.). Changing existing site's port requires:
1. Updating systemd service file
2. Updating Nginx upstream
3. Restarting services
4. Testing everything

Far simpler to use next available port.

---

### Q: Can I SSH directly to a site's user?

**A:** No. Site users have `nologin` shell. To operate as a site user:
```bash
# As root or deploy user
sudo -u <sitename> bash
cd /srv/sites/<sitename>/current
# Now you're running commands as site user
```

---

### Q: How do I deploy a site that's not Node.js?

**A:** Same pattern, different commands:

**Python/Django:**
```ini
[Service]
ExecStart=/srv/sites/<sitename>/venv/bin/gunicorn myapp.wsgi:application --bind 127.0.0.1:3102
```

**Ruby/Rails:**
```ini
[Service]
ExecStart=/usr/local/bin/puma -C config/puma.rb
```

**Go:**
```ini
[Service]
ExecStart=/srv/sites/<sitename>/current/myapp-binary
```

Just ensure it binds to `127.0.0.1:<unique-port>`.

---

### Q: Why is Chien's Treats API disabled?

**A:** TypeScript compilation fails due to Fastify plugin version mismatches between nested dependencies. The frontend works without the API (uses IndexedDB for client-side data). Fixing requires resolving TypeScript conflicts or bypassing compilation with `tsx` directly (partially attempted).

---

### Q: Is this setup production-ready?

**A:** For small-to-medium traffic sites: **Yes**. For high-traffic sites: **Needs enhancements**:
- Load balancing (multiple frontend instances)
- Database connection pooling
- CDN for static assets
- Horizontal scaling (multiple VPS nodes)
- Managed database (not on same VPS)

---

### Q: How do I update Nginx config for a site?

**A:**
```bash
# Edit config file
sudo nano /etc/nginx/sites-available/<sitename>.conf

# Test config
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

**Never** restart Nginx unless necessary (reload is zero-downtime).

---

### Q: How do I see what's listening on what ports?

**A:**
```bash
# All listening ports
ss -tulpn

# Specific port
ss -tulpn | grep :3101

# All Node.js processes
ps aux | grep node
```

---

### Q: Where are environment variables stored?

**A:** `/srv/sites/<sitename>/shared/.env`

**Never** commit this file to Git. **Never** store secrets in code.

---

### Q: How do I update a site's environment variables?

**A:**
```bash
# Edit .env file
sudo nano /srv/sites/<sitename>/shared/.env

# Restart services to load new variables
sudo systemctl restart <sitename>-frontend <sitename>-api
```

---

### Q: What's the difference between `restart` and `reload`?

**A:**
- **restart:** Stops process completely, then starts new process (brief downtime)
- **reload:** Sends signal to process to reload config without stopping (zero downtime)

Nginx supports `reload`. Most application servers (Node.js) require `restart`.

---

### Q: Can I run multiple instances of a site for load balancing?

**A:** Yes, but requires configuration:

1. Run frontend on ports 3101, 3102, 3103 (separate service files)
2. Configure Nginx upstream with all three:
```nginx
upstream <sitename>_frontend {
    server 127.0.0.1:3101;
    server 127.0.0.1:3102;
    server 127.0.0.1:3103;
}
```
3. Nginx will round-robin requests across instances

---

### Q: What happens when the VPS reboots?

**A:** All enabled services auto-start:
- `chienstreats-frontend.service` (enabled)
- PostgreSQL, Redis, Nginx (enabled by default)

Sites should be accessible within 1-2 minutes after reboot.

---

### Q: How much traffic can this VPS handle?

**A:** Depends on:
- **CPU:** Next.js can handle 100-1000 req/sec per core (mostly I/O-bound)
- **RAM:** Each Node.js process uses 100-500MB depending on site
- **Network:** 1Gbps network interface (shared)

**Rough estimate:** 5-10 small-to-medium sites comfortably. Beyond that, need better VPS or multiple servers.

---

### Q: Why are logs in `shared/logs/` and not `releases/<timestamp>/logs/`?

**A:** Logs persist across deployments. If logs were in `releases/`, they'd be deleted when old releases are cleaned up. You want to keep logs even after rolling back to old code.

---

### Q: Can I delete old releases manually?

**A:** Yes:
```bash
cd /srv/sites/<sitename>/releases/
ls -lt  # List by time, newest first
rm -rf 20251001_120000  # Delete specific old release
```

**Keep at least 2 releases** for rollback capability.

---

### Q: What if I accidentally delete the `current` symlink?

**A:** Site is down. Restore it:
```bash
ln -sfn /srv/sites/<sitename>/releases/<latest-timestamp> \
  /srv/sites/<sitename>/current
sudo systemctl restart <sitename>-frontend
```

---

### Q: How do I check which release is currently deployed?

**A:**
```bash
readlink /srv/sites/<sitename>/current
# Output: /srv/sites/<sitename>/releases/20251009_121725
```

---

### Q: Why does the site use Cloudflare?

**A:** Cloudflare provides:
- **DDoS protection:** Filters malicious traffic before it hits VPS
- **CDN:** Caches static assets globally (faster load times)
- **SSL:** Free SSL certificates + proxy
- **DNS:** Fast DNS resolution

**Not required** - can point domain directly to VPS IP.

---

### Q: What if Cloudflare goes down?

**A:** Site is unreachable (DNS resolution fails). To bypass Cloudflare:
1. Change DNS to point directly to VPS IP
2. Obtain Let's Encrypt certificate on VPS
3. Wait for DNS propagation (24-48 hours)

---

## Appendix: File Reference

### Key System Files

| File | Purpose |
|------|---------|
| `/etc/systemd/system/<sitename>-*.service` | Service definitions |
| `/etc/nginx/sites-available/<sitename>.conf` | Nginx site configs |
| `/etc/nginx/sites-enabled/<sitename>.conf` | Active site configs (symlinks) |
| `/etc/letsencrypt/live/<domain>/` | SSL certificates |
| `/srv/sites/<sitename>/` | Site filesystem root |
| `/srv/sites/<sitename>/shared/.env` | Environment variables |
| `/srv/sites/<sitename>/shared/logs/` | Log files |
| `/var/log/nginx/` | Global Nginx logs |
| `/var/lib/postgresql/14/main/` | PostgreSQL data directory |

---

## Appendix: Port Reference

| Port | Protocol | Purpose | Exposed |
|------|----------|---------|---------|
| 22 | TCP | SSH | Internet |
| 80 | TCP | HTTP | Internet |
| 443 | TCP | HTTPS | Internet |
| 3101-3109 | TCP | Site #1 Frontends | Localhost only |
| 3110-3119 | TCP | Site #2 Frontends | Localhost only |
| 4000-4009 | TCP | Site #1 APIs | Localhost only |
| 4010-4019 | TCP | Site #2 APIs | Localhost only |
| 5432 | TCP | PostgreSQL | Localhost only |
| 6379 | TCP | Redis | Localhost only |
| 8080 | TCP | Placeholder Page (temporary) | Internet (via Nginx) |

---

## Appendix: User Reference

| User | UID | Home | Shell | Purpose |
|------|-----|------|-------|---------|
| root | 0 | /root | /bin/bash | System administration |
| deploy | 1000 | /home/deploy | /bin/bash | Deployment automation |
| chienstreats | 1001 | /srv/sites/chienstreats | /sbin/nologin | Site #1 process user |
| secondsite | 1002 | /srv/sites/second-site-placeholder | /sbin/nologin | Site #2 process user |

---

## Document Maintenance

**Last Updated:** 2025-10-09
**Next Review:** When new site is deployed
**Maintainers:** All developers with VPS access

**Update Trigger Events:**
1. New site deployed → Update Active Sites Registry
2. Port allocation changes → Update Port Registry
3. Domain added → Update Domain Registry
4. SSL certificate renewed → Update SSL Certificate table
5. Resource usage patterns change → Update Shared Resource Usage table

**Do NOT update:**
- Architecture descriptions (unless fundamental change to entire VPS setup)
- Design principles (unless migrating to different architecture)
- Common Questions section (unless answering new architectural decision)

---

**End of Document**
