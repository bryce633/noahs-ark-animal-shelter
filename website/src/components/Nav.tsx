'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_LINKS, SHELTER } from '@/data/site';
import styles from './Nav.module.css';

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label={`${SHELTER.name} home`} onClick={() => setOpen(false)}>
          <Image
            src="/images/logo-parts/logo-icon-transparent.png"
            alt=""
            width={361}
            height={289}
            className={styles.brandIcon}
            preload
          />
          <Image
            src="/images/logo-parts/logo-text-transparent.png"
            alt=""
            width={336}
            height={70}
            className={styles.brandText}
            preload
          />
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
          <span className={styles.srOnly}>Menu</span>
        </button>

        <ul id="main-menu" className={`${styles.links} ${open ? styles.linksOpen : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
                aria-current={pathname === link.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/donate"
              className={`${styles.donate} ${pathname === '/donate' ? styles.donateActive : ''}`}
              onClick={() => setOpen(false)}
            >
              Donate
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
