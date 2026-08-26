import { StarRating } from "@/app/components/StarRating";

export interface ReviewListItem {
  id: string;
  rating: number;
  content: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: ReviewListItem[];
  emptyMessage: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function ReviewList({ reviews, emptyMessage }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-cream-muted">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-card border border-border bg-surface p-4 shadow-poster"
        >
          <div className="flex items-center gap-3">
            {review.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.image}
                alt={review.user.name ?? "User"}
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-2 ring-border-subtle"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-xs font-semibold text-cream-muted">
                {initials(review.user.name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cream">
                {review.user.name ?? "Anonymous"}
              </p>
              <p className="text-xs text-cream-dim">{formatDate(review.createdAt)}</p>
            </div>
          </div>

          <div className="mt-3">
            <StarRating value={review.rating} readOnly />
          </div>

          {review.content && (
            <p className="mt-2 text-sm text-cream-muted">{review.content}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
