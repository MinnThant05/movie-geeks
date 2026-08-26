import Image from "next/image";
import Link from "next/link";
import { tmdbImage, type TmdbMovie } from "@/lib/tmdb";

export function MovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = tmdbImage(movie.poster_path, "w500");
  const year = movie.release_date?.slice(0, 4) || "—";

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group relative block overflow-hidden rounded-card border border-border bg-surface shadow-poster transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-marquee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-[2/3] w-full bg-surface-raised">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-cream-dim">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-background-alt via-background-alt/85 to-transparent px-3 pb-3 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <h3 className="truncate font-display text-base tracking-wide text-cream">
            {movie.title}
          </h3>
          <div className="mt-1 flex items-center justify-between text-xs text-cream-muted">
            <span>{year}</span>
            <span className="flex items-center gap-1 font-semibold text-accent-teal">
              ★ {movie.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
