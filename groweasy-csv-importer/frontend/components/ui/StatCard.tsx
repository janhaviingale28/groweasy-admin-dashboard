import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, accent }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${accent || "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {trend.positive ? (
            <ArrowUpRight size={14} className="text-emerald-500" />
          ) : (
            <ArrowDownRight size={14} className="text-red-500" />
          )}
          <span className={trend.positive ? "text-emerald-500" : "text-red-500"}>{trend.value}</span>
          <span className="text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
