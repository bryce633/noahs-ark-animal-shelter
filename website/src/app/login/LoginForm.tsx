'use client';

import { useActionState } from 'react';
import { login } from './actions';
import styles from './login.module.css';

export default function LoginForm({ next, expired }: { next: string; expired: boolean }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className={styles.form}>
      {expired && !state && <p className={styles.notice}>Your session ended. Please sign in again.</p>}
      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <label className="field">
        Username
        <input className="input" name="username" autoComplete="username" required autoFocus />
      </label>
      <label className="field">
        Password
        <input className="input" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" className="btn btnNavy" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
