import { ALLOWED_STATUSES, CrmRecord } from "../types/crm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[\d+()\-.\s]{6,20}$/;

/**
 * A mapped record is valid if it has at least one contact method
 * (email or mobile, matching a plausible format) and a status from the
 * allowed enum. This is the last line of defense against a hallucinating
 * or malformed AI response.
 */
export function isValidRecord(record: CrmRecord): boolean {
  if (!record || typeof record !== "object") return false;

  const hasEmail = !!record.email && EMAIL_REGEX.test(record.email);
  const hasMobile = !!record.mobile && MOBILE_REGEX.test(record.mobile);

  if (!hasEmail && !hasMobile) return false;
  if (!ALLOWED_STATUSES.includes(record.status)) return false;

  return true;
}

export function isCsvFile(filename: string, mimetype: string): boolean {
  const extOk = filename.toLowerCase().endsWith(".csv");
  const mimeOk =
    mimetype === "text/csv" ||
    mimetype === "application/vnd.ms-excel" ||
    mimetype === "application/csv" ||
    mimetype === "text/plain" || // some browsers send this for .csv
    mimetype === "application/octet-stream";
  return extOk && mimeOk;
}
