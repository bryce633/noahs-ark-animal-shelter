// Central place for reading configuration from environment variables, with
// sane defaults so the app runs out of the box for local development.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env loader (no external dependency). Only used if a .env file
// exists; real environment variables always take precedence.
function loadDotEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, 'utf8');
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip matching surrounding quotes, if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

export const config = {
  rootDir,
  port: Number(process.env.PORT) || 3000,
  databasePath: process.env.DATABASE_PATH
    ? path.resolve(rootDir, process.env.DATABASE_PATH)
    : path.join(rootDir, 'data', 'shelter.sqlite'),
  authSecret: process.env.AUTH_SECRET || 'dev-only-secret-change-me',
  authTokenTtlSeconds: Number(process.env.AUTH_TOKEN_TTL_SECONDS) || 43200,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'change-me-now',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
  },
};

if (config.authSecret === 'dev-only-secret-change-me') {
  // Not fatal, but worth a loud reminder since this signs auth tokens.
  console.warn(
    '[config] AUTH_SECRET is not set — using an insecure default. ' +
      'Set AUTH_SECRET in your .env before deploying this anywhere real.'
  );
}
