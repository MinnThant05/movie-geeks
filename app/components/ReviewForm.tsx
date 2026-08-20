"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { StarRating } from "@/app/components/StarRating";

// Mirrors the `movie` object shape expected by POST /api/reviews (the
// TMDB id is sent as `id` and used server-side to upsert the Movie row).
export interface ReviewMovieInput {
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

export interface ReviewSummary {
  id: string;
  rating: number;
  content: string | null;
}

interface ReviewFormProps {
  movie: ReviewMovieInput;
  existingReview?: ReviewSummary | null;
  onSaved?: (review: ReviewSummary) => void;
  onCancel?: () => void;
}

type SubmitState = "idle" | "submitting" | "error";

export function ReviewForm({ movie, existingReview, onSaved, onCancel }: ReviewFormProps) {
  const router = useRouter();
  const isEditing = Boolean(existingReview);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setState("error");
      setErrorMessage("Please select a star rating.");
      return;
    }

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(
        isEditing ? `/api/reviews/${existingReview!.id}` : "/api/reviews",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? { rating, content: content.trim() || null }
              : { rating, content: content.trim() || null, movie }
          ),
        }
      );

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage("You've already reviewed this movie.");
        } else {
          const data = await res.json().catch(() => null);
          setErrorMessage(data?.error ?? "Something went wrong. Please try again.");
        }
        setState("error");
        return;
      }

      const saved: ReviewSummary = await res.json();
      setState("idle");
      router.refresh();
      onSaved?.(saved);
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const isSubmitting = state === "submitting";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-gray-800 p-4">
      <div className="mb-3">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts about this movie (optional)"
        rows={4}
        className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-600"
      />

      {state === "error" && errorMessage && (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Submit review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
