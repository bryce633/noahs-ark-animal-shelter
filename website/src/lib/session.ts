import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BACKEND_URL } from './backend';
import { SESSION_COOKIE } from './sessionCookie';

// The backend login token lives in an httpOnly cookie, so browser JavaScript
// can never read it. Only server code in this project uses it.

export type AdminUser = { id: number; username: string; email: string | null; role: string };

async function getToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Confirms with the backend that the cookie holds a valid ADMIN token.
// Every admin page and admin action calls this; anyone else goes to /login.
export const requireAdmin = cache(async (): Promise<{ user: AdminUser; token: string }> => {
  const token = await getToken();
  if (!token) redirect('/login');

  let user: AdminUser | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) user = (await res.json()).user;
  } catch {
    // Backend unreachable — treat as signed out.
  }

  if (!user || user.role !== 'ADMIN') redirect('/login?expired=1');
  return { user, token };
});

// Calls a protected backend route as the signed-in admin.
export async function adminFetch(path: string, init: RequestInit = {}) {
  const { token } = await requireAdmin();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: 'no-store',
  });

  if (res.status === 401) redirect('/login?expired=1');
  return res;
}
