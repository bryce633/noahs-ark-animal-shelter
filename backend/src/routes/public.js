import { Router, HttpError } from '../lib/http.js';
import { requireEnum, parseId } from '../lib/validate.js';
import { db } from '../db.js';

// Read-only routes for the public website — no login required. They only
// ever return animals marked AVAILABLE, and only the fields that are safe to
// show visitors (no microchip IDs, medical, foster, or adopter details).
export const publicRouter = new Router();

const PUBLIC_COLUMNS = `id, name, species, breed, sex, birth_date, is_age_estimated,
  color, description, photo_url, intake_date`;

const SPECIES_VALUES = ['DOG', 'CAT', 'RABBIT', 'BIRD', 'REPTILE', 'SMALL_MAMMAL', 'OTHER'];

// GET /api/public/animals?species=
publicRouter.get('/api/public/animals', async (req, res, ctx) => {
  const clauses = ["status = 'AVAILABLE'"];
  const params = [];

  if (ctx.query.species) {
    clauses.push('species = ?');
    params.push(requireEnum({ species: ctx.query.species }, 'species', SPECIES_VALUES));
  }

  const animals = db
    .prepare(`SELECT ${PUBLIC_COLUMNS} FROM animals WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`)
    .all(...params);

  ctx.sendJson(200, { animals });
});

// GET /api/public/animals/:id
publicRouter.get('/api/public/animals/:id', async (req, res, ctx) => {
  const id = parseId(ctx.params.id, 'animal id');
  const animal = db
    .prepare(`SELECT ${PUBLIC_COLUMNS} FROM animals WHERE id = ? AND status = 'AVAILABLE'`)
    .get(id);

  if (!animal) throw new HttpError(404, `No available animal found with id ${id}`);
  ctx.sendJson(200, { animal });
});
