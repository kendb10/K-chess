import type { GameResult } from "@/lib/types";

const STYLES: Record<GameResult, string> = {
  WIN: "bg-emerald-100 text-emerald-800",
  LOSS: "bg-rose-100 text-rose-800",
  DRAW: "bg-amber-100 text-amber-800",
};

const LABELS: Record<GameResult, string> = {
  WIN: "Win",
  LOSS: "Loss",
  DRAW: "Draw",
};

export default function ResultBadge({ result }: { result: GameResult }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[result]}`}
    >
      {LABELS[result]}
    </span>
  );
}
