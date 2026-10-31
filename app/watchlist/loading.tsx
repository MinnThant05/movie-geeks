import { Skeleton, PosterGridSkeleton } from "@/app/components/SkeletonCard";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Skeleton className="h-7 w-40 rounded-md" />
        <Skeleton className="mt-2 h-1 w-16 rounded-pill" />
      </div>

      <PosterGridSkeleton count={10} />
    </main>
  );
}
