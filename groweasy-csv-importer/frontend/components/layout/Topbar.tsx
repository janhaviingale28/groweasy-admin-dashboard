"use client";

import { useEffect, useState } from "react";
import { Menu, Sun, Moon, Bell, Search } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/import": "Import Wizard",
  "/history": "Import History",
  "/analytics": "Analytics",
  "/users": "User Management",
  "/settings": "Settings",
};

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  const title =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/import") ? "Import Wizard" : "GrowEasy");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
            <p className="hidden text-xs text-slate-400 sm:block">{now}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 md:flex dark:border-slate-800 dark:bg-slate-900">
            <Search size={15} />
            <span>Search…</span>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
            title="Toggle dark / light mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="relative rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
          </button>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
            AS
          </div>
        </div>
      </div>
    </header>
  );
}
