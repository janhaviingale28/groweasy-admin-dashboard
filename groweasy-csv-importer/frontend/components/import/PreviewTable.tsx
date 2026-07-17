import { RawCsvRow } from "@/lib/types";

interface PreviewTableProps {
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}

export default function PreviewTable({ headers, rows, totalRows }: PreviewTableProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Preview ({rows.length} of {totalRows} rows shown)
        </h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {headers.map((header) => (
                <th key={header} className="table-th whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {headers.map((header) => (
                  <td
                    key={header}
                    className="table-td max-w-[220px] truncate whitespace-nowrap"
                    title={row[header]}
                  >
                    {row[header] || <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
