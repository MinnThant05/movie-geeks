"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { SearchInput } from "@/app/components/SearchInput";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        active ? "text-accent-teal" : "text-cream-muted hover:text-accent-teal"
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="h-[3px] w-full bg-gradient-to-r from-accent-teal via-accent to-accent-deep" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-md border border-border-subtle bg-background px-3 py-1.5 shadow-poster transition hover:border-accent-teal hover:shadow-marquee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <span className="text-lg leading-none">🎬</span>
          <span className="font-display text-xl tracking-wide text-cream transition-colors group-hover:text-accent-teal">
            MOVIE GEEKS
          </span>
        </Link>

        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:px-4">
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {status === "loading" ? (
            <span className="text-sm text-cream-dim">...</span>
          ) : session ? (
            <>
              <NavLink href="/watchlist">Watchlist</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              {session.user.role === "ADMIN" && (
                <NavLink href="/admin">Admin</NavLink>
              )}
              <span className="hidden text-sm text-cream-muted sm:inline">
                Hi, {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-pill border border-border-subtle bg-surface-raised px-3 py-1.5 text-sm text-cream-muted transition hover:border-accent-teal hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Sign in</NavLink>
              <Link
                href="/register"
                className="rounded-pill bg-accent-deep px-4 py-1.5 text-sm font-semibold text-cream shadow-marquee transition hover:bg-accent-deep-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
