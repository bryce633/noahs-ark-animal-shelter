import Image from 'next/image';
import Link from 'next/link';
import type { Pet } from '@/lib/pets';
import { formatMoney } from '@/data/campaigns';
import styles from './Cards.module.css';

export function PetCard({ pet, large = false }: { pet: Pet; large?: boolean }) {
  return (
    <article className={`${styles.petCard} ${large ? styles.petLarge : ''}`}>
      <div className={styles.petPhoto}>
        <Image
          src={pet.image}
          alt={`${pet.name} the ${pet.species === 'other' ? 'pet' : pet.species}`}
          fill
          sizes="(max-width: 600px) 100vw, 300px"
          unoptimized={pet.image.startsWith('http')}
        />
      </div>
      <h3 className={styles.petName}>{pet.name}</h3>
      {pet.details && <p className={styles.petDetails}>{pet.details}</p>}
      <p className={styles.petDescription}>{pet.description}</p>
      <Link href={`/adopt?apply=${pet.id}#apply`} className={`btn btnWhite ${styles.cardButton}`}>
        Meet Me
      </Link>
    </article>
  );
}

type InfoCardProps = { icon: string; title: string; body: string; large?: boolean };

export function InfoCard({ icon, title, body, large = false }: InfoCardProps) {
  return (
    <article className={`${styles.infoCard} ${large ? styles.infoLarge : ''}`}>
      <span className={styles.infoIcon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.infoTitle}>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

export function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${formatMoney(raised)} raised of ${formatMoney(goal)} goal`}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}

type CampaignCardProps = {
  title: string;
  description: string;
  raised: number;
  goal: number;
  image: string;
  donateHref: string;
};

export function CampaignCard({ title, description, raised, goal, image, donateHref }: CampaignCardProps) {
  return (
    <article className={styles.whitePhotoCard}>
      <div className={styles.wideImage}>
        <Image src={image} alt="" fill sizes="(max-width: 600px) 100vw, 320px" />
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p>{description}</p>
        <ProgressBar raised={raised} goal={goal} />
        <p className={styles.raised}>
          {formatMoney(raised)} raised of {formatMoney(goal)}
        </p>
        <a href={donateHref} className={`btn btnBrown ${styles.cardButton}`}>
          Give Now
        </a>
      </div>
    </article>
  );
}

type StoryCardProps = {
  name: string;
  home: string;
  quote: string;
  image: string;
};

export function StoryCard({ name, home, quote, image }: StoryCardProps) {
  return (
    <article className={styles.whitePhotoCard}>
      <div className={styles.storyImage}>
        <Image src={image} alt={name} fill sizes="(max-width: 600px) 100vw, 320px" />
      </div>
      <div className={styles.cardBody}>
        <span className="badge badgeGreen">❤ ADOPTED</span>
        <h3 className={styles.cardTitle}>{name}</h3>
        <p className={styles.storyHome}>{home}</p>
        <p className={styles.quote}>“{quote}”</p>
      </div>
    </article>
  );
}

type EventRowProps = {
  month: string;
  day: string;
  title: string;
  when: string;
  description: string;
};

export function EventRow({ month, day, title, when, description }: EventRowProps) {
  return (
    <article className={styles.eventRow}>
      <div className={styles.date}>
        <span className={styles.month}>{month}</span>
        <span className={styles.day}>{day}</span>
      </div>
      <div className={styles.eventInfo}>
        <h3 className={styles.eventTitle}>{title}</h3>
        <p className={styles.eventWhen}>{when}</p>
        <p>{description}</p>
      </div>
      <Link href="/location" className="btn btnOutline">
        Learn More
      </Link>
    </article>
  );
}
