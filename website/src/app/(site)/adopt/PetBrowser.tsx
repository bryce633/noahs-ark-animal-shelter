'use client';

import { useState } from 'react';
import { PetCard } from '@/components/Cards';
import type { Pet, Species } from '@/lib/pets';
import styles from './adopt.module.css';

const FILTERS: { label: string; value: Species | 'all' }[] = [
  { label: 'All Pets', value: 'all' },
  { label: 'Dogs', value: 'dog' },
  { label: 'Cats', value: 'cat' },
  { label: 'Other', value: 'other' },
];

export default function PetBrowser({ pets }: { pets: Pet[] }) {
  const [filter, setFilter] = useState<Species | 'all'>('all');
  const shown = filter === 'all' ? pets : pets.filter((pet) => pet.species === filter);
  // Only offer the "Other" tab when there are rabbits, birds, etc. available.
  const filters = FILTERS.filter((option) => option.value !== 'other' || pets.some((pet) => pet.species === 'other'));

  return (
    <>
      <div className={styles.tabs} role="group" aria-label="Filter pets">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.tab} ${filter === option.value ? styles.tabActive : ''}`}
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {shown.length > 0 ? (
        <div className="grid3">
          {shown.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <p className="lead">No {filter === 'all' ? 'pets' : `${filter}s`} are available right now — check back soon!</p>
      )}
    </>
  );
}
