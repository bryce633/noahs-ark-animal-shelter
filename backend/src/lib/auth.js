// Password hashing and auth tokens, built entirely on Node's built-in
// crypto module so the project has no external auth dependency.
//
// Tokens are a minimal JWT-style format (header.payload.signature, each
// base64url-encoded, HMAC-SHA256 signed) — interoperable with standard JWT
// tooling if this project ever grows into needing it, but implemented here
// without the `jsonwebtoken` package.

import crypto from 'node:crypto';
import { config } from '../config.js';

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(plainTextPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainTextPassword, salt, SCRYPT_KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(plainTextPassword, storedHash) {
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;

  const derivedKey = crypto.scryptSync(plainTextPassword, salt, SCRYPT_KEY_LENGTH);
  const storedKey = Buffer.from(keyHex, 'hex');

  if (derivedKey.length !== storedKey.length) return false;
  return crypto.timingSafeEqual(derivedKey, storedKey);
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

export function signToken(payload, { expiresInSeconds = config.authTokenTtlSeconds } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', config.authSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', config.authSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) >= payload.exp) {
    return null; // expired
  }

  return payload;
}
