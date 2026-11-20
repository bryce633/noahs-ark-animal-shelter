import { Router } from '../lib/http.js';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../db.js';

export const dashboardRouter = new Router();

// GET /api/dashboard/stats — a quick operational snapshot for a landing
// page: how many animals are in each status, how much application/foster
// activity is outstanding, and what's happened recently.
dashboardRouter.get('/api/dashboard/stats', requireAuth, async (req, res, ctx) => {
  const animalsByStatus = db
    .prepare('SELECT status, COUNT(*) AS count FROM animals GROUP BY status')
    .all();

  const animalsBySpecies = db
    .prepare('SELECT species, COUNT(*) AS count FROM animals GROUP BY species')
    .all();

  const pendingApplications = db
    .prepare("SELECT COUNT(*) AS count FROM adoption_applications WHERE status = 'PENDING'")
    .get().count;

  const activeFosters = db
    .prepare('SELECT COUNT(*) AS count FROM foster_assignments WHERE end_date IS NULL')
    .get().count;

  const adoptionsThisMonth = db
    .prepare(
      "SELECT COUNT(*) AS count FROM adoptions WHERE strftime('%Y-%m', adoption_date) = strftime('%Y-%m', 'now')"
    )
    .get().count;

  const recentIntakes = db
    .prepare(
      `SELECT id, name, species, status, intake_date
       FROM animals
       WHERE intake_date IS NOT NULL
       ORDER BY intake_date DESC
       LIMIT 5`
    )
    .all();

  const medicalDueSoon = db
    .prepare(
      `SELECT mr.id, mr.animal_id, a.name AS animal_name, mr.type, mr.next_due_date
       FROM medical_records mr
       JOIN animals a ON a.id = mr.animal_id
       WHERE mr.next_due_date IS NOT NULL
         AND date(mr.next_due_date) <= date('now', '+14 days')
       ORDER BY mr.next_due_date ASC
       LIMIT 10`
    )
    .all();

  ctx.sendJson(200, {
    animalsByStatus,
    animalsBySpecies,
    pendingApplications,
    activeFosters,
    adoptionsThisMonth,
    recentIntakes,
    medicalDueSoon,
  });
});
