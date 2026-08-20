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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">My Profile</h1>

      <div className="mb-6 flex items-center gap-4">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            className="h-16 w-16 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-gray-300">
            {initials(user.name)}
          </div>
        )}

        <div>
          <p className="text-lg font-semibold text-white">{user.name ?? "Unnamed"}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-white">Edit Profile</h2>
        <EditProfile
          initialName={user.name ?? ""}
          initialBio={user.bio ?? ""}
          initialImage={user.image}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">My Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400">
            You haven&apos;t reviewed any movies yet.{" "}
            <Link href="/" className="text-blue-400 hover:underline">
              Browse movies
            </Link>{" "}
            to write your first review.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((review) => {
              const posterUrl = tmdbImage(review.movie.posterPath, "w200");
              return (
                <li key={review.id} className="flex gap-4 rounded-lg bg-gray-800 p-4">
                  <Link
                    href={`/movies/${review.movie.id}`}
                    className="relative aspect-[2/3] w-16 flex-shrink-0 overflow-hidden rounded bg-gray-700"
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
                      <div className="flex h-full items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <Link
                        href={`/movies/${review.movie.id}`}
                        className="truncate font-semibold text-white hover:underline"
                      >
                        {review.movie.title}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="mt-1">
                      <StarRating value={review.rating} readOnly />
                    </div>

                    {review.content && (
                      <p className="mt-2 text-sm text-gray-200">{review.content}</p>
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
