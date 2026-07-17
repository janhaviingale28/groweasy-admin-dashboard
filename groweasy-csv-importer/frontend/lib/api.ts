import { ApiErrorResponse, ImportSummary, UploadPreviewResponse } from "./types";
import { buildPreviewClient, runImportClient } from "./csv-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const BACKEND_TIMEOUT_MS = 2500;

export class ApiRequestError extends Error {}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorResponse;
      if (body.error) message = body.error;
    } catch {
      // response wasn't JSON; keep the default message
    }
    throw new ApiRequestError(message);
  }
  return res.json() as Promise<T>;
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

/**
 * Uploads a CSV file and returns a preview (headers + first rows).
 * Tries the Express backend first; if it's unreachable (e.g. running the
 * frontend standalone), falls back to fully client-side parsing so the
 * dashboard is always usable out of the box.
 */
export async function uploadCsvPreview(file: File): Promise<UploadPreviewResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { signal, cancel } = withTimeout(BACKEND_TIMEOUT_MS);
    const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: formData, signal });
    cancel();
    return await handleResponse<UploadPreviewResponse>(res);
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    const text = await file.text();
    return buildPreviewClient(file.name, text);
  }
}

/** Confirms the import: re-submits the CSV for full AI extraction (with client-side fallback). */
export async function confirmImport(file: File): Promise<ImportSummary> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { signal, cancel } = withTimeout(BACKEND_TIMEOUT_MS);
    const res = await fetch(`${API_URL}/api/import`, { method: "POST", body: formData, signal });
    cancel();
    return await handleResponse<ImportSummary>(res);
  } catch (err) {
    if (err instanceof ApiRequestError) throw err;
    const text = await file.text();
    return runImportClient(text);
  }
}

/** True if the Express backend responded to a lightweight health check. */
export async function isBackendConnected(): Promise<boolean> {
  try {
    const { signal, cancel } = withTimeout(1500);
    const res = await fetch(`${API_URL}/health`, { signal }).catch(() => fetch(`${API_URL}/`, { signal }));
    cancel();
    return res.ok;
  } catch {
    return false;
  }
}
