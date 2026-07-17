"use client";

import { AppUser } from "./types";

const STORAGE_KEY = "groweasy-users";

const AVATAR_COLORS = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-violet-500",
  "bg-cyan-500",
];

function seed(): AppUser[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    { id: "u1", name: "Aarav Shah", email: "aarav@groweasy.io", role: "Owner", status: "active", lastActive: new Date(now - 10 * 60000).toISOString(), avatarColor: AVATAR_COLORS[0] },
    { id: "u2", name: "Priya Nair", email: "priya@groweasy.io", role: "Admin", status: "active", lastActive: new Date(now - 2 * day).toISOString(), avatarColor: AVATAR_COLORS[1] },
    { id: "u3", name: "Rohan Mehta", email: "rohan@groweasy.io", role: "Editor", status: "active", lastActive: new Date(now - 1 * day).toISOString(), avatarColor: AVATAR_COLORS[2] },
    { id: "u4", name: "Sneha Kapoor", email: "sneha@groweasy.io", role: "Editor", status: "invited", lastActive: new Date(now - 5 * day).toISOString(), avatarColor: AVATAR_COLORS[3] },
    { id: "u5", name: "Vikram Rao", email: "vikram@groweasy.io", role: "Viewer", status: "suspended", lastActive: new Date(now - 20 * day).toISOString(), avatarColor: AVATAR_COLORS[4] },
    { id: "u6", name: "Ishita Verma", email: "ishita@groweasy.io", role: "Viewer", status: "active", lastActive: new Date(now - 3 * 60000).toISOString(), avatarColor: AVATAR_COLORS[5] },
  ];
}

export function getUsers(): AppUser[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as AppUser[];
  } catch {
    return seed();
  }
}

export function saveUsers(users: AppUser[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
