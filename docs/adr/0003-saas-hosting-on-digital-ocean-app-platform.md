# SaaS hosting on Digital Ocean App Platform

The self-hosted deployment runs all services on a single machine via
docker-compose with Traefik. For SaaS, we need managed infrastructure that
a solo developer can operate without a DevOps team, within a $100–200/mo budget.

We chose Digital Ocean App Platform as the single provider for compute, with
DO Managed Databases for Postgres and Redis, and DO Spaces for file storage.

## Architecture

Five services, three managed resources, one provider:

| Component         | Hosting                          | Scaling          |
|-------------------|----------------------------------|------------------|
| Frontend (SPA)    | DO App Platform static site      | CDN-backed       |
| API server        | DO App Platform container        | Autoscaled       |
| Cron worker       | DO App Platform container        | Single instance  |
| MCTS scheduler    | DO App Platform container        | Single, always-on|
| Hocuspocus (WS)   | DO App Platform container        | Single instance  |
| Postgres          | DO Managed Database              | Single node      |
| Redis             | DO Managed Redis                 | Single node      |
| File storage      | DO Spaces                        | Managed          |

## Key decisions within this choice

- **Path-based routing on a single domain**, consistent with ADR #0002. DO App
  Platform handles routing natively — no Traefik needed in SaaS.
- **MCTS as a container, not a lambda.** Simulations run 20–60 seconds with
  heavy numpy/scipy dependencies — lambdas have cold-start and timeout problems
  for this workload. A single always-on container avoids both.
- **Backend split into three services** (API, cron, hocuspocus) so each scales
  to its nature. The API autoscales for request volume, the cron worker runs as
  a singleton (jobs are idempotent upserts, BullMQ handles retries), and
  hocuspocus handles WebSocket connections independently.
- **Shared database, shared schema multi-tenancy.** All tenants in the same
  tables, filtered by organizationId. Prisma middleware enforces the filter
  systematically.
- **Prisma migrations run as a pre-deploy build command** on the API service.
  If migration fails, deploy rolls back, old version keeps serving.
- **CI/CD via DO's GitHub integration** — push to main triggers auto-deploy.
- **Billing via Stripe, enabled by config.** Billing code lives in the main repo,
  activated by environment variables (Stripe keys + `BILLING_ENABLED`).
  Self-hosted deployments don't set the keys — all features unlocked. SaaS
  deployments sync subscription status via Stripe webhooks to a column on the
  Organization table.
- **DO Spaces replaces MinIO.** S3-compatible, so existing client code works with
  a connection string change. CDN-backed, $5/mo.

## Considered alternatives

- **AWS (ECS/Lambda/RDS)** — more powerful, but operationally complex for a solo
  dev. Lambda specifically rejected for MCTS due to cold starts and timeout
  limits. RDS is more expensive than DO Managed Databases at this scale.
- **Fly.io / Google Cloud Run** — strong scale-to-zero options for MCTS, but
  splitting infrastructure across providers adds operational overhead. DO keeps
  everything in one dashboard.
- **Neon (serverless Postgres)** — rejected based on poor prior experience.
  DO Managed Databases provides predictable local performance for $15/mo.
- **Upstash (serverless Redis)** — rejected because external caching with
  network latency doesn't make sense when $15/mo buys a co-located instance.
- **Separate repo for billing (open core)** — rejected. Billing is thin (Stripe
  integration + a middleware check), and self-hosters aren't lost revenue.
  One repo, billing as config, keeps things simple.
