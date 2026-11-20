import { Router, HttpError } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { optionalString, requireEnum, optionalDate, parseId } from '../lib/validate.js';
import { db } from '../db.js';

// Cross-cutting views/actions on adoption applications that aren't scoped
// to a single animal (submitting a new one lives in animals.js, since it's
// always "apply for *this* animal").
export const applicationsRouter = new Router();

const STATUS_VALUES = ['PENDING', 'APPROVED', 'DENIED', 'WITHDRAWN'];

// GET /api/applications?status=&animalId=&personId=
applicationsRouter.get('/api/applications', requireAuth, async (req, res, ctx) => {
  const clauses = [];
  const params = [];

  if (ctx.query.status) {
    clauses.push('aa.status = ?');
    params.push(requireEnum({ status: ctx.query.status }, 'status', STATUS_VALUES));
  }
  if (ctx.query.animalId) {
    clauses.push('aa.animal_id = ?');
    params.push(parseId(ctx.query.animalId, 'animalId'));
  }
  if (ctx.query.personId) {
    clauses.push('aa.person_id = ?');
    params.push(parseId(ctx.query.personId, 'personId'));
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const applications = db
    .prepare(
      `SELECT aa.*, a.name AS animal_name, p.first_name, p.last_name
       FROM adoption_applications aa
       JOIN animals a ON a.id = aa.animal_id
       JOIN people p ON p.id = aa.person_id
       ${where}
       ORDER BY aa.submitted_date DESC`
    )
    .all(...params);

  ctx.sendJson(200, { applications });
});

// PATCH /api/applications/:id — move an application through its lifecycle.
applicationsRouter.patch('/api/applications/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'application id');
  const application = db.prepare('SELECT * FROM adoption_applications WHERE id = ?').get(id);
  if (!application) throw new HttpError(404, `No application found with id ${id}`);

  const fields = [];
  const params = [];

  if (ctx.body?.status !== undefined) {
    const status = requireEnum(ctx.body, 'status', STATUS_VALUES);
    fields.push('status = ?');
    params.push(status);
    if (status !== 'PENDING') {
      fields.push('decision_date = ?');
      params.push(new Date().toISOString().slice(0, 10));
    }
  }

  const notes = optionalString(ctx.body, 'notes', { maxLength: 4000 });
  if (notes !== undefined) {
    fields.push('notes = ?');
    params.push(notes);
  }

  if (fields.length === 0) {
    throw new HttpError(422, 'No valid fields provided to update');
  }

  params.push(id);
  db.prepare(`UPDATE adoption_applications SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM adoption_applications WHERE id = ?').get(id);
  ctx.sendJson(200, { application: updated });
});
