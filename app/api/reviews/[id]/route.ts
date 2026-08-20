import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UpdateReviewBody {
  rating?: number;
  content?: string | null;
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let review;
  try {
    review = await prisma.review.findUnique({ where: { id } });
  } catch (error) {
    console.error("Fetch review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.userId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only edit your own reviews" },
      { status: 403 }
    );
  }

  let body: UpdateReviewBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rating, content } = body;

  if (!isValidRating(rating)) {
    return NextResponse.json(
      { error: "rating is required and must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (!isValidContent(content)) {
    return NextResponse.json({ error: "content must be a string" }, { status: 400 });
  }

  try {
    const updated = await prisma.review.update({
      where: { id },
      data: { rating, content: content ?? null },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  let review;
  try {
    review = await prisma.review.findUnique({ where: { id } });
  } catch (error) {
    console.error("Fetch review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.userId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only delete your own reviews" },
      { status: 403 }
    );
  }

  try {
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
