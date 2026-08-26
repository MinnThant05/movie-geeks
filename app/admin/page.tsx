import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/app/components/admin/AdminUsersTable";
import { AdminReviewsTable } from "@/app/components/admin/AdminReviewsTable";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-poster">
      <p className="text-sm text-cream-muted">{label}</p>
      <p className="mt-1 truncate font-display text-2xl tracking-wide text-accent-teal">
        {value}
      </p>
    </div>
  );
}

export default async function AdminPage() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    redirect(auth.status === 401 ? "/login" : "/");
  }

  const [totalUsers, totalReviews, totalMovies, topMovie, users, reviews] =
    await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.movie.count(),
      prisma.review.groupBy({
        by: ["movieId"],
        _count: { movieId: true },
        orderBy: { _count: { movieId: "desc" } },
        take: 1,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          movie: { select: { id: true, title: true } },
        },
      }),
    ]);

  const mostReviewedMovie =
    topMovie.length > 0
      ? await prisma.movie.findUnique({
          where: { id: topMovie[0]!.movieId },
          select: { title: true },
        })
      : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-wide text-cream sm:text-3xl">
          Admin Dashboard
        </h1>
        <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
      </div>

      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers.toString()} />
        <StatCard label="Total Reviews" value={totalReviews.toString()} />
        <StatCard label="Total Movies" value={totalMovies.toString()} />
        <StatCard
          label="Most Reviewed"
          value={mostReviewedMovie ? mostReviewedMovie.title : "—"}
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl tracking-wide text-cream">
          User Management
        </h2>
        <AdminUsersTable
          users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={auth.session.user.id}
        />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl tracking-wide text-cream">
          Review Moderation
        </h2>
        <AdminReviewsTable
          reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        />
      </section>
    </main>
  );
}
