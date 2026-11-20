import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/Hero';
import { InfoCard } from '@/components/Cards';
import { SHELTER } from '@/data/site';
import styles from './grooming.module.css';

export const metadata: Metadata = { title: 'Grooming & Boarding' };

// Placeholder prices — the shelter needs to confirm these.
const GROOMING = [
  { name: 'Bath & Brush', description: 'Shampoo, conditioner, blow-dry, and brush-out.', price: '$35+' },
  { name: 'Full Groom', description: 'Bath plus haircut, ear cleaning, and nail trim.', price: '$55+' },
  { name: 'Nail Trim', description: 'Quick trim and file — walk-ins welcome.', price: '$15' },
  { name: 'De-shedding', description: 'Special treatment to reduce shedding.', price: '$20+' },
  { name: 'Cat Grooming', description: 'Bath, brush-out, and sanitary trim for cats.', price: '$45+' },
];

const BOARDING = [
  { name: 'Dog Boarding', description: 'Per night. Includes walks and playtime.', price: '$30' },
  { name: 'Cat Boarding', description: 'Per night. Quiet, cat-only room.', price: '$20' },
  { name: 'Daycare', description: 'Supervised play while you work or run errands.', price: '$20/day' },
  { name: 'Multi-Pet Discount', description: 'Second pet from the same family.', price: '10% off' },
];

const INCLUDES = [
  { icon: '🧹', title: 'Clean Kennels', body: 'Cleaned and sanitized every day.' },
  { icon: '🦮', title: 'Daily Walks', body: 'Fresh air and exercise for dogs.' },
  { icon: '🍽️', title: "Your Pet's Food", body: 'Bring their food to avoid upset tummies.' },
  { icon: '💊', title: 'Medications', body: 'Given on schedule at no extra charge.' },
  { icon: '❤️', title: 'Love & Attention', body: 'Playtime and cuddles every day.' },
  { icon: '📱', title: 'Photo Updates', body: 'Get pictures of your pet on request.' },
];

type Service = { name: string; description: string; price: string };

function PriceList({ services }: { services: Service[] }) {
  return (
    <ul className={styles.priceList}>
      {services.map((service) => (
        <li key={service.name} className={styles.priceRow}>
          <div>
            <p className={styles.serviceName}>{service.name}</p>
            <p className={styles.serviceDescription}>{service.description}</p>
          </div>
          <span className={styles.price}>{service.price}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GroomingBoardingPage() {
  return (
    <>
      <Hero
        badge="COMING SOON"
        title="Grooming & Boarding"
        subtitle="Pamper your pet and support shelter animals at the same time — every service helps fund our rescue work."
      />

      <section className="section">
        <div className={`container ${styles.service}`}>
          <div className={styles.photo}>
            <Image src="/images/dog.png" alt="A freshly groomed dog" fill sizes="(max-width: 760px) 100vw, 380px" />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>✂️ Grooming</h2>
            <p>Gentle, professional grooming for dogs and cats of all sizes.</p>
            <PriceList services={GROOMING} />
            <p className={styles.note}>Prices vary by size, coat, and temperament.</p>
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className={`container ${styles.service} ${styles.reverse}`}>
          <div className={styles.photo}>
            <Image src="/images/cat.png" alt="A relaxed cat" fill sizes="(max-width: 760px) 100vw, 380px" />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title}>🏠 Boarding</h2>
            <p>A safe, clean, and loving place for your pet to stay while you&apos;re away.</p>
            <PriceList services={BOARDING} />
            <p className={styles.note}>Holiday and extended stays: please call ahead to reserve.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="sectionTitle">What Every Stay Includes</h2>
          <div className="grid3">
            {INCLUDES.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className="container">
          <h2 className="sectionTitle">Before Your Visit</h2>
          <div className={styles.requirements}>
            <div className="whiteCard">
              <h3 className={styles.reqTitle}>🐶 Dogs</h3>
              <p className={styles.reqLabel}>Proof of current vaccines required:</p>
              <ul>
                <li>Rabies</li>
                <li>DHPP (distemper/parvo)</li>
                <li>Bordetella (kennel cough)</li>
                <li>Flea & tick prevention</li>
              </ul>
            </div>
            <div className="whiteCard">
              <h3 className={styles.reqTitle}>🐱 Cats</h3>
              <p className={styles.reqLabel}>Proof of current vaccines required:</p>
              <ul>
                <li>Rabies</li>
                <li>FVRCP</li>
                <li>Flea prevention</li>
                <li>Spayed/neutered if over 6 months</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.book}>
        <div className="container">
          <h2 className={styles.bookTitle}>Ready to book?</h2>
          <p>Call us to schedule grooming or reserve a boarding stay.</p>
          <a href={SHELTER.phoneHref} className="btn btnLight">
            📞 {SHELTER.phoneDisplay}
          </a>
        </div>
      </section>
    </>
  );
}
