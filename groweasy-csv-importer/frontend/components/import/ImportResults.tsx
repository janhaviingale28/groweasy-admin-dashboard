import { ImportSummary, LeadStatus } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { FileWarning, PartyPopper } from "lucide-react";

interface ImportResultsProps {
  summary: ImportSummary;
}

const STATUS_COLORS: Record<LeadStatus, "brand" | "amber" | "green" | "slate" | "red"> = {
  new: "brand",
  contacted: "amber",
  qualified: "green",
  unqualified: "slate",
  converted: "green",
  lost: "red",
};

export default function ImportResults({ summary }: ImportResultsProps) {
  const skippedOutcomes = summary.outcomes.filter((o) => o.status !== "imported");

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
        <PartyPopper size={18} />
        Import complete — {summary.imported} of {summary.totalRows} rows were successfully mapped to CRM records.
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Rows" value={summary.totalRows} />
        <StatCard label="Imported" value={summary.imported} accent="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Skipped" value={summary.skipped} accent="text-amber-600 dark:text-amber-400" />
        <StatCard label="Errors" value={summary.errors} accent="text-red-600 dark:text-red-400" />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Imported CRM Records ({summary.records.length})
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Name", "Email", "Mobile", "Company", "Source", "Status"].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.records.slice(0, 50).map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="table-td whitespace-nowrap">{record.name || "—"}</td>
                  <td className="table-td whitespace-nowrap">{record.email || "—"}</td>
                  <td className="table-td whitespace-nowrap">{record.mobile || "—"}</td>
                  <td className="table-td whitespace-nowrap">{record.company || "—"}</td>
                  <td className="table-td whitespace-nowrap">{record.source || "—"}</td>
                  <td className="table-td whitespace-nowrap">
                    <Badge color={STATUS_COLORS[record.status]}>{record.status}</Badge>
                  </td>
                </tr>
              ))}
              {summary.records.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-td text-center text-slate-400">
                    No records were imported.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {summary.records.length > 50 && (
          <p className="mt-2 text-xs text-slate-400">Showing first 50 of {summary.records.length} imported records.</p>
        )}
      </div>

      {skippedOutcomes.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <FileWarning size={15} className="text-amber-500" />
            Skipped / Errored Rows ({skippedOutcomes.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="table-th">Row</th>
                  <th className="table-th">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {skippedOutcomes.slice(0, 20).map((outcome, idx) => (
                  <tr key={idx}>
                    <td className="table-td max-w-[380px] truncate text-slate-600 dark:text-slate-300">
                      {JSON.stringify(outcome.row)}
                    </td>
                    <td className="table-td text-slate-500">{outcome.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-semibold ${accent || "text-slate-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}
