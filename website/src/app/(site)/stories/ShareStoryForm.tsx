'use client';

import SubmitForm from '@/components/SubmitForm';

export default function ShareStoryForm() {
  return (
    <SubmitForm
      successTitle="Thank you for sharing! 🐾"
      successMessage="We can't wait to read your story. We'll reach out if we'd like to feature it on our website."
    >
      <div className="fieldRow">
        <label className="field">
          Your Name
          <input className="input" name="name" placeholder="Jane Doe" required />
        </label>
        <label className="field">
          Email
          <input className="input" type="email" name="email" placeholder="jane@email.com" required />
        </label>
      </div>
      <div className="fieldRow">
        <label className="field">
          Pet&apos;s Name
          <input className="input" name="petName" placeholder="Buddy" required />
        </label>
        <label className="field">
          Adoption Date
          <input className="input" type="month" name="adoptionDate" />
        </label>
      </div>
      <label className="field">
        Your Story
        <textarea className="input" name="story" placeholder="Tell us how your pet is doing..." required />
      </label>
      <label className="field">
        📷 Add a photo of your pet
        <input className="input" type="file" name="photo" accept="image/*" />
      </label>
      <div className="center">
        <button type="submit" className="btn btnBrown">
          Share My Story
        </button>
      </div>
    </SubmitForm>
  );
}
