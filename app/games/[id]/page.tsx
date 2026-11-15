import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResultBadge from "@/components/ResultBadge";
import GameViewer from "@/components/GameViewer";
import type { GameResult, PlayerColor } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GamePage({ params }: { params: { id: string } }) {
  const game = await prisma.game.findUnique({
    where: { id: params.id },
    include: { memos: { orderBy: { ply: "asc" } } },
  });

  if (!game) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">vs. {game.opponent}</h1>
          <p className="text-sm text-slate-500">
            {new Date(game.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            Played as {game.playedAs === "WHITE" ? "White" : "Black"}
            {game.timeControl && ` · ${game.timeControl}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {game.score && <span className="text-sm text-slate-500">{game.score}</span>}
          <ResultBadge result={game.result as GameResult} />
        </div>
      </div>

      <GameViewer
        gameId={game.id}
        pgn={game.pgn}
        playedAs={game.playedAs as PlayerColor}
        initialMemos={game.memos}
      />
    </div>
  );
}
