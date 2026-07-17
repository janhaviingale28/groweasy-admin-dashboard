"use client";

import { useState } from "react";
import CsvUploader from "@/components/import/CsvUploader";
import PreviewTable from "@/components/import/PreviewTable";
import FieldMappingStep from "@/components/import/FieldMappingStep";
import ImportResults from "@/components/import/ImportResults";
import { confirmImport, uploadCsvPreview, ApiRequestError } from "@/lib/api";
import { suggestFieldMappings } from "@/lib/field-mapping";
import { addImportHistoryEntry } from "@/lib/import-history";
import { CrmField, ImportSummary, UploadPreviewResponse, FieldMappingSuggestion } from "@/lib/types";
import { Check } from "lucide-react";

type Stage = "upload" | "mapping" | "preview" | "importing" | "results";

const STEPS: { key: Stage; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "AI Field Mapping" },
  { key: "preview", label: "Preview & Confirm" },
  { key: "results", label: "Results" },
];

export default function ImportWizardPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UploadPreviewResponse | null>(null);
  const [mappingSuggestions, setMappingSuggestions] = useState<FieldMappingSuggestion[]>([]);
  const [finalMapping, setFinalMapping] = useState<Record<string, CrmField> | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  async function handleFileSelected(file: File) {
    setError(null);
    setSelectedFile(file);
    setIsLoadingPreview(true);
    try {
      const result = await uploadCsvPreview(file);
      setPreview(result);
      setMappingSuggestions(suggestFieldMappings(result.headers, result.previewRows[0]));
      setStage("mapping");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to preview file.");
      setStage("upload");
    } finally {
      setIsLoadingPreview(false);
    }
  }

  function handleMappingConfirmed(mapping: Record<string, CrmField>) {
    setFinalMapping(mapping);
    setStage("preview");
  }

  async function handleConfirmImport() {
    if (!selectedFile) return;
    setError(null);
    setStage("importing");
    try {
      const result = await confirmImport(selectedFile);
      setSummary(result);
      addImportHistoryEntry({
        id: `${Date.now()}`,
        fileName: selectedFile.name,
        timestamp: new Date().toISOString(),
        totalRows: result.totalRows,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        status: "completed",
        mode: "heuristic",
      });
      setStage("results");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Import failed.");
      setStage("preview");
    }
  }

  function handleStartOver() {
    setStage("upload");
    setSelectedFile(null);
    setPreview(null);
    setMappingSuggestions([]);
    setFinalMapping(null);
    setSummary(null);
    setError(null);
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === stage || (stage === "importing" && s.key === "preview"));

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, idx) => {
          const active = idx === currentStepIndex;
          const done = idx < currentStepIndex;
          return (
            <li key={step.key} className="flex items-center gap-2">
              <span
                className={[
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                  active
                    ? "bg-brand-500 text-white"
                    : done
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800",
                ].join(" ")}
              >
                {done && <Check size={12} />}
                {idx + 1}. {step.label}
              </span>
              {idx < STEPS.length - 1 && <span className="h-px w-6 bg-slate-300 dark:bg-slate-700" />}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="card p-6">
        {stage === "upload" && <CsvUploader onFileSelected={handleFileSelected} disabled={isLoadingPreview} />}

        {isLoadingPreview && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Parsing your CSV…</p>}

        {stage === "mapping" && preview && (
          <FieldMappingStep
            suggestions={mappingSuggestions}
            onConfirm={handleMappingConfirmed}
            onBack={handleStartOver}
          />
        )}

        {stage === "preview" && preview && (
          <div className="space-y-6">
            <PreviewTable headers={preview.headers} rows={preview.previewRows} totalRows={preview.totalRows} />
            <div className="flex gap-3">
              <button onClick={handleConfirmImport} className="btn-primary">
                Confirm Import ({preview.totalRows} rows)
              </button>
              <button onClick={() => setStage("mapping")} className="btn-secondary">
                Back to Mapping
              </button>
              <button onClick={handleStartOver} className="btn-secondary">
                Choose a Different File
              </button>
            </div>
          </div>
        )}

        {stage === "importing" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Applying field mapping and importing rows into the CRM…
            </p>
          </div>
        )}

        {stage === "results" && summary && (
          <div className="space-y-6">
            <ImportResults summary={summary} />
            <button onClick={handleStartOver} className="btn-secondary">
              Import Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
