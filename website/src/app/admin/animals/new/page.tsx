import Link from 'next/link';
import AnimalForm from '../AnimalForm';
import styles from '../../admin.module.css';

export const metadata = { title: 'Add Animal' };

export default function NewAnimalPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add Animal</h1>
        <Link href="/admin/animals">← Back to animals</Link>
      </div>
      <AnimalForm />
    </>
  );
}
