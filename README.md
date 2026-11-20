# Noah's Ark Animal Shelter

Website and admin system for **Noah's Ark Animal Shelter** in Colby, Kansas —
"Every Animal Deserves a Safe Haven."

| Folder | What it is |
|---|---|
| [`website/`](website) | Public website + admin side (Next.js 16, TypeScript, CSS Modules) |
| [`backend/`](backend) | Shelter API and database (Node.js, built-in SQLite, no dependencies) |

## Getting started

You need **Node.js 22.5 or newer** ([nodejs.org](https://nodejs.org)). Check with `node -v`.

```bash
git clone git@github.com:bryce633/noahs-ark-animal-shelter.git
cd noahs-ark-animal-shelter
npm run dev
```

That's it. The first run sets everything up for you:

- installs the website's packages,
- creates `backend/.env` from `backend/.env.example`,
- creates a local database with a starter admin account and two sample animals,

then starts both servers:

| | URL |
|---|---|
| Website | http://localhost:3123 |
| Admin sign-in | http://localhost:3123/login |
| Backend health check | http://localhost:3000/api/health |

Press **Ctrl+C** to stop both.

**Admin login (local only):** the username and password are `ADMIN_USERNAME` and
`ADMIN_PASSWORD` in `backend/.env`. Each developer has their own local database,
so changes you make in the admin side stay on your machine.

## Other commands

| Command | What it does |
|---|---|
| `npm run dev` | Set up (if needed) and start the website and backend |
| `npm run setup` | Only do the first-time setup |
| `npm test` | Run the backend tests |
| `npm run build` | Production build of the website |

You can also work on one part at a time with `npm run dev` inside `website/`
or `backend/`. The website shows a friendly "couldn't load pets" message if the
backend isn't running.

## How it fits together

- Animals marked **Available** in the admin side show up on the public Adopt and
  Home pages (the website reads them from `GET /api/public/animals`).
- Everything under `/admin` requires the admin login; the public site never links to it.
- More detail: [`website/README.md`](website/README.md) and [`backend/README.md`](backend/README.md).

## Before going live

- Set a long random `AUTH_SECRET` and a new `ADMIN_PASSWORD` in the server's `backend/.env`
  (never commit `.env` files).
- Connect the website forms (adoption agreement, volunteer, contact, stories) so
  submissions are saved/emailed — right now they only show a thank-you message.
- See the checklist at the end of [`website/README.md`](website/README.md).
