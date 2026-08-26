"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 shadow-poster">
        <h1 className="mb-6 text-center font-display text-3xl tracking-wide text-cream">
          Sign in to Movie Geeks
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-cream-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-cream outline-none transition focus:border-accent-teal focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-cream-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border-subtle bg-background px-3 py-2 text-cream outline-none transition focus:border-accent-teal focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-pill bg-accent-deep py-2 font-semibold text-cream shadow-marquee transition hover:bg-accent-deep-hover disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent-teal transition-colors hover:text-accent">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}