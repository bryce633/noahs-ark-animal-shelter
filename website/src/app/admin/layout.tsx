import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { logout } from '../login/actions';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin | Noah’s Ark' },
  robots: { index: false, follow: false },
};

// Every /admin page renders inside this layout, which confirms the signed-in
// admin with the backend first. Visitors who aren't signed in never get here.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Link href="/admin" className={styles.brand}>
          <Image src="/images/logo.png" alt="" width={48} height={46} />
          <span>Admin</span>
        </Link>
        <nav className={styles.barLinks}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/animals">Animals</Link>
          <Link href="/" target="_blank">
            View Website ↗
          </Link>
        </nav>
        <form action={logout} className={styles.signOut}>
          <span className={styles.user}>Signed in as {user.username}</span>
          <button type="submit" className="btn btnOutline">
            Sign Out
          </button>
        </form>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
