// Starts the backend and the website together for local development.
// Output from each is labeled; Ctrl+C stops both.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
  { name: 'backend', dir: 'backend', color: '\x1b[35m' },
  { name: 'website', dir: 'website', color: '\x1b[32m' },
];

const children = [];
let shuttingDown = false;

function stopAll(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGINT');
  setTimeout(() => process.exit(code), 500);
}

for (const service of services) {
  const label = `${service.color}[${service.name}]\x1b[0m `;
  const child = spawn(npm, ['run', 'dev'], {
    cwd: path.join(root, service.dir),
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const prefix = (stream, target) => {
    let buffered = '';
    stream.on('data', (chunk) => {
      buffered += chunk.toString();
      const lines = buffered.split('\n');
      buffered = lines.pop();
      for (const line of lines) target.write(label + line + '\n');
    });
  };
  prefix(child.stdout, process.stdout);
  prefix(child.stderr, process.stderr);

  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`${label}stopped (exit code ${code}). Stopping everything.`);
      stopAll(code ?? 1);
    }
  });
  children.push(child);
}

console.log('\nStarting Noah’s Ark...');
console.log('  Website:   http://localhost:3123');
console.log('  Admin:     http://localhost:3123/login');
console.log('  Backend:   http://localhost:3000/api/health');
console.log('Press Ctrl+C to stop.\n');

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
