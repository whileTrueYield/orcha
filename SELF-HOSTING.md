# Self-Hosting Orcha

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Step-by-step setup](#step-by-step-setup)
5. [Starting Orcha](#starting-orcha)
6. [First login](#first-login)
7. [Connect a coding agent (MCP)](#connect-a-coding-agent-mcp)
8. [Architecture overview](#architecture-overview)
9. [Environment variable reference](#environment-variable-reference)
10. [Email configuration](#email-configuration)
11. [Backups](#backups)
12. [Updating](#updating)
13. [Troubleshooting](#troubleshooting)

---

## Overview

Orcha is a project manager that builds your team's schedule using Monte Carlo
Tree Search (MCTS). Feed it tickets, estimates, and work-week calendars; the
scheduler explores thousands of assignment permutations and returns a complete
schedule with confidence-weighted delivery dates.

This guide covers deploying Orcha on a single server you control -- from a
fresh Linux box to a running instance with automatic HTTPS. No Kubernetes, no
cloud-specific tooling, just Docker Compose and a domain name.

## Prerequisites

- **Server** -- 2 CPU cores, 4 GB RAM, 20 GB disk (guidelines, not hard limits)
- **OS** -- Any Linux with Docker support (Ubuntu 22.04+ recommended). macOS works for local testing.
- **Domain** -- A domain or subdomain with a DNS A record pointing to your server's IP
- **Docker** -- Docker Engine 20+ and Docker Compose v2 (the `docker compose` plugin, not the legacy `docker-compose` binary)
- **Email provider** -- SMTP credentials or a [Resend](https://resend.com) API key (see [Email configuration](#email-configuration))

Verify Docker is installed correctly:

```sh
docker --version          # Docker version 20.x or higher
docker compose version    # Docker Compose version v2.x
```

## Quick start

For experienced users who want to get running in five minutes:

```sh
git clone https://github.com/whileTrueYield/orcha.git && cd orcha
./orcha-setup.sh
make prod
```

Open `https://your-domain.com` and register. The first user is auto-confirmed.

## Step-by-step setup

### 1. Clone and run the setup script

```sh
git clone https://github.com/whileTrueYield/orcha.git && cd orcha
./orcha-setup.sh
```

The setup script checks prerequisites, prompts for your domain, Let's Encrypt
email, and email provider, then auto-generates cryptographic secrets and writes
everything to `.env.prod`. See below for details on each prompt.

To configure manually instead, copy `.env.prod.example` to `.env.prod` and
replace every `CHANGE_ME` value (see [Environment variable reference](#environment-variable-reference)).

### 2. Set your domain

```
ORCHA_DOMAIN=orcha.example.com
```

This must match a DNS A record pointing to your server. Traefik uses this to
route traffic and request a TLS certificate.

**Setting up a DNS A record:** In your registrar's DNS settings (Namecheap,
Cloudflare, Route 53, etc.), add:

| Type | Name             | Value          | TTL |
|------|------------------|----------------|-----|
| A    | `orcha` (or `@`) | Your server IP | 300 |

Use `@` for a root domain, or the subdomain prefix (e.g. `orcha`) for a
subdomain. Verify propagation with `dig +short orcha.example.com`.

### 3. Set your Let's Encrypt email

```
LETS_ENCRYPT_EMAIL=admin@example.com
```

Used only for certificate expiration warnings. Traefik handles renewal
automatically.

### 4. Generate secrets

The setup script generates these automatically. If configuring manually, run
each command and paste the output into `.env.prod`:

```sh
# Postgres password -> __DOCKER_POSTGRES_PASSWORD
openssl rand -base64 24

# Session secret -> __DOCKER_ORCHA_SESSION_SECRET
openssl rand -base64 32

# MinIO password -> MINIO_ROOT_PASSWORD
openssl rand -base64 24

# VAPID keys -> __DOCKER_VAPID_PUBLIC_KEY and __DOCKER_VAPID_PRIVATE_KEY
npx web-push generate-vapid-keys
```

If you don't have Node.js locally, you can generate VAPID keys after the first
boot: `docker exec orcha-backend npx web-push generate-vapid-keys`, then
update `.env.prod` and restart with `make prod`.

### 5. Configure email

Choose **one** provider. The setup script handles this, or set the vars in
`.env.prod` manually. Only set the vars for your chosen provider -- leave the
other blank.

**Option A: SMTP** -- works with Mailgun, SendGrid, Amazon SES, Postmark, or
any SMTP server.

```
__DOCKER_SMTP_HOST=smtp.mailgun.org
__DOCKER_SMTP_PORT=587
__DOCKER_SMTP_USER=postmaster@mg.example.com
__DOCKER_SMTP_PASS=your-smtp-password
```

**Option B: Resend** -- simpler if you don't already have SMTP credentials.

```
__DOCKER_RESEND_API_KEY=re_xxxxxxxxxxxx
```

## Starting Orcha

```sh
make prod
```

This builds all container images and starts them in the background. The first
build takes several minutes; subsequent starts reuse cached layers.

**Verify:** `docker compose -f docker-compose.prod.yaml --env-file .env.prod ps`
-- all containers should show `running` (except `minio-init` and `db-migrate`,
which run once and exit with status 0).

**View logs:** `make prod-logs` (press `Ctrl+C` to stop). For a single
service: `docker compose -f docker-compose.prod.yaml --env-file .env.prod logs -f backend`

**Stop:** `make prod-down` -- stops all containers. Data is preserved in
Docker volumes.

## First login

1. Open `https://your-domain.com` in a browser
2. Register an account -- the **first user** is automatically confirmed (no email needed)
3. Create your organization
4. Invite team members -- subsequent users **will** need email confirmation

If email is not configured, only the first user will be able to register.

## Connect a coding agent (MCP)

Orcha exposes a remote [MCP](https://modelcontextprotocol.io) endpoint so a
coding agent (Claude Code, Cursor, …) can read your workspace and act on it —
ask "what should I work on next?", then create, update, and transition tickets
and edit their Markdown bodies. The endpoint is your backend's **`/api/mcp`**
path (Traefik routes `/api` to the backend). Connect it with a Personal Access
Token, or — for consumer clients like Claude Desktop and the claude.ai
connector — over OAuth.

### With a Personal Access Token

Mint one in the app from the **avatar menu → API Tokens** (a **read-only** token
is accepted but refused on any write), then point your MCP client at the endpoint
with the token in an `Authorization` header. For a Claude Code / Cursor-style
`mcp.json`:

```json
{
  "mcpServers": {
    "orcha": {
      "type": "http",
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer orcha_pat_your_token_here"
      }
    }
  }
}
```

### With OAuth (consumer Claude clients)

Claude Desktop and the claude.ai connector connect over OAuth instead of a pasted
token. Add Orcha as a **custom connector** pointing at the same
`https://your-domain.com/api/mcp` URL, with no `Authorization` header. Orcha is
its **own** authorization server — no third-party identity provider to run or
configure. The client discovers it from the endpoint, registers itself, and opens
a browser where the user signs in, picks the **organization / Role** and **read**
vs **read + write** access on the consent screen, and approves. Users manage their
connected apps from the **avatar menu → Connected Apps**.

> **OAuth needs HTTPS.** The authorization server refuses a non-HTTPS issuer
> (except on `localhost`), so consumer OAuth clients only work once Orcha is
> served over TLS — which the Traefik setup above already does. If you run behind
> plain HTTP, use a Personal Access Token instead. See
> [ADR 0009](docs/adr/0009-oauth-2.1-orcha-as-its-own-authorization-server.md)
> for the authorization model.

Either way, the tools are the same — tenant-scoped to the connection's role and
returning LLM-shaped flat JSON:

- **Read** — `whoami`, `next_tickets` (your MCTS-prioritized work queue),
  `list_tickets`, `get_ticket`, `get_ticket_body`, `list_projects`, `get_project`,
  `get_project_body`, `get_schedule`.
- **Write** — `create_ticket`, `update_ticket`, `transition_ticket` (lifecycle:
  schedule / start / advance / close / cancel), `update_ticket_body`,
  `update_project_body` (Markdown body with optimistic-concurrency conflict
  handling).

See the [README](README.md#connect-a-coding-agent-mcp) for per-tool detail.

## Architecture overview

All traffic enters through Traefik on ports 80/443. Individual services are
not exposed to the host.

```
Internet --> Traefik (ports 80/443, automatic TLS)
               |-- /          -->  Frontend (nginx, React SPA)
               |-- /api       -->  Backend (Node.js, GraphQL API)
               |-- /uploads   -->  MinIO (S3-compatible file storage)
               |-- /support   -->  Support (embeddable widget)
```

| Service    | Role                                                         |
|------------|--------------------------------------------------------------|
| Frontend   | Serves the web application (React SPA via nginx)             |
| Backend    | GraphQL API, authentication, business logic                  |
| Cron       | Background jobs: scheduling runs, email notifications        |
| AI         | MCTS scheduling engine (Python/FastAPI, stateless)           |
| Support    | Embeddable support widget                                    |
| Traefik    | Reverse proxy, TLS termination, path-based routing           |
| Postgres   | Primary database (persistent, volume-backed)                 |
| Redis      | Session storage and job queues (ephemeral, no backup needed) |
| MinIO      | S3-compatible object storage for uploads                     |

Two one-shot containers (`db-migrate` and `minio-init`) run at boot to apply
database migrations and create storage buckets, then exit.

## Environment variable reference

All variables live in [`.env.prod.example`](.env.prod.example). The
**Required** column indicates: **Configure** = you provide it, **Generated** =
fill with a random secret, **No** = safe default.

### Domain and TLS

| Variable             | Description                                    | Example             | Required  |
|----------------------|------------------------------------------------|---------------------|-----------|
| `ORCHA_DOMAIN`       | Domain Traefik serves (must match DNS A record)| `orcha.example.com` | Configure |
| `LETS_ENCRYPT_EMAIL` | Email for certificate expiration notices        | `admin@example.com` | Configure |

### Service ports (internal, not exposed to host)

| Variable                         | Default | Description               |
|----------------------------------|---------|---------------------------|
| `__DOCKER_ORCHA_BACKEND_PORT`    | `4000`  | Backend HTTP              |
| `__DOCKER_ORCHA_SUPPORT_PORT`    | `3001`  | Support widget            |
| `__DOCKER_ORCHA_AI_PORT`         | `8000`  | AI scheduling engine      |

### Postgres

| Variable                     | Default | Required  | Generate with                |
|------------------------------|---------|-----------|------------------------------|
| `__DOCKER_POSTGRES_USER`     | `orcha` | No        | --                           |
| `__DOCKER_POSTGRES_DB`       | `orcha` | No        | --                           |
| `__DOCKER_POSTGRES_PASSWORD` | --      | Generated | `openssl rand -base64 24`    |

### Redis

| Variable                  | Default | Description    |
|---------------------------|---------|----------------|
| `__DOCKER_REDIS_HOSTNAME` | `redis` | Redis hostname |
| `__DOCKER_REDIS_PORT`     | `6379`  | Redis port     |

### Session and push notifications

| Variable                        | Required  | Generate with                    |
|---------------------------------|-----------|----------------------------------|
| `__DOCKER_ORCHA_SESSION_SECRET` | Generated | `openssl rand -base64 32`        |
| `__DOCKER_VAPID_PUBLIC_KEY`     | Generated | `npx web-push generate-vapid-keys` |
| `__DOCKER_VAPID_PRIVATE_KEY`    | Generated | (same command, outputs both)     |

### MinIO (object storage)

| Variable                                 | Default         | Required  |
|------------------------------------------|-----------------|-----------|
| `MINIO_ROOT_USER`                        | `orcha`         | No        |
| `MINIO_ROOT_PASSWORD`                    | --              | Generated |
| `__DOCKER_UPLOAD_S3_BUCKET`              | `orcha-uploads` | No        |
| `__DOCKER_DOCUMENTATION_S3_BUCKET`       | `orcha-docs`    | No        |
| `__DOCKER_DOCUMENTATION_DISTRIBUTION_ID` | (empty)         | No        |

### Email provider (set one group in `.env.prod`)

| Variable                  | Description          | Required  |
|---------------------------|----------------------|-----------|
| `__DOCKER_SMTP_HOST`      | SMTP server hostname | If SMTP   |
| `__DOCKER_SMTP_PORT`      | SMTP server port     | If SMTP   |
| `__DOCKER_SMTP_USER`      | SMTP username        | If SMTP   |
| `__DOCKER_SMTP_PASS`      | SMTP password        | If SMTP   |
| `__DOCKER_RESEND_API_KEY` | Resend API key       | If Resend |

## Email configuration

Email is required for user invitations, password resets, and notifications.

**SMTP** is the universal option. Providers like Mailgun, SendGrid, Amazon SES,
and Postmark all offer SMTP credentials. Typical settings use port 587 with
STARTTLS. Check your provider's docs for the exact host and authentication
details.

**Resend** is a modern email API -- simpler to set up if you don't already have
SMTP credentials. Sign up at [resend.com](https://resend.com), verify your
sending domain, and generate an API key.

**Testing:** After starting Orcha, invite a team member or trigger a password
reset. If the email arrives, you're set.

**Common issues:**
- **Emails in spam** -- Add SPF, DKIM, and DMARC records for your sending domain (your provider's docs will explain how)
- **Domain verification required** -- Most providers need you to verify domain ownership before delivering mail
- **Connection refused on port 587** -- Some cloud providers (AWS, GCP) block outbound SMTP by default. Request the restriction be lifted, or use Resend

## Backups

### Postgres

```sh
docker exec orcha-db pg_dump -U orcha orcha > backup-$(date +%Y%m%d).sql
```

For daily automated backups, add a cron job: `crontab -e`

```
0 3 * * * docker exec orcha-db pg_dump -U orcha orcha > /path/to/backups/orcha-$(date +\%Y\%m\%d).sql
```

**Restoring from a backup:**

```sh
make prod-down
docker compose -f docker-compose.prod.yaml --env-file .env.prod up -d db
# Wait for DB to be ready
docker exec orcha-db pg_isready -U orcha
# Drop, recreate, and restore
docker exec -i orcha-db psql -U orcha -d postgres -c "DROP DATABASE IF EXISTS orcha;"
docker exec -i orcha-db psql -U orcha -d postgres -c "CREATE DATABASE orcha;"
docker exec -i orcha-db psql -U orcha -d orcha < backup-20250523.sql
make prod
```

### MinIO (file uploads)

Uploads are stored in the `minio-data` Docker volume:

```sh
docker run --rm -v orcha_minio-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Redis

Ephemeral (sessions, job queues). No backup needed -- regenerates on restart.
Users will need to log in again after a Redis restart.

## Updating

```sh
git pull
make prod
```

This rebuilds images, runs new migrations, and restarts services. Data is
preserved -- Postgres and MinIO use persistent Docker volumes.

Check the changelog before updating for new required env vars or breaking
changes.

## Troubleshooting

### Cannot reach the application

1. **DNS:** `dig +short orcha.example.com` should return your server's IP
2. **Firewall:** Ports 80 and 443 must be open (`sudo ufw allow 80/tcp && sudo ufw allow 443/tcp` on Ubuntu)
3. **Containers:** `docker compose -f docker-compose.prod.yaml --env-file .env.prod ps` -- all should show `running`

### TLS certificate not issuing

Let's Encrypt uses an HTTP challenge, which requires:

1. Port 80 open (even though traffic redirects to HTTPS)
2. DNS resolving to your server
3. Traefik running -- check with `docker logs orcha-traefik`

Rate limit: 5 certificates per domain per week. If hit, wait and retry.

### Emails not arriving

1. Verify credentials in `.env.prod`
2. Check backend logs: `docker logs orcha-backend 2>&1 | grep -i email`
4. Check spam folders
5. Verify domain authentication (SPF/DKIM) with your provider

### First user stuck at email confirmation

This should not happen -- the first user is auto-confirmed. If it does, check
whether someone else registered first:

```sh
docker exec orcha-db psql -U orcha -d orcha -c "SELECT id, email FROM \"User\";"
```

### Container keeps restarting

Check logs: `make prod-logs` or `docker logs orcha-backend --tail 100`

Common causes:
- **Missing env var** -- Compare `.env.prod` against [`.env.prod.example`](.env.prod.example)
- **Database not ready** -- Check `docker logs orcha-db`
- **Port conflict** -- Another process on port 80/443: `sudo lsof -i :80`
