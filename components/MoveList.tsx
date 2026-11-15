"use client";

import { Fragment } from "react";

interface VerboseMove {
  san: string;
}

interface MoveListProps {
  moves: VerboseMove[];
  currentPly: number;
  onSelect: (ply: number) => void;
}

export default function MoveList({ moves, currentPly, onSelect }: MoveListProps) {
  const pairs: { moveNumber: number; white?: string; black?: string; whitePly: number; blackPly?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNumber: i / 2 + 1,
      white: moves[i]?.san,
      whitePly: i + 1,
      black: moves[i + 1]?.san,
      blackPly: moves[i + 1] ? i + 2 : undefined,
    });
  }

  return (
    <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-1 text-sm">
      {pairs.map((pair) => (
        <Fragment key={pair.moveNumber}>
          <span className="text-slate-400">{pair.moveNumber}.</span>
          <button
            onClick={() => onSelect(pair.whitePly)}
            className={`rounded px-1.5 py-0.5 text-left hover:bg-slate-100 ${
              currentPly === pair.whitePly ? "bg-slate-900 text-white hover:bg-slate-900" : ""
            }`}
          >
            {pair.white}
          </button>
          <button
            onClick={() => pair.blackPly && onSelect(pair.blackPly)}
            disabled={!pair.black}
            className={`rounded px-1.5 py-0.5 text-left hover:bg-slate-100 disabled:opacity-0 ${
              currentPly === pair.blackPly ? "bg-slate-900 text-white hover:bg-slate-900" : ""
            }`}
          >
            {pair.black}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
