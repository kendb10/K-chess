import { Chess } from "chess.js";
import type { GameResult, PlayerColor } from "./types";

export interface ParsedPgn {
  headers: Record<string, string | null>;
  white: string;
  black: string;
  date: string | null; // ISO date string (YYYY-MM-DD) if parseable
  resultTag: string | null; // raw PGN Result tag, e.g. "1-0", "0-1", "1/2-1/2"
  timeControl: string | null;
  moveCount: number;
}

export class PgnParseError extends Error {}

/** Parses a Chess.com-style PGN export and extracts header metadata. */
export function parsePgn(pgn: string): ParsedPgn {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim());
  } catch (err) {
    throw new PgnParseError(
      err instanceof Error ? `Invalid PGN: ${err.message}` : "Invalid PGN"
    );
  }

  const headers = chess.header();
  const moveCount = chess.history().length;

  if (moveCount === 0) {
    throw new PgnParseError("PGN contains no moves.");
  }

  return {
    headers,
    white: headers.White ?? "Unknown",
    black: headers.Black ?? "Unknown",
    date: normalizePgnDate(headers.Date ?? headers.UTCDate ?? undefined),
    resultTag: headers.Result ?? null,
    timeControl: headers.TimeControl ?? null,
    moveCount,
  };
}

/** Converts PGN "YYYY.MM.DD" dates to ISO "YYYY-MM-DD"; returns null if unparseable. */
function normalizePgnDate(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

/** Determines the opponent name from parsed PGN headers and the color the player used. */
export function resolveOpponent(parsed: ParsedPgn, playedAs: PlayerColor): string {
  return playedAs === "WHITE" ? parsed.black : parsed.white;
}

/** Derives WIN/LOSS/DRAW from the PGN Result tag and the color the player used. */
export function resolveResult(
  resultTag: string | null,
  playedAs: PlayerColor
): GameResult {
  if (resultTag === "1/2-1/2") return "DRAW";
  if (resultTag === "1-0") return playedAs === "WHITE" ? "WIN" : "LOSS";
  if (resultTag === "0-1") return playedAs === "BLACK" ? "WIN" : "LOSS";
  return "DRAW";
}
