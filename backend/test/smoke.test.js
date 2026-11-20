// End-to-end smoke tests that exercise the real HTTP layer (no mocking) —
// they spin up the actual server on an ephemeral port against a throwaway
// SQLite file, then drive it with fetch requests the way a real client
// would. Run with: npm test

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tempDir = mkdtempSync(path.join(tmpdir(), 'adoption-center-test-'));
process.env.DATABASE_PATH = path.join(tempDir, 'test.sqlite');
process.env.AUTH_SECRET = 'test-secret';
process.env.AUTH_TOKEN_TTL_SECONDS = '3600';

// Imported dynamically so the env vars above are in place before
// config.js / db.js read them.
const { handleRequest } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error(err);
      res.writeHead(500).end();
    });
  });
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
});

async function api(method, pathAndQuery, { token, body } = {}) {
  const res = await fetch(`${baseUrl}${pathAndQuery}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : undefined;
  return { status: res.status, json };
}

let adminToken;
let animalId;
let personId;

test('health check responds ok', async () => {
  const { status, json } = await api('GET', '/api/health');
  assert.equal(status, 200);
  assert.equal(json.status, 'ok');
});

test('unauthenticated requests to protected routes are rejected', async () => {
  const { status } = await api('GET', '/api/animals');
  assert.equal(status, 401);
});

test('the first registration bootstraps an admin with no auth required', async () => {
  const { status, json } = await api('POST', '/api/auth/register', {
    body: { username: 'admin', password: 'super-secret-1', email: 'admin@example.com' },
  });
  assert.equal(status, 201);
  assert.equal(json.user.role, 'ADMIN');
});

test('a second registration requires an authenticated admin', async () => {
  const { status } = await api('POST', '/api/auth/register', {
    body: { username: 'someone-else', password: 'super-secret-2' },
  });
  assert.equal(status, 401);
});

test('login with correct credentials returns a token', async () => {
  const { status, json } = await api('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'super-secret-1' },
  });
  assert.equal(status, 200);
  assert.ok(json.token);
  adminToken = json.token;
});

test('login with wrong password is rejected', async () => {
  const { status } = await api('POST', '/api/auth/login', {
    body: { username: 'admin', password: 'wrong-password' },
  });
  assert.equal(status, 401);
});

test('creating a person', async () => {
  const { status, json } = await api('POST', '/api/people', {
    token: adminToken,
    body: { firstName: 'Jamie', lastName: 'Rivera', email: 'jamie@example.com' },
  });
  assert.equal(status, 201);
  personId = json.person.id;
});

test('creating an animal validates required fields', async () => {
  const { status, json } = await api('POST', '/api/animals', {
    token: adminToken,
    body: { name: 'Colby' }, // missing species
  });
  assert.equal(status, 422);
  assert.match(json.error, /species/);
});

test('creating an animal succeeds with valid data', async () => {
  const { status, json } = await api('POST', '/api/animals', {
    token: adminToken,
    body: { name: 'Colby', species: 'DOG', breed: 'Golden Retriever mix', sex: 'MALE' },
  });
  assert.equal(status, 201);
  assert.equal(json.animal.name, 'Colby');
  assert.equal(json.animal.status, 'INTAKE');
  animalId = json.animal.id;
});

test('recording an intake sets the animal to INTAKE with an intake date', async () => {
  const { status, json } = await api('POST', `/api/animals/${animalId}/intake`, {
    token: adminToken,
    body: { intakeDate: '2026-09-01', intakeType: 'STRAY', source: 'Found near the park' },
  });
  assert.equal(status, 201);
  assert.equal(json.intakeRecord.intake_type, 'STRAY');
});

test('adding a medical record', async () => {
  const { status, json } = await api('POST', `/api/animals/${animalId}/medical`, {
    token: adminToken,
    body: { type: 'EXAM', description: 'Intake wellness exam', veterinarian: 'Dr. Patel' },
  });
  assert.equal(status, 201);
  assert.equal(json.medicalRecord.type, 'EXAM');
});

test('marking an animal available, then starting and ending a foster assignment', async () => {
  await api('PATCH', `/api/animals/${animalId}`, { token: adminToken, body: { status: 'AVAILABLE' } });

  const started = await api('POST', `/api/animals/${animalId}/foster`, {
    token: adminToken,
    body: { personId, startDate: '2026-09-05' },
  });
  assert.equal(started.status, 201);

  const animalWhileFostered = await api('GET', `/api/animals/${animalId}`, { token: adminToken });
  assert.equal(animalWhileFostered.json.animal.status, 'FOSTERED');

  const ended = await api('PATCH', `/api/foster/${started.json.fosterAssignment.id}`, {
    token: adminToken,
    body: { endDate: '2026-09-10' },
  });
  assert.equal(ended.status, 200);

  const animalAfterFoster = await api('GET', `/api/animals/${animalId}`, { token: adminToken });
  assert.equal(animalAfterFoster.json.animal.status, 'AVAILABLE');
});

test('submitting an application and finalizing an adoption', async () => {
  const application = await api('POST', `/api/animals/${animalId}/applications`, {
    token: adminToken,
    body: { personId, notes: 'Great fit.' },
  });
  assert.equal(application.status, 201);

  const adoption = await api('POST', `/api/animals/${animalId}/adopt`, {
    token: adminToken,
    body: { personId, applicationId: application.json.application.id, fee: 75 },
  });
  assert.equal(adoption.status, 201);

  const animalAfterAdoption = await api('GET', `/api/animals/${animalId}`, { token: adminToken });
  assert.equal(animalAfterAdoption.json.animal.status, 'ADOPTED');
  assert.equal(animalAfterAdoption.json.animal.applications[0].status, 'APPROVED');

  const secondAttempt = await api('POST', `/api/animals/${animalId}/adopt`, {
    token: adminToken,
    body: { personId },
  });
  assert.equal(secondAttempt.status, 409);
});

test('dashboard stats reflect the seeded activity', async () => {
  const { status, json } = await api('GET', '/api/dashboard/stats', { token: adminToken });
  assert.equal(status, 200);
  assert.ok(Array.isArray(json.animalsByStatus));
  assert.equal(json.adoptionsThisMonth >= 0, true);
});

test('a non-admin cannot delete an animal', async () => {
  await api('POST', '/api/auth/register', {
    token: adminToken,
    body: { username: 'staffer', password: 'super-secret-3', role: 'STAFF' },
  });
  const staffLogin = await api('POST', '/api/auth/login', {
    body: { username: 'staffer', password: 'super-secret-3' },
  });

  const { status } = await api('DELETE', `/api/animals/${animalId}`, { token: staffLogin.json.token });
  assert.equal(status, 403);
});

test('the public animals route lists only available animals, without login or private fields', async () => {
  const available = await api('POST', '/api/animals', {
    token: adminToken,
    body: { name: 'Luna', species: 'CAT', status: 'AVAILABLE', microchipId: 'CHIP-123' },
  });
  await api('POST', '/api/animals', {
    token: adminToken,
    body: { name: 'Hidden', species: 'DOG', status: 'MEDICAL_HOLD' },
  });

  const { status, json } = await api('GET', '/api/public/animals');
  assert.equal(status, 200);

  const names = json.animals.map((animal) => animal.name);
  assert.ok(names.includes('Luna'));
  assert.ok(!names.includes('Hidden'));
  assert.ok(!names.includes('Colby')); // adopted earlier in this suite

  const luna = json.animals.find((animal) => animal.name === 'Luna');
  assert.equal(luna.microchip_id, undefined);
  assert.equal(luna.status, undefined);

  const single = await api('GET', `/api/public/animals/${available.json.animal.id}`);
  assert.equal(single.status, 200);
  assert.equal(single.json.animal.name, 'Luna');
});

test('the public animals route hides animals that are not available', async () => {
  const { status } = await api('GET', `/api/public/animals/${animalId}`);
  assert.equal(status, 404);
});
