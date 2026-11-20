# Noah's Ark Animal Shelter — Website

Public website for Noah's Ark Animal Shelter in Colby, Kansas, built from the
Figma "Adoption" design. Next.js 16 + TypeScript + CSS Modules.

## Run it

The easiest way is from the top of the repo, which starts the website and the
backend together (see the [main README](../README.md)):

```bash
npm run dev
```

The website gets its adoptable pets and admin login from the backend in
[`../backend`](../backend). To run the website on its own, run `npm run dev` in
this folder (it installs packages on the first run).

Open http://localhost:3123. If the backend runs somewhere other than
http://localhost:3000, copy `.env.example` to `.env.local` and set `BACKEND_URL`.

## Admin side

- Sign in at http://localhost:3123/login (not linked anywhere on the public site).
- Only the backend's ADMIN account can sign in. Everything under `/admin` is
  blocked for anyone else (`src/proxy.ts` + `requireAdmin` in `src/lib/session.ts`).
- **Animals:** add, edit, or delete animals. Any animal set to **Available**
  shows on the public Adopt page and home page; any other status hides it.

## Pages

| Page | File |
|---|---|
| Home | `src/app/(site)/page.tsx` |
| Location (map, hours, contact form) | `src/app/(site)/location/page.tsx` |
| Campaigns & Events | `src/app/(site)/campaigns/page.tsx` |
| Adopt (pet list + adoption application) | `src/app/(site)/adopt/page.tsx` |
| Stories (Happy Tails) | `src/app/(site)/stories/page.tsx` |
| Donate (Givebutter + founding sponsors) | `src/app/(site)/donate/page.tsx` |
| Volunteer (volunteer application) | `src/app/(site)/volunteer/page.tsx` |
| Grooming & Boarding | `src/app/(site)/grooming-boarding/page.tsx` |

The menu and footer on every page come from `src/components/Nav.tsx` and
`src/components/Footer.tsx`.

## Where to change content

- **Contact info, Givebutter link, menu links:** `src/data/site.ts`
- **Adoptable pets:** managed in the admin side at `/admin/animals`
- **Campaigns, events, adoption stories:** `src/data/campaigns.ts`
- **Images:** `public/images/` (logo, hero banner, dog, cat)
- **Colors and shared styles:** `src/app/globals.css`

## Before going live

- [ ] Set a strong `AUTH_SECRET` and a new admin password in the backend's `.env`.
- [ ] Replace the placeholder stories, campaign numbers, events, prices,
      hours, and sponsor tiers with real information from the shelter.
- [ ] Set `GIVEBUTTER_URL` in `src/data/site.ts` to the real campaign link and
      add the Givebutter QR code on the Donate page.
- [ ] Connect the forms (adoption, volunteer, contact, share your story) to a
      form service or the backend (`../backend`) so submissions are
      emailed to Noahsarkcolby@gmail.com. Right now they only show a thank-you
      message — see `src/components/SubmitForm.tsx`.
- [ ] Add the shelter's real social media links in `src/components/Footer.tsx`.
- [ ] Swap in higher-resolution photos.
