import Image from "next/image";
import { notFound } from "next/navigation";
import { getMovieDetails, tmdbImage } from "@/lib/tmdb";

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovieDetails(id);

  if (!movie) {
    notFound();
  }

  const posterUrl = tmdbImage(movie.poster_path, "w500");
  const year = movie.release_date?.slice(0, 4) || "—";
  const cast = movie.credits.cast.slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-800 md:w-72">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 767px) 100vw, 288px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white">
            {movie.title} <span className="text-gray-400">({year})</span>
          </h1>

          {movie.tagline && (
            <p className="mt-1 italic text-gray-400">{movie.tagline}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
            {movie.runtime ? <span>{movie.runtime} min</span> : null}
            <span className="flex items-center gap-1">
              ⭐ {movie.vote_average.toFixed(1)}
            </span>
            {movie.genres.length > 0 && (
              <span>{movie.genres.map((g) => g.name).join(", ")}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-gray-200">
            {movie.overview}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-white">Cast</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {cast.map((member) => {
            const photoUrl = tmdbImage(member.profile_path, "w200");
            return (
              <div key={member.id} className="overflow-hidden rounded-lg bg-gray-800">
                <div className="relative aspect-[2/3] w-full">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {member.character}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-white">Reviews</h2>
        <p className="text-gray-400">Coming soon.</p>
      </section>
    </main>
  );
}
