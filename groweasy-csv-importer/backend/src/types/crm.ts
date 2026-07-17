/**
 * The allowed lead status values a CRM record can have.
 * The AI prompt is instructed to only ever pick from this list.
 */
export const ALLOWED_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
  "lost",
] as const;

export type LeadStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * A single standardized CRM lead record, produced after AI extraction.
 */
export interface CrmRecord {
  name: string | null;
  email: string | null;
  mobile: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
}

/** A raw row straight out of the uploaded CSV (arbitrary headers). */
export type RawCsvRow = Record<string, string>;

/** Result of parsing an uploaded CSV file. */
export interface CsvPreview {
  headers: string[];
  rows: RawCsvRow[];
  totalRows: number;
}

/** Outcome for a single row after the AI mapping stage. */
export interface ImportOutcome {
  row: RawCsvRow;
  record: CrmRecord | null;
  status: "imported" | "skipped" | "error";
  reason?: string;
}

/** Summary returned by POST /api/import */
export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: number;
  records: CrmRecord[];
  outcomes: ImportOutcome[];
}
