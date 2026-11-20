import Link from 'next/link';
import { adminFetch } from '@/lib/session';
import { SPECIES_OPTIONS, STATUS_OPTIONS, labelFor, type Animal } from '@/lib/backend';
import { setAnimalStatus } from '../actions';
import styles from '../admin.module.css';

export const metadata = { title: 'Animals' };

function statusClass(status: string) {
  if (status === 'AVAILABLE') return `${styles.status} ${styles.statusAvailable}`;
  if (status === 'ADOPTED') return `${styles.status} ${styles.statusAdopted}`;
  return styles.status;
}

export default async function AdminAnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const { saved, deleted } = await searchParams;
  const res = await adminFetch('/api/animals');
  const animals: Animal[] = res.ok ? (await res.json()).animals : [];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Animals</h1>
        <Link href="/admin/animals/new" className="btn btnBrown">
          + Add Animal
        </Link>
      </div>

      {saved && <p className={styles.flash}>Saved! Animals marked Available are now on the website.</p>}
      {deleted && <p className={styles.flash}>Animal deleted.</p>}
      {!res.ok && <p className={styles.error}>Couldn&apos;t load animals right now.</p>}

      {res.ok && animals.length === 0 ? (
        <div className={`${styles.panel} ${styles.empty}`}>
          <p>No animals yet.</p>
          <p>Add your first one and set it to &quot;Available&quot; to show it on the website.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th aria-label="Photo" />
              <th>Name</th>
              <th className={styles.hideSmall}>Species</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {animals.map((animal) => (
              <tr key={animal.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.thumb}
                    src={animal.photo_url || (animal.species === 'CAT' ? '/images/cat.png' : '/images/dog.png')}
                    alt=""
                  />
                </td>
                <td className={styles.nameCell}>{animal.name}</td>
                <td className={styles.hideSmall}>{labelFor(SPECIES_OPTIONS, animal.species)}</td>
                <td>
                  <span className={statusClass(animal.status)}>
                    {labelFor(STATUS_OPTIONS, animal.status).split(' — ')[0]}
                  </span>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    {animal.status !== 'AVAILABLE' && animal.status !== 'ADOPTED' && (
                      <form action={setAnimalStatus.bind(null, animal.id, 'AVAILABLE')}>
                        <button type="submit" className={`btn btnOutline ${styles.smallBtn}`}>
                          Show on website
                        </button>
                      </form>
                    )}
                    {animal.status === 'AVAILABLE' && (
                      <form action={setAnimalStatus.bind(null, animal.id, 'ADOPTED')}>
                        <button type="submit" className={`btn btnOutline ${styles.smallBtn}`}>
                          Mark adopted
                        </button>
                      </form>
                    )}
                    <Link href={`/admin/animals/${animal.id}`} className={`btn btnNavy ${styles.smallBtn}`}>
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
