// First-time setup, run automatically before `npm run dev` (and by
// `npm run setup`). Every step is skipped when it's already done, so it's
// safe to run again.
//
//  1. Checks the Node.js version (the backend needs Node 22.5+ for node:sqlite).
//  2. Installs packages for the website and backend if they're missing.
//  3. Creates backend/.env from backend/.env.example.
//  4. Creates the local database with a starter admin account and sample animals.

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const website = path.join(root, 'website');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function log(message) {
  console.log(`\x1b[36m[setup]\x1b[0m ${message}`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    console.error(`\n[setup] "${command} ${args.join(' ')}" failed in ${path.relative(root, cwd) || '.'}`);
    process.exit(result.status ?? 1);
  }
}

// 1. Node version
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 5)) {
  console.error(
    `\n[setup] Node.js ${process.versions.node} is too old. Install Node.js 22.5 or newer (https://nodejs.org) and try again.\n`
  );
  process.exit(1);
}

// 2. Packages
for (const [name, dir] of [
  ['website', website],
  ['backend', backend],
]) {
  const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const hasDependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length > 0;
  if (hasDependencies && !existsSync(path.join(dir, 'node_modules'))) {
    log(`Installing ${name} packages (first run only)...`);
    run(npm, ['install'], dir);
  }
}

// 3. Backend settings
const envFile = path.join(backend, '.env');
if (!existsSync(envFile)) {
  copyFileSync(path.join(backend, '.env.example'), envFile);
  log('Created backend/.env from backend/.env.example.');
}

// 4. Local database
const env = readFileSync(envFile, 'utf8');
const dbSetting = env.match(/^\s*DATABASE_PATH\s*=\s*(.+)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, '');
const dbPath = path.resolve(backend, dbSetting || './data/shelter.sqlite');
if (!existsSync(dbPath)) {
  log('Creating the local database with a starter admin account and sample animals...');
  run(process.execPath, ['scripts/seed.js'], backend);
}
