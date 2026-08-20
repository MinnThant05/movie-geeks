import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Avatar upload is not configured: BLOB_READ_WRITE_TOKEN is missing. Run `vercel env pull` to fetch it.",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "file must be an image" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `file must be at most ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
      { status: 400 }
    );
  }

  try {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const blob = await put(`avatars/${session.user.id}-${Date.now()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: blob.url },
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Something went wrong uploading the avatar" }, { status: 500 });
  }
}
