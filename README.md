# ACL Rehab Gym App

A mobile-first Progressive Web App (PWA) for ACL rehabilitation after quad tendon graft reconstruction + meniscus repair.

The app includes:
- structured workout schedule (warm-up, block A/B/C, cool-down)
- exercise illustrations (wger + SVG fallback)
- session tracking
- pain/swelling journal
- progress analytics
- shareable read-only view for a physiotherapist

## Architecture

- `frontend/`
  - React 18 + Vite + Tailwind
  - PWA (`manifest.json` + `sw.js`)
  - Pages Function proxy: `functions/api/[[path]].js`
- `worker/`
  - Cloudflare Worker API (TypeScript)
  - D1 binding in `wrangler.toml`
- `schema.sql`
  - D1 database schema
- `seed.sql`
  - default exercise seed data

## Request Flow (Production)

1. Browser loads the app from Cloudflare Pages.
2. Frontend sends same-origin API calls to `/api/*`.
3. Pages Function proxies `/api/*` to the Worker.
4. Worker runs business logic and reads/writes D1.
5. JSON response is returned to the frontend.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS |
| Charts | Recharts |
| Hosting | Cloudflare Pages |
| Backend API | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Name + 4-digit PIN (SHA-256 hash) |

## Core Features

- Auth: register + login using name/PIN
- Dashboard: stats + next session + streak
- Session view: per-exercise logging + timer
- Health log: pain/swelling/stiffness/ROM
- Progress: pain/swelling trend, cumulative sessions, per-exercise weight trend
- Share view (`/share/:token`): read-only overview for physiotherapist
- Settings:
  - change name
  - change PIN
  - copy share link
  - edit program (add/remove/reorder exercises)
  - export JSON
- Offline:
  - service worker caching
  - offline write queue in frontend with reconnect sync

## API Endpoints

```txt
POST   /api/auth/register
POST   /api/auth/login

GET    /api/exercises
POST   /api/exercises
PUT    /api/exercises/:id
DELETE /api/exercises/:id
PUT    /api/exercises/reorder

PUT    /api/settings/name
PUT    /api/settings/pin

POST   /api/sessions
GET    /api/sessions
PUT    /api/sessions/:id
POST   /api/sessions/:id/exercises

POST   /api/health-log
GET    /api/health-log

GET    /api/share/:token
GET    /api/progress/:exercise_id
```

## Local Development

Requirements:
- Node.js 20+
- npm
- Wrangler CLI (`npm i -g wrangler`)

### 1) Database

```bash
# from repo root
npx wrangler d1 create acl-rehab-db
# set database_id in worker/wrangler.toml

npx wrangler d1 execute acl-rehab-db --local --file=./schema.sql
npx wrangler d1 execute acl-rehab-db --local --file=./seed.sql
```

### 2) Run Worker locally

```bash
cd worker
npm ci
npx wrangler dev
```

### 3) Run Frontend locally

```bash
cd frontend
npm ci
npm run dev
```

## Manual Deployment

```bash
# Worker
cd worker
npx wrangler deploy

# Frontend
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=acl-rehab-app
```

## Automatic Deployment (GitHub Actions)

Workflow:
- `.github/workflows/cloudflare-deploy.yml`
- Trigger: every push to `main` (and manual `workflow_dispatch`)
- Deploys both Worker and Pages

### Required GitHub Secrets

Set these at repository level (`Settings -> Secrets and variables -> Actions`):

- `CLOUDFLARE_API_TOKEN`
  - minimum scopes:
    - Workers Scripts: Edit
    - Cloudflare Pages: Edit
    - D1: Edit
- `CLOUDFLARE_ACCOUNT_ID`

Once set, each push to `main` automatically deploys.

## Exercise Illustrations

- wger images cached as static assets in:
  - `frontend/public/images/wger/`
- SVG fallback images for exercises without a wger match
- attribution:
  - `frontend/public/images/wger/ATTRIBUTION.md`

## Security Notes

- PINs are stored as SHA-256 hashes.
- CORS is restricted to the app domain and localhost.
- Basic auth endpoint rate limiting is implemented in the Worker.

## Known Limitations

- Rate limiting is currently in-memory (per isolate), not globally distributed.
- Offline queue sync is client-side best-effort replay.

## Public Repository Safety

This repository must not contain secrets or personal/private information.
Do not commit:
- API tokens
- account IDs outside required env/secrets references
- private URLs, emails, or credentials
- `.env` files with sensitive values
