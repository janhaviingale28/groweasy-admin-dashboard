"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, UploadCloud, CheckCircle2, TrendingUp, ArrowRight, Wifi, WifiOff } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import ImportsTrendChart from "@/components/dashboard/ImportsTrendChart";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import RecentImportsTable from "@/components/dashboard/RecentImportsTable";
import { getImportHistory } from "@/lib/import-history";
import { getUsers } from "@/lib/mock-users";
import { ImportHistoryEntry } from "@/lib/types";
import { isBackendConnected } from "@/lib/api";

export default function DashboardPage() {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    setHistory(getImportHistory());
    setUserCount(getUsers().length);
    isBackendConnected().then(setBackendOnline);
  }, []);

  const totals = useMemo(() => {
    const totalRows = history.reduce((s, h) => s + h.totalRows, 0);
    const imported = history.reduce((s, h) => s + h.imported, 0);
    const skipped = history.reduce((s, h) => s + h.skipped, 0);
    const successRate = totalRows > 0 ? Math.round((imported / totalRows) * 100) : 0;
    return { totalRows, imported, skipped, successRate };
  }, [history]);

  const statusData = useMemo(() => {
    // Distribute imported leads across statuses proportionally for a realistic-looking chart
    const buckets: Record<string, number> = {
      new: 0.42,
      contacted: 0.22,
      qualified: 0.14,
      converted: 0.1,
      unqualified: 0.07,
      lost: 0.05,
    };
    return Object.entries(buckets).map(([name, ratio]) => ({
      name,
      value: Math.round(totals.imported * ratio),
    }));
  }, [totals.imported]);

  return (
    <div className="space-y-6">
      {backendOnline === false && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <WifiOff size={16} />
          Backend API not reachable — running on local, client-side CSV processing. Start the Express server for the full AI pipeline.
        </div>
      )}
      {backendOnline === true && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
          <Wifi size={16} />
          Connected to backend API — imports use the full AI mapping pipeline.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads Imported" value={totals.imported.toLocaleString()} icon={CheckCircle2} trend={{ value: "+12.4%", positive: true }} />
        <StatCard label="Import Success Rate" value={`${totals.successRate}%`} icon={TrendingUp} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" trend={{ value: "+3.1%", positive: true }} />
        <StatCard label="Total Imports Run" value={history.length.toString()} icon={UploadCloud} accent="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
        <StatCard label="Team Members" value={userCount.toString()} icon={Users} accent="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImportsTrendChart history={history} />
        </div>
        <StatusPieChart data={statusData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentImportsTable history={history} />
        </div>
        <div className="card flex flex-col justify-between p-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Start a new import</h3>
            <p className="mt-1 text-xs text-slate-400">
              Upload a CSV from any CRM, ad platform, or spreadsheet — AI will map the fields for you automatically.
            </p>
          </div>
          <Link href="/import" className="btn-primary mt-4">
            <UploadCloud size={16} />
            Launch Import Wizard
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
