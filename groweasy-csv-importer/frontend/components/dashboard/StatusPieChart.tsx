"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  new: "#2f6fed",
  contacted: "#f59e0b",
  qualified: "#10b981",
  unqualified: "#94a3b8",
  converted: "#22c55e",
  lost: "#ef4444",
};

export default function StatusPieChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lead Status Breakdown</h3>
      <p className="mb-2 text-xs text-slate-400">{total} total leads across all imports</p>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Legend
            iconType="circle"
            formatter={(value) => <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
