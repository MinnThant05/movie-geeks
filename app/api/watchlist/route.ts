import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

interface MovieInput {
  id?: number;
  tmdbId?: number;
  title?: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  genres?: string[];
  runtime?: number | null;
}

interface AddToWatchlistBody {
  movie?: MovieInput;
}

function parseReleaseDate(releaseDate: string | null | undefined): Date | null {
  if (!releaseDate) return null;
  const date = new Date(releaseDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: AddToWatchlistBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { movie } = body;
  const movieId = movie?.id ?? movie?.tmdbId;

  if (!movie || typeof movieId !== "number" || !Number.isInteger(movieId)) {
    return NextResponse.json(
      { error: "movie.id (TMDB id) is required" },
      { status: 400 }
    );
  }

  if (!movie.title || typeof movie.title !== "string") {
    return NextResponse.json({ error: "movie.title is required" }, { status: 400 });
  }

  try {
    await prisma.movie.upsert({
      where: { id: movieId },
      update: {},
      create: {
        id: movieId,
        title: movie.title,
        overview: movie.overview ?? null,
        posterPath: movie.posterPath ?? null,
        backdropPath: movie.backdropPath ?? null,
        releaseDate: parseReleaseDate(movie.releaseDate),
        rating: movie.rating ?? null,
        genres: Array.isArray(movie.genres) ? movie.genres : [],
        runtime: movie.runtime ?? null,
      },
    });

    const entry = await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        movieId,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This movie is already on your watchlist" },
        { status: 409 }
      );
    }

    console.error("Add to watchlist error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const movieIdParam = searchParams.get("movieId");

  if (!movieIdParam) {
    return NextResponse.json(
      { error: "movieId query parameter is required" },
      { status: 400 }
    );
  }

  const movieId = Number(movieIdParam);
  if (!Number.isInteger(movieId)) {
    return NextResponse.json({ error: "movieId must be an integer" }, { status: 400 });
  }

  try {
    await prisma.watchlist.deleteMany({
      where: { userId: session.user.id, movieId },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: "desc" },
      include: { movie: true },
    });

    return NextResponse.json(watchlist, { status: 200 });
  } catch (error) {
    console.error("List watchlist error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
