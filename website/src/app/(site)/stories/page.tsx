import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/Hero';
import { StoryCard } from '@/components/Cards';
import { STORIES } from '@/data/campaigns';
import ShareStoryForm from './ShareStoryForm';
import styles from './stories.module.css';

export const metadata: Metadata = { title: 'Happy Tails' };

const STATS = [
  { number: '0', label: 'Pets Adopted' },
  { number: '0', label: 'Spay/Neuter Surgeries' },
  { number: '0', label: 'Volunteers' },
  { number: 'Coming Soon', label: 'Our Grand Opening' },
];

export default function StoriesPage() {
  return (
    <>
      <Hero
        title="Happy Tails"
        subtitle="Every adoption is a new beginning. Meet the pets who found their forever homes."
      />

      <section className={styles.stats}>
        <div className={`container ${styles.statsInner}`}>
          {STATS.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Featured Story</h2>
          <article className={styles.featured}>
            <div className={styles.featuredPhoto}>
              <Image src="/images/cat.png" alt="Luna the calico cat" fill sizes="(max-width: 760px) 100vw, 420px" />
            </div>
            <div className={styles.featuredBody}>
              <span className="badge badgeGreen">❤ ADOPTED</span>
              <h3 className={styles.featuredTitle}>Luna&apos;s Second Chance</h3>
              <p>
                Luna came to us shy and underweight. After weeks of care and patience from our volunteers, she
                blossomed into the sweetest lap cat. Today she rules the house with the Garcia family.
              </p>
              <p className={styles.featuredQuote}>“We can&apos;t imagine life without her. Thank you, Noah&apos;s Ark!”</p>
              <p className={styles.attribution}>— The Garcia Family, Colby</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section sectionGray">
        <div className="container">
          <h2 className="sectionTitle">Recently Adopted</h2>
          <div className="grid3">
            {STORIES.map((story) => (
              <StoryCard key={story.name} {...story} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Adopted from Noah&apos;s Ark? Share Your Story!</h2>
          <p className="lead">
            We love hearing how our alumni are doing. Send us a photo and a few words — you might be featured here!
          </p>
          <ShareStoryForm />
        </div>
      </section>
    </>
  );
}
