"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { parsePgn, resolveOpponent, resolveResult, PgnParseError } from "@/lib/pgn";
import type { GameResult, PlayerColor } from "@/lib/types";

export default function NewGameForm() {
  const router = useRouter();
  const [pgn, setPgn] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [playedAs, setPlayedAs] = useState<PlayerColor>("WHITE");
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [result, setResult] = useState<GameResult>("WIN");
  const [score, setScore] = useState("");
  const [timeControl, setTimeControl] = useState("");

  function handlePgnChange(value: string) {
    setPgn(value);
    setSubmitError(null);
    if (!value.trim()) {
      setParseError(null);
      return;
    }
    try {
      const parsed = parsePgn(value);
      setParseError(null);
      setDate(parsed.date ?? "");
      setOpponent(resolveOpponent(parsed, playedAs));
      setResult(resolveResult(parsed.resultTag, playedAs));
      setTimeControl(parsed.timeControl ?? "");
    } catch (err) {
      setParseError(err instanceof PgnParseError ? err.message : "Could not parse PGN.");
    }
  }

  function handleColorChange(color: PlayerColor) {
    setPlayedAs(color);
    if (!pgn.trim()) return;
    try {
      const parsed = parsePgn(pgn);
      setOpponent(resolveOpponent(parsed, color));
      setResult(resolveResult(parsed.resultTag, color));
    } catch {
      // ignore, parseError already surfaced from handlePgnChange
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pgn, date, opponent, result, score, playedAs, timeControl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/games/${data.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = pgn.trim() && !parseError && date && opponent;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Add a new game</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">
            PGN (paste from Chess.com)
          </span>
          <textarea
            value={pgn}
            onChange={(e) => handlePgnChange(e.target.value)}
            rows={10}
            placeholder={`[Event "Live Chess"]\n[Date "2024.05.01"]\n[White "you"]\n[Black "opponent"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 ...`}
            className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-slate-500 focus:outline-none"
          />
          {parseError && <span className="text-sm text-rose-600">{parseError}</span>}
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">I played as</span>
            <select
              value={playedAs}
              onChange={(e) => handleColorChange(e.target.value as PlayerColor)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="WHITE">White</option>
              <option value="BLACK">Black</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Opponent</span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Result</span>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as GameResult)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="WIN">Win</option>
              <option value="LOSS">Loss</option>
              <option value="DRAW">Draw</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Score (optional)</span>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 1-0"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Time control (optional)</span>
            <input
              type="text"
              value={timeControl}
              onChange={(e) => setTimeControl(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
        </div>

        {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
        >
          {submitting ? "Saving..." : "Save game"}
        </button>
      </form>
    </div>
  );
}
