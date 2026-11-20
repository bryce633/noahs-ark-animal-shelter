import { Router, HttpError } from '../lib/http.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  requireString,
  optionalString,
  requireEnum,
  optionalEnum,
  optionalDate,
  optionalNumber,
  parseId,
} from '../lib/validate.js';
import { db } from '../db.js';

export const animalsRouter = new Router();

const SPECIES_VALUES = ['DOG', 'CAT', 'RABBIT', 'BIRD', 'REPTILE', 'SMALL_MAMMAL', 'OTHER'];
const SEX_VALUES = ['MALE', 'FEMALE', 'UNKNOWN'];
const STATUS_VALUES = [
  'INTAKE',
  'AVAILABLE',
  'PENDING',
  'FOSTERED',
  'ADOPTED',
  'MEDICAL_HOLD',
  'RETURNED',
  'DECEASED',
];

function getAnimalOr404(id) {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(id);
  if (!animal) throw new HttpError(404, `No animal found with id ${id}`);
  return animal;
}

function animalWithRelations(animal) {
  return {
    ...animal,
    intakeRecords: db
      .prepare('SELECT * FROM intake_records WHERE animal_id = ? ORDER BY intake_date DESC')
      .all(animal.id),
    medicalRecords: db
      .prepare('SELECT * FROM medical_records WHERE animal_id = ? ORDER BY record_date DESC')
      .all(animal.id),
    fosterAssignments: db
      .prepare(
        `SELECT fa.*, p.first_name, p.last_name
         FROM foster_assignments fa
         JOIN people p ON p.id = fa.person_id
         WHERE fa.animal_id = ?
         ORDER BY fa.start_date DESC`
      )
      .all(animal.id),
    applications: db
      .prepare(
        `SELECT aa.*, p.first_name, p.last_name
         FROM adoption_applications aa
         JOIN people p ON p.id = aa.person_id
         WHERE aa.animal_id = ?
         ORDER BY aa.submitted_date DESC`
      )
      .all(animal.id),
    adoption: db
      .prepare(
        `SELECT ad.*, p.first_name, p.last_name
         FROM adoptions ad
         JOIN people p ON p.id = ad.person_id
         WHERE ad.animal_id = ?`
      )
      .get(animal.id) || null,
  };
}

// GET /api/animals?status=&species=&q=
animalsRouter.get('/api/animals', requireAuth, async (req, res, ctx) => {
  const clauses = [];
  const params = [];

  if (ctx.query.status) {
    clauses.push('status = ?');
    params.push(requireEnum({ status: ctx.query.status }, 'status', STATUS_VALUES));
  }
  if (ctx.query.species) {
    clauses.push('species = ?');
    params.push(requireEnum({ species: ctx.query.species }, 'species', SPECIES_VALUES));
  }
  if (ctx.query.q) {
    clauses.push('(name LIKE ? OR breed LIKE ? OR microchip_id LIKE ?)');
    const like = `%${ctx.query.q}%`;
    params.push(like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const animals = db
    .prepare(`SELECT * FROM animals ${where} ORDER BY created_at DESC`)
    .all(...params);

  ctx.sendJson(200, { animals });
});

// POST /api/animals
animalsRouter.post('/api/animals', requireAuth, async (req, res, ctx) => {
  const name = requireString(ctx.body, 'name', { maxLength: 120 });
  const species = requireEnum(ctx.body, 'species', SPECIES_VALUES);
  const breed = optionalString(ctx.body, 'breed', { maxLength: 120 });
  const sex = optionalEnum(ctx.body, 'sex', SEX_VALUES) || 'UNKNOWN';
  const birthDate = optionalDate(ctx.body, 'birthDate');
  const isAgeEstimated = Boolean(ctx.body?.isAgeEstimated);
  const color = optionalString(ctx.body, 'color', { maxLength: 120 });
  const weightLbs = optionalNumber(ctx.body, 'weightLbs', { min: 0, max: 500 });
  const microchipId = optionalString(ctx.body, 'microchipId', { maxLength: 60 });
  const status = optionalEnum(ctx.body, 'status', STATUS_VALUES) || 'INTAKE';
  const description = optionalString(ctx.body, 'description', { maxLength: 4000 });
  const photoUrl = optionalString(ctx.body, 'photoUrl', { maxLength: 1000 });
  const intakeDate = optionalDate(ctx.body, 'intakeDate');

  const result = db
    .prepare(
      `INSERT INTO animals
        (name, species, breed, sex, birth_date, is_age_estimated, color, weight_lbs,
         microchip_id, status, description, photo_url, intake_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      species,
      breed ?? null,
      sex,
      birthDate ?? null,
      isAgeEstimated ? 1 : 0,
      color ?? null,
      weightLbs ?? null,
      microchipId ?? null,
      status,
      description ?? null,
      photoUrl ?? null,
      intakeDate ?? null
    );

  const animal = getAnimalOr404(result.lastInsertRowid);
  ctx.sendJson(201, { animal: animalWithRelations(animal) });
});

// GET /api/animals/:id
animalsRouter.get('/api/animals/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  const animal = getAnimalOr404(id);
  ctx.sendJson(200, { animal: animalWithRelations(animal) });
});

// PATCH /api/animals/:id
animalsRouter.patch('/api/animals/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);

  const fields = [];
  const params = [];

  const setIfPresent = (column, value) => {
    if (value !== undefined) {
      fields.push(`${column} = ?`);
      params.push(value);
    }
  };

  if (ctx.body?.name !== undefined) setIfPresent('name', requireString(ctx.body, 'name', { maxLength: 120 }));
  if (ctx.body?.species !== undefined) setIfPresent('species', requireEnum(ctx.body, 'species', SPECIES_VALUES));
  setIfPresent('breed', optionalString(ctx.body, 'breed', { maxLength: 120 }) ?? undefined);
  setIfPresent('sex', optionalEnum(ctx.body, 'sex', SEX_VALUES));
  setIfPresent('birth_date', optionalDate(ctx.body, 'birthDate'));
  if (ctx.body?.isAgeEstimated !== undefined) setIfPresent('is_age_estimated', Boolean(ctx.body.isAgeEstimated) ? 1 : 0);
  setIfPresent('color', optionalString(ctx.body, 'color', { maxLength: 120 }));
  setIfPresent('weight_lbs', optionalNumber(ctx.body, 'weightLbs', { min: 0, max: 500 }));
  setIfPresent('microchip_id', optionalString(ctx.body, 'microchipId', { maxLength: 60 }));
  setIfPresent('status', optionalEnum(ctx.body, 'status', STATUS_VALUES));
  setIfPresent('description', optionalString(ctx.body, 'description', { maxLength: 4000 }));
  setIfPresent('photo_url', optionalString(ctx.body, 'photoUrl', { maxLength: 1000 }));
  setIfPresent('intake_date', optionalDate(ctx.body, 'intakeDate'));

  if (fields.length === 0) {
    throw new HttpError(422, 'No valid fields provided to update');
  }

  fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  params.push(id);

  db.prepare(`UPDATE animals SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  const animal = getAnimalOr404(id);
  ctx.sendJson(200, { animal: animalWithRelations(animal) });
});

// DELETE /api/animals/:id (admin only — this is a destructive, permanent action)
animalsRouter.delete('/api/animals/:id', requireAuth, requireAdmin, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);
  db.prepare('DELETE FROM animals WHERE id = ?').run(id);
  ctx.sendJson(204, undefined);
});

// ---- Intake records ----

// GET /api/animals/:id/intake
animalsRouter.get('/api/animals/:id/intake', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);
  const records = db
    .prepare('SELECT * FROM intake_records WHERE animal_id = ? ORDER BY intake_date DESC')
    .all(id);
  ctx.sendJson(200, { intakeRecords: records });
});

// POST /api/animals/:id/intake
animalsRouter.post('/api/animals/:id/intake', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);

  const intakeDate = ctx.body?.intakeDate
    ? optionalDate(ctx.body, 'intakeDate')
    : new Date().toISOString().slice(0, 10);
  const intakeType = requireEnum(ctx.body, 'intakeType', [
    'STRAY',
    'SURRENDER',
    'TRANSFER',
    'BORN_IN_CARE',
    'RETURN',
  ]);
  const source = optionalString(ctx.body, 'source', { maxLength: 300 });
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare(
      'INSERT INTO intake_records (animal_id, intake_date, intake_type, source, notes) VALUES (?, ?, ?, ?, ?)'
    )
    .run(id, intakeDate, intakeType, source ?? null, notes ?? null);

  db.prepare(
    "UPDATE animals SET intake_date = ?, status = 'INTAKE', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ).run(intakeDate, id);

  const record = db.prepare('SELECT * FROM intake_records WHERE id = ?').get(result.lastInsertRowid);
  ctx.sendJson(201, { intakeRecord: record });
});

// ---- Medical records ----

// GET /api/animals/:id/medical
animalsRouter.get('/api/animals/:id/medical', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);
  const records = db
    .prepare('SELECT * FROM medical_records WHERE animal_id = ? ORDER BY record_date DESC')
    .all(id);
  ctx.sendJson(200, { medicalRecords: records });
});

// POST /api/animals/:id/medical
animalsRouter.post('/api/animals/:id/medical', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);

  const recordDate = ctx.body?.recordDate
    ? optionalDate(ctx.body, 'recordDate')
    : new Date().toISOString().slice(0, 10);
  const type = requireEnum(ctx.body, 'type', [
    'VACCINATION',
    'EXAM',
    'SURGERY',
    'TREATMENT',
    'TEST',
    'OTHER',
  ]);
  const description = requireString(ctx.body, 'description', { maxLength: 2000 });
  const veterinarian = optionalString(ctx.body, 'veterinarian', { maxLength: 200 });
  const nextDueDate = optionalDate(ctx.body, 'nextDueDate');
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare(
      `INSERT INTO medical_records
        (animal_id, record_date, type, description, veterinarian, next_due_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, recordDate, type, description, veterinarian ?? null, nextDueDate ?? null, notes ?? null);

  const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(result.lastInsertRowid);
  ctx.sendJson(201, { medicalRecord: record });
});

// ---- Foster assignments ----

// GET /api/animals/:id/foster
animalsRouter.get('/api/animals/:id/foster', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);
  const assignments = db
    .prepare('SELECT * FROM foster_assignments WHERE animal_id = ? ORDER BY start_date DESC')
    .all(id);
  ctx.sendJson(200, { fosterAssignments: assignments });
});

// POST /api/animals/:id/foster — starts a new foster assignment.
animalsRouter.post('/api/animals/:id/foster', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);

  const personId = parseId(ctx.body?.personId, 'personId');
  const person = db.prepare('SELECT id FROM people WHERE id = ?').get(personId);
  if (!person) throw new HttpError(404, `No person found with id ${personId}`);

  const activeAssignment = db
    .prepare('SELECT id FROM foster_assignments WHERE animal_id = ? AND end_date IS NULL')
    .get(id);
  if (activeAssignment) {
    throw new HttpError(409, 'This animal already has an active foster assignment — end it first');
  }

  const startDate = ctx.body?.startDate
    ? optionalDate(ctx.body, 'startDate')
    : new Date().toISOString().slice(0, 10);
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare('INSERT INTO foster_assignments (animal_id, person_id, start_date, notes) VALUES (?, ?, ?, ?)')
    .run(id, personId, startDate, notes ?? null);

  db.prepare(
    "UPDATE animals SET status = 'FOSTERED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ).run(id);

  const assignment = db.prepare('SELECT * FROM foster_assignments WHERE id = ?').get(result.lastInsertRowid);
  ctx.sendJson(201, { fosterAssignment: assignment });
});

// PATCH /api/foster/:id — typically used to end an assignment (set endDate).
animalsRouter.patch('/api/foster/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'foster assignment id');
  const assignment = db.prepare('SELECT * FROM foster_assignments WHERE id = ?').get(id);
  if (!assignment) throw new HttpError(404, `No foster assignment found with id ${id}`);

  const endDate = optionalDate(ctx.body, 'endDate') ?? new Date().toISOString().slice(0, 10);
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  db.prepare('UPDATE foster_assignments SET end_date = ?, notes = COALESCE(?, notes) WHERE id = ?').run(
    endDate,
    notes ?? null,
    id
  );

  const stillFostered = db
    .prepare('SELECT id FROM foster_assignments WHERE animal_id = ? AND end_date IS NULL')
    .get(assignment.animal_id);

  if (!stillFostered) {
    db.prepare(
      "UPDATE animals SET status = 'AVAILABLE', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND status = 'FOSTERED'"
    ).run(assignment.animal_id);
  }

  const updated = db.prepare('SELECT * FROM foster_assignments WHERE id = ?').get(id);
  ctx.sendJson(200, { fosterAssignment: updated });
});

// ---- Adoption applications ----

// POST /api/animals/:id/applications — submit an application for this animal.
animalsRouter.post('/api/animals/:id/applications', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  getAnimalOr404(id);

  const personId = parseId(ctx.body?.personId, 'personId');
  const person = db.prepare('SELECT id FROM people WHERE id = ?').get(personId);
  if (!person) throw new HttpError(404, `No person found with id ${personId}`);

  const submittedDate = ctx.body?.submittedDate
    ? optionalDate(ctx.body, 'submittedDate')
    : new Date().toISOString().slice(0, 10);
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare(
      'INSERT INTO adoption_applications (animal_id, person_id, submitted_date, notes) VALUES (?, ?, ?, ?)'
    )
    .run(id, personId, submittedDate, notes ?? null);

  const application = db
    .prepare('SELECT * FROM adoption_applications WHERE id = ?')
    .get(result.lastInsertRowid);
  ctx.sendJson(201, { application });
});

// POST /api/animals/:id/adopt — finalizes an adoption.
animalsRouter.post('/api/animals/:id/adopt', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  const animal = getAnimalOr404(id);

  const existingAdoption = db.prepare('SELECT id FROM adoptions WHERE animal_id = ?').get(id);
  if (existingAdoption || animal.status === 'ADOPTED') {
    throw new HttpError(409, 'This animal has already been adopted');
  }

  const personId = parseId(ctx.body?.personId, 'personId');
  const person = db.prepare('SELECT id FROM people WHERE id = ?').get(personId);
  if (!person) throw new HttpError(404, `No person found with id ${personId}`);

  let applicationId = null;
  if (ctx.body?.applicationId !== undefined) {
    applicationId = parseId(ctx.body.applicationId, 'applicationId');
    const application = db
      .prepare('SELECT id FROM adoption_applications WHERE id = ? AND animal_id = ?')
      .get(applicationId, id);
    if (!application) {
      throw new HttpError(404, `No application ${applicationId} found for animal ${id}`);
    }
  }

  const adoptionDate = ctx.body?.adoptionDate
    ? optionalDate(ctx.body, 'adoptionDate')
    : new Date().toISOString().slice(0, 10);
  const fee = optionalNumber(ctx.body, 'fee', { min: 0, max: 10000 });
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare(
      `INSERT INTO adoptions (animal_id, person_id, application_id, adoption_date, fee, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, personId, applicationId, adoptionDate, fee ?? null, notes ?? null);

  db.prepare(
    "UPDATE animals SET status = 'ADOPTED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?"
  ).run(id);

  if (applicationId) {
    db.prepare(
      "UPDATE adoption_applications SET status = 'APPROVED', decision_date = ? WHERE id = ?"
    ).run(adoptionDate, applicationId);
  }

  const adoption = db.prepare('SELECT * FROM adoptions WHERE id = ?').get(result.lastInsertRowid);
  ctx.sendJson(201, { adoption });
});
