// Creates the first admin user (from .env / defaults) and a handful of
// sample records so the API has something to look at right after setup.
// Safe to re-run: it skips anything that already exists.

import { db } from '../src/db.js';
import { config } from '../src/config.js';
import { hashPassword } from '../src/lib/auth.js';

function seedAdminUser() {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(config.admin.username);
  if (existing) {
    console.log(`[seed] Admin user "${config.admin.username}" already exists — skipping.`);
    return;
  }

  db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
    config.admin.username,
    config.admin.email,
    hashPassword(config.admin.password),
    'ADMIN'
  );

  console.log(`[seed] Created admin user "${config.admin.username}".`);
  if (config.admin.password === 'change-me-now') {
    console.log('[seed] WARNING: using the default password — set ADMIN_PASSWORD in .env before real use.');
  }
}

function seedSampleData() {
  const animalCount = db.prepare('SELECT COUNT(*) AS count FROM animals').get().count;
  if (animalCount > 0) {
    console.log('[seed] Animals already exist — skipping sample data.');
    return;
  }

  const insertAnimal = db.prepare(
    `INSERT INTO animals (name, species, breed, sex, birth_date, is_age_estimated, color, status, description, intake_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const colby = insertAnimal.run(
    'Colby',
    'DOG',
    'Golden Retriever mix',
    'MALE',
    '2023-04-01',
    1,
    'Golden',
    'AVAILABLE',
    'Friendly, energetic, great with kids. Loves fetch.',
    '2026-08-01'
  );

  const luna = insertAnimal.run(
    'Luna',
    'CAT',
    'Domestic Shorthair',
    'FEMALE',
    '2024-01-15',
    1,
    'Black and white',
    'MEDICAL_HOLD',
    'Shy at first, warms up quickly. Recovering from a minor procedure.',
    '2026-09-01'
  );

  db.prepare(
    'INSERT INTO intake_records (animal_id, intake_date, intake_type, source, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(colby.lastInsertRowid, '2026-08-01', 'STRAY', 'Found near Colby Park', 'Healthy on intake exam.');

  db.prepare(
    'INSERT INTO intake_records (animal_id, intake_date, intake_type, source, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(luna.lastInsertRowid, '2026-09-01', 'SURRENDER', 'Owner surrender', 'Owner moving, could not keep pet.');

  db.prepare(
    `INSERT INTO medical_records (animal_id, record_date, type, description, veterinarian, next_due_date)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(colby.lastInsertRowid, '2026-08-02', 'EXAM', 'Intake wellness exam — healthy.', 'Dr. Patel', null);

  db.prepare(
    `INSERT INTO medical_records (animal_id, record_date, type, description, veterinarian, next_due_date)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    luna.lastInsertRowid,
    '2026-09-02',
    'SURGERY',
    'Spay surgery, routine recovery.',
    'Dr. Patel',
    '2026-09-16'
  );

  const person = db
    .prepare('INSERT INTO people (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)')
    .run('Jamie', 'Rivera', 'jamie.rivera@example.com', '555-0101');

  db.prepare(
    'INSERT INTO adoption_applications (animal_id, person_id, submitted_date, notes) VALUES (?, ?, ?, ?)'
  ).run(colby.lastInsertRowid, person.lastInsertRowid, '2026-09-10', 'Has a fenced yard, works from home.');

  db.prepare(
    "UPDATE animals SET status = 'PENDING' WHERE id = ?"
  ).run(colby.lastInsertRowid);

  console.log('[seed] Created sample animals (Colby, Luna), an intake and medical history, a person, and a pending application.');
}

seedAdminUser();
seedSampleData();
console.log('[seed] Done.');
