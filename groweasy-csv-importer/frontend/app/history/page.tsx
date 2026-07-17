"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Trash2, Search, Download } from "lucide-react";
import { ImportHistoryEntry } from "@/lib/types";
import { clearImportHistory, getImportHistory } from "@/lib/import-history";
import Badge from "@/components/ui/Badge";

export default function ImportHistoryPage() {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setHistory(getImportHistory());
  }, []);

  const filtered = useMemo(
    () => history.filter((h) => h.fileName.toLowerCase().includes(query.toLowerCase())),
    [history, query]
  );

  function handleClear() {
    if (!window.confirm("Clear all import history? This cannot be undone.")) return;
    clearImportHistory();
    setHistory([]);
  }

  function handleExport() {
    const csv = [
      ["File Name", "Date", "Total Rows", "Imported", "Skipped", "Errors", "Mode"].join(","),
      ...filtered.map((h) =>
        [h.fileName, new Date(h.timestamp).toISOString(), h.totalRows, h.imported, h.skipped, h.errors, h.mode].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handleClear} className="btn-secondary text-red-600 dark:text-red-400">
            <Trash2 size={15} /> Clear History
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="table-th">File</th>
                <th className="table-th">Date</th>
                <th className="table-th">Total Rows</th>
                <th className="table-th">Imported</th>
                <th className="table-th">Skipped</th>
                <th className="table-th">Errors</th>
                <th className="table-th">Mode</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-td">
                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                      <FileText size={14} className="text-slate-400" />
                      {entry.fileName}
                    </div>
                  </td>
                  <td className="table-td text-slate-500">
                    {new Date(entry.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="table-td">{entry.totalRows}</td>
                  <td className="table-td text-emerald-600 dark:text-emerald-400">{entry.imported}</td>
                  <td className="table-td text-amber-600 dark:text-amber-400">{entry.skipped}</td>
                  <td className="table-td text-red-600 dark:text-red-400">{entry.errors}</td>
                  <td className="table-td">
                    <Badge color={entry.mode === "ai" ? "brand" : "slate"}>{entry.mode === "ai" ? "AI" : "Heuristic"}</Badge>
                  </td>
                  <td className="table-td">
                    <Badge color={entry.status === "completed" ? "green" : "red"}>{entry.status}</Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-td py-10 text-center text-slate-400">
                    No import history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
