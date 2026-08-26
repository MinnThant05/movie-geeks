// Standalone script — run manually with `npm run sync-movies`.
// Bulk-populates the Movie table from TMDB's /movie/popular endpoint so
// reviews/watchlist always have a real movie row to reference and admin
// stats are meaningful. Does NOT touch browse/search/details pages, which
// keep reading from TMDB live.
import { config } from "dotenv";

// .env.local takes priority; config() never overrides an already-set var,
// so loading .env.local first then falling back to .env mirrors Next's
// own precedence.
config({ path: ".env.local" });
config();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_PAGES = 25;
const DELAY_BETWEEN_PAGES_MS = 250;

interface TmdbMovieListItem {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  genre_ids?: number[];
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbPopularResponse {
  results: TmdbMovieListItem[];
  total_pages: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tmdbGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set (checked .env.local and .env)");
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText} (${endpoint})`);
  }

  return res.json() as Promise<T>;
}

function parseReleaseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchGenreMap(): Promise<Map<number, string>> {
  const data = await tmdbGet<{ genres: TmdbGenre[] }>("/genre/movie/list");
  return new Map(data.genres.map((g) => [g.id, g.name]));
}

// prisma is dynamically imported (inside main, after dotenv has run) because
// lib/prisma.ts reads process.env.DATABASE_URL at module-load time, and
// static ES module imports are hoisted above the config() calls above.
async function main() {
  const { prisma } = await import("../lib/prisma");

  const requestedPages = Number(process.argv[2]);
  const pageCount =
    Number.isInteger(requestedPages) && requestedPages > 0 ? requestedPages : DEFAULT_PAGES;

  console.log(`Starting TMDB sync: up to ${pageCount} pages of /movie/popular...`);

  const genreMap = await fetchGenreMap();
  console.log(`Loaded ${genreMap.size} genres.`);

  let totalSynced = 0;
  let totalFailed = 0;

  try {
    for (let page = 1; page <= pageCount; page++) {
      let response: TmdbPopularResponse;
      try {
        response = await tmdbGet<TmdbPopularResponse>("/movie/popular", { page: page.toString() });
      } catch (error) {
        console.error(`  Failed to fetch page ${page}, skipping:`, error instanceof Error ? error.message : error);
        continue;
      }

      if (page === 1 && response.total_pages < pageCount) {
        console.log(`  TMDB only has ${response.total_pages} pages of popular movies; will stop there.`);
      }

      for (const movie of response.results) {
        try {
          const genres = (movie.genre_ids ?? [])
            .map((id) => genreMap.get(id))
            .filter((name): name is string => Boolean(name));

          const data = {
            title: movie.title,
            overview: movie.overview ?? null,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path,
            releaseDate: parseReleaseDate(movie.release_date),
            rating: typeof movie.vote_average === "number" ? movie.vote_average : null,
            genres,
          };

          await prisma.movie.upsert({
            where: { id: movie.id },
            create: { id: movie.id, ...data },
            update: data,
          });

          totalSynced++;
        } catch (error) {
          totalFailed++;
          console.error(
            `  Failed to sync movie ${movie.id} (${movie.title}):`,
            error instanceof Error ? error.message : error
          );
        }
      }

      console.log(`Synced page ${page}/${pageCount}, ${totalSynced} movies total`);

      const isLastPage = page === pageCount || page === response.total_pages;
      if (!isLastPage) {
        await sleep(DELAY_BETWEEN_PAGES_MS);
      } else {
        break;
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\nDone. Synced ${totalSynced} movies (${totalFailed} failed).`);
}

main().catch((error) => {
  console.error("Sync failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
