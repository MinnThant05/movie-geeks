import Image from "next/image";
import Link from "next/link";
import { getPopularMovies, tmdbImage } from "@/lib/tmdb";
import { MovieCard } from "@/app/components/MovieCard";

export default async function HomePage() {
  const data = await getPopularMovies();
  const [hero, ...rest] = data.results;
  const heroBackdrop = hero ? tmdbImage(hero.backdrop_path, "original") : null;

  return (
    <main className="w-full">
      {hero && (
        <section className="relative w-full overflow-hidden">
          <div className="relative h-[60vh] max-h-[560px] min-h-[380px] w-full bg-surface">
            {heroBackdrop && (
              <Image
                src={heroBackdrop}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:pb-14">
                <h1 className="max-w-2xl font-display text-4xl leading-tight tracking-wide text-cream sm:text-5xl md:text-6xl">
                  {hero.title}
                </h1>
                {hero.overview && (
                  <p className="mt-4 line-clamp-3 max-w-xl text-sm text-cream-muted sm:text-base">
                    {hero.overview}
                  </p>
                )}
                <Link
                  href={`/movies/${hero.id}`}
                  className="mt-6 inline-block rounded-pill bg-accent-deep px-6 py-2.5 text-sm font-semibold text-cream shadow-marquee transition hover:bg-accent-deep-hover"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl tracking-wide text-cream sm:text-3xl">
            Popular Movies
          </h2>
          <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
          {rest.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </main>
  );
}
