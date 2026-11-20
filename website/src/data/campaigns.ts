// Placeholder campaigns, events, and adoption stories. The shelter should
// confirm every number, date, and name before the site goes live.

export const OPENING_CAMPAIGN = {
  title: "Help Noah's Ark Open Its Doors!",
  description:
    "We're raising money to finish our building, buy supplies, and open as Colby's safe haven for dogs and cats.",
  raised: 12500,
  goal: 50000,
  donors: 84,
};

export const CAMPAIGNS = [
  {
    title: 'Kennel Fund',
    description: 'Help us build safe, comfortable kennels for 20 dogs.',
    raised: 4000,
    goal: 10000,
    image: '/images/dog.png',
  },
  {
    title: 'Cat Room Fund',
    description: 'A cozy, quiet room with climbing towers for our cats.',
    raised: 1500,
    goal: 6000,
    image: '/images/cat.png',
  },
  {
    title: 'Spay & Neuter Fund',
    description: 'Help prevent pet overpopulation in rural Kansas.',
    raised: 2200,
    goal: 5000,
    image: '/images/dog.png',
  },
];

export const EVENTS = [
  {
    month: 'NOV',
    day: '15',
    title: 'Bake Sale for the Shelter',
    when: 'Saturday • 9 AM – 1 PM • Downtown Colby',
    description: 'Homemade treats for people and pets. All proceeds go to our opening fund.',
  },
  {
    month: 'DEC',
    day: '6',
    title: 'Holiday Photos with Your Pet',
    when: 'Saturday • 10 AM – 3 PM • Location TBA',
    description: 'Get a festive photo with your furry family member for a small donation.',
  },
  {
    month: 'JAN',
    day: '24',
    title: 'Founding Sponsor Dinner',
    when: 'Saturday • 6 PM • Location TBA',
    description: 'An evening celebrating the people and businesses helping us open.',
  },
  {
    month: 'MAR',
    day: '14',
    title: 'Grand Opening & Adoption Day',
    when: 'Saturday • 10 AM – 4 PM • 1025 East 4th Street',
    description: 'Tour the shelter, meet adoptable pets, and celebrate with us!',
  },
];

export const STORIES = [
  {
    name: 'Buddy',
    home: 'Went home with the Miller family • Oct 2026',
    quote: 'Buddy fit right in from day one. The kids adore him!',
    image: '/images/dog.png',
  },
  {
    name: 'Cleo',
    home: 'Went home with Sarah T. • Oct 2026',
    quote: 'She was shy at first, now she follows me everywhere.',
    image: '/images/cat.png',
  },
  {
    name: 'Max',
    home: 'Went home with the Johnsons • Sep 2026',
    quote: 'Our senior boy is living his best life on the farm.',
    image: '/images/dog.png',
  },
  {
    name: 'Oliver',
    home: 'Went home with the Nguyen family • Sep 2026',
    quote: 'Nonstop zoomies and cuddles. Best kitten ever!',
    image: '/images/cat.png',
  },
  {
    name: 'Daisy',
    home: 'Went home with Tom & Linda • Aug 2026',
    quote: 'Daisy loves her big yard and long walks.',
    image: '/images/dog.png',
  },
  {
    name: 'Milo',
    home: 'Went home with the Parker family • Aug 2026',
    quote: 'He instantly became best friends with our dog.',
    image: '/images/cat.png',
  },
];

export function formatMoney(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}
