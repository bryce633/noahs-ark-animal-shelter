import { Router, HttpError } from '../lib/http.js';
import { hashPassword, verifyPassword, signToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { requireString, optionalString, optionalEnum } from '../lib/validate.js';
import { db } from '../db.js';

export const authRouter = new Router();

function publicUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

// POST /api/auth/register
// Creates a staff account. The very first account in the system may
// self-register as ADMIN (so a fresh install is usable); after that,
// creating new accounts requires an authenticated admin.
authRouter.post('/api/auth/register', async (req, res, ctx) => {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

  if (userCount > 0) {
    requireAuth(req, res, ctx);
    if (ctx.user.role !== 'ADMIN') {
      throw new HttpError(403, 'Only an admin can create new staff accounts');
    }
  }

  const username = requireString(ctx.body, 'username', { maxLength: 60 });
  const password = requireString(ctx.body, 'password', { maxLength: 200 });
  if (password.length < 8) {
    throw new HttpError(422, 'Invalid "password": must be at least 8 characters');
  }
  const email = optionalString(ctx.body, 'email', { maxLength: 200 });
  const role =
    userCount === 0 ? 'ADMIN' : optionalEnum(ctx.body, 'role', ['ADMIN', 'STAFF']) || 'STAFF';

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    throw new HttpError(409, 'That username is already taken');
  }

  const passwordHash = hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(username, email ?? null, passwordHash, role);

  const user = db
    .prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?')
    .get(result.lastInsertRowid);

  ctx.sendJson(201, { user: publicUser(user) });
});

// POST /api/auth/login
authRouter.post('/api/auth/login', async (req, res, ctx) => {
  const username = requireString(ctx.body, 'username', { maxLength: 60 });
  const password = requireString(ctx.body, 'password', { maxLength: 200 });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new HttpError(401, 'Invalid username or password');
  }

  const token = signToken({ sub: user.id, role: user.role });
  ctx.sendJson(200, { token, user: publicUser(user) });
});

// GET /api/auth/me
authRouter.get('/api/auth/me', requireAuth, async (req, res, ctx) => {
  ctx.sendJson(200, { user: ctx.user });
});
