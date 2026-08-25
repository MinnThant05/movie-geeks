import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/app/components/admin/AdminUsersTable";
import { AdminReviewsTable } from "@/app/components/admin/AdminReviewsTable";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Admin Dashboard</h1>

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
        <h2 className="mb-4 text-lg font-semibold text-white">User Management</h2>
        <AdminUsersTable
          users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={auth.session.user.id}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Review Moderation</h2>
        <AdminReviewsTable
          reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        />
      </section>
    </main>
  );
}
