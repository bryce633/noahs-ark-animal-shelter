'use client';

import { useState } from 'react';

type SubmitFormProps = {
  successTitle: string;
  successMessage: string;
  children: React.ReactNode;
};

// Wraps a form and shows a thank-you message on submit.
// TODO: send submissions to Noahsarkcolby@gmail.com through a form service
// (e.g. Formspree) or the backend in ../backend before going live.
export default function SubmitForm({ successTitle, successMessage, children }: SubmitFormProps) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="formCard" role="status">
        <p className="formHeading">{successTitle}</p>
        <p>{successMessage}</p>
      </div>
    );
  }

  return (
    <form
      className="formCard"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
        window.scrollBy({ top: -200, behavior: 'smooth' });
      }}
    >
      {children}
    </form>
  );
}

export function CheckGroup({ name, options, columns = 3 }: { name: string; options: string[]; columns?: 3 | 4 }) {
  return (
    <div className={`checkGrid ${columns === 4 ? 'checkGrid4' : ''}`}>
      {options.map((option) => (
        <label key={option} className="check">
          <input type="checkbox" name={name} value={option} />
          {option}
        </label>
      ))}
    </div>
  );
}
