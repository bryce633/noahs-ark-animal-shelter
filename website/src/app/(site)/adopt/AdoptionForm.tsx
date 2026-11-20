'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import SubmitForm from '@/components/SubmitForm';
import type { Pet } from '@/lib/pets';
import {
  ADOPTION_FEE,
  HEALTH_DISCLOSURE,
  LATER_SECTIONS,
  VETERINARY_CARE,
  type AgreementSection,
} from '@/data/adoptionAgreement';
import styles from './adopt.module.css';

const NOT_LISTED = 'not-listed';

// One numbered section of the agreement with its own "I agree" checkbox.
function Section({ section }: { section: AgreementSection }) {
  return (
    <section className={styles.agreement}>
      <p className={styles.agreementTitle}>
        {section.number}. {section.title}
      </p>
      {section.intro && <p>{section.intro}</p>}
      {section.items && (
        <ol className={styles.letterList}>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )}
      <label className={`check ${styles.agreeCheck}`}>
        <input type="checkbox" name={`agreeSection${section.number}`} required />I have read and agree to Section{' '}
        {section.number}.
      </label>
    </section>
  );
}

function Choice({ name, value, label, checked, onChange, required }: {
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
  required?: boolean;
}) {
  return (
    <label className="check">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} required={required} />
      {label}
    </label>
  );
}

export default function AdoptionForm({ pets, today }: { pets: Pet[]; today: string }) {
  const searchParams = useSearchParams();
  const requested = pets.find((pet) => String(pet.id) === searchParams.get('apply'));

  // Animal details fill in from the chosen pet, but stay editable.
  const [choice, setChoice] = useState(requested ? String(requested.id) : pets.length ? '' : NOT_LISTED);
  const [species, setSpecies] = useState(requested?.species === 'cat' ? 'Cat' : requested?.species === 'dog' ? 'Dog' : '');
  const [breed, setBreed] = useState(requested?.breed ?? '');
  const [color, setColor] = useState(requested?.color ?? '');
  const [sex, setSex] = useState<string>(requested?.sex ?? '');
  const [age, setAge] = useState(requested?.age ?? '');

  function choosePet(value: string) {
    setChoice(value);
    const pet = pets.find((p) => String(p.id) === value);
    setSpecies(pet?.species === 'cat' ? 'Cat' : pet?.species === 'dog' ? 'Dog' : '');
    setBreed(pet?.breed ?? '');
    setColor(pet?.color ?? '');
    setSex(pet?.sex ?? '');
    setAge(pet?.age ?? '');
  }

  const chosenPet = pets.find((pet) => String(pet.id) === choice);

  return (
    <SubmitForm
      successTitle="Thank you! 🐾"
      successMessage="We've received your signed adoption agreement. Someone from Noah's Ark will call you within a few days to set up a meet & greet."
    >
      <p className={styles.agreementHeader}>Noah&apos;s Ark Animal Shelter, Inc. — Adoption Agreement</p>

      {/* 1. Adopter information */}
      <p className="formHeading">1. Adopter Information</p>
      <label className="field">
        Full Name
        <input className="input" name="fullName" autoComplete="name" required />
      </label>
      <label className="field">
        Address
        <input className="input" name="address" autoComplete="street-address" required />
      </label>
      <div className="fieldRow">
        <label className="field">
          City / State / Zip
          <input className="input" name="cityStateZip" placeholder="Colby, KS 67701" required />
        </label>
        <label className="field">
          Phone
          <input className="input" type="tel" name="phone" autoComplete="tel" required />
        </label>
      </div>
      <div className="fieldRow">
        <label className="field">
          Email
          <input className="input" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="field">
          Driver&apos;s License / ID #
          <input className="input" name="idNumber" autoComplete="off" required />
        </label>
      </div>

      {/* 2. Animal information */}
      <p className="formHeading">2. Animal Information</p>
      {pets.length > 0 && (
        <label className="field">
          Animal Name
          <select className="input" name="animalChoice" value={choice} onChange={(e) => choosePet(e.target.value)} required>
            <option value="" disabled>
              Choose an animal
            </option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
            <option value={NOT_LISTED}>An animal not listed here</option>
          </select>
        </label>
      )}
      {choice === NOT_LISTED && (
        <label className="field">
          {pets.length > 0 ? 'Name of the animal' : 'Animal Name'}
          <input className="input" name="animalName" required />
        </label>
      )}
      {chosenPet && <input type="hidden" name="animalName" value={chosenPet.name} />}

      <div className="fieldRow">
        <div className="field">
          Species
          <div className={styles.radioRow}>
            <Choice name="species" value="Dog" label="Dog" checked={species === 'Dog'} onChange={() => setSpecies('Dog')} required />
            <Choice name="species" value="Cat" label="Cat" checked={species === 'Cat'} onChange={() => setSpecies('Cat')} />
          </div>
        </div>
        <div className="field">
          Sex
          <div className={styles.radioRow}>
            <Choice name="sex" value="Male" label="Male" checked={sex === 'Male'} onChange={() => setSex('Male')} required />
            <Choice name="sex" value="Female" label="Female" checked={sex === 'Female'} onChange={() => setSex('Female')} />
          </div>
        </div>
      </div>
      <div className="fieldRow">
        <label className="field">
          Breed (if known)
          <input className="input" name="breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
        </label>
        <label className="field">
          Color / Markings
          <input className="input" name="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
      <label className="field">
        Age (approximately)
        <input className="input" name="age" value={age} onChange={(e) => setAge(e.target.value)} />
      </label>

      {/* 3. Adoption fee */}
      <section className={styles.agreement}>
        <p className={styles.agreementTitle}>3. Adoption Fee</p>
        <p>
          Adopter agrees to pay an adoption fee of{' '}
          <strong>{ADOPTION_FEE !== null ? `$${ADOPTION_FEE.toFixed(2)}` : 'the amount the Shelter confirms for this animal'}</strong>
          , which is non-refundable. This fee helps to cover veterinary care, spay/neuter, vaccinations, food, shelter
          and rehabilitation.
        </p>
        <label className={`check ${styles.agreeCheck}`}>
          <input type="checkbox" name="agreeSection3" required />I agree to pay the non-refundable adoption fee.
        </label>
      </section>

      <Section section={HEALTH_DISCLOSURE} />
      <Section section={VETERINARY_CARE} />

      {/* 6. Spay or neuter */}
      <section className={styles.agreement}>
        <p className={styles.agreementTitle}>6. Spay or Neuter Requirement</p>
        <div className={styles.radioColumn}>
          <Choice name="spayNeuter" value="Already spayed/neutered" label="The animal has already been spayed/neutered" required />
          <Choice name="spayNeuter" value="Must be spayed/neutered" label="The animal must be spayed/neutered" />
          <Choice name="spayNeuter" value="Not sure" label="Not sure — the Shelter will confirm" />
        </div>
      </section>

      {LATER_SECTIONS.map((section) => (
        <Section key={section.number} section={section} />
      ))}

      {/* 13. Signatures */}
      <p className="formHeading">13. Signatures</p>
      <p>
        By signing below, the Adopter confirms that they have read, understood and agree to all terms of this Adoption
        Agreement.
      </p>
      <label className="field">
        Adopter Signature <span className={styles.hint}>Type your full name to sign</span>
        <input className={`input ${styles.signature}`} name="adopterSignature" autoComplete="off" required />
      </label>
      <div className="fieldRow">
        <label className="field">
          Printed Name
          <input className="input" name="printedName" autoComplete="name" required />
        </label>
        <label className="field">
          Date
          <input className="input" type="date" name="signedDate" defaultValue={today} required />
        </label>
      </div>

      <div className={styles.shelterUse}>
        <p className={styles.shelterUseTitle}>For Shelter Use</p>
        <p className={styles.hint}>A shelter representative signs here when you pick up your animal.</p>
        <div className={styles.shelterLines}>
          <span>Shelter Representative Signature</span>
          <span>Printed Name</span>
          <span>Title</span>
          <span>Date</span>
        </div>
      </div>

      <div className="center">
        <button type="submit" className="btn btnNavy">
          Sign &amp; Submit Agreement
        </button>
      </div>
      <p className="formNote">
        Submitting this agreement doesn&apos;t guarantee adoption. We&apos;ll contact you to talk about next steps.
      </p>
    </SubmitForm>
  );
}
