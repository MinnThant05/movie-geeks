export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-surface-raised via-border-subtle to-surface-raised ${className}`}
    />
  );
}

export function SkeletonMovieCard() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-poster">
      <Skeleton className="aspect-[2/3] w-full" />
    </div>
  );
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMovieCard key={i} />
      ))}
    </div>
  );
}
