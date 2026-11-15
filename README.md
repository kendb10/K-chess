# K-Chess

My personal chess study blog — log games from Chess.com, review them move by move on an
interactive board, and attach notes to specific positions.

## Tech stack

- [Next.js 13](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io/) + SQLite for storage
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

## Useful commands

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build & run
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx prisma studio` — browse/edit the SQLite database visually
- `npx prisma migrate dev --name <name>` — create a new migration after editing
  `prisma/schema.prisma`
