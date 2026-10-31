"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <span className="text-4xl">🎞️</span>
      <h1 className="mt-4 font-display text-2xl tracking-wide text-cream sm:text-3xl">
        Something went wrong loading this page
      </h1>
      <p className="mt-2 max-w-md text-sm text-cream-muted">
        An unexpected error occurred. You can try again, or head back to the
        homepage.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-pill bg-accent-deep px-5 py-2 text-sm font-semibold text-cream shadow-marquee transition hover:bg-accent-deep-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-pill border border-border-subtle bg-surface-raised px-5 py-2 text-sm font-semibold text-cream-muted transition hover:border-accent-teal hover:text-cream"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
