import Link from 'next/link';
import { adminFetch } from '@/lib/session';
import { STATUS_OPTIONS, labelFor } from '@/lib/backend';
import styles from './admin.module.css';

export const metadata = { title: { absolute: 'Dashboard | Admin | Noah’s Ark' } };

type Stats = {
  animalsByStatus: { status: string; count: number }[];
  pendingApplications: number;
  adoptionsThisMonth: number;
  recentIntakes: { id: number; name: string; species: string; status: string; intake_date: string }[];
};

export default async function AdminDashboard() {
  const res = await adminFetch('/api/dashboard/stats');
  const stats: Stats | null = res.ok ? await res.json() : null;

  const countFor = (status: string) => stats?.animalsByStatus.find((row) => row.status === status)?.count ?? 0;
  const total = stats?.animalsByStatus.reduce((sum, row) => sum + row.count, 0) ?? 0;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <Link href="/admin/animals/new" className="btn btnBrown">
          + Add Animal
        </Link>
      </div>

      {!stats ? (
        <p className={styles.error}>Couldn&apos;t load the dashboard right now.</p>
      ) : (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{countFor('AVAILABLE')}</span>
              <span className={styles.statLabel}>Shown on website</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{total}</span>
              <span className={styles.statLabel}>Total animals</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.pendingApplications}</span>
              <span className={styles.statLabel}>Pending applications</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.adoptionsThisMonth}</span>
              <span className={styles.statLabel}>Adoptions this month</span>
            </div>
          </div>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Recently arrived</h2>
            {stats.recentIntakes.length === 0 ? (
              <p className="muted">No intakes recorded yet.</p>
            ) : (
              <ul>
                {stats.recentIntakes.map((animal) => (
                  <li key={animal.id}>
                    <Link href={`/admin/animals/${animal.id}`}>{animal.name}</Link> — {labelFor(STATUS_OPTIONS, animal.status)}
                    , arrived {animal.intake_date}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>How the website works</h2>
            <p>
              Any animal set to <strong>Available</strong> shows up on the public Adopt page and the home page right
              away. Change it to <strong>Adoption pending</strong> or <strong>Adopted</strong> and it disappears from
              the website.
            </p>
          </section>
        </>
      )}
    </>
  );
}
