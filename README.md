# Secret Santa 2026

A tiny SvelteKit app for a friend Christmas gift exchange. Each person picks their name, enters a private code, and sees who they should buy a gift for.

No database — assignments are derived from a secret seed, so everyone always gets the same match.

## Local development

```bash
npm install
cp .env.example .env
# Edit PARTICIPANTS and EXCHANGE_SEED in .env
npm run dev
```

Optional: print the full assignment cycle (keep this private):

```bash
node --env-file=.env scripts/check.mjs
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `EXCHANGE_SEED` | Secret string that determines the shuffle. Change it to redraw everyone. |
| `PARTICIPANTS` | Comma-separated `Name:code` pairs, e.g. `Ethan:4821,Mia:1937,...` |

Send each person only their own code (text message, etc.).

## Deploy to Vercel

The project already uses `@sveltejs/adapter-vercel` (configured in `vite.config.ts`). Env vars are declared in `src/env.ts`.

1. Push this repo to GitHub (remote is already set if you cloned/pushed).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In **Project Settings → Environment Variables**, add for Production (and Preview if you want):
   - `EXCHANGE_SEED` — any long random string (not the example if this is the real party)
   - `PARTICIPANTS` — your real `Name:code` list, e.g. `Ethan:4821,Mia:1937,...`
4. Deploy. Share the URL only with your friends.

Optional CLI path (after `npm i -g vercel` and `vercel login`):

```bash
vercel link
vercel env add EXCHANGE_SEED
vercel env add PARTICIPANTS
vercel --prod
```

Changing `EXCHANGE_SEED` and redeploying reshuffles all assignments.

> Note: `npm run build` on Windows may fail at the adapter symlink step (`EPERM`). Vercel’s Linux builders do not have this issue — deploy there, or run the build in WSL locally.

## How matching works

Names are shuffled with a seeded PRNG into one cycle (A→B→C→…→A). That means:

- Nobody draws themselves
- Everyone gives exactly one gift
- Everyone receives exactly one gift
- Opening the app in any order always shows the same result
