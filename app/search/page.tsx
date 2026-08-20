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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-gray-400">
          Search for a movie using the box above.
        </p>
      </main>
    );
  }

  const data = await searchMovies(query);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Results for &ldquo;{query}&rdquo;
      </h1>

      {data.results.length === 0 ? (
        <p className="text-gray-400">No movies found for &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </main>
  );
}
