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

interface CreateReviewBody {
  rating?: number;
  content?: string | null;
  movie?: MovieInput;
}

function isValidRating(rating: unknown): rating is number {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

function isValidContent(content: unknown): content is string | null | undefined {
  return content === undefined || content === null || typeof content === "string";
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

  let body: CreateReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, content, movie } = body;

  if (!isValidRating(rating)) {
    return NextResponse.json(
      { error: "rating is required and must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (!isValidContent(content)) {
    return NextResponse.json({ error: "content must be a string" }, { status: 400 });
  }

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

    const review = await prisma.review.create({
      data: {
        rating,
        content: content ?? null,
        userId: session.user.id,
        movieId,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You already reviewed this movie" },
        { status: 409 }
      );
    }

    console.error("Create review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: Request) {
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
    const reviews = await prisma.review.findMany({
      where: { movieId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("List reviews error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
