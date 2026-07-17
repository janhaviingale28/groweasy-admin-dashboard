"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  History,
  BarChart3,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/import", label: "Import Wizard", icon: UploadCloud },
  { href: "/history", label: "Import History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                GrowEasy
              </p>
              <p className="text-xs leading-tight text-slate-400">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-700 dark:bg-slate-800 dark:text-brand-300">
            <p className="font-semibold">AI Mapping Engine</p>
            <p className="mt-1 text-brand-600/80 dark:text-brand-300/70">
              Falls back to a deterministic mapper automatically when no AI key is configured.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
