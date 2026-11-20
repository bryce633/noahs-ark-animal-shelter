import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import { CampaignCard, EventRow, ProgressBar } from '@/components/Cards';
import { CAMPAIGNS, EVENTS, OPENING_CAMPAIGN, formatMoney } from '@/data/campaigns';
import { GIVEBUTTER_URL, SHELTER } from '@/data/site';
import styles from './campaigns.module.css';

export const metadata: Metadata = { title: 'Campaigns & Events' };

export default function CampaignsPage() {
  return (
    <>
      <Hero title="Campaigns & Events" subtitle="Join us, give, and help build a safe haven for animals in Colby." />

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Featured Campaign</h2>
          <article className={styles.featured}>
            <div className={styles.featuredPhoto}>
              <Image src="/images/cat.png" alt="" fill sizes="(max-width: 760px) 100vw, 400px" />
            </div>
            <div className={styles.featuredBody}>
              <span className="badge">OPENING CAMPAIGN</span>
              <h3 className={styles.featuredTitle}>{OPENING_CAMPAIGN.title}</h3>
              <p>{OPENING_CAMPAIGN.description}</p>
              <ProgressBar raised={OPENING_CAMPAIGN.raised} goal={OPENING_CAMPAIGN.goal} />
              <div className={styles.raisedRow}>
                <span className={styles.raised}>{formatMoney(OPENING_CAMPAIGN.raised)} raised</span>
                <span className={styles.goal}>Goal: {formatMoney(OPENING_CAMPAIGN.goal)}</span>
              </div>
              <Link href="/donate" className="btn btnBrown">
                Donate with Givebutter
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section sectionGray">
        <div className="container">
          <h2 className="sectionTitle">More Ways to Make a Difference</h2>
          <div className="grid3">
            {CAMPAIGNS.map((campaign) => (
              <CampaignCard key={campaign.title} {...campaign} donateHref={GIVEBUTTER_URL} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Upcoming Events</h2>
          <div className={styles.events}>
            {EVENTS.map((event) => (
              <EventRow key={event.title} {...event} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.host}>
        <div className="container">
          <h2 className={styles.hostTitle}>Want to host a fundraiser?</h2>
          <p>
            Birthday drives, school projects, business events — we&apos;ll help you plan it. Call{' '}
            <a href={SHELTER.phoneHref}>{SHELTER.phoneDisplay}</a> or email{' '}
            <a href={`mailto:${SHELTER.email}`}>{SHELTER.email}</a>.
          </p>
          <Link href="/volunteer" className="btn btnLight">
            Volunteer at an Event
          </Link>
        </div>
      </section>
    </>
  );
}
