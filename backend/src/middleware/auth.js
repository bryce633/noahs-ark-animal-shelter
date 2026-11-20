import { HttpError } from '../lib/http.js';
import { verifyToken } from '../lib/auth.js';
import { db } from '../db.js';

// Verifies the Bearer token and attaches the authenticated user to ctx.user.
// Every /api route except /api/auth/login and /api/health requires this.
export function requireAuth(req, res, ctx) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Missing or malformed Authorization header (expected "Bearer <token>")');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = db
    .prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?')
    .get(payload.sub);

  if (!user) {
    throw new HttpError(401, 'User for this token no longer exists');
  }

  ctx.user = user;
}

// Use after requireAuth to restrict a route to admins.
export function requireAdmin(req, res, ctx) {
  if (ctx.user?.role !== 'ADMIN') {
    throw new HttpError(403, 'This action requires an admin account');
  }
}
