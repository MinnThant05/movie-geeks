"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/app/generated/prisma/enums";

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
}

interface AdminUsersTableProps {
  users: AdminUserRow[];
  currentUserId: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminUsersTable({ users: initialUsers, currentUserId }: AdminUsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggleRole(user: AdminUserRow) {
    const nextRole: Role = user.role === "ADMIN" ? "USER" : "ADMIN";
    setPendingId(user.id);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, role: nextRole }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setPendingId(null);
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
      );
      setPendingId(null);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPendingId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-raised text-cream-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isPromoteAction = user.role !== "ADMIN";
              const actionToneClasses = isSelf
                ? "border-border-subtle text-cream-dim"
                : isPromoteAction
                  ? "border-accent-teal/50 text-accent-teal hover:border-accent-teal hover:bg-accent-teal/10"
                  : "border-red-800 text-red-400 hover:border-red-600 hover:text-red-300";
              return (
                <tr key={user.id} className="text-cream-muted">
                  <td className="px-4 py-2 font-medium text-cream">{user.name ?? "Unnamed"}</td>
                  <td className="px-4 py-2 text-cream-dim">{user.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        user.role === "ADMIN"
                          ? "rounded-pill bg-accent-teal/15 px-2 py-0.5 text-xs font-semibold text-accent-teal"
                          : "rounded-pill border border-border-subtle bg-surface-raised px-2 py-0.5 text-xs font-semibold text-cream-muted"
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-cream-dim">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(user)}
                      disabled={isSelf || pendingId === user.id}
                      title={isSelf ? "You cannot change your own role" : undefined}
                      className={`rounded-pill border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${actionToneClasses}`}
                    >
                      {pendingId === user.id
                        ? "Saving..."
                        : user.role === "ADMIN"
                          ? "Demote to USER"
                          : "Promote to ADMIN"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
