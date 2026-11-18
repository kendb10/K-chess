# K-Chess

My personal chess study blog — log games from Chess.com, review them move by move on an
interactive board, and attach notes to specific positions.

## Tech stack

- [Next.js 13](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io/) + SQLite for storage locally, [Turso](https://turso.tech/)
  (libSQL) in production
- [chess.js](https://github.com/jhlywa/chess.js) for PGN parsing
- [react-chessboard](https://github.com/Clariity/react-chessboard) for the interactive board

> **Node version note:** this project is pinned to Next.js 13.5.x and Prisma 5.x because the
> dev machine runs Node 18.14, which is below the minimum required by current Next.js/Prisma
> releases (Node 18.17+ / 20+). If you upgrade Node, consider upgrading these dependencies too.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates/updates prisma/dev.db
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data model

- **Game**: date, opponent, result (WIN/LOSS/DRAW), optional score, color played, full PGN,
  optional time control.
- **Memo**: a note attached to a specific ply (half-move) of a game.

## Adding a game

Go to **+ New Game**, paste a PGN exported from Chess.com, pick which color you played, and the
form will prefill the date/opponent/result from the PGN headers (all fields stay editable before
saving).

## Auth

Anyone can browse games, but adding/editing/deleting games and memos requires logging in at
`/login` with a single shared password (`ADMIN_PASSWORD` env var). A successful login sets a
signed, httpOnly session cookie (`lib/auth.ts`) that's checked:

- server-side, before rendering `/new` (redirects to `/login` otherwise)
- server-side, before rendering edit controls on the game detail page
- in every mutating API route (`POST`/`DELETE` under `/api/games` and `/api/memos`)

To change the password or force everyone to log in again, update `ADMIN_PASSWORD` and/or
`SESSION_SECRET` locally (`.env`) and in Vercel's env vars, then redeploy.

## Useful commands

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build & run
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx prisma studio` — browse/edit the SQLite database visually
- `npx prisma migrate dev --name <name>` — create a new migration after editing
  `prisma/schema.prisma`

## Deployment (Vercel + Turso)

The app is deployed at **https://kienchess.vercel.app** and redeploys automatically on every
push to `main`.

Vercel's serverless functions have an ephemeral filesystem, so the local `prisma/dev.db` SQLite
file can't be used in production. Instead, production reads/writes a [Turso](https://turso.tech/)
database (libSQL, wire-compatible with SQLite) via Prisma's `driverAdapters` preview feature
(`lib/prisma.ts` picks Turso when `TURSO_DATABASE_URL` is set, otherwise falls back to the local
file).

Project env vars (already set in Vercel → Project Settings → Environment Variables, Production):

- `TURSO_DATABASE_URL` — `libsql://k-chess-kendb10.aws-ap-northeast-1.turso.io`
- `TURSO_AUTH_TOKEN` — auth token for the `k-chess` Turso database
- `DATABASE_URL` — `file:./dev.db` (only used by `prisma generate` at build time, never for
  runtime connections in production)

### Applying schema changes to Turso

Prisma Migrate doesn't talk to Turso directly (it connects over HTTP, not a native socket), so
after changing `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <name>        # creates a local migration + updates dev.db
turso db shell k-chess < prisma/migrations/<new-migration-folder>/migration.sql
```

Useful Turso CLI commands:

- `turso db shell k-chess` — open a SQL shell against the production database
- `turso db show k-chess --url` — print the database URL
- `turso db tokens create k-chess` — mint a new auth token
