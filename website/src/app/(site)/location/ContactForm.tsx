'use client';

import SubmitForm from '@/components/SubmitForm';

export default function ContactForm() {
  return (
    <SubmitForm
      successTitle="Message sent! 🐾"
      successMessage="Thanks for reaching out. We'll get back to you as soon as we can."
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
          Phone (optional)
          <input className="input" type="tel" name="phone" placeholder="(785) 555-0123" />
        </label>
        <label className="field">
          Topic
          <select className="input" name="topic" defaultValue="">
            <option value="" disabled>
              Choose a topic
            </option>
            <option>Adoption</option>
            <option>Volunteering</option>
            <option>Grooming</option>
            <option>Boarding</option>
            <option>Donations & Sponsorship</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <label className="field">
        Message
        <textarea className="input" name="message" placeholder="How can we help?" required />
      </label>
      <div className="center">
        <button type="submit" className="btn btnNavy">
          Send Message
        </button>
      </div>
    </SubmitForm>
  );
}
