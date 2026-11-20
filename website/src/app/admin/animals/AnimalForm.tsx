'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { SEX_OPTIONS, SPECIES_OPTIONS, STATUS_OPTIONS, type Animal } from '@/lib/backend';
import { deleteAnimal, saveAnimal } from '../actions';
import styles from '../admin.module.css';

export default function AnimalForm({ animal }: { animal?: Animal }) {
  const [state, formAction, pending] = useActionState(saveAnimal.bind(null, animal?.id ?? null), null);
  const [photoUrl, setPhotoUrl] = useState(animal?.photo_url ?? '');
  const [species, setSpecies] = useState(animal?.species ?? 'DOG');
  const fallback = species === 'CAT' ? '/images/cat.png' : '/images/dog.png';

  return (
    <>
      <form action={formAction} className={styles.formLayout}>
        <div className="formCard">
          {state?.error && (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          )}

          <div className="fieldRow">
            <label className="field">
              Name *
              <input className="input" name="name" defaultValue={animal?.name} required />
            </label>
            <label className="field">
              Status
              <select className="input" name="status" defaultValue={animal?.status ?? 'AVAILABLE'}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="fieldRow">
            <label className="field">
              Species *
              <select className="input" name="species" value={species} onChange={(e) => setSpecies(e.target.value)}>
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Sex
              <select className="input" name="sex" defaultValue={animal?.sex ?? 'UNKNOWN'}>
                {SEX_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="fieldRow">
            <label className="field">
              Breed
              <input className="input" name="breed" defaultValue={animal?.breed ?? ''} placeholder="Lab Mix" />
            </label>
            <label className="field">
              Color
              <input className="input" name="color" defaultValue={animal?.color ?? ''} placeholder="Yellow" />
            </label>
          </div>

          <div className="fieldRow">
            <label className="field">
              Birth date
              <input className="input" type="date" name="birthDate" defaultValue={animal?.birth_date ?? ''} />
            </label>
            <label className="field">
              Weight (lbs)
              <input
                className="input"
                type="number"
                name="weightLbs"
                min="0"
                step="0.1"
                defaultValue={animal?.weight_lbs ?? ''}
              />
            </label>
          </div>
          <label className="check">
            <input type="checkbox" name="isAgeEstimated" defaultChecked={animal?.is_age_estimated === 1} />
            Birth date is a guess
          </label>

          <label className="field">
            Description <span className={styles.hint}>Shown on the website</span>
            <textarea
              className="input"
              name="description"
              defaultValue={animal?.description ?? ''}
              placeholder="Gentle, playful, and great with kids..."
            />
          </label>

          <label className="field">
            Photo link <span className={styles.hint}>Paste the web address of a photo (must start with https://)</span>
            <input
              className="input"
              type="url"
              name="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="fieldRow">
            <label className="field">
              Arrival date
              <input className="input" type="date" name="intakeDate" defaultValue={animal?.intake_date ?? ''} />
            </label>
            <label className="field">
              Microchip ID <span className={styles.hint}>Private</span>
              <input className="input" name="microchipId" defaultValue={animal?.microchip_id ?? ''} />
            </label>
          </div>

          <div className={styles.formButtons}>
            <Link href="/admin/animals" className="btn btnOutline">
              Cancel
            </Link>
            <button type="submit" className="btn btnBrown" disabled={pending}>
              {pending ? 'Saving…' : animal ? 'Save Changes' : 'Add Animal'}
            </button>
          </div>
        </div>

        <aside className={styles.preview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.previewImage} src={photoUrl || fallback} alt="Photo preview" />
          <p className={styles.previewLabel}>
            {photoUrl ? 'Photo preview' : 'No photo yet — a placeholder will be shown on the website.'}
          </p>
        </aside>
      </form>

      {animal && (
        <form
          action={deleteAnimal.bind(null, animal.id)}
          className={`${styles.panel} ${styles.dangerZone}`}
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${animal.name} permanently? This can't be undone.`)) event.preventDefault();
          }}
        >
          <p>
            <strong>Delete this animal</strong> — removes {animal.name} and all of their records permanently. To just
            hide them from the website, change the status instead.
          </p>
          <button type="submit" className={`btn ${styles.danger}`}>
            Delete
          </button>
        </form>
      )}
    </>
  );
}
