'use client';

import SubmitForm, { CheckGroup } from '@/components/SubmitForm';

export default function VolunteerForm() {
  return (
    <SubmitForm
      successTitle="Thank you for volunteering! 🐾"
      successMessage="We've received your application. Someone from Noah's Ark will reach out soon about getting started."
    >
      <p className="formHeading">1. Contact Information</p>
      <div className="fieldRow">
        <label className="field">
          First Name
          <input className="input" name="firstName" placeholder="Jane" required />
        </label>
        <label className="field">
          Last Name
          <input className="input" name="lastName" placeholder="Doe" required />
        </label>
      </div>
      <div className="fieldRow">
        <label className="field">
          Email
          <input className="input" type="email" name="email" placeholder="jane@email.com" required />
        </label>
        <label className="field">
          Phone
          <input className="input" type="tel" name="phone" placeholder="(785) 555-0123" required />
        </label>
      </div>
      <div className="fieldRow">
        <label className="field">
          Street Address
          <input className="input" name="street" placeholder="123 Main St" />
        </label>
        <label className="field">
          City / State / ZIP
          <input className="input" name="city" placeholder="Colby, KS 67701" />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" name="adult" />I am 18 or older (volunteers under 18 need a parent or guardian)
      </label>

      <p className="formHeading">2. Availability</p>
      <span className="checkGroupLabel">Which days can you help?</span>
      <CheckGroup
        name="days"
        columns={4}
        options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
      />
      <span className="checkGroupLabel">What times work best?</span>
      <CheckGroup name="times" options={['Mornings', 'Afternoons', 'Evenings']} />

      <p className="formHeading">3. Interests</p>
      <CheckGroup
        name="interests"
        options={['Animal Care', 'Cleaning', 'Fundraising', 'Events', 'Transport', 'Other']}
      />

      <p className="formHeading">4. Experience</p>
      <label className="field">
        Tell us about any experience with animals or volunteering
        <textarea className="input" name="experience" placeholder="I have two dogs at home and volunteered at..." />
      </label>

      <div className="center">
        <button type="submit" className="btn btnNavy">
          Submit Application
        </button>
      </div>
    </SubmitForm>
  );
}
