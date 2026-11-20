import Image from 'next/image';
import Link from 'next/link';
import { NAV_LINKS, SHELTER } from '@/data/site';
import styles from './Footer.module.css';

const HELP_LINKS = [
  { href: '/adopt', label: 'Adopt a Pet' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/grooming-boarding', label: 'Grooming & Boarding' },
  { href: '/donate', label: 'Become a Sponsor' },
  { href: '/campaigns', label: 'Host a Fundraiser' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.band}>
        <div className={`container ${styles.bandInner}`}>
          <div>
            <p className={styles.bandTitle}>Stay in touch with our animals</p>
            <p>Follow along for new arrivals, events, and happy tails.</p>
          </div>
          {/* Add the shelter's real social media links here */}
          <div className={styles.social}>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="TikTok">♪</a>
          </div>
        </div>
      </div>

      <div className={`container ${styles.columns}`}>
        <div className={styles.brand}>
          <Image src="/images/logo.png" alt="" width={130} height={125} className={styles.brandLogo} />
          <p className={styles.tagline}>{SHELTER.tagline}</p>
        </div>

        <div>
          <p className={styles.heading}>Quick Links</p>
          <ul className={styles.list}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/donate">Donate</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className={styles.heading}>How You Can Help</p>
          <ul className={styles.list}>
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/volunteer" className={`btn btnLight ${styles.apply}`}>
            Apply Here
          </Link>
        </div>

        <div>
          <p className={styles.heading}>Contact Us</p>
          <ul className={styles.list}>
            <li>
              {SHELTER.street}
              <br />
              {SHELTER.cityStateZip}
            </li>
            <li>
              <a href={SHELTER.phoneHref}>{SHELTER.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${SHELTER.email}`}>{SHELTER.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} {SHELTER.name}</span>
          <span>A 501(c)(3) nonprofit organization</span>
        </div>
      </div>
    </footer>
  );
}
