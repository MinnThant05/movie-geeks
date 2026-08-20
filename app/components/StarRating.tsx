"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  if (readOnly) {
    return (
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`Rated ${value} out of 5 stars`}
      >
        {STAR_VALUES.map((star) => (
          <span
            key={star}
            aria-hidden="true"
            className={`text-lg leading-none ${
              star <= value ? "text-yellow-400" : "text-gray-600"
            }`}
          >
            {star <= value ? "★" : "☆"}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Select a rating"
      onMouseLeave={() => setHoverValue(null)}
    >
      {STAR_VALUES.map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => setHoverValue(star)}
            className={`text-2xl leading-none transition hover:scale-110 ${
              filled ? "text-yellow-400" : "text-gray-600"
            }`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
