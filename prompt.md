# Claude Code Prompt: ACL Revalidatie Gym App

BELANGRIJK: Lees deze prompt volledig door en bouw het project stap voor stap op!

---

## Project Overzicht

Bouw een mobiele-first Progressive Web App (PWA) voor ACL-revalidatie na een quad tendon graft reconstructie + meniscushechting. De app bevat een gestructureerd gym-schema, oefening-illustraties, sessie-tracking, progressie-logging en een pijn/zwelling dagboek. De app moet deelbaar zijn (read-only link voor bijv. fysiotherapeut) en volledig serverless draaien op Cloudflare.

---

## Tech Stack

- **Frontend**: React (Vite) met Tailwind CSS, gebouwd als PWA (installeerbaar, offline-capable)
- **Hosting**: Cloudflare Pages (static frontend)
- **Backend/API**: Cloudflare Workers (API endpoints)
- **Database**: Cloudflare D1 (SQLite, serverless, gratis tier)
- **Auth**: Simpele PIN-code of magic link (geen OAuth complexiteit nodig)
- **Oefening-illustraties**: MuscleWiki API (https://musclewiki.com) of wger REST API (https://wger.de/api/v2/) — gebruik hun open-source exercise images. Fallback: genereer simpele SVG placeholder illustraties per oefening.

---

Voordat je begint: controleer of `wrangler` is geïnstalleerd
(`npm install -g wrangler`). Vraag me om `npx wrangler login`
te draaien als er nog geen auth token is. Doe GEEN deployment
zonder mijn expliciete bevestiging.

---

## Database Schema (Cloudflare D1)

```sql
-- Gebruikers (simpel, geen OAuth)
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  share_token TEXT UNIQUE DEFAULT (lower(hex(randomblob(16)))),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Oefeningen (master data)
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'warmup', 'blok_a', 'blok_b', 'blok_c', 'cooldown'
  default_sets INTEGER,
  default_reps TEXT, -- '3x20' of '3x30sec'
  default_weight TEXT,
  note TEXT, -- aandachtspunt
  image_url TEXT, -- URL naar oefening illustratie
  sort_order INTEGER,
  is_timed BOOLEAN DEFAULT FALSE -- voor planks, balans, etc.
);

-- Sessie tracking
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  notes TEXT
);

-- Per-oefening logging binnen een sessie
CREATE TABLE session_exercises (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  completed BOOLEAN DEFAULT FALSE,
  sets_completed INTEGER,
  reps_completed TEXT,
  weight_used TEXT,
  notes TEXT
);

-- Pijn/zwelling dagboek
CREATE TABLE health_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  swelling INTEGER CHECK(swelling BETWEEN 0 AND 10), -- 0=geen, 10=ernstig
  pain INTEGER CHECK(pain BETWEEN 0 AND 10),
  stiffness INTEGER CHECK(stiffness BETWEEN 0 AND 10),
  rom_extension BOOLEAN, -- volle extensie bereikt?
  rom_flexion_degrees INTEGER, -- geschatte flexie in graden
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Seed Data: Oefeningen

Laad bij eerste deployment deze oefeningen in:

```json
[
  {
    "id": "warmup_bike",
    "name": "Hometrainer",
    "category": "warmup",
    "default_sets": 1,
    "default_reps": "5 min",
    "default_weight": "Licht",
    "note": "Lage weerstand, opwarmen",
    "is_timed": true,
    "sort_order": 1
  },
  {
    "id": "warmup_quad_sets",
    "name": "Quad Sets (isometrisch)",
    "category": "warmup",
    "default_sets": 3,
    "default_reps": "10",
    "default_weight": "Lichaamsgewicht",
    "note": "5 seconden vasthouden per rep",
    "is_timed": false,
    "sort_order": 2
  },
  {
    "id": "warmup_slr",
    "name": "Straight Leg Raises",
    "category": "warmup",
    "default_sets": 2,
    "default_reps": "15 per been",
    "default_weight": "Lichaamsgewicht",
    "note": "Alle richtingen: voor, zij, achter",
    "is_timed": false,
    "sort_order": 3
  },
  {
    "id": "a_leg_press",
    "name": "Leg Press",
    "category": "blok_a",
    "default_sets": 3,
    "default_reps": "20",
    "default_weight": "35 kg × 2",
    "note": "⚠️ Max 70-80° knieflexie (meniscus!)",
    "is_timed": false,
    "sort_order": 10
  },
  {
    "id": "a_leg_curl",
    "name": "Leg Curl (machine)",
    "category": "blok_a",
    "default_sets": 3,
    "default_reps": "15",
    "default_weight": "35 kg",
    "note": "Langzaam, geen momentum",
    "is_timed": false,
    "sort_order": 11
  },
  {
    "id": "a_glute_bridge",
    "name": "Glute Bridges",
    "category": "blok_a",
    "default_sets": 3,
    "default_reps": "15",
    "default_weight": "Lichaamsgewicht",
    "note": "2 sec squeeze bovenaan",
    "is_timed": false,
    "sort_order": 12
  },
  {
    "id": "a_calf_raise",
    "name": "Calf Raises (staand)",
    "category": "blok_a",
    "default_sets": 3,
    "default_reps": "20",
    "default_weight": "Lichaamsgewicht",
    "note": "Bilateraal, volle ROM",
    "is_timed": false,
    "sort_order": 13
  },
  {
    "id": "b_lat_pull",
    "name": "Lat Pulldown",
    "category": "blok_b",
    "default_sets": 3,
    "default_reps": "12",
    "default_weight": "27 kg",
    "note": "Schouderbladen samentrekken",
    "is_timed": false,
    "sort_order": 20
  },
  {
    "id": "b_chest_press",
    "name": "Chest Press",
    "category": "blok_b",
    "default_sets": 3,
    "default_reps": "12",
    "default_weight": "17,5 kg × 2 + stang",
    "note": "Gecontroleerd tempo",
    "is_timed": false,
    "sort_order": 21
  },
  {
    "id": "b_ohp",
    "name": "Overhead Press",
    "category": "blok_b",
    "default_sets": 3,
    "default_reps": "12",
    "default_weight": "10 kg × 2 + stang",
    "note": "Core aanspannen",
    "is_timed": false,
    "sort_order": 22
  },
  {
    "id": "b_trap_bar_dl",
    "name": "Trap Bar Deadlift",
    "category": "blok_b",
    "default_sets": 3,
    "default_reps": "12",
    "default_weight": "5 kg × 2 + bar",
    "note": "Rug recht, vanuit de heupen",
    "is_timed": false,
    "sort_order": 23
  },
  {
    "id": "c_band_walks",
    "name": "Lateral Band Walks",
    "category": "blok_c",
    "default_sets": 2,
    "default_reps": "15 per richting",
    "default_weight": "Weerstandsband",
    "note": "Knieën naar buiten duwen",
    "is_timed": false,
    "sort_order": 30
  },
  {
    "id": "c_clamshells",
    "name": "Clamshells (met band)",
    "category": "blok_c",
    "default_sets": 2,
    "default_reps": "15 per kant",
    "default_weight": "Weerstandsband",
    "note": "Heup stabiel houden",
    "is_timed": false,
    "sort_order": 31
  },
  {
    "id": "c_plank",
    "name": "Plank (front)",
    "category": "blok_c",
    "default_sets": 3,
    "default_reps": "30-45 sec",
    "default_weight": "Lichaamsgewicht",
    "note": "Heupen niet laten zakken",
    "is_timed": true,
    "sort_order": 32
  },
  {
    "id": "c_dead_bugs",
    "name": "Dead Bugs",
    "category": "blok_c",
    "default_sets": 2,
    "default_reps": "10 per kant",
    "default_weight": "Lichaamsgewicht",
    "note": "Onderrug op de grond houden",
    "is_timed": false,
    "sort_order": 33
  },
  {
    "id": "c_balance",
    "name": "Eenbenig Staan",
    "category": "blok_c",
    "default_sets": 3,
    "default_reps": "30 sec per been",
    "default_weight": "Lichaamsgewicht",
    "note": "Eventueel op balanspad/bosu",
    "is_timed": true,
    "sort_order": 34
  },
  {
    "id": "cooldown_bike",
    "name": "Hometrainer (uitfietsen)",
    "category": "cooldown",
    "default_sets": 1,
    "default_reps": "5 min",
    "default_weight": "Licht",
    "note": "Rustig uitfietsen",
    "is_timed": true,
    "sort_order": 40
  },
  {
    "id": "cooldown_ice",
    "name": "IJzen knie",
    "category": "cooldown",
    "default_sets": 1,
    "default_reps": "15-20 min",
    "default_weight": "—",
    "note": "Direct na sessie",
    "is_timed": true,
    "sort_order": 41
  }
]
```

---

## App Structuur & Schermen

### 1. Login / Setup

- Eerste keer: naam + 4-cijferige PIN instellen
- Daarna: PIN invoeren om in te loggen
- PIN wordt gehashed opgeslagen in D1

### 2. Dashboard (home)

- Welkomstbericht met naam
- Volgende geplande sessie (ma/wo/vr)
- Snelle stats: aantal sessies deze week, streak
- Laatste pijn/zwelling score als kleur-indicator (groen/oranje/rood)
- Knop: "Start Sessie" en "Dagboek invullen"

### 3. Sessie Scherm (workout view)

- Toon oefeningen per blok (tabs of scrollbare secties):
  - ☀️ Warming-up
  - 🦵 Blok A — Knie-revalidatie
  - 💪 Blok B — Upper body
  - ⚖️ Blok C — Stabiliteit
  - ❄️ Cooling down
- Per oefening:
  - Naam + illustratie (afbeelding uit open-source library)
  - Sets × Reps (aanpasbaar per sessie)
  - Gewicht veld (aanpasbaar, onthoudt laatste waarde)
  - Aandachtspunt als waarschuwingslabel
  - Checkbox om af te vinken
  - Bij `is_timed: true`: ingebouwde countdown timer met geluidssignaal
- Progress bar bovenaan: "7/17 oefeningen voltooid"
- "Sessie Afronden" knop onderaan

### 4. Timer Component

- Grote countdown cijfers (goed leesbaar in gym)
- Start / Pauze / Reset knoppen
- Standaard ingesteld op de default tijd van de oefening
- Aanpasbaar met +/- 15 sec knoppen
- Trilsignaal + geluid bij 0 (via Vibration API + Audio)

### 5. Dagboek (Health Log)

- Datum (default: vandaag)
- Sliders of segmented controls voor:
  - Zwelling (0-10)
  - Pijn (0-10)
  - Stijfheid (0-10)
- Toggles:
  - Volle extensie bereikt? (ja/nee)
  - Geschatte flexie (slider 0-150°)
- Notitie tekstveld
- Opslaan knop

### 6. Progressie / Historie

- Grafiek: gewichten per oefening over tijd (simpele line chart)
- Grafiek: zwelling/pijn trend over weken
- Lijst van afgeronde sessies met datum
- Gebruik een lichtgewicht chart library (bijv. Chart.js via CDN of recharts)

### 7. Delen (Share View)

- Via `share_token` in de users tabel
- URL: `https://[app-domain]/share/[share_token]`
- Read-only view voor fysiotherapeut:
  - Overzicht van alle sessies
  - Pijn/zwelling trend
  - Progressie per oefening
  - Geen bewerkingsrechten
- "Deel met fysiotherapeut" knop in settings genereert/toont de link

### 8. Instellingen

- Naam wijzigen
- PIN wijzigen
- Deel-link bekijken/kopiëren
- Schema aanpassen: oefeningen toevoegen/verwijderen/herordenen
- Data exporteren (JSON)

---

## Oefening Illustraties

Gebruik de **wger API** (https://wger.de/api/v2/) om exercise images op te halen:

- API is open-source en gratis
- Endpoint: `GET https://wger.de/api/v2/exerciseimage/?exercise={id}&format=json`
- Cache de afbeeldingen als statische assets in de build (niet runtime fetchen)
- Voor oefeningen die niet in wger staan (quad sets, clamshells, dead bugs, etc.): maak simpele SVG illustraties met duidelijke lichaamspositie

Alternatief als wger onvoldoende is: gebruik https://github.com/yuhonas/free-exercise-db (open-source exercise database met afbeeldingen op GitHub, MIT license).

---

## Cloudflare Setup

### Project structuur

```
acl-rehab-app/
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SessionView.jsx
│   │   │   ├── ExerciseCard.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── HealthLog.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── ShareView.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── manifest.json   # PWA manifest
│   │   ├── sw.js           # Service worker
│   │   └── images/         # Gecachte oefening illustraties
│   └── vite.config.js
├── worker/                 # Cloudflare Worker (API)
│   ├── src/
│   │   └── index.ts
│   └── wrangler.toml
├── schema.sql              # D1 database schema
└── seed.sql                # Seed data voor oefeningen
```

### wrangler.toml (Worker)

```toml
name = "acl-rehab-api"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "DB"
database_name = "acl-rehab-db"
database_id = "<wordt gegenereerd bij `wrangler d1 create`>"
```

### API Endpoints (Worker)

```
POST   /api/auth/register     — Nieuw account (naam + pin)
POST   /api/auth/login         — Login (pin verificatie)

GET    /api/exercises          — Alle oefeningen ophalen
PUT    /api/exercises/:id      — Oefening aanpassen (gewicht etc.)

POST   /api/sessions           — Nieuwe sessie starten
GET    /api/sessions           — Sessie historie
PUT    /api/sessions/:id       — Sessie updaten/afronden
POST   /api/sessions/:id/exercises — Oefening resultaat loggen

POST   /api/health-log         — Dagboek entry toevoegen
GET    /api/health-log         — Dagboek entries ophalen

GET    /api/share/:token       — Read-only data voor share link
GET    /api/progress/:exercise_id — Gewicht progressie per oefening
```

### Deployment stappen

```bash
# 1. Database aanmaken
npx wrangler d1 create acl-rehab-db

# 2. Schema laden
npx wrangler d1 execute acl-rehab-db --file=./schema.sql

# 3. Seed data laden
npx wrangler d1 execute acl-rehab-db --file=./seed.sql

# 4. Worker deployen
cd worker && npx wrangler deploy

# 5. Frontend deployen naar Cloudflare Pages
cd frontend && npm run build
npx wrangler pages deploy dist --project-name=acl-rehab-app
```

---

## Design Richtlijnen

- **Mobile-first**: ontwerp voor telefoonscherm in de gym
- **Grote touch targets**: knoppen minimaal 48px, makkelijk te raken met bezwete handen
- **Hoog contrast**: goed leesbaar onder TL-verlichting
- **Kleurenschema**: donkerblauw (#1a2744) als primary, accent blauw (#3b82f6), waarschuwingen in oranje/rood
- **Categorie kleuren**:
  - Warming-up: amber/geel
  - Blok A (knie): blauw
  - Blok B (upper body): donkergrijs
  - Blok C (stabiliteit): teal/groen
  - Cooling down: indigo/paars
- **Font**: system font stack voor snelheid
- **Animaties**: minimaal, enkel subtiele transitions
- **PWA**: installeerbaar op homescreen, offline-capable voor het geval gym slecht bereik heeft

---

## Belangrijke Aandachtspunten

1. **Offline support**: Cache het schema en de laatste sessie-data via Service Worker. Sync wanneer weer online.
2. **Timer moet werken op achtergrond**: gebruik `setInterval` met `visibilitychange` correctie zodat de timer klopt als het scherm uit gaat.
3. **Gewichten onthouden**: het laatst gebruikte gewicht per oefening automatisch invullen bij de volgende sessie.
4. **Meniscus waarschuwing**: bij leg press en squats altijd een visuele waarschuwing tonen over max ROM.
5. **Geen persoonsgegevens**: geen email, geen naam-vereiste voor share view, privacy-first.
6. **Taal**: hele app in het **Nederlands**.
