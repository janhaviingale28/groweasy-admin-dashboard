export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | "lost";

export interface CrmRecord {
  name: string | null;
  email: string | null;
  mobile: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
}

export type RawCsvRow = Record<string, string>;

export interface UploadPreviewResponse {
  fileName: string;
  headers: string[];
  totalRows: number;
  previewRows: RawCsvRow[];
}

export interface ImportOutcome {
  row: RawCsvRow;
  record: CrmRecord | null;
  status: "imported" | "skipped" | "error";
  reason?: string;
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: number;
  records: CrmRecord[];
  outcomes: ImportOutcome[];
}

export interface ApiErrorResponse {
  error: string;
}

/** CRM field a CSV column can be mapped to during the AI mapping step. */
export type CrmField = keyof CrmRecord | "ignore";

export interface FieldMappingSuggestion {
  csvColumn: string;
  suggestedField: CrmField;
  confidence: number; // 0-1
  sampleValue: string;
}

/** A completed import, persisted to history. */
export interface ImportHistoryEntry {
  id: string;
  fileName: string;
  timestamp: string; // ISO
  totalRows: number;
  imported: number;
  skipped: number;
  errors: number;
  status: "completed" | "failed";
  mode: "ai" | "heuristic";
  records?: CrmRecord[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer";
  status: "active" | "invited" | "suspended";
  lastActive: string; // ISO
  avatarColor: string;
}
