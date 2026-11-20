import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LoginForm from './LoginForm';
import styles from './login.module.css';

// Not linked anywhere on the public site, and hidden from search engines.
export const metadata: Metadata = { title: 'Admin Sign In', robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { next, expired } = await searchParams;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Image src="/images/logo.png" alt="Noah's Ark Animal Shelter" width={120} height={115} priority />
        <h1 className={styles.title}>Admin Sign In</h1>
        <LoginForm next={next ?? '/admin'} expired={expired === '1'} />
        <Link href="/" className={styles.back}>
          ← Back to the website
        </Link>
      </div>
    </main>
  );
}
