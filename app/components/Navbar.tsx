"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Suspense } from "react";
import { SearchInput } from "@/app/components/SearchInput";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-white">
          🎬 Movie Geeks
        </Link>

        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:px-4">
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <span className="text-sm text-gray-500">...</span>
          ) : session ? (
            <>
              <span className="text-sm text-gray-300">
                Hi, {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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