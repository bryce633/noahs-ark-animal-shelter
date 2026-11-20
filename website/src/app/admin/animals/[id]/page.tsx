import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminFetch } from '@/lib/session';
import type { Animal } from '@/lib/backend';
import AnimalForm from '../AnimalForm';
import styles from '../../admin.module.css';

export const metadata = { title: 'Edit Animal' };

export default async function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const res = await adminFetch(`/api/animals/${id}`);
  if (res.status === 404) notFound();
  const animal: Animal = (await res.json()).animal;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Edit {animal.name}</h1>
        <Link href="/admin/animals">← Back to animals</Link>
      </div>
      <AnimalForm animal={animal} />
    </>
  );
}
