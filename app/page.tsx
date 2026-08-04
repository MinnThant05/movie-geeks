import { getPopularMovies } from "@/lib/tmdb";
import { MovieCard } from "@/app/components/MovieCard";

export default async function HomePage() {
  const data = await getPopularMovies();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Popular Movies</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </main>
  );
}
