# ACL Revalidatie Gym App

Mobiele-first Progressive Web App (PWA) voor ACL-revalidatie na een quad tendon graft reconstructie + meniscushechting. Bevat een gestructureerd gym-schema, oefening-illustraties, sessie-tracking, progressie-logging en een pijn/zwelling dagboek.

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Frontend | React 18 (Vite) + Tailwind CSS 3 |
| Charts | Recharts |
| Hosting | Cloudflare Pages |
| API | Cloudflare Workers (TypeScript) |
| Database | Cloudflare D1 (SQLite) |
| Auth | 4-cijferige PIN (SHA-256 gehashed) |

## Projectstructuur

```
.
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginSetup.jsx     # PIN-login & registratie
│   │   │   ├── Dashboard.jsx      # Welkom, stats, quick-actions
│   │   │   ├── SessionView.jsx    # Workout tracker per blok
│   │   │   ├── ExerciseCard.jsx   # Oefening-kaart met checkbox/timer
│   │   │   ├── Timer.jsx          # Countdown met vibratie & geluid
│   │   │   ├── HealthLog.jsx      # Pijn/zwelling/ROM dagboek
│   │   │   ├── Progress.jsx       # Trend-grafieken (Recharts)
│   │   │   ├── ShareView.jsx      # Deellink voor fysiotherapeut
│   │   │   └── Settings.jsx       # Instellingen & data-export
│   │   ├── lib/
│   │   │   ├── api.js             # Fetch-wrapper voor alle endpoints
│   │   │   └── constants.js       # API base URL & categorie-definitie
│   │   ├── App.jsx                # Routing, auth-state, tab-navigatie
│   │   ├── main.jsx               # Entry-point + service worker registratie
│   │   └── index.css              # Tailwind directives + card/button classes
│   ├── public/
│   │   ├── manifest.json          # PWA manifest (nl, standalone)
│   │   ├── sw.js                  # Service Worker (network-first cache)
│   │   ├── _redirects             # SPA fallback
│   │   └── images/                # SVG fallbacks + wger foto's
│   ├── functions/
│   │   └── api/[[path]].js        # Cloudflare Pages Function (API proxy)
│   └── vite.config.js
├── worker/                        # Cloudflare Worker (API)
│   ├── src/index.ts               # Alle API routes
│   └── wrangler.toml              # D1 database binding
├── schema.sql                     # Database schema (5 tabellen + indexen)
├── seed.sql                       # 18 oefeningen als seed data
└── prompt.md                      # Oorspronkelijke bouwopdracht
```

## Oefeningen (18 stuks)

De app bevat een vast revalidatieschema in 5 blokken:

| Blok | Kleur | Oefeningen |
|------|-------|------------|
| Warming-up | Amber | Hometrainer, Quad Sets, Straight Leg Raises |
| Blok A — Knie-revalidatie | Blauw | Leg Press, Leg Curl, Glute Bridges, Calf Raises |
| Blok B — Upper body | Grijs | Lat Pulldown, Chest Press, Overhead Press, Trap Bar Deadlift |
| Blok C — Stabiliteit | Teal | Lateral Band Walks, Clamshells, Plank, Dead Bugs, Eenbenig Staan |
| Cooling down | Indigo | Hometrainer (uitfietsen), IJzen knie |

## API Endpoints

```
POST   /api/auth/register          Nieuw account (naam + PIN)
POST   /api/auth/login             Login (PIN verificatie)

GET    /api/exercises              Alle oefeningen
PUT    /api/exercises/:id          Oefening aanpassen

POST   /api/sessions              Nieuwe sessie starten
GET    /api/sessions              Sessie historie
PUT    /api/sessions/:id          Sessie updaten/afronden
POST   /api/sessions/:id/exercises Oefening resultaat loggen

POST   /api/health-log            Dagboek entry toevoegen
GET    /api/health-log            Dagboek entries ophalen

GET    /api/share/:token          Read-only data voor deellink
GET    /api/progress/:exercise_id Gewicht progressie per oefening
```

## Lokaal ontwikkelen

### Vereisten

- Node.js >= 18
- npm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (voor D1)

### Database opzetten

```bash
# D1 database aanmaken (eerste keer)
npx wrangler d1 create acl-rehab-db

# Zet het database_id in worker/wrangler.toml

# Schema laden
npx wrangler d1 execute acl-rehab-db --local --file=./schema.sql

# Seed data laden
npx wrangler d1 execute acl-rehab-db --local --file=./seed.sql
```

### Worker starten

```bash
cd worker
npm install
npx wrangler dev
# API draait op http://127.0.0.1:8787
```

### Frontend starten

```bash
cd frontend
npm install
npm run dev
# App draait op http://localhost:5173
```

De frontend detecteert automatisch localhost en stuurt API-calls naar `http://127.0.0.1:8787`.

## Deployment (Cloudflare)

```bash
# 1. Database schema + seed (remote)
npx wrangler d1 execute acl-rehab-db --file=./schema.sql
npx wrangler d1 execute acl-rehab-db --file=./seed.sql

# 2. Worker deployen
cd worker && npx wrangler deploy

# 3. Frontend bouwen & deployen naar Pages
cd frontend && npm run build
npx wrangler pages deploy dist --project-name=acl-rehab-app
```

In productie proxyt de Pages Function (`functions/api/[[path]].js`) alle `/api/*` requests naar de Worker, zodat de frontend same-origin API-calls kan doen.

## PWA

De app is installeerbaar op het homescreen:

- **manifest.json** met `display: standalone` en Nederlandse taalinstellingen
- **Service Worker** met network-first strategie en fallback naar cache
- SVG iconen (192x192 en 512x512)

## Oefening-illustraties

- **wger API** foto's (gecached als statische assets in `public/images/wger/`)
- **SVG fallbacks** voor oefeningen die niet in wger staan (quad sets, clamshells, dead bugs, etc.)

Attributie: zie `frontend/public/images/wger/ATTRIBUTION.md`.

## Bekend issues & TODO

Dit project is gegenereerd door OpenAI Codex en is ~75% compleet. Openstaande punten:

### Bugs

- [ ] React Rules of Hooks violation in `App.jsx` (hooks na conditionele return)
- [ ] Race condition bij user registratie (SELECT na INSERT zonder deterministische lookup)
- [ ] Login-collision: twee users met dezelfde PIN loggen in op hetzelfde account
- [ ] Timer useEffect dependency-loop (`secondsLeft` als dependency terwijl het in de callback wordt gewijzigd)

### Ontbrekende features

- [ ] Gewicht-progressie grafiek per oefening (endpoint bestaat, frontend mist)
- [ ] Lijst van afgeronde sessies met datum in Progressie-scherm
- [ ] Volledige read-only share view voor fysiotherapeut (nu alleen counts)
- [ ] Naam wijzigen in Instellingen
- [ ] PIN wijzigen in Instellingen
- [ ] Schema aanpassen (oefeningen toevoegen/verwijderen/herordenen)
- [ ] Kopieer-knop voor deellink
- [ ] Offline write-queue met sync

### Verbeteringen

- [ ] Rate limiting op login endpoint
- [ ] CORS beperken tot eigen domein
- [ ] PIN-invoer maskeren (`type="password"`)
- [ ] Loading states bij API-calls
- [ ] Echte streak-berekening (nu: `min(sessiesDezeWeek, 3)`)
- [ ] Volgende sessiedatum berekenen i.p.v. statische tekst
- [ ] Meer assets pre-cachen in Service Worker
- [ ] PWA iconen: `purpose: "maskable any"` toevoegen

## Licentie

Oefening-afbeeldingen van [wger](https://wger.de) vallen onder hun respectievelijke licenties (AGPL). Zie `ATTRIBUTION.md`.
