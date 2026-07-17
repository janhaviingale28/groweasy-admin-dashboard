import { CrmRecord, ImportOutcome, ImportSummary, LeadStatus, RawCsvRow, UploadPreviewResponse } from "./types";

const ALLOWED_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
  "lost",
];

/** Minimal CSV parser (handles quoted fields, commas, CRLF) for client-side fallback. */
export function parseCsvClient(text: string): { headers: string[]; rows: RawCsvRow[] } {
  const cleaned = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) throw new Error("The uploaded file is empty.");

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1).map((r) => {
    const obj: RawCsvRow = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });

  if (dataRows.length === 0) throw new Error("No data rows found in the CSV file.");

  return { headers, rows: dataRows };
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeStatus(raw: string | null): LeadStatus {
  if (!raw) return "new";
  const normalized = raw.toLowerCase().trim();
  return (ALLOWED_STATUSES.find((s) => s === normalized) as LeadStatus) ?? "new";
}

function get(row: RawCsvRow, candidates: string[]): string | null {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((k) => normalizeHeader(k) === normalizeHeader(candidate));
    if (match && row[match]?.trim()) return row[match].trim();
  }
  for (const candidate of candidates) {
    const match = keys.find((k) => normalizeHeader(k).includes(normalizeHeader(candidate)));
    if (match && row[match]?.trim()) return row[match].trim();
  }
  return null;
}

/** Deterministic heuristic mapper mirroring the backend's fallback logic — runs fully client-side. */
export function heuristicMapRow(row: RawCsvRow): { skip: boolean; reason?: string; record?: CrmRecord } {
  const email = get(row, ["email", "e-mail", "emailaddress", "email address"]);
  const mobile = get(row, ["mobile", "phone", "phonenumber", "phone number", "contact number", "cell"]);

  if (!email && !mobile) {
    return { skip: true, reason: "Missing both email and mobile number." };
  }

  const name = get(row, ["name", "fullname", "full name", "lead name", "contact name"]);
  const company = get(row, ["company", "company name", "organization", "business"]);
  const source = get(row, ["source", "lead source", "campaign", "platform"]);
  const statusRaw = get(row, ["status", "lead status", "stage"]);

  const record: CrmRecord = {
    name,
    email,
    mobile,
    company,
    source,
    status: normalizeStatus(statusRaw),
    notes: null,
  };

  return { skip: false, record };
}

export function buildPreviewClient(fileName: string, text: string): UploadPreviewResponse {
  const { headers, rows } = parseCsvClient(text);
  return {
    fileName,
    headers,
    totalRows: rows.length,
    previewRows: rows.slice(0, 10),
  };
}

export function runImportClient(text: string): ImportSummary {
  const { rows } = parseCsvClient(text);
  const outcomes: ImportOutcome[] = rows.map((row) => {
    const result = heuristicMapRow(row);
    if (result.skip || !result.record) {
      return { row, record: null, status: "skipped", reason: result.reason };
    }
    return { row, record: result.record, status: "imported" };
  });

  const records = outcomes.filter((o) => o.status === "imported").map((o) => o.record as CrmRecord);

  return {
    totalRows: rows.length,
    imported: records.length,
    skipped: outcomes.filter((o) => o.status === "skipped").length,
    errors: 0,
    records,
    outcomes,
  };
}
