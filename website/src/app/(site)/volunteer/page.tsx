import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import { InfoCard } from '@/components/Cards';
import VolunteerForm from './VolunteerForm';

export const metadata: Metadata = { title: 'Volunteer' };

const WAYS = [
  { icon: '🐾', title: 'Animal Care', body: 'Walk dogs, socialize cats, and help with feeding and enrichment.' },
  { icon: '🧽', title: 'Cleaning', body: 'Keep kennels, cat rooms, and play areas clean, safe, and comfortable.' },
  { icon: '💰', title: 'Fundraising', body: 'Help us raise money and find founding sponsors for the shelter.' },
  { icon: '🎪', title: 'Events', body: 'Set up, run booths, and spread the word at adoption events and fundraisers.' },
  { icon: '🚗', title: 'Transport', body: 'Drive animals to vet visits, grooming appointments, and adoption events.' },
  { icon: '💡', title: 'Other Skills', body: "Photography, social media, carpentry, office help — tell us what you're good at!" },
];

export default function VolunteerPage() {
  return (
    <>
      <Hero title="Volunteer With Us" subtitle="Help us give every animal a safe haven" />

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">Ways You Can Help</h2>
          <p className="lead">
            Noah&apos;s Ark is getting ready to open its doors in Colby, and we can&apos;t do it without our community.
            Whether you have an hour a week or a whole weekend, there&apos;s a place for you.
          </p>
          <div className="grid3">
            {WAYS.map((way) => (
              <InfoCard key={way.title} {...way} />
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionGray" id="apply">
        <div className="container">
          <h2 className="sectionTitle">Volunteer Application</h2>
          <p className="lead">
            Fill this out from your phone or computer — no printing needed. We&apos;ll email you at the address you
            provide.
          </p>
          <VolunteerForm />
        </div>
      </section>
    </>
  );
}
