# Adoption Center Backend (Colby)

An internal shelter management API: track animals from intake through
adoption, medical history, foster placements, adopters/donors, and
adoption applications.

Built with **zero external dependencies** — just Node.js. It uses Node's
built-in HTTP server, Node's built-in SQLite module (`node:sqlite`), and
Node's built-in crypto for auth. This means `npm install` isn't required
at all: as long as Node.js 22.5+ is installed, `npm start` works
immediately. (This was a deliberate choice for this setup, since package
registry access wasn't available — but it also means one less thing that
can break later.)

## Requirements

- Node.js **22.5.0 or later** (for `node:sqlite`). Check with `node -v`.
  If you're on an older Node, the fix is just to upgrade Node — nothing
  in this project needs it beyond that module.

## Getting started

```bash
# 1. Copy the example environment file and adjust if you want
cp .env.example .env

# 2. Create the database and a first admin user + sample data
npm run seed

# 3. Start the server
npm start
```

The server listens on `http://localhost:3000` by default (see `.env`).
The SQLite database file is created automatically at `data/shelter.sqlite`
(git-ignored) — no separate database server to install or run.

The seed script creates an admin account using `ADMIN_USERNAME` /
`ADMIN_PASSWORD` from your `.env` (defaults to `admin` / `change-me-now`
if you don't set them — **change this before using it for anything
real**). It also adds two sample animals (including one named Colby) so
there's something to look at right away. It's safe to re-run; it skips
anything that already exists.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Running the tests

```bash
npm test
```

This runs a full end-to-end smoke test suite (`test/smoke.test.js`) against
a real instance of the server on a throwaway database — registration,
login, animals, intake, medical records, fostering, applications, and
adoption, plus a few authorization checks. No test framework dependency
needed; it uses Node's built-in test runner (`node --test`).

## Authentication

All routes except `POST /api/auth/login`, `POST /api/auth/register`
(only for the very first account), and `GET /api/health` require a
Bearer token:

```
Authorization: Bearer <token>
```

Get one from `POST /api/auth/login`. Tokens are signed, short-lived
(12 hours by default — see `AUTH_TOKEN_TTL_SECONDS`), and there are two
roles:

- **STAFF** — full day-to-day access: manage animals, medical records,
  people, foster assignments, applications, and adoptions.
- **ADMIN** — everything STAFF can do, plus deleting animals/people/
  medical records and creating new staff accounts.

The first account ever created via `POST /api/auth/register` becomes
ADMIN automatically (so a fresh install is usable). Every account after
that requires an authenticated admin to create it.

## Data model

- **Animal** — name, species, breed, sex, birth date (with an
  "estimated" flag, since shelter intake ages are often guesses), color,
  weight, microchip ID, status, description, photo URL, intake date.
  Status is one of: `INTAKE`, `AVAILABLE`, `PENDING`, `FOSTERED`,
  `ADOPTED`, `MEDICAL_HOLD`, `RETURNED`, `DECEASED`.
- **IntakeRecord** — how and when an animal came into care (`STRAY`,
  `SURRENDER`, `TRANSFER`, `BORN_IN_CARE`, `RETURN`), source, notes.
- **MedicalRecord** — exams, vaccinations, surgeries, treatments, tests;
  who performed it, and an optional next-due date (surfaced on the
  dashboard so nothing gets missed).
- **Person** — an adopter, foster, or other contact. Not role-locked:
  the same person can foster one animal and adopt another.
- **FosterAssignment** — links a person to an animal for a date range;
  starting one sets the animal to `FOSTERED`, ending it (when no other
  active foster exists) returns the animal to `AVAILABLE`.
- **AdoptionApplication** — a person applying for a specific animal;
  status is `PENDING` / `APPROVED` / `DENIED` / `WITHDRAWN`.
- **Adoption** — the finalized adoption record (one per animal); can
  optionally reference the application it came from, which gets marked
  `APPROVED` automatically.
- **User** — a staff login (`ADMIN` or `STAFF`), separate from `Person`.

## API reference

All request/response bodies are JSON. Dates are `YYYY-MM-DD` strings.

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | First call ever creates an ADMIN, no auth needed. After that, requires an authenticated ADMIN. |
| POST | `/api/auth/login` | Returns `{ token, user }`. |
| GET | `/api/auth/me` | Returns the current user. |

### Animals
| Method | Path | Notes |
|---|---|---|
| GET | `/api/animals?status=&species=&q=` | `q` searches name/breed/microchip. |
| POST | `/api/animals` | Create an animal. |
| GET | `/api/animals/:id` | Includes intake, medical, foster, application, and adoption history. |
| PATCH | `/api/animals/:id` | Partial update. |
| DELETE | `/api/animals/:id` | Admin only. |
| GET/POST | `/api/animals/:id/intake` | Recording an intake also sets status to `INTAKE`. |
| GET/POST | `/api/animals/:id/medical` | |
| PATCH/DELETE | `/api/medical/:id` | Delete is admin only. |
| GET/POST | `/api/animals/:id/foster` | Starting a foster sets status to `FOSTERED`. |
| PATCH | `/api/foster/:id` | Set `endDate` to end it; returns animal to `AVAILABLE` if no other active foster. |
| POST | `/api/animals/:id/applications` | Submit an application (`personId`, optional `notes`). |
| POST | `/api/animals/:id/adopt` | Finalize an adoption (`personId`, optional `applicationId`, `fee`). Sets status to `ADOPTED`. |

### People, applications, adoptions, dashboard
| Method | Path | Notes |
|---|---|---|
| GET | `/api/people?q=` | Searches name/email/phone. |
| POST | `/api/people` | |
| GET | `/api/people/:id` | Includes foster/application/adoption history. |
| PATCH/DELETE | `/api/people/:id` | Delete is admin only; blocked if the person has related records. |
| GET | `/api/applications?status=&animalId=&personId=` | |
| PATCH | `/api/applications/:id` | Update `status` and/or `notes`. |
| GET | `/api/adoptions` | Full adoption history. |
| GET | `/api/dashboard/stats` | Counts by status/species, pending applications, active fosters, adoptions this month, recent intakes, medical items due within 14 days. |
| GET | `/api/health` | No auth required. |

### Public (for the website — no auth)
| Method | Path | Notes |
|---|---|---|
| GET | `/api/public/animals?species=` | Only `AVAILABLE` animals, only public-safe fields (no microchip, medical, foster, or adopter info). |
| GET | `/api/public/animals/:id` | 404 unless the animal is `AVAILABLE`. |

## A note on `node:sqlite`

Node's built-in SQLite module is still marked "experimental" by Node
itself (you'll see a one-line warning on startup — that's expected and
harmless). If a future Node release changes this API in a breaking way,
the only file that would need updating is `src/db.js`; nothing else in
the app talks to SQLite directly.

## Troubleshooting

**"disk I/O error" when starting the server or running the seed script.**
This happens when the SQLite database file sits on a filesystem that
doesn't support the file-locking calls SQLite normally uses — this can
happen inside synced folders (iCloud Drive, Dropbox, OneDrive) or some
network/virtual mounts. `src/db.js` already works around this by using
`PRAGMA locking_mode = EXCLUSIVE` (see the comment there for why). If you
still hit this error, the most reliable fix is pointing `DATABASE_PATH`
in your `.env` at a folder on a normal local disk instead, e.g.:
```
DATABASE_PATH=/Users/you/adoption-center-data/shelter.sqlite
```

**One consequence of that locking mode:** only one process can have the
database file open at a time. That's fine for normal use (the server
holds it open; the seed script only runs while the server is stopped),
but if you want to poke at the `.sqlite` file directly with a GUI tool
like DB Browser for SQLite, stop the server first.

## Project layout

```
src/
  server.js       entry point
  app.js          request routing, CORS, error handling
  config.js       reads .env / defaults
  db.js           SQLite connection + schema
  lib/            auth (hashing/tokens), HTTP helpers, validation helpers
  middleware/     requireAuth, requireAdmin
  routes/         one file per resource
scripts/seed.js   creates the first admin + sample data
test/             end-to-end smoke tests (node --test)
```
