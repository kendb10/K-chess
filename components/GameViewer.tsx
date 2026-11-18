"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import MoveList from "./MoveList";
import { useElementWidth } from "@/lib/useElementWidth";
import type { PlayerColor } from "@/lib/types";

interface Memo {
  id: string;
  ply: number;
  text: string;
}

interface GameViewerProps {
  gameId: string;
  pgn: string;
  playedAs: PlayerColor;
  initialMemos: Memo[];
  canEdit: boolean;
}

export default function GameViewer({
  gameId,
  pgn,
  playedAs,
  initialMemos,
  canEdit,
}: GameViewerProps) {
  const { moves, positions } = useMemo(() => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    const verboseMoves = chess.history({ verbose: true });
    const fens = [verboseMoves[0]?.before ?? chess.fen()];
    for (const move of verboseMoves) fens.push(move.after);
    return { moves: verboseMoves, positions: fens };
  }, [pgn]);

  const [ply, setPly] = useState(0);
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const [memoText, setMemoText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { ref: boardContainerRef, width: boardWidth } = useElementWidth<HTMLDivElement>(480);

  const goTo = (p: number) => setPly(Math.max(0, Math.min(positions.length - 1, p)));

  // Highlight the squares of the move that led to the current position.
  const lastMoveSquareStyles = useMemo(() => {
    const lastMove = moves[ply - 1];
    if (!lastMove) return {};
    const highlight = { backgroundColor: "rgba(250, 204, 21, 0.4)" };
    return { [lastMove.from]: highlight, [lastMove.to]: highlight };
  }, [moves, ply]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(ply - 1);
      if (e.key === "ArrowRight") goTo(ply + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, positions.length]);

  const currentMemos = memos.filter((m) => m.ply === ply);

  async function handleAddMemo(e: React.FormEvent) {
    e.preventDefault();
    if (!memoText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/games/${gameId}/memos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ply, text: memoText.trim() }),
      });
      if (res.ok) {
        const memo = await res.json();
        setMemos((prev) => [...prev, memo]);
        setMemoText("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMemo(id: string) {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/memos/${id}`, { method: "DELETE" });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-col items-center gap-3">
        <div ref={boardContainerRef} className="w-full max-w-[480px]">
          <Chessboard
            position={positions[ply]}
            boardWidth={boardWidth}
            boardOrientation={playedAs === "WHITE" ? "white" : "black"}
            arePiecesDraggable={false}
            customSquareStyles={lastMoveSquareStyles}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(ply - 1)}
            disabled={ply === 0}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="min-w-[72px] text-center text-sm text-slate-500">
            {ply} / {positions.length - 1}
          </span>
          <button
            onClick={() => goTo(ply + 1)}
            disabled={ply === positions.length - 1}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Moves</h2>
          <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 p-2">
            <MoveList moves={moves} currentPly={ply} onSelect={goTo} />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Memo at move {ply}
          </h2>
          <div className="flex flex-col gap-2">
            {currentMemos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-start justify-between gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm"
              >
                <p className="whitespace-pre-wrap">{memo.text}</p>
                {canEdit && (
                  <button
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="flex-shrink-0 text-xs text-slate-400 hover:text-rose-600"
                    aria-label="Delete memo"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {currentMemos.length === 0 && (
              <p className="text-sm text-slate-400">No memo for this position yet.</p>
            )}
            {canEdit && (
              <form onSubmit={handleAddMemo} className="flex flex-col gap-2">
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="Add a note about this position..."
                  rows={3}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting || !memoText.trim()}
                  className="self-start rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
                >
                  Add memo
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
