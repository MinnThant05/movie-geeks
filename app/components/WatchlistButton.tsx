"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mirrors the `movie` object shape expected by POST /api/watchlist (the
// TMDB id is sent as `id` and used server-side to upsert the Movie row).
export interface WatchlistMovieInput {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number | null;
  genres: string[];
  runtime: number | null;
}

interface WatchlistButtonProps {
  movie: WatchlistMovieInput;
  isLoggedIn: boolean;
  initialIsOnWatchlist: boolean;
}

export function WatchlistButton({
  movie,
  isLoggedIn,
  initialIsOnWatchlist,
}: WatchlistButtonProps) {
  const router = useRouter();
  const [isOnWatchlist, setIsOnWatchlist] = useState(initialIsOnWatchlist);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-4 py-1.5 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
      >
        + Add to Watchlist
      </Link>
    );
  }

  async function handleToggle() {
    setIsSubmitting(true);
    setError("");

    try {
      const res = isOnWatchlist
        ? await fetch(`/api/watchlist?movieId=${movie.id}`, { method: "DELETE" })
        : await fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movie }),
          });

      if (!res.ok && res.status !== 409) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // A 409 (already on watchlist) still means the end state is "on".
      setIsOnWatchlist(!isOnWatchlist);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isSubmitting}
        className={
          isOnWatchlist
            ? "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            : "inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-4 py-1.5 text-sm font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white disabled:opacity-50"
        }
      >
        {isSubmitting
          ? "Saving..."
          : isOnWatchlist
            ? "✓ On Watchlist"
            : "+ Add to Watchlist"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
