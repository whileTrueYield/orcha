# Email providers: SMTP and Resend, drop AWS SES

The backend originally used AWS SES via `@aws-sdk/client-ses` as the sole email
provider. For self-hosted production, this forces every operator to maintain an
AWS account just for transactional email — a significant friction point when the
rest of the stack is self-contained (Postgres, Redis, MinIO all bundled).

We decided to replace SES with two provider options:

- **SMTP** — universal, works with any provider (Mailgun, SendGrid, Postfix,
  even SES via its SMTP interface at `email-smtp.<region>.amazonaws.com`)
- **Resend** — modern API-first provider with simple API-key auth

This keeps the email surface small (two providers, not three) while covering
the full spectrum: SMTP for operators who already have mail infrastructure,
Resend for those who want zero-config setup. SES users are not left behind —
they connect through the SMTP path.

## Considered options

- **Keep SES alongside SMTP and Resend** — rejected because SES is reachable via
  SMTP, so the SDK path adds a code path to maintain with no unique capability.
- **SMTP only** — viable, but Resend's API-key model is meaningfully simpler for
  new users who don't already have an SMTP server.
