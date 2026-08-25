import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

type AuthSuccess = { ok: true; session: Session };
type AuthFailure = { ok: false; status: 401 | 403; response: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  return { ok: true, session };
}

export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (auth.session.user.role !== "ADMIN") {
    return {
      ok: false,
      status: 403,
      response: NextResponse.json(
        { error: "Forbidden: admin access required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}
