const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// ─── Types (the shape of what TMDB returns) ───

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface TmdbMovieDetails extends TmdbMovie {
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

// ─── Core fetch helper ───

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY!);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Like tmdbFetch, but resolves to null on a non-ok response (e.g. 404)
// instead of throwing, for callers that treat "not found" as valid.
async function tmdbFetchOrNull<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY!);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // cache for 1 hour
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

// ─── Public functions ───

export async function getPopularMovies(page = 1) {
  return tmdbFetch<{ results: TmdbMovie[]; total_pages: number }>(
    "/movie/popular",
    { page: page.toString() }
  );
}

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch<{ results: TmdbMovie[]; total_pages: number }>(
    "/search/movie",
    { query, page: page.toString() }
  );
}

export async function getMovieDetails(id: string): Promise<TmdbMovieDetails | null> {
  return tmdbFetchOrNull<TmdbMovieDetails>(`/movie/${id}`, {
    append_to_response: "credits",
  });
}

// ─── Image URL helper ───

export function tmdbImage(path: string | null, size: "w200" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}