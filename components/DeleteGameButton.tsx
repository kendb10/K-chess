"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteGameButton({ gameId }: { gameId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/games/${gameId}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-slate-400 hover:text-rose-600"
      >
        Delete game
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Delete this game?</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md bg-rose-600 px-2 py-1 font-medium text-white hover:bg-rose-500 disabled:opacity-40"
      >
        {deleting ? "Deleting..." : "Confirm"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-slate-400 hover:text-slate-600">
        Cancel
      </button>
    </div>
  );
}
