[![Deploy Cloudflare](https://github.com/nsamsin/ACL-Recovery-GymApp/actions/workflows/cloudflare-deploy.yml/badge.svg)](https://github.com/nsamsin/ACL-Recovery-GymApp/actions/workflows/cloudflare-deploy.yml)

# ACL Revalidatie Gym App

Mobiele-first Progressive Web App (PWA) voor ACL-revalidatie na een quad tendon graft reconstructie + meniscushechting.

De app bevat:
- gestructureerd gymschema (warming-up, blok A/B/C, cooling down)
- oefeningillustraties (wger + SVG fallback)
- sessie-tracking
- pijn/zwelling dagboek
- progressie-overzichten
- deelbare read-only view voor fysiotherapeut

## Architectuur

- `frontend/`
  - React 18 + Vite + Tailwind
  - PWA (`manifest.json` + `sw.js`)
  - Pages Function proxy: `functions/api/[[path]].js`
- `worker/`
  - Cloudflare Worker API (TypeScript)
  - D1 binding in `wrangler.toml`
- `schema.sql`
  - D1 schema
- `seed.sql`
  - standaard oefeningen

## Request Flow (productie)

1. Browser opent de app op Cloudflare Pages.
2. Frontend doet API-calls naar same-origin `/api/*`.
3. Pages Function proxyt `/api/*` naar de Worker.
4. Worker verwerkt business logic en leest/schrijft in D1.
5. JSON response gaat terug naar frontend.

## Tech Stack

| Laag | Technologie |
|---|---|
| Frontend | React 18 (Vite) + Tailwind CSS |
| Charts | Recharts |
| Hosting | Cloudflare Pages |
| Backend API | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Naam + 4-cijferige PIN (SHA-256 hash) |

## Kernfunctionaliteit

- Auth: registratie + login met naam/PIN
- Dashboard: stats + volgende sessie + streak
- Sessie view: per oefening loggen + timer
- Health log: pijn/zwelling/stijfheid/ROM
- Progressie: pijn/zwelling trend, cumulatieve sessies, gewichtprogressie per oefening
- Share view (`/share/:token`): read-only overzicht voor fysiotherapeut
- Settings:
  - naam wijzigen
  - PIN wijzigen
  - deel-link kopiëren
  - schema aanpassen (oefening toevoegen/verwijderen/herordenen)
  - JSON export
- Offline:
  - service worker caching
  - offline write queue in frontend met sync bij reconnect

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

## Lokaal Ontwikkelen

Vereisten:
- Node.js 20+
- npm
- Wrangler CLI (`npm i -g wrangler`)

### 1) Database

```bash
# vanuit repo root
npx wrangler d1 create acl-rehab-db
# zet database_id in worker/wrangler.toml

npx wrangler d1 execute acl-rehab-db --local --file=./schema.sql
npx wrangler d1 execute acl-rehab-db --local --file=./seed.sql
```

### 2) Worker lokaal

```bash
cd worker
npm ci
npx wrangler dev
```

### 3) Frontend lokaal

```bash
cd frontend
npm ci
npm run dev
```

## Handmatige Deployment

```bash
# Worker
cd worker
npx wrangler deploy

# Frontend
cd ../frontend
npm run build
npx wrangler pages deploy dist --project-name=acl-rehab-app
```

## Automatische Deployment via GitHub Actions

Workflow:
- `.github/workflows/cloudflare-deploy.yml`
- Trigger: elke push naar `main` (en handmatig via `workflow_dispatch`)
- Deployt zowel Worker als Pages

### Benodigde GitHub Secrets

Stel in op repo-niveau (`Settings -> Secrets and variables -> Actions`):

- `CLOUDFLARE_API_TOKEN`
  - Token met minimaal:
    - Workers Scripts: Edit
    - Cloudflare Pages: Edit
    - D1: Edit
- `CLOUDFLARE_ACCOUNT_ID`

Zodra deze secrets staan, wordt elke push naar `main` automatisch gedeployed.

## Oefeningillustraties

- wger-afbeeldingen gecached als statische assets onder:
  - `frontend/public/images/wger/`
- fallback SVG’s voor oefeningen zonder match
- attributie:
  - `frontend/public/images/wger/ATTRIBUTION.md`

## Security Notities

- PIN wordt gehashed opgeslagen (SHA-256).
- CORS is beperkt tot eigen Pages domein + localhost.
- Basis rate-limiting op auth endpoints aanwezig in Worker.

## Bekende Beperkingen

- Rate limiting is momenteel in-memory (per isolate), niet distributed persistent.
- Offline queue is client-side; conflict-resolutie is basic (best-effort replay).

