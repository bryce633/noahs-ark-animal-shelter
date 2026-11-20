// Kept separate from session.ts so proxy.ts can import it without pulling in
// server-only code.
export const SESSION_COOKIE = 'noahs_ark_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // matches the backend's 12-hour token
