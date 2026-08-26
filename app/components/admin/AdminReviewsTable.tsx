"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StarRating } from "@/app/components/StarRating";

export interface AdminReviewRow {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: string; name: string | null };
  movie: { id: number; title: string };
}

interface AdminReviewsTableProps {
  reviews: AdminReviewRow[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminReviewsTable({ reviews: initialReviews }: AdminReviewsTableProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setPendingId(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        setPendingId(null);
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
      setPendingId(null);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPendingId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="text-cream-muted">No reviews yet.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <ul className="flex flex-col gap-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4 shadow-poster sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  href={`/movies/${review.movie.id}`}
                  className="font-semibold text-cream transition-colors hover:text-accent-teal"
                >
                  {review.movie.title}
                </Link>
                <span className="text-xs text-cream-muted">
                  by {review.user.name ?? "Unnamed"}
                </span>
                <span className="text-xs text-cream-dim">{formatDate(review.createdAt)}</span>
              </div>

              <div className="mt-1">
                <StarRating value={review.rating} readOnly />
              </div>

              {review.content && (
                <p className="mt-2 text-sm text-cream-muted">{review.content}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleDelete(review.id)}
              disabled={pendingId === review.id}
              className="self-start rounded-pill border border-red-800 px-3 py-1 text-xs font-semibold text-red-400 transition hover:border-red-600 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pendingId === review.id ? "Deleting..." : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
