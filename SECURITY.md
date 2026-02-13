# Security Policy

## Supported Versions

Security fixes are provided for:
- `main` (latest)

Older commits/branches are not maintained.

## Reporting a Vulnerability

Please do **not** open public issues for security vulnerabilities.

Report privately via one of the following:
- GitHub Security Advisories (preferred): `Security` tab in this repository
- Direct contact with the repository owner (`nsamsin`) if advisory flow is unavailable

Please include:
- clear reproduction steps
- affected endpoint(s) or file(s)
- impact assessment (confidentiality/integrity/availability)
- proof-of-concept (if available)

You can expect:
- acknowledgement within 72 hours
- a remediation plan or triage update within 7 days

## Security Design Notes

Current production architecture:
- Frontend: Cloudflare Pages (`frontend/`)
- API: Cloudflare Worker (`worker/`)
- DB: Cloudflare D1 (`schema.sql`, `seed.sql`)
- CI/CD: GitHub Actions deploy workflow (`.github/workflows/cloudflare-deploy.yml`)

## Current Security Controls

- Auth model:
  - login requires `name + 4-digit PIN`
  - PIN stored as SHA-256 hash (never plain text in DB)
- CORS restrictions:
  - limited to app Pages domain + localhost for development
- API hardening:
  - input validation on auth and settings routes
  - basic rate-limiting on login/register (worker isolate memory)
- Share access:
  - read-only access via per-user `share_token`
- Frontend:
  - PIN input is masked (`type="password"`)
  - same-origin `/api/*` calls via Pages Function proxy

## Secret Management

Required repository secrets for deploys:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Rules:
- never commit tokens/credentials to git
- rotate API tokens immediately if exposure is suspected
- keep token scope minimal (Workers/Pages/D1 deploy permissions only)

## Known Limitations

- Rate limiting is currently in-memory per worker isolate (not globally distributed).
- Offline queue sync is best-effort and client-side.
- No MFA support (by design for this rehab app scope).

## Hardening Roadmap

Planned improvements:
- distributed rate limiting (Durable Object/KV backed)
- audit/event logging for security-relevant actions
- stricter session model (token-based auth instead of localStorage identity headers)
- optional stronger auth mode for higher-risk deployments
