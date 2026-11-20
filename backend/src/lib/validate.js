// Small, dependency-free validation helpers. Each returns the cleaned value
// or throws an HttpError(422) with a message naming the offending field —
// good enough for an internal tool without pulling in a schema library.

import { HttpError } from './http.js';

function fail(field, message) {
  throw new HttpError(422, `Invalid "${field}": ${message}`);
}

export function requireString(body, field, { maxLength = 500 } = {}) {
  const value = body?.[field];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(field, 'is required and must be a non-empty string');
  }
  if (value.length > maxLength) {
    fail(field, `must be at most ${maxLength} characters`);
  }
  return value.trim();
}

export function optionalString(body, field, { maxLength = 2000 } = {}) {
  const value = body?.[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') fail(field, 'must be a string');
  if (value.length > maxLength) fail(field, `must be at most ${maxLength} characters`);
  return value.trim();
}

export function requireEnum(body, field, allowedValues) {
  const value = body?.[field];
  if (typeof value !== 'string' || !allowedValues.includes(value)) {
    fail(field, `must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
}

export function optionalEnum(body, field, allowedValues) {
  const value = body?.[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || !allowedValues.includes(value)) {
    fail(field, `must be one of: ${allowedValues.join(', ')}`);
  }
  return value;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function requireDate(body, field) {
  const value = body?.[field];
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    fail(field, 'must be a date string in YYYY-MM-DD format');
  }
  return value;
}

export function optionalDate(body, field) {
  const value = body?.[field];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
    fail(field, 'must be a date string in YYYY-MM-DD format');
  }
  return value;
}

export function optionalNumber(body, field, { min, max } = {}) {
  const value = body?.[field];
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) fail(field, 'must be a number');
  if (min !== undefined && num < min) fail(field, `must be at least ${min}`);
  if (max !== undefined && num > max) fail(field, `must be at most ${max}`);
  return num;
}

export function parseId(rawValue, label = 'id') {
  const id = Number(rawValue);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}: must be a positive integer`);
  }
  return id;
}
