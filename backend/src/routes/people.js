import { Router, HttpError } from '../lib/http.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { requireString, optionalString, parseId } from '../lib/validate.js';
import { db } from '../db.js';

export const peopleRouter = new Router();

function getPersonOr404(id) {
  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(id);
  if (!person) throw new HttpError(404, `No person found with id ${id}`);
  return person;
}

function personWithHistory(person) {
  return {
    ...person,
    fosterAssignments: db
      .prepare(
        `SELECT fa.*, a.name AS animal_name
         FROM foster_assignments fa
         JOIN animals a ON a.id = fa.animal_id
         WHERE fa.person_id = ?
         ORDER BY fa.start_date DESC`
      )
      .all(person.id),
    applications: db
      .prepare(
        `SELECT aa.*, a.name AS animal_name
         FROM adoption_applications aa
         JOIN animals a ON a.id = aa.animal_id
         WHERE aa.person_id = ?
         ORDER BY aa.submitted_date DESC`
      )
      .all(person.id),
    adoptions: db
      .prepare(
        `SELECT ad.*, a.name AS animal_name
         FROM adoptions ad
         JOIN animals a ON a.id = ad.animal_id
         WHERE ad.person_id = ?
         ORDER BY ad.adoption_date DESC`
      )
      .all(person.id),
  };
}

// GET /api/people?q=
peopleRouter.get('/api/people', requireAuth, async (req, res, ctx) => {
  let people;
  if (ctx.query.q) {
    const like = `%${ctx.query.q}%`;
    people = db
      .prepare(
        `SELECT * FROM people
         WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?
         ORDER BY last_name, first_name`
      )
      .all(like, like, like, like);
  } else {
    people = db.prepare('SELECT * FROM people ORDER BY last_name, first_name').all();
  }
  ctx.sendJson(200, { people });
});

// POST /api/people
peopleRouter.post('/api/people', requireAuth, async (req, res, ctx) => {
  const firstName = requireString(ctx.body, 'firstName', { maxLength: 100 });
  const lastName = requireString(ctx.body, 'lastName', { maxLength: 100 });
  const email = optionalString(ctx.body, 'email', { maxLength: 200 });
  const phone = optionalString(ctx.body, 'phone', { maxLength: 40 });
  const address = optionalString(ctx.body, 'address', { maxLength: 500 });
  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });

  const result = db
    .prepare(
      'INSERT INTO people (first_name, last_name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(firstName, lastName, email ?? null, phone ?? null, address ?? null, notes ?? null);

  const person = getPersonOr404(result.lastInsertRowid);
  ctx.sendJson(201, { person: personWithHistory(person) });
});

// GET /api/people/:id
peopleRouter.get('/api/people/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'person id');
  const person = getPersonOr404(id);
  ctx.sendJson(200, { person: personWithHistory(person) });
});

// PATCH /api/people/:id
peopleRouter.patch('/api/people/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'person id');
  getPersonOr404(id);

  const fields = [];
  const params = [];
  const setIfPresent = (column, value) => {
    if (value !== undefined) {
      fields.push(`${column} = ?`);
      params.push(value);
    }
  };

  if (ctx.body?.firstName !== undefined) setIfPresent('first_name', requireString(ctx.body, 'firstName', { maxLength: 100 }));
  if (ctx.body?.lastName !== undefined) setIfPresent('last_name', requireString(ctx.body, 'lastName', { maxLength: 100 }));
  setIfPresent('email', optionalString(ctx.body, 'email', { maxLength: 200 }));
  setIfPresent('phone', optionalString(ctx.body, 'phone', { maxLength: 40 }));
  setIfPresent('address', optionalString(ctx.body, 'address', { maxLength: 500 }));
  setIfPresent('notes', optionalString(ctx.body, 'notes', { maxLength: 4000 }));

  if (fields.length === 0) {
    throw new HttpError(422, 'No valid fields provided to update');
  }

  fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");
  params.push(id);

  db.prepare(`UPDATE people SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  ctx.sendJson(200, { person: personWithHistory(getPersonOr404(id)) });
});

// DELETE /api/people/:id (admin only)
peopleRouter.delete('/api/people/:id', requireAuth, requireAdmin, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'person id');
  getPersonOr404(id);
  try {
    db.prepare('DELETE FROM people WHERE id = ?').run(id);
  } catch {
    throw new HttpError(
      409,
      'This person is referenced by foster, application, or adoption records and cannot be deleted'
    );
  }
  ctx.sendJson(204, undefined);
});
