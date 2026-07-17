"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AppUser } from "@/lib/types";
import { randomAvatarColor } from "@/lib/mock-users";

interface UserFormModalProps {
  onClose: () => void;
  onSave: (user: AppUser) => void;
  initial?: AppUser | null;
}

export default function UserFormModal({ onClose, onSave, initial }: UserFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<AppUser["role"]>(initial?.role ?? "Viewer");
  const [status, setStatus] = useState<AppUser["status"]>(initial?.status ?? "invited");

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    onSave({
      id: initial?.id ?? `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      status,
      lastActive: initial?.lastActive ?? new Date().toISOString(),
      avatarColor: initial?.avatarColor ?? randomAvatarColor(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {initial ? "Edit Team Member" : "Invite Team Member"}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="jane@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as AppUser["role"])} className="input">
                <option>Owner</option>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as AppUser["status"])} className="input">
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleSubmit} className="btn-primary">
            {initial ? "Save Changes" : "Send Invite"}
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
