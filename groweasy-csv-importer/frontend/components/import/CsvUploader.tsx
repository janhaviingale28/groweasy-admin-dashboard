"use client";

import { ChangeEvent, DragEvent, useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

interface CsvUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function CsvUploader({ onFileSelected, disabled }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndEmit = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please choose a .csv file.");
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndEmit(e.dataTransfer.files?.[0]);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndEmit(e.target.files?.[0]);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
            : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900",
          disabled ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-900/30">
          <UploadCloud size={26} />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Drag & drop your CSV file here
        </p>
        <p className="mt-1 text-xs text-slate-400">or</p>

        <label className="btn-primary mt-3 cursor-pointer">
          Browse Files
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
          />
        </label>

        <p className="mt-4 text-xs text-slate-400">
          Supports CSVs exported from Facebook, Google Ads, Excel, Shopify, or any CRM.
        </p>
      </div>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
