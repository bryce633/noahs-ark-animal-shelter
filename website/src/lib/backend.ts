// Where the backend (../backend in this repo) is running. Set BACKEND_URL in
// .env.local (or the host's environment settings) when it lives elsewhere.
export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export const SPECIES_OPTIONS = [
  { value: 'DOG', label: 'Dog' },
  { value: 'CAT', label: 'Cat' },
  { value: 'RABBIT', label: 'Rabbit' },
  { value: 'BIRD', label: 'Bird' },
  { value: 'REPTILE', label: 'Reptile' },
  { value: 'SMALL_MAMMAL', label: 'Small mammal' },
  { value: 'OTHER', label: 'Other' },
];

export const SEX_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

// Only AVAILABLE animals appear on the public website.
export const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available — shown on website' },
  { value: 'PENDING', label: 'Adoption pending' },
  { value: 'INTAKE', label: 'Just arrived (intake)' },
  { value: 'MEDICAL_HOLD', label: 'Medical hold' },
  { value: 'FOSTERED', label: 'In foster care' },
  { value: 'ADOPTED', label: 'Adopted' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'DECEASED', label: 'Deceased' },
];

export function labelFor(options: { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? value ?? '';
}

// Fields returned by the backend's public route (GET /api/public/animals).
export type PublicAnimal = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  sex: string;
  birth_date: string | null;
  is_age_estimated: number;
  color: string | null;
  description: string | null;
  photo_url: string | null;
  intake_date: string | null;
};

// Full animal record from the protected admin routes.
export type Animal = PublicAnimal & {
  status: string;
  weight_lbs: number | null;
  microchip_id: string | null;
  created_at: string;
  updated_at: string;
};
