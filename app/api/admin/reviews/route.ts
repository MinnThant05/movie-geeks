import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export interface AdminReview {
  id: string;
  rating: number;
  content: string | null;
  createdAt: Date;
  user: { id: string; name: string | null };
  movie: { id: number; title: string };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("List all reviews error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // No ownership check here on purpose: this endpoint is authorized by
    // requireAdmin() alone (the caller's ROLE), not by review.userId. Admin
    // moderation must be able to remove any user's review, unlike
    // DELETE /api/reviews/[id] which checks review.userId === session.user.id.
    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Admin delete review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
