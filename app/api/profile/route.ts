import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_NAME_LENGTH = 100;
const MAX_BIO_LENGTH = 500;

interface UpdateProfileBody {
  name?: string;
  bio?: string | null;
}

function isValidName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.trim().length <= MAX_NAME_LENGTH;
}

function isValidBio(bio: unknown): bio is string | null | undefined {
  return (
    bio === undefined ||
    bio === null ||
    (typeof bio === "string" && bio.length <= MAX_BIO_LENGTH)
  );
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: UpdateProfileBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, bio } = body;

  if (!isValidName(name)) {
    return NextResponse.json(
      { error: `name is required and must be at most ${MAX_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }

  if (!isValidBio(bio)) {
    return NextResponse.json(
      { error: `bio must be a string of at most ${MAX_BIO_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim(), bio: bio?.trim() || null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
