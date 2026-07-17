"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ImportHistoryEntry } from "@/lib/types";

export default function QualityLineChart({ history }: { history: ImportHistoryEntry[] }) {
  const data = [...history]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((h) => ({
      date: new Date(h.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      successRate: h.totalRows > 0 ? Math.round((h.imported / h.totalRows) * 100) : 0,
    }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Import Success Rate Trend</h3>
      <p className="mb-2 text-xs text-slate-400">% of rows successfully mapped per import</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: -20, right: 10, top: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-slate-100 dark:text-slate-800" stroke="currentColor" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Legend formatter={() => <span className="text-xs text-slate-500 dark:text-slate-400">Success rate</span>} />
          <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
