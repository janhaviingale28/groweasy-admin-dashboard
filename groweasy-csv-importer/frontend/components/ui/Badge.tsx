interface BadgeProps {
  children: React.ReactNode;
  color?: "brand" | "green" | "amber" | "red" | "slate" | "violet";
}

const COLOR_MAP: Record<NonNullable<BadgeProps["color"]>, string> = {
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

export default function Badge({ children, color = "slate" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_MAP[color]}`}>
      {children}
    </span>
  );
}
