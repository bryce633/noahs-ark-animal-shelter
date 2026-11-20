// Noah's Ark Animal Shelter, Inc. adoption agreement — the wording of the
// sections the adopter reads and agrees to on the Adopt page. Edit the text
// here; the form in src/app/(site)/adopt/AdoptionForm.tsx displays it.

// Set this to the fee amount (e.g. 150) to show it in Section 3. While it's
// null, the form says the shelter will confirm the fee.
export const ADOPTION_FEE: number | null = null;

export const RETURN_FEE = 50;

export type AgreementSection = {
  number: number;
  title: string;
  intro?: string;
  items?: string[];
};

export const HEALTH_DISCLOSURE: AgreementSection = {
  number: 4,
  title: 'Health Disclosure',
  items: [
    'The animal is adopted “AS IS” with no guarantees as to health, temperament, or behavior.',
    'The Shelter has provided all known medical and behavioral information at the time of adoption.',
    'The animal may have been exposed to illness, parasites, or stress-related conditions.',
    'The Shelter makes no warranties, express or implied, regarding the animal’s condition.',
  ],
};

export const VETERINARY_CARE: AgreementSection = {
  number: 5,
  title: 'Veterinary Care',
  intro: 'The Adopter agrees to:',
  items: [
    'Provide regular veterinary care, including vaccinations and preventative treatments.',
    'Seek prompt veterinary care if the animal becomes ill or injured.',
    'Maintain parasite prevention (heartworm, flea, tick, etc. as appropriate).',
  ],
};

// Sections 7–12, shown after the spay/neuter choice in Section 6.
export const LATER_SECTIONS: AgreementSection[] = [
  {
    number: 7,
    title: 'Care and Treatment of Animal',
    intro: 'The Adopter agrees to:',
    items: [
      'Provide adequate food, fresh water, shelter and humane care at all times.',
      'Keep the animal primarily as a household companion, not for fighting, breeding or research.',
      'Never abandon, neglect, abuse or allow harm to come to the animal.',
      'Comply with all local, state and federal animal welfare laws.',
    ],
  },
  {
    number: 8,
    title: 'Return Policy',
    intro:
      'If at any time the Adopter cannot keep the animal, the animal must be returned to Noah’s Ark Animal Shelter, Inc.',
    items: [
      `A fee of $${RETURN_FEE.toFixed(2)} per animal will be charged for the return.`,
      'Shelter reserves the right to refuse the return if the animal has become unsafe.',
    ],
  },
  {
    number: 9,
    title: 'Right of Repossession',
    intro: 'The Shelter reserves the right to reclaim the animal if:',
    items: [
      'This agreement is violated.',
      'The animal is abused, neglected or kept in unsafe conditions.',
      'False information was provided by the Adopter.',
    ],
  },
  {
    number: 10,
    title: 'Liability Waiver',
    intro: 'The Adopter agrees to:',
    items: [
      'Assume all responsibility for the animal once adopted.',
      'Release Noah’s Ark Animal Shelter, Inc., its officers, directors and volunteers from any liability for injury, damage or loss caused by the animal.',
      'Indemnify and hold the Shelter harmless from any claims relating to the animal after adoption.',
    ],
  },
  {
    number: 11,
    title: 'Governing Law',
    intro: 'This Agreement shall be governed by and interpreted under the laws of the State of Kansas.',
  },
  {
    number: 12,
    title: 'Entire Agreement',
    intro:
      'This document represents the entire agreement between the parties. No verbal agreements or modifications shall be valid unless in writing and signed by both parties.',
  },
];
