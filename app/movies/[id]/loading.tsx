import { Skeleton, SkeletonMovieCard } from "@/app/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="w-full">
      <section className="relative w-full overflow-hidden bg-surface">
        <div className="relative h-[38vh] min-h-[220px] max-h-[420px] w-full overflow-hidden">
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="relative -mt-20 flex flex-col gap-6 pb-8 sm:-mt-28 md:flex-row md:items-end md:gap-8">
            <div className="w-40 flex-shrink-0 overflow-hidden rounded-card border border-border bg-surface shadow-poster sm:w-48 md:w-56">
              <Skeleton className="aspect-[2/3] w-full" />
            </div>

            <div className="min-w-0 flex-1 md:pb-2">
              <Skeleton className="h-9 w-2/3 max-w-md rounded-md sm:h-10" />
              <Skeleton className="mt-3 h-4 w-1/2 max-w-xs rounded-md" />

              <div className="mt-4 flex flex-wrap gap-3">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-pill" />
                <Skeleton className="h-6 w-24 rounded-pill" />
                <Skeleton className="h-6 w-16 rounded-pill" />
              </div>

              <Skeleton className="mt-4 h-9 w-40 rounded-pill" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-2xl rounded-md" />

        <section className="mt-12">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="mt-2 h-1 w-16 rounded-pill" />

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMovieCard key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
