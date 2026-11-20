import { Router, HttpError } from '../lib/http.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { optionalString, optionalEnum, optionalDate, parseId } from '../lib/validate.js';
import { db } from '../db.js';

// Standalone routes for a single medical record by its own id (as opposed
// to the animal-scoped list/create routes in animals.js).
export const medicalRouter = new Router();

function getMedicalRecordOr404(id) {
  const record = db.prepare('SELECT * FROM medical_records WHERE id = ?').get(id);
  if (!record) throw new HttpError(404, `No medical record found with id ${id}`);
  return record;
}

// PATCH /api/medical/:id
medicalRouter.patch('/api/medical/:id', requireAuth, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'medical record id');
  getMedicalRecordOr404(id);

  const fields = [];
  const params = [];
  const setIfPresent = (column, value) => {
    if (value !== undefined) {
      fields.push(`${column} = ?`);
      params.push(value);
    }
  };

  setIfPresent('record_date', optionalDate(ctx.body, 'recordDate'));
  setIfPresent(
    'type',
    optionalEnum(ctx.body, 'type', ['VACCINATION', 'EXAM', 'SURGERY', 'TREATMENT', 'TEST', 'OTHER'])
  );
  setIfPresent('description', optionalString(ctx.body, 'description', { maxLength: 2000 }));
  setIfPresent('veterinarian', optionalString(ctx.body, 'veterinarian', { maxLength: 200 }));
  setIfPresent('next_due_date', optionalDate(ctx.body, 'nextDueDate'));
  setIfPresent('notes', optionalString(ctx.body, 'notes', { maxLength: 4000 }));

  if (fields.length === 0) {
    throw new HttpError(422, 'No valid fields provided to update');
  }

  params.push(id);
  db.prepare(`UPDATE medical_records SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  ctx.sendJson(200, { medicalRecord: getMedicalRecordOr404(id) });
});

// DELETE /api/medical/:id (admin only)
medicalRouter.delete('/api/medical/:id', requireAuth, requireAdmin, async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'medical record id');
  getMedicalRecordOr404(id);
  db.prepare('DELETE FROM medical_records WHERE id = ?').run(id);
  ctx.sendJson(204, undefined);
});
