# Coral Hosts Operations Runbook

**Version:** 2.0  
**Last Updated:** 2025-10-10  
**Maintainer:** Platform Engineering

---

## Scope

This runbook covers Coral Hosts' marketing site hosted on the Coral VPS (`109.205.180.240`). The application is a static Next.js build served behind Nginx and Cloudflare. There is no standalone API service; the only runtime dependency is Node.js for the Next.js server and the optional SMTP integration for the contact form.

---

## Quick Reference

```bash
# paths
/site -> /srv/sites/coralhosts
/site/current -> active release (Next.js app)
/site/shared/.env -> environment file (NEXT_PUBLIC_SITE_URL, SMTP credentials)
/site/shared/logs/frontend.log -> Next.js stdout/stderr

# service management
sudo systemctl status coralhosts-frontend
sudo systemctl restart coralhosts-frontend

# deploy (as deploy user)
cd /srv/sites/coralhosts
sudo -u deploy bash deployment/deploy.sh coralhosts

# logs
tail -f /srv/sites/coralhosts/shared/logs/frontend.log
journalctl -u coralhosts-frontend.service -f
```

---

## Architecture

```
Internet
  → Cloudflare (Full Strict, WAF, Bot Fight)
    → Nginx (TLS termination, Brotli, cache headers)
      → Next.js app (Node 20, pnpm) listening on 3101
      → SMTP provider (optional, for contact notifications)
```

- **Static assets** are served from `.next/static` with aggressive caching. HTML responses are short-lived to allow content updates.
- **Contact form** posts to `/api/contact`, which calls Nodemailer using the credentials in `.env`. If credentials are missing, submissions are logged to stdout for later review.
- **Observability**: Access and error logs are written to `/srv/sites/coralhosts/shared/logs`. Cloudflare analytics provide edge insight. UptimeRobot monitors `https://coralhosts.com/healthz` (Next.js route returning 200).

---

## Deployments

1. CI or operator runs `deployment/deploy.sh coralhosts`.
2. Script creates a timestamped release in `/srv/sites/coralhosts/releases/<timestamp>`.
3. `pnpm install --frozen-lockfile` and `pnpm build` run in the release.
4. Symlink `/srv/sites/coralhosts/current` atomically flips to new release.
5. `systemctl restart coralhosts-frontend` reloads the Node server.
6. Health check hits `/` and `/contact` before deployment script exits.
7. Previous five releases are retained for rollback.

### Rollback

```bash
cd /srv/sites/coralhosts
ls releases/  # identify previous release
ln -sfn releases/<previous>/coral-hosts current.tmp
mv -Tf current.tmp current
sudo systemctl restart coralhosts-frontend
```

---

## Environment configuration

`/srv/sites/coralhosts/shared/.env`

```
NEXT_PUBLIC_SITE_URL=https://coralhosts.com
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
CONTACT_INBOX=hello@coralhosts.com
CONTACT_FROM=no-reply@coralhosts.com
```

- Reload service after changes: `sudo systemctl restart coralhosts-frontend`.
- If SMTP fields are empty the API logs submissions but does not dispatch email.

---

## Health checks

- `https://coralhosts.com/healthz` (returns 200 JSON)
- `systemctl status coralhosts-frontend` (Node process)
- `journalctl -u coralhosts-frontend -n 100` for crash loops

---

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Service crash-looping | Check env file permissions (`600`, owned by deploy user). Review logs for syntax errors. |
| Contact form 500 | Ensure SMTP credentials are valid. Test with `npx --yes nodemailer-test` using the same account. |
| Assets outdated | Run deploy; Cloudflare cache purge executes automatically via GitHub Actions. |
| High latency | Review Cloudflare analytics for cache hit ratios. Verify Nginx `Cache-Control` headers (should be `max-age=31536000, immutable` for static). |

---

## Security & access

- SSH: only `deploy` user allowed via SSH keys. Password login disabled.
- Node process runs as `coralhosts` system user with read-only FS, write access to `shared/logs` only.
- Cloudflare set to "Full (strict)" with WAF ruleset "Managed Challenge".
- TLS certificates renewed via Certbot cron (`systemctl list-timers | grep certbot`).

---

## Incident response

1. Triage via Cloudflare status + `systemctl status`.
2. If Next.js process unhealthy, restart service. If revert required, follow rollback section.
3. Update status page (Statuspage.io) and notify stakeholders via shared Slack channel.
4. Post-incident: collect logs, update runbooks, file retrospective ticket.

---

## Change log

- **2025-10-10**: Migrated from NestJS API + storefront to static Next.js marketing site. Decommissioned API service; consolidated runbooks.

