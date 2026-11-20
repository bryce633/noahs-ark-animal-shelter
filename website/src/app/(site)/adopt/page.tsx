import type { Metadata } from 'next';
import { Suspense } from 'react';
import Hero from '@/components/Hero';
import { SHELTER } from '@/data/site';
import { getAvailablePets } from '@/lib/pets';
import PetBrowser from './PetBrowser';
import AdoptionForm from './AdoptionForm';
import styles from './adopt.module.css';

export const metadata: Metadata = { title: 'Adopt a Pet' };

const STEPS = [
  { title: 'Browse', body: 'Find a dog or cat you connect with on this page.' },
  { title: 'Apply Online', body: 'Fill out and sign our adoption agreement — no printing needed.' },
  { title: 'Meet & Greet', body: "We'll call you to set up a visit with your new friend." },
  { title: 'Take Them Home', body: 'Sign the adoption agreement and welcome them home!' },
];

export default async function AdoptPage() {
  const pets = await getAvailablePets();
  // Local date for the signature field, e.g. 2026-11-10.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

  return (
    <>
      <Hero title="Adopt a Pet" subtitle={SHELTER.tagline} />

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Pets up for adoption</h2>
          <p className="lead">
            Meet the dogs and cats waiting for a loving, permanent home. Tap &quot;Meet Me&quot; to apply for that pet.
          </p>
          {pets ? (
            <PetBrowser pets={pets} />
          ) : (
            <p className="lead">
              We couldn&apos;t load our adoptable pets right now. Please try again soon or call {SHELTER.phoneDisplay}.
            </p>
          )}
        </div>
      </section>

      <section className="section sectionGray">
        <div className="container">
          <h2 className="sectionTitle">How to Adopt</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="apply">
        <div className="container">
          <h2 className="sectionTitle">Adoption Application &amp; Agreement</h2>
          <p className="lead">
            Read each section, check that you agree, and sign at the bottom — all from your phone or computer, no
            printing needed.
          </p>
          <Suspense fallback={null}>
            <AdoptionForm pets={pets ?? []} today={today} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
