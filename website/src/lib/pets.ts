import { connection } from 'next/server';
import { BACKEND_URL, type PublicAnimal } from './backend';

export type Species = 'dog' | 'cat' | 'other';

export type Pet = {
  id: number;
  name: string;
  species: Species;
  details: string;
  description: string;
  image: string;
  // Separate fields so the adoption agreement can fill them in.
  breed: string;
  color: string;
  sex: 'Male' | 'Female' | '';
  age: string;
};

function describeAge(birthDate: string | null, estimated: boolean) {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;

  const months = Math.max(
    0,
    (new Date().getFullYear() - born.getFullYear()) * 12 + (new Date().getMonth() - born.getMonth())
  );
  const prefix = estimated ? '~' : '';
  if (months < 12) return `${prefix}${months} ${months === 1 ? 'month' : 'months'}`;
  const years = Math.floor(months / 12);
  return `${prefix}${years} ${years === 1 ? 'year' : 'years'}`;
}

function toPet(animal: PublicAnimal): Pet {
  const species: Species = animal.species === 'DOG' ? 'dog' : animal.species === 'CAT' ? 'cat' : 'other';
  const sex = animal.sex === 'MALE' ? 'Male' : animal.sex === 'FEMALE' ? 'Female' : '';
  const age = describeAge(animal.birth_date, animal.is_age_estimated === 1);

  return {
    id: animal.id,
    name: animal.name,
    species,
    details: [sex, age, animal.breed].filter(Boolean).join(' • '),
    description: animal.description ?? '',
    image: animal.photo_url || (species === 'cat' ? '/images/cat.png' : '/images/dog.png'),
    breed: animal.breed ?? '',
    color: animal.color ?? '',
    sex,
    age: age?.replace('~', 'about ') ?? '',
  };
}

// Loads the animals marked AVAILABLE in the admin side. Returns null when the
// backend can't be reached so pages can show a friendly message instead.
export async function getAvailablePets(): Promise<Pet[] | null> {
  await connection();
  try {
    const res = await fetch(`${BACKEND_URL}/api/public/animals`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data: { animals: PublicAnimal[] } = await res.json();
    return data.animals.map(toPet);
  } catch {
    return null;
  }
}
