// Database layer. Uses Node's built-in SQLite module (node:sqlite) so this
// project runs with zero external dependencies — just Node.js 22.5+.
//
// node:sqlite is still marked experimental by Node itself; the warning it
// prints on startup is expected and harmless for this app's purposes.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const db = new DatabaseSync(config.databasePath);

db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = DELETE;');
// Note: intentionally NOT using WAL journal mode, and explicitly using
// EXCLUSIVE locking mode. WAL relies on shared memory (mmap) between the
// database file and a -shm sidecar file, and normal SQLite locking relies
// on POSIX byte-range locks that get upgraded/downgraded as reads and
// writes happen — several synced or virtual filesystems (iCloud Drive,
// Dropbox/OneDrive-managed folders, some network and virtualized mounts)
// don't support those lock transitions properly and fail with a bare
// "disk I/O error" the moment SQLite tries to write. EXCLUSIVE locking
// mode takes one lock for the life of the connection instead of juggling
// locks per-statement, which sidesteps that problem. This is safe here
// because this app only ever opens the database from a single process at
// a time (the server, or a one-off script like the seed script) — it was
// never going to be accessed by multiple processes concurrently anyway.
db.exec('PRAGMA locking_mode = EXCLUSIVE;');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN', 'STAFF')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS people (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS animals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  species       TEXT NOT NULL,
  breed         TEXT,
  sex           TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (sex IN ('MALE', 'FEMALE', 'UNKNOWN')),
  birth_date    TEXT,
  is_age_estimated INTEGER NOT NULL DEFAULT 0,
  color         TEXT,
  weight_lbs    REAL,
  microchip_id  TEXT,
  status        TEXT NOT NULL DEFAULT 'INTAKE' CHECK (
                  status IN ('INTAKE', 'AVAILABLE', 'PENDING', 'FOSTERED', 'ADOPTED', 'MEDICAL_HOLD', 'RETURNED', 'DECEASED')
                ),
  description   TEXT,
  photo_url     TEXT,
  intake_date   TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS intake_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id   INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  intake_date TEXT NOT NULL,
  intake_type TEXT NOT NULL CHECK (intake_type IN ('STRAY', 'SURRENDER', 'TRANSFER', 'BORN_IN_CARE', 'RETURN')),
  source      TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS medical_records (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id      INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_date    TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('VACCINATION', 'EXAM', 'SURGERY', 'TREATMENT', 'TEST', 'OTHER')),
  description    TEXT NOT NULL,
  veterinarian   TEXT,
  next_due_date  TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS foster_assignments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id  INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  person_id  INTEGER NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  start_date TEXT NOT NULL,
  end_date   TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS adoption_applications (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id      INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  person_id      INTEGER NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  submitted_date TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN')),
  notes          TEXT,
  decision_date  TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS adoptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  animal_id     INTEGER NOT NULL UNIQUE REFERENCES animals(id) ON DELETE RESTRICT,
  person_id     INTEGER NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  application_id INTEGER REFERENCES adoption_applications(id) ON DELETE SET NULL,
  adoption_date TEXT NOT NULL,
  fee           REAL,
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species);
CREATE INDEX IF NOT EXISTS idx_intake_animal ON intake_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_medical_animal ON medical_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_foster_animal ON foster_assignments(animal_id);
CREATE INDEX IF NOT EXISTS idx_foster_person ON foster_assignments(person_id);
CREATE INDEX IF NOT EXISTS idx_applications_animal ON adoption_applications(animal_id);
CREATE INDEX IF NOT EXISTS idx_applications_person ON adoption_applications(person_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON adoption_applications(status);
CREATE INDEX IF NOT EXISTS idx_adoptions_person ON adoptions(person_id);
`;

export function initSchema() {
  db.exec(SCHEMA);
}

initSchema();
