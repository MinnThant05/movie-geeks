import Link from "next/link";
import { searchMovies } from "@/lib/tmdb";
import { MovieCard } from "@/app/components/MovieCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <span className="text-4xl">🔎</span>
        <p className="mt-4 text-cream-muted">
          Search for a movie using the box above.
        </p>
      </main>
    );
  }

  const data = await searchMovies(query);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl tracking-wide text-cream sm:text-3xl">
          Results for &ldquo;{query}&rdquo;
        </h1>
        <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
      </div>

      {data.results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
          <span className="text-4xl">🎬</span>
          <p className="text-cream-muted">
            No movies found for &ldquo;{query}&rdquo;
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-accent-teal transition-colors hover:text-accent"
          >
            Browse popular movies →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
          {data.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </main>
  );
}
