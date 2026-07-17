"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ImportHistoryEntry } from "@/lib/types";

export default function ImportsTrendChart({ history }: { history: ImportHistoryEntry[] }) {
  const data = [...history]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((h) => ({
      date: new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      imported: h.imported,
      skipped: h.skipped,
    }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Leads Imported Over Time</h3>
          <p className="text-xs text-slate-400">Successful vs skipped rows per import</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 5 }}>
          <defs>
            <linearGradient id="importedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2f6fed" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2f6fed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="skippedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="imported" stroke="#2f6fed" fill="url(#importedGrad)" strokeWidth={2} name="Imported" />
          <Area type="monotone" dataKey="skipped" stroke="#f59e0b" fill="url(#skippedGrad)" strokeWidth={2} name="Skipped" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
