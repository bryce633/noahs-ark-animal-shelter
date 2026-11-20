'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BACKEND_URL } from '@/lib/backend';
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/sessionCookie';

export type LoginState = { error: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');

  if (!username || !password) return { error: 'Enter your username and password.' };

  let token: string | null = null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });

    if (res.status === 401) return { error: 'That username or password is incorrect.' };
    if (!res.ok) return { error: 'Something went wrong signing in. Please try again.' };

    const data: { token: string; user: { role: string } } = await res.json();
    if (data.user.role !== 'ADMIN') return { error: 'This account does not have access to the admin side.' };
    token = data.token;
  } catch {
    return { error: "Can't reach the shelter database right now. Please try again in a minute." };
  }

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
