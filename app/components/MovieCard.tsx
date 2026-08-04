import Image from "next/image";
import Link from "next/link";
import { tmdbImage, type TmdbMovie } from "@/lib/tmdb";

export function MovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = tmdbImage(movie.poster_path, "w500");

  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block overflow-hidden rounded-lg bg-gray-800 transition hover:scale-105"
    >
      <div className="relative aspect-[2/3] w-full">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-white">
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
          <span>{movie.release_date?.slice(0, 4) || "—"}</span>
          <span className="flex items-center gap-1">
            ⭐ {movie.vote_average.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
