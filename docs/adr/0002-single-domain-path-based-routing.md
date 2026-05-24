# Single domain with path-based routing

Self-hosted Orcha uses a single domain with path-based routing through Traefik,
rather than subdomains per service. The operator provides one domain
(`ORCHA_DOMAIN=orcha.example.com`) and Traefik routes by path:

- `/` → frontend (nginx, static assets)
- `/api` → backend (GraphQL)
- `/ws` → hocuspocus (WebSocket, collaborative editing)
- `/uploads` → MinIO (file uploads)

This means one DNS A record, one Let's Encrypt certificate, and one env var.
The alternative — subdomains like `api.orcha.example.com` — requires wildcard
DNS or multiple A records, a wildcard cert or multiple certs, and more env vars
to configure. For a self-hosted product targeting small-to-mid teams, the
simpler setup wins.

## Consequences

The frontend build receives path-based URLs as build args (e.g.,
`orcha_api_uri=https://orcha.example.com/api`) instead of the previous
subdomain-based pattern. Email templates and backend config that construct
URLs must also use the single-domain convention.
