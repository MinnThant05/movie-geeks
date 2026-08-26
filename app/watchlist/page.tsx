import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dbMovieToTmdbMovie } from "@/lib/tmdb";
import { MovieCard } from "@/app/components/MovieCard";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const entries = await prisma.watchlist.findMany({
    where: { userId: session.user.id },
    include: { movie: true },
    orderBy: { addedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl tracking-wide text-cream sm:text-3xl">
          My Watchlist
        </h1>
        <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface/60 px-6 py-16 text-center">
          <span className="text-4xl">🍿</span>
          <p className="text-cream-muted">Your watchlist is empty.</p>
          <Link
            href="/"
            className="text-sm font-semibold text-accent-teal transition-colors hover:text-accent"
          >
            Browse movies to add some →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
          {entries.map((entry) => (
            <MovieCard key={entry.id} movie={dbMovieToTmdbMovie(entry.movie)} />
          ))}
        </div>
      )}
    </main>
  );
}
