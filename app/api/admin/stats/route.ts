import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export interface AdminStats {
  totalUsers: number;
  totalReviews: number;
  totalMovies: number;
  mostReviewedMovie: { id: number; title: string; reviewCount: number } | null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const [totalUsers, totalReviews, totalMovies, topMovie] = await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.movie.count(),
      prisma.review.groupBy({
        by: ["movieId"],
        _count: { movieId: true },
        orderBy: { _count: { movieId: "desc" } },
        take: 1,
      }),
    ]);

    let mostReviewedMovie: AdminStats["mostReviewedMovie"] = null;
    if (topMovie.length > 0) {
      const movie = await prisma.movie.findUnique({
        where: { id: topMovie[0]!.movieId },
        select: { id: true, title: true },
      });
      if (movie) {
        mostReviewedMovie = {
          id: movie.id,
          title: movie.title,
          reviewCount: topMovie[0]!._count.movieId,
        };
      }
    }

    const stats: AdminStats = { totalUsers, totalReviews, totalMovies, mostReviewedMovie };
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
