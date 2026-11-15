import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isGameResult, isPlayerColor } from "@/lib/types";
import { parsePgn, PgnParseError } from "@/lib/pgn";

export async function GET() {
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
  return NextResponse.json(games);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.pgn !== "string") {
    return NextResponse.json({ error: "Missing PGN." }, { status: 400 });
  }

  const { pgn, date, opponent, result, score, playedAs, timeControl } = body;

  if (!isPlayerColor(playedAs)) {
    return NextResponse.json(
      { error: "playedAs must be WHITE or BLACK." },
      { status: 400 }
    );
  }
  if (!isGameResult(result)) {
    return NextResponse.json(
      { error: "result must be WIN, LOSS, or DRAW." },
      { status: 400 }
    );
  }
  if (!date || isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }
  if (!opponent || typeof opponent !== "string") {
    return NextResponse.json({ error: "Missing opponent." }, { status: 400 });
  }

  try {
    parsePgn(pgn);
  } catch (err) {
    if (err instanceof PgnParseError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const game = await prisma.game.create({
    data: {
      date: new Date(date),
      opponent,
      result,
      score: score || null,
      playedAs,
      pgn,
      timeControl: timeControl || null,
    },
  });

  return NextResponse.json(game, { status: 201 });
}
