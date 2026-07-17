"use client";

import { useState } from "react";
import { Sun, Moon, Monitor, Bot, Bell, KeyRound } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [importAlerts, setImportAlerts] = useState(true);
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

  return (
    <div className="max-w-3xl space-y-6">
      <section className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <p className="mt-0.5 text-xs text-slate-400">Choose how GrowEasy looks on this device.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ThemeOption label="Light" icon={Sun} active={theme === "light"} onClick={() => setTheme("light")} />
          <ThemeOption label="Dark" icon={Moon} active={theme === "dark"} onClick={() => setTheme("dark")} />
          <ThemeOption
            label="System"
            icon={Monitor}
            active={false}
            onClick={() => {
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              setTheme(prefersDark ? "dark" : "light");
            }}
          />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">AI Mapping Engine</h2>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          Configure the backend API used for CSV preview and import. When unreachable, the app automatically falls
          back to a client-side heuristic mapper so imports keep working.
        </p>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Backend API URL</label>
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="input" />
          <p className="mt-1.5 text-xs text-slate-400">
            Set <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">NEXT_PUBLIC_API_URL</code> in
            <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">.env.local</code> to point this at your
            deployed backend.
          </p>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h2>
        </div>
        <div className="mt-4 space-y-3">
          <ToggleRow
            label="Email me a summary after each import"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <ToggleRow
            label="Alert me when an import has a high error rate"
            checked={importAlerts}
            onChange={setImportAlerts}
          />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">API Keys</h2>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          The OpenAI key used for AI field extraction lives server-side in the backend&apos;s <code>.env</code> file
          (<code>OPENAI_API_KEY</code>) and is never exposed to the browser.
        </p>
      </section>
    </div>
  );
}

function ThemeOption({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Sun;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
      ].join(" ")}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
