import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminPage() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    redirect(auth.status === 401 ? "/login" : "/");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Admin area</h1>
    </main>
  );
}
