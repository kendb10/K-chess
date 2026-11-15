import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResultBadge from "@/components/ResultBadge";
import type { GameResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await prisma.game.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      opponent: true,
      result: true,
      score: true,
      playedAs: true,
    },
  });

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 py-16 text-center">
        <p className="text-slate-600">No games yet.</p>
        <Link
          href="/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add your first game
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {games.map((game) => (
        <li key={game.id}>
          <Link
            href={`/games/${game.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{game.opponent}</span>
              <span className="text-sm text-slate-500">
                {new Date(game.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                Played as {game.playedAs === "WHITE" ? "White" : "Black"}
              </span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {game.score && (
                <span className="text-sm text-slate-500">{game.score}</span>
              )}
              <ResultBadge result={game.result as GameResult} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
