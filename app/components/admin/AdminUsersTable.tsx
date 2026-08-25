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

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="text-gray-200">
                  <td className="px-4 py-2">{user.name ?? "Unnamed"}</td>
                  <td className="px-4 py-2 text-gray-400">{user.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        user.role === "ADMIN"
                          ? "rounded-full bg-blue-600/20 px-2 py-0.5 text-xs font-semibold text-blue-400"
                          : "rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-300"
                      }
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(user)}
                      disabled={isSelf || pendingId === user.id}
                      title={isSelf ? "You cannot change your own role" : undefined}
                      className="rounded-lg border border-gray-700 px-3 py-1 text-xs font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
