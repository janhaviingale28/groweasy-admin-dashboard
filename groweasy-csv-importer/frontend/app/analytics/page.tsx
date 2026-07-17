"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, Clock, Percent } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import SourceBarChart from "@/components/analytics/SourceBarChart";
import QualityLineChart from "@/components/analytics/QualityLineChart";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import { getImportHistory } from "@/lib/import-history";
import { ImportHistoryEntry } from "@/lib/types";

export default function AnalyticsPage() {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getImportHistory());
  }, []);

  const stats = useMemo(() => {
    const totalImported = history.reduce((s, h) => s + h.imported, 0);
    const totalRows = history.reduce((s, h) => s + h.totalRows, 0);
    const avgRate = totalRows > 0 ? Math.round((totalImported / totalRows) * 100) : 0;
    const avgRowsPerImport = history.length > 0 ? Math.round(totalRows / history.length) : 0;
    return { totalImported, avgRate, avgRowsPerImport, imports: history.length };
  }, [history]);

  const statusData = useMemo(() => {
    const buckets: Record<string, number> = {
      new: 0.42,
      contacted: 0.22,
      qualified: 0.14,
      converted: 0.1,
      unqualified: 0.07,
      lost: 0.05,
    };
    return Object.entries(buckets).map(([name, ratio]) => ({ name, value: Math.round(stats.totalImported * ratio) }));
  }, [stats.totalImported]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads Processed" value={stats.totalImported.toLocaleString()} icon={Users} />
        <StatCard label="Avg. Success Rate" value={`${stats.avgRate}%`} icon={Percent} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard label="Avg. Rows / Import" value={stats.avgRowsPerImport.toString()} icon={TrendingUp} accent="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
        <StatCard label="Imports This Month" value={stats.imports.toString()} icon={Clock} accent="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SourceBarChart />
        <StatusPieChart data={statusData} />
      </div>

      <QualityLineChart history={history} />
    </div>
  );
}
