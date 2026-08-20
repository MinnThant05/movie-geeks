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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">My Watchlist</h1>

      {entries.length === 0 ? (
        <p className="text-gray-400">
          Your watchlist is empty.{" "}
          <Link href="/" className="text-blue-400 hover:underline">
            Browse movies
          </Link>{" "}
          to add some.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map((entry) => (
            <MovieCard key={entry.id} movie={dbMovieToTmdbMovie(entry.movie)} />
          ))}
        </div>
      )}
    </main>
  );
}
