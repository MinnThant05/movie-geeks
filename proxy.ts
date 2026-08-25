import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same mechanism, new name/file).
// withAuth's built-in `authorized` callback can only send everyone to the same
// sign-in page, so we let it always pass the token through and decide the
// redirect ourselves below to distinguish "not logged in" from "logged in,
// wrong role".
export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;

    if (token?.role !== "ADMIN") {
      const destination = token ? "/" : "/login";
      return NextResponse.redirect(new URL(destination, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
