"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ReviewForm,
  type ReviewMovieInput,
  type ReviewSummary,
} from "@/app/components/ReviewForm";
import { StarRating } from "@/app/components/StarRating";

interface MyReviewSectionProps {
  movie: ReviewMovieInput;
  isLoggedIn: boolean;
  initialReview: ReviewSummary | null;
}

export function MyReviewSection({ movie, isLoggedIn, initialReview }: MyReviewSectionProps) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isLoggedIn) {
    return (
      <p className="text-gray-400">
        <Link href="/login" className="text-blue-400 hover:underline">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  if (!review) {
    return <ReviewForm movie={movie} onSaved={(saved) => setReview(saved)} />;
  }

  if (isEditing) {
    return (
      <ReviewForm
        movie={movie}
        existingReview={review}
        onSaved={(saved) => {
          setReview(saved);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/reviews/${review!.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(data?.error ?? "Failed to delete review.");
        setIsDeleting(false);
        return;
      }

      setReview(null);
      setIsDeleting(false);
      router.refresh();
    } catch {
      setDeleteError("Network error. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <StarRating value={review.rating} readOnly />

      {review.content && <p className="mt-2 text-sm text-gray-200">{review.content}</p>}

      {deleteError && <p className="mt-2 text-sm text-red-400">{deleteError}</p>}

      <div className="mt-3 flex gap-4">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-400 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-red-400 hover:underline disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
