// Shelter contact details and site-wide settings, shared by every page.

export const SHELTER = {
  name: "Noah's Ark Animal Shelter",
  tagline: 'Every Animal Deserves a Safe Haven',
  street: '1025 East 4th Street',
  cityStateZip: 'Colby, KS 67701',
  phoneDisplay: '785-460-DOGS (3647)',
  phoneHref: 'tel:+17854603647',
  email: 'Noahsarkcolby@gmail.com',
};

export const FULL_ADDRESS = `${SHELTER.street}, ${SHELTER.cityStateZip}`;

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&output=embed`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FULL_ADDRESS)}`;

// Replace with the real Givebutter campaign link once the account is set up.
export const GIVEBUTTER_URL = '#';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/location', label: 'Location' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/adopt', label: 'Adopt' },
  { href: '/stories', label: 'Stories' },
];
