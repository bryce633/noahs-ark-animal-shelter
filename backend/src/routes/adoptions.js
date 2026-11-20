import { Router } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';

// Finalizing an adoption lives in animals.js (POST /api/animals/:id/adopt)
// since it's always "adopt out *this* animal". This is just the list view.
export const adoptionsRouter = new Router();

// GET /api/adoptions
adoptionsRouter.get('/api/adoptions', requireAuth, async (req, res, ctx) => {
  const adoptions = db
    .prepare(
      `SELECT ad.*, a.name AS animal_name, a.species, p.first_name, p.last_name
       FROM adoptions ad
       JOIN animals a ON a.id = ad.animal_id
       JOIN people p ON p.id = ad.person_id
       ORDER BY ad.adoption_date DESC`
    )
    .all();

  ctx.sendJson(200, { adoptions });
});
