"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const DATA = [
  { source: "Facebook Ads", leads: 412 },
  { source: "Google Ads", leads: 356 },
  { source: "Website Form", leads: 289 },
  { source: "Shopify", leads: 470 },
  { source: "Trade Show", leads: 60 },
  { source: "Webinar", leads: 175 },
  { source: "Referral", leads: 98 },
];

export default function SourceBarChart() {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Leads by Source</h3>
      <p className="mb-2 text-xs text-slate-400">Aggregated across all imports</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={DATA} margin={{ left: -20, right: 10, top: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-slate-100 dark:text-slate-800" stroke="currentColor" />
          <XAxis dataKey="source" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Bar dataKey="leads" fill="#2f6fed" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
