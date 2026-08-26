import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tmdbImage } from "@/lib/tmdb";
import { EditProfile } from "@/app/components/EditProfile";
import { StarRating } from "@/app/components/StarRating";

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, bio: true },
  });

  if (!user) {
    redirect("/login");
  }

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { movie: true },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-wide text-cream sm:text-3xl">
          My Profile
        </h1>
        <div className="mt-2 h-1 w-16 rounded-pill bg-gradient-to-r from-accent-teal to-accent-deep" />
      </div>

      <div className="mb-8 flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-poster">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-border-subtle"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-lg font-semibold text-cream-muted">
            {initials(user.name)}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-display text-xl tracking-wide text-cream">
            {user.name ?? "Unnamed"}
          </p>
          <p className="text-sm text-cream-muted">{user.email}</p>
          {user.bio && <p className="mt-2 max-w-lg text-sm text-cream-muted">{user.bio}</p>}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-xl tracking-wide text-cream">Edit Profile</h2>
        <EditProfile
          initialName={user.name ?? ""}
          initialBio={user.bio ?? ""}
          initialImage={user.image}
        />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl tracking-wide text-cream">My Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-cream-muted">
            You haven&apos;t reviewed any movies yet.{" "}
            <Link href="/" className="text-accent-teal transition-colors hover:text-accent">
              Browse movies
            </Link>{" "}
            to write your first review.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => {
              const posterUrl = tmdbImage(review.movie.posterPath, "w200");
              return (
                <li
                  key={review.id}
                  className="flex gap-4 rounded-card border border-border bg-surface p-4 shadow-poster"
                >
                  <Link
                    href={`/movies/${review.movie.id}`}
                    className="relative aspect-[2/3] w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-raised"
                  >
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={review.movie.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-cream-dim">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <Link
                        href={`/movies/${review.movie.id}`}
                        className="truncate font-semibold text-cream transition-colors hover:text-accent-teal"
                      >
                        {review.movie.title}
                      </Link>
                      <span className="text-xs text-cream-dim">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="mt-1">
                      <StarRating value={review.rating} readOnly />
                    </div>

                    {review.content && (
                      <p className="mt-2 text-sm text-cream-muted">{review.content}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
