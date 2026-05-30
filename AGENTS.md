# Orcha

Project management app with a Monte Carlo Tree Search (MCTS) scheduling engine.
Repo: github.com/whileTrueYield/orcha

## Architecture

Six components, monorepo with Yarn workspaces:

| Component | Type | Stack | Port | Purpose |
|-----------|------|-------|------|---------|
| **frontend** | static site | React + Vite (CDN-served) | — | SPA |
| **support** | static site | React + Vite (CDN-served) | — | Embedded support widget |
| **api** | service | Express + GraphQL + REST | 4000 | Backend API |
| **hocuspocus** | service | Hocuspocus (Yjs CRDT) | 38268 | Real-time collaboration via WebSocket |
| **ai** | service | FastAPI (Python 3.12) | 8000 | MCTS scheduler — internal only |
| **cron** | worker | BullMQ (same Docker image as api) | — | Background job processor |

Infrastructure: PostgreSQL 16, Redis 7, S3-compatible storage (MinIO locally, DO Spaces in prod).

## Key paths

- `.do/app.yaml` — DigitalOcean App Platform spec
- `docker-compose.yaml` — Local dev environment
- `docker-compose.prod.yaml` — Self-hosted prod (Traefik + Let's Encrypt)
- `backend/src/` — API, cron, hocuspocus source (TypeScript)
- `ai/app/` — MCTS scheduler source (Python)
- `frontend/src/` — React SPA source
- `backend/prisma/schema.prisma` — Database schema

## Deployment

Two deployment paths:

### DigitalOcean App Platform (SaaS)
- Spec: `.do/app.yaml`, deploys from `main` branch on push
- Domain: `orcha.run`
- AI service uses `internal_ports` (no public route) — called by cron/api internally
- Managed Postgres, Redis, and DO Spaces provisioned separately in DO console
- `doctl` is configured locally for CLI operations
- Use `doctl apps list` to get app ID, `doctl apps update <id> --spec .do/app.yaml` to sync spec

### Self-hosted (docker-compose.prod.yaml)
- Traefik reverse proxy with auto TLS
- Single domain, path-based routing
- Setup script: `orcha-setup.sh`

## Dev environment

```bash
make main          # Start all services
make rebuild-ai    # Rebuild AI service only
make test-ai       # Run AI tests
make ssh-ai        # Shell into AI container
```

## Branching

- `main` — active development, DO deploys from here. PRs target `main`.

## Agent skills

### Issue tracker

GitHub Issues on whileTrueYield/orcha. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the root. See `docs/agents/domain.md`.
