import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import { InfoCard, PetCard } from '@/components/Cards';
import { SHELTER } from '@/data/site';
import { getAvailablePets } from '@/lib/pets';
import styles from './page.module.css';

export default async function HomePage() {
  const pets = await getAvailablePets();

  return (
    <>
      <Hero badge="COMING SOON TO COLBY, KANSAS!" title={SHELTER.name} subtitle={SHELTER.tagline}>
        <Link href="/donate" className="btn btnBrown">
          Help Us Open
        </Link>
        <Link href="/volunteer" className="btn btnLight">
          Volunteer
        </Link>
      </Hero>

      <section className="section">
        <div className={`container ${styles.split}`}>
          <div className={styles.photo}>
            <Image src="/images/dog.png" alt="A smiling yellow Lab" fill sizes="(max-width: 760px) 100vw, 360px" />
          </div>
          <div>
            <h2 className="sectionTitle">Our Mission</h2>
            <p className={styles.body}>
              {SHELTER.name} is a nonprofit organization committed to the rescue, rehabilitation, and rehoming of
              dogs and cats that have experienced abuse, neglect, or abandonment. The organization provides veterinary
              care, behavioral support, and safe shelter to animals in need, while also promoting responsible pet
              ownership, spaying and neutering, and the humane treatment of animals through public education and
              community outreach.
            </p>
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className={`container ${styles.split} ${styles.reverse}`}>
          <div className={styles.photo}>
            <Image src="/images/cat.png" alt="A calico cat" fill sizes="(max-width: 760px) 100vw, 360px" />
          </div>
          <div>
            <h2 className="sectionTitle">Our Vision</h2>
            <p className={styles.body}>
              Our vision is to foster a compassionate community in which every dog and cat is safe, valued, and has
              access to a loving, permanent home. We are committed to reducing animal homelessness, preventing
              cruelty, and promoting a culture of responsible pet ownership throughout rural Kansas and the
              surrounding communities.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.wide}`}>
          <h2 className="sectionTitle">Pets up for adoption</h2>
          {pets && pets.length > 0 ? (
            <>
              <p className="lead">Meet a few of the dogs and cats waiting for a loving, permanent home.</p>
              <div className={`grid3 ${styles.bigGrid} ${styles.petGrid}`}>
                {pets.slice(0, 3).map((pet) => (
                  <PetCard key={pet.id} pet={pet} large />
                ))}
              </div>
            </>
          ) : (
            <p className="lead">Our first adoptable pets will be listed here soon — check back!</p>
          )}
          <div className="center">
            <Link href="/adopt" className="btn btnNavy">
              See All Pets
            </Link>
          </div>
        </div>
      </section>

      <section className="section sectionGray">
        <div className={`container ${styles.wide}`}>
          <h2 className="sectionTitle">How You Can Help</h2>
          <div className={`grid3 ${styles.bigGrid}`}>
            <InfoCard large icon="🏠" title="Adopt" body="Give a dog or cat a forever home. Apply online in minutes." />
            <InfoCard large icon="🙋" title="Volunteer" body="Walk dogs, socialize cats, and help at events." />
            <InfoCard large icon="💛" title="Donate" body="Help us open our doors and care for animals in need." />
          </div>
        </div>
      </section>
    </>
  );
}
