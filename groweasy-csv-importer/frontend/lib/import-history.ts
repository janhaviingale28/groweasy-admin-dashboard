"use client";

import { ImportHistoryEntry } from "./types";

const STORAGE_KEY = "groweasy-import-history";

export function getImportHistory(): ImportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedHistory();
    const parsed = JSON.parse(raw) as ImportHistoryEntry[];
    return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}

export function addImportHistoryEntry(entry: ImportHistoryEntry): void {
  if (typeof window === "undefined") return;
  const current = getImportHistory();
  const updated = [entry, ...current].slice(0, 200);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearImportHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Seeds a bit of realistic-looking history on first load so the dashboard/analytics aren't empty. */
function seedHistory(): ImportHistoryEntry[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const seed: ImportHistoryEntry[] = [
    {
      id: "seed-1",
      fileName: "facebook_leads_july.csv",
      timestamp: new Date(now - 1 * day).toISOString(),
      totalRows: 248,
      imported: 231,
      skipped: 15,
      errors: 2,
      status: "completed",
      mode: "heuristic",
    },
    {
      id: "seed-2",
      fileName: "google_ads_export.csv",
      timestamp: new Date(now - 3 * day).toISOString(),
      totalRows: 132,
      imported: 128,
      skipped: 4,
      errors: 0,
      status: "completed",
      mode: "ai",
    },
    {
      id: "seed-3",
      fileName: "shopify_customers.csv",
      timestamp: new Date(now - 6 * day).toISOString(),
      totalRows: 512,
      imported: 470,
      skipped: 38,
      errors: 4,
      status: "completed",
      mode: "ai",
    },
    {
      id: "seed-4",
      fileName: "trade_show_contacts.csv",
      timestamp: new Date(now - 9 * day).toISOString(),
      totalRows: 64,
      imported: 60,
      skipped: 4,
      errors: 0,
      status: "completed",
      mode: "heuristic",
    },
    {
      id: "seed-5",
      fileName: "webinar_signups.csv",
      timestamp: new Date(now - 13 * day).toISOString(),
      totalRows: 189,
      imported: 175,
      skipped: 12,
      errors: 2,
      status: "completed",
      mode: "ai",
    },
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}
