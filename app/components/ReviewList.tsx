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
    return <p className="text-gray-400">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg bg-gray-800 p-4">
          <div className="flex items-center gap-3">
            {review.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.user.image}
                alt={review.user.name ?? "User"}
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-gray-300">
                {initials(review.user.name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {review.user.name ?? "Anonymous"}
              </p>
              <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
            </div>
          </div>

          <div className="mt-3">
            <StarRating value={review.rating} readOnly />
          </div>

          {review.content && (
            <p className="mt-2 text-sm text-gray-200">{review.content}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
