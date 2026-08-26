import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails, tmdbImage } from "@/lib/tmdb";
import { MyReviewSection } from "@/app/components/MyReviewSection";
import type { ReviewMovieInput } from "@/app/components/ReviewForm";
import { ReviewList } from "@/app/components/ReviewList";
import { WatchlistButton } from "@/app/components/WatchlistButton";

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
  const backdropUrl = tmdbImage(movie.backdrop_path, "original");
  const year = movie.release_date?.slice(0, 4) || "—";
  const cast = movie.credits.cast.slice(0, 10);

  const session = await getServerSession(authOptions);

  const myReview = session?.user
    ? await prisma.review.findUnique({
        where: { userId_movieId: { userId: session.user.id, movieId: movie.id } },
        select: { id: true, rating: true, content: true },
      })
    : null;

  const otherReviews = await prisma.review.findMany({
    where: {
      movieId: movie.id,
      ...(session?.user ? { userId: { not: session.user.id } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      content: true,
      createdAt: true,
      user: { select: { name: true, image: true } },
    },
  });

  const watchlistEntry = session?.user
    ? await prisma.watchlist.findUnique({
        where: { userId_movieId: { userId: session.user.id, movieId: movie.id } },
        select: { id: true },
      })
    : null;

  const allReviewsCount = otherReviews.length + (myReview ? 1 : 0);
  const averageRating =
    allReviewsCount > 0
      ? (otherReviews.reduce((sum, r) => sum + r.rating, 0) + (myReview?.rating ?? 0)) /
        allReviewsCount
      : 0;

  const reviewMovieInput: ReviewMovieInput = {
    id: movie.id,
    title: movie.title,
    overview: movie.overview || null,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date || null,
    rating: movie.vote_average,
    genres: movie.genres.map((genre) => genre.name),
    runtime: movie.runtime,
  };

  return (
    <main className="w-full">
      <section className="relative w-full overflow-hidden bg-surface">
        <div className="relative h-[38vh] min-h-[220px] max-h-[420px] w-full">
          {backdropUrl && (
            <Image
              src={backdropUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="relative -mt-20 flex flex-col gap-6 pb-8 sm:-mt-28 md:flex-row md:items-end md:gap-8">
            <div className="relative aspect-[2/3] w-40 flex-shrink-0 overflow-hidden rounded-card border border-border bg-surface shadow-poster sm:w-48 md:w-56">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 767px) 160px, 224px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-cream-dim">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 md:pb-2">
              <h1 className="font-display text-3xl tracking-wide text-cream sm:text-4xl">
                {movie.title}{" "}
                <span className="font-sans text-xl font-normal text-cream-muted">
                  ({year})
                </span>
              </h1>

              {movie.tagline && (
                <p className="mt-2 italic text-cream-muted">{movie.tagline}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cream-muted">
                {movie.runtime ? <span>{movie.runtime} min</span> : null}
                <span className="flex items-center gap-1 font-semibold text-accent-teal">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
              </div>

              {movie.genres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-pill border border-border-subtle bg-surface-raised px-2.5 py-1 text-xs font-medium text-cream-muted"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <WatchlistButton
                  movie={reviewMovieInput}
                  isLoggedIn={Boolean(session?.user)}
                  initialIsOnWatchlist={Boolean(watchlistEntry)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="max-w-3xl leading-relaxed text-cream-muted">
          {movie.overview}
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl tracking-wide text-cream">Cast</h2>
          <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {cast.map((member) => {
              const photoUrl = tmdbImage(member.profile_path, "w200");
              return (
                <div
                  key={member.id}
                  className="overflow-hidden rounded-card border border-border bg-surface shadow-poster"
                >
                  <div className="relative aspect-[2/3] w-full bg-surface-raised">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 20vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-cream-dim">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-sm font-semibold text-cream">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-cream-muted">
                      {member.character}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="font-display text-2xl tracking-wide text-cream">
                Reviews
              </h2>
              <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
            </div>
            {allReviewsCount > 0 && (
              <p className="text-sm text-cream-muted">
                {allReviewsCount} review{allReviewsCount === 1 ? "" : "s"} ·{" "}
                <span className="font-semibold text-accent-teal">
                  {averageRating.toFixed(1)}
                </span>{" "}
                average
              </p>
            )}
          </div>

          <MyReviewSection
            movie={reviewMovieInput}
            isLoggedIn={Boolean(session?.user)}
            initialReview={myReview}
          />

          <div className="mt-6">
            <ReviewList
              reviews={otherReviews}
              emptyMessage={
                myReview
                  ? "No other reviews yet."
                  : "No reviews yet — be the first to review this movie."
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
