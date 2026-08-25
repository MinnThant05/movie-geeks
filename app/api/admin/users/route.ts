import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
}

interface UpdateRoleBody {
  userId?: string;
  role?: string;
}

function isValidRole(role: unknown): role is Role {
  return role === Role.USER || role === Role.ADMIN;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: UpdateRoleBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, role } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!isValidRole(role)) {
    return NextResponse.json(
      { error: "role must be one of USER, ADMIN" },
      { status: 400 }
    );
  }

  // The acting admin is always derived from the session, never from the
  // request body — this is what makes the self-demotion check trustworthy.
  const actingAdminId = auth.session.user.id;

  if (userId === actingAdminId) {
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 403 }
    );
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Demoting the last remaining admin would lock everyone out of /admin
    // (proxy.ts gates the route on role === "ADMIN" with no recovery path),
    // so refuse the change while this would be the only admin left.
    if (target.role === Role.ADMIN && role === Role.USER) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last remaining admin" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
