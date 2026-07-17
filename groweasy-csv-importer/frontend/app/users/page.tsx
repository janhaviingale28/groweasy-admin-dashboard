"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react";
import { AppUser } from "@/lib/types";
import { getUsers, saveUsers } from "@/lib/mock-users";
import Badge from "@/components/ui/Badge";
import UserFormModal from "@/components/users/UserFormModal";

const STATUS_COLOR: Record<AppUser["status"], "green" | "amber" | "red"> = {
  active: "green",
  invited: "amber",
  suspended: "red",
};

const ROLE_COLOR: Record<AppUser["role"], "brand" | "violet" | "slate"> = {
  Owner: "brand",
  Admin: "violet",
  Editor: "slate",
  Viewer: "slate",
};

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
      ),
    [users, query]
  );

  function persist(next: AppUser[]) {
    setUsers(next);
    saveUsers(next);
  }

  function handleSave(user: AppUser) {
    const exists = users.some((u) => u.id === user.id);
    const next = exists ? users.map((u) => (u.id === user.id ? user : u)) : [user, ...users];
    persist(next);
    setModalOpen(false);
    setEditingUser(null);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this team member?")) return;
    persist(users.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-9"
          />
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="table-th">Member</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th">Last Active</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${user.avatarColor}`}>
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <Badge color={ROLE_COLOR[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="table-td">
                    <Badge color={STATUS_COLOR[user.status]}>{user.status}</Badge>
                  </td>
                  <td className="table-td text-slate-400">
                    {new Date(user.lastActive).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>
                  <td className="table-td">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-td py-10 text-center text-slate-400">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <UserFormModal
          initial={editingUser}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
