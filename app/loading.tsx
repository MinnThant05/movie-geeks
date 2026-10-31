import { Skeleton, PosterGridSkeleton } from "@/app/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="w-full">
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[60vh] max-h-[560px] min-h-[380px] w-full overflow-hidden bg-surface">
          <Skeleton className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/10" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:pb-14">
              <Skeleton className="h-10 w-2/3 max-w-lg rounded-md sm:h-14" />
              <Skeleton className="mt-4 h-4 w-full max-w-xl rounded-md" />
              <Skeleton className="mt-2 h-4 w-5/6 max-w-xl rounded-md" />
              <Skeleton className="mt-6 h-10 w-36 rounded-pill" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6">
          <Skeleton className="h-7 w-48 rounded-md" />
          <Skeleton className="mt-2 h-1 w-16 rounded-pill" />
        </div>

        <PosterGridSkeleton count={12} />
      </div>
    </main>
  );
}
