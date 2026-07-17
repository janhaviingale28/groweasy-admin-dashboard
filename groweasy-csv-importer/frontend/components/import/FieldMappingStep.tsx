"use client";

import { useMemo, useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { CrmField, FieldMappingSuggestion } from "@/lib/types";
import { CRM_FIELD_LABELS } from "@/lib/field-mapping";

const ALL_FIELDS: CrmField[] = ["name", "email", "mobile", "company", "source", "status", "notes", "ignore"];

interface FieldMappingStepProps {
  suggestions: FieldMappingSuggestion[];
  onConfirm: (mapping: Record<string, CrmField>) => void;
  onBack: () => void;
}

export default function FieldMappingStep({ suggestions, onConfirm, onBack }: FieldMappingStepProps) {
  const [mapping, setMapping] = useState<Record<string, CrmField>>(() =>
    Object.fromEntries(suggestions.map((s) => [s.csvColumn, s.suggestedField]))
  );

  const mappedRequiredFields = useMemo(() => {
    const values = Object.values(mapping);
    return { hasEmail: values.includes("email"), hasMobile: values.includes("mobile") };
  }, [mapping]);

  const canProceed = mappedRequiredFields.hasEmail || mappedRequiredFields.hasMobile;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-900/10">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <div>
          <p className="text-sm font-medium text-brand-800 dark:text-brand-300">AI Field Mapping</p>
          <p className="mt-0.5 text-xs text-brand-700/80 dark:text-brand-300/70">
            We&apos;ve automatically matched your CSV columns to CRM fields based on header names and sample values.
            Review the suggestions below and adjust any that look wrong before importing.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="table-th">CSV Column</th>
              <th className="table-th">Sample Value</th>
              <th className="table-th">Maps To</th>
              <th className="table-th">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {suggestions.map((s) => (
              <tr key={s.csvColumn} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="table-td font-medium text-slate-700 dark:text-slate-200">{s.csvColumn}</td>
                <td className="table-td max-w-[200px] truncate text-slate-500" title={s.sampleValue}>
                  {s.sampleValue || <span className="text-slate-300 dark:text-slate-600">—</span>}
                </td>
                <td className="table-td">
                  <select
                    value={mapping[s.csvColumn]}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [s.csvColumn]: e.target.value as CrmField }))
                    }
                    className="input py-1.5 text-xs"
                  >
                    {ALL_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {CRM_FIELD_LABELS[field]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="table-td">
                  <ConfidenceBar value={s.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canProceed && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle size={16} />
          Map at least one column to Email or Mobile so rows can be matched to CRM contacts.
        </div>
      )}
      {canProceed && (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={14} /> Mapping looks good — ready to preview.
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => onConfirm(mapping)} disabled={!canProceed} className="btn-primary">
          Continue to Preview
        </button>
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400">{pct}%</span>
    </div>
  );
}
