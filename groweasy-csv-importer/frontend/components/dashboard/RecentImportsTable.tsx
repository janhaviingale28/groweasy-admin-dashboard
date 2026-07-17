import Link from "next/link";
import { ImportHistoryEntry } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { FileText } from "lucide-react";

export default function RecentImportsTable({ history }: { history: ImportHistoryEntry[] }) {
  const recent = history.slice(0, 5);

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Imports</h3>
        <Link href="/history" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="table-th">File</th>
              <th className="table-th">Rows</th>
              <th className="table-th">Imported</th>
              <th className="table-th">Mode</th>
              <th className="table-th">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="table-td">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <FileText size={14} className="text-slate-400" />
                    {entry.fileName}
                  </div>
                </td>
                <td className="table-td">{entry.totalRows}</td>
                <td className="table-td text-emerald-600 dark:text-emerald-400">{entry.imported}</td>
                <td className="table-td">
                  <Badge color={entry.mode === "ai" ? "brand" : "slate"}>{entry.mode === "ai" ? "AI" : "Heuristic"}</Badge>
                </td>
                <td className="table-td text-slate-400">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="table-td text-center text-slate-400">
                  No imports yet — run your first import to see it here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
