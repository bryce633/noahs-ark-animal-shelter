import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import { InfoCard, ProgressBar } from '@/components/Cards';
import { OPENING_CAMPAIGN, formatMoney } from '@/data/campaigns';
import { SHELTER } from '@/data/site';
import DonationBox from './DonationBox';
import styles from './donate.module.css';

export const metadata: Metadata = { title: 'Donate' };

const TIERS = [
  { name: 'Bronze', price: '$250', perks: 'Name on our Founding Sponsors web page.' },
  { name: 'Silver', price: '$500', perks: 'Name on our sponsor wall + web page.' },
  { name: 'Gold', price: '$1,000', perks: 'Engraved paw-print plaque at the shelter.' },
  { name: 'Platinum', price: '$5,000', perks: 'Name a kennel or cat room + all perks.' },
];

export default function DonatePage() {
  return (
    <>
      <Hero
        title={OPENING_CAMPAIGN.title}
        subtitle="Every gift brings us one step closer to a safe haven for dogs and cats in Colby, Kansas."
      />

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Our Opening Campaign</h2>
          <div className={styles.progress}>
            <div className={styles.progressLabels}>
              <span className={styles.raisedText}>{formatMoney(OPENING_CAMPAIGN.raised)} raised</span>
              <span className={styles.goalText}>Goal: {formatMoney(OPENING_CAMPAIGN.goal)}</span>
            </div>
            <ProgressBar raised={OPENING_CAMPAIGN.raised} goal={OPENING_CAMPAIGN.goal} />
            <p className="muted">{OPENING_CAMPAIGN.donors} donors • Every dollar counts!</p>
          </div>
          <DonationBox />
        </div>
      </section>

      <section className="section sectionGray">
        <div className="container">
          <h2 className="sectionTitle">Your Gift at Work</h2>
          <div className="grid3">
            <InfoCard icon="🥣" title="$25" body="Feeds a shelter dog or cat for two weeks." />
            <InfoCard icon="💉" title="$100" body="Covers vaccines and a vet exam for a new arrival." />
            <InfoCard icon="✂️" title="$250" body="Pays for a spay or neuter surgery." />
          </div>
        </div>
      </section>

      <section className="section" id="sponsors">
        <div className="container">
          <h2 className="sectionTitle">Become a Founding Sponsor</h2>
          <p className="lead">
            Founding Sponsors are the businesses, families, and friends who help us open our doors. Your name will be
            honored at the shelter forever.
          </p>
          <div className="grid4">
            {TIERS.map((tier) => (
              <div key={tier.name} className={styles.tier}>
                <span className="badge">{tier.name}</span>
                <span className={styles.tierPrice}>{tier.price}</span>
                <p>{tier.perks}</p>
              </div>
            ))}
          </div>
          <div className="center">
            <a href={`mailto:${SHELTER.email}?subject=Founding%20Sponsor`} className="btn btnNavy">
              Become a Sponsor
            </a>
          </div>
          <h3 className={styles.wallTitle}>Our Founding Sponsors</h3>
          <div className={styles.wall}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.wallSlot}>
                Your Name Here
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className={`container ${styles.other}`}>
          <div className={styles.otherText}>
            <h2 className="sectionTitle">Other Ways to Give</h2>
            <h3 className={styles.otherHeading}>Mail a check</h3>
            <p>
              Payable to {SHELTER.name}, {SHELTER.street}, {SHELTER.cityStateZip}
            </p>
            <h3 className={styles.otherHeading}>Donate supplies</h3>
            <p>Dog & cat food, cat litter, blankets, towels, toys, and cleaning supplies.</p>
            <h3 className={styles.otherHeading}>Host a fundraiser</h3>
            <p>Birthday drives, bake sales, and business events — we&apos;ll help!</p>
          </div>
          {/* Replace with the QR code image from the Givebutter campaign */}
          <div className={`whiteCard ${styles.qr}`}>
            <div className={styles.qrPlaceholder}>QR code</div>
            <p className={styles.qrLabel}>Scan to donate</p>
          </div>
        </div>
      </section>
    </>
  );
}
