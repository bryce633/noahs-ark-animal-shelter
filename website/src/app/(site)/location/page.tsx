import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import { DIRECTIONS_URL, MAP_EMBED_URL, SHELTER } from '@/data/site';
import ContactForm from './ContactForm';
import styles from './location.module.css';

export const metadata: Metadata = { title: 'Visit Us' };

// Placeholder hours — the shelter needs to confirm these.
const HOURS = [
  { days: 'Monday – Friday', time: '10 AM – 6 PM' },
  { days: 'Saturday', time: '10 AM – 4 PM' },
  { days: 'Sunday', time: 'Closed' },
];

const TIPS = [
  "Call ahead and we'll have your favorite pet ready to meet.",
  "Bring a photo ID if you're applying to adopt.",
  'Bring your current dog to meet a new one — just ask us first.',
  'For grooming and boarding: dogs on a leash, cats in a carrier.',
  `Need to rehome a pet? Please call ${SHELTER.phoneDisplay} to talk with us.`,
];

export default function LocationPage() {
  return (
    <>
      <Hero title="Visit Us" subtitle="Coming soon to Colby, Kansas — we can't wait to meet you!" />

      <section className="section">
        <div className={`container ${styles.mapInfo}`}>
          <iframe
            className={styles.map}
            src={MAP_EMBED_URL}
            title={`Map to ${SHELTER.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className={`whiteCard ${styles.info}`}>
            <h2 className={styles.infoTitle}>{SHELTER.name}</h2>
            <div className={styles.infoRow}>
              <span aria-hidden="true">📍</span>
              <div>
                <p className={styles.infoLabel}>Address</p>
                <p className={styles.infoValue}>
                  {SHELTER.street}
                  <br />
                  {SHELTER.cityStateZip}
                </p>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span aria-hidden="true">📞</span>
              <div>
                <p className={styles.infoLabel}>Phone</p>
                <a href={SHELTER.phoneHref} className={styles.infoValue}>
                  {SHELTER.phoneDisplay}
                </a>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span aria-hidden="true">✉️</span>
              <div>
                <p className={styles.infoLabel}>Email</p>
                <a href={`mailto:${SHELTER.email}`} className={styles.infoValue}>
                  {SHELTER.email}
                </a>
              </div>
            </div>
            <div className={styles.buttons}>
              <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btnBrown">
                Get Directions
              </a>
              <a href={SHELTER.phoneHref} className="btn btnOutline">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className={`container ${styles.hoursTips}`}>
          <div className="whiteCard">
            <h2 className={styles.cardTitle}>🕒 Hours</h2>
            <span className="badge">OPENING SOON</span>
            <ul className={styles.hours}>
              {HOURS.map((row) => (
                <li key={row.days}>
                  <span className={styles.hoursDay}>{row.days}</span>
                  <span className={row.time === 'Closed' ? 'muted' : ''}>{row.time}</span>
                </li>
              ))}
            </ul>
            <p className={styles.small}>Grooming and boarding drop-off by appointment.</p>
          </div>
          <div className="whiteCard">
            <h2 className={styles.cardTitle}>🐾 Planning a Visit?</h2>
            <ul className={styles.tips}>
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="container">
          <h2 className="sectionTitle">Send Us a Message</h2>
          <p className="lead">
            Questions about adopting, volunteering, grooming, or boarding? We&apos;ll get back to you as soon as we can.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
