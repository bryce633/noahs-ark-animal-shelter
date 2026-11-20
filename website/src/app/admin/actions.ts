'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminFetch } from '@/lib/session';

export type AnimalFormState = { error: string } | null;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function refreshPages() {
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  revalidatePath('/adopt');
}

// Creates a new animal (animalId = null) or updates an existing one.
export async function saveAnimal(
  animalId: number | null,
  _prev: AnimalFormState,
  formData: FormData
): Promise<AnimalFormState> {
  const body: Record<string, unknown> = {
    name: text(formData, 'name'),
    species: text(formData, 'species'),
    status: text(formData, 'status'),
    sex: text(formData, 'sex'),
    breed: text(formData, 'breed'),
    color: text(formData, 'color'),
    description: text(formData, 'description'),
    photoUrl: text(formData, 'photoUrl'),
    microchipId: text(formData, 'microchipId'),
    isAgeEstimated: formData.get('isAgeEstimated') === 'on',
  };

  // Dates and numbers are only sent when filled in.
  for (const key of ['birthDate', 'intakeDate', 'weightLbs']) {
    const value = text(formData, key);
    if (value) body[key] = value;
  }

  if (!body.name) return { error: 'Please enter the animal’s name.' };

  const res = await adminFetch(animalId ? `/api/animals/${animalId}` : '/api/animals', {
    method: animalId ? 'PATCH' : 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { error: data?.error ?? 'Could not save this animal. Please try again.' };
  }

  refreshPages();
  redirect('/admin/animals?saved=1');
}

export async function deleteAnimal(animalId: number) {
  const res = await adminFetch(`/api/animals/${animalId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    throw new Error('Could not delete this animal.');
  }
  refreshPages();
  redirect('/admin/animals?deleted=1');
}

// Quick status change from the animals list (e.g. mark as Adopted).
export async function setAnimalStatus(animalId: number, status: string) {
  await adminFetch(`/api/animals/${animalId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  refreshPages();
}
