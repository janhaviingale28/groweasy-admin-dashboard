import { CrmField, FieldMappingSuggestion, RawCsvRow } from "./types";

const FIELD_CANDIDATES: Record<Exclude<CrmField, "ignore">, string[]> = {
  name: ["name", "fullname", "full name", "lead name", "contact name", "customer"],
  email: ["email", "e-mail", "emailaddress", "email address"],
  mobile: ["mobile", "phone", "phonenumber", "phone number", "contact number", "cell", "whatsapp"],
  company: ["company", "company name", "organization", "business", "org"],
  source: ["source", "lead source", "campaign", "platform", "channel"],
  status: ["status", "lead status", "stage", "pipeline"],
  notes: ["notes", "comment", "comments", "message", "remarks"],
};

function normalize(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Simulates "AI field mapping": scores each CSV column against known CRM
 * fields using fuzzy header matching, returning the best guess + a
 * confidence score so the user can review/correct it before import.
 */
export function suggestFieldMappings(
  headers: string[],
  sampleRow: RawCsvRow | undefined
): FieldMappingSuggestion[] {
  const used = new Set<Exclude<CrmField, "ignore">>();

  return headers.map((column) => {
    const normalizedColumn = normalize(column);
    let bestField: CrmField = "ignore";
    let bestScore = 0;

    (Object.keys(FIELD_CANDIDATES) as Array<Exclude<CrmField, "ignore">>).forEach((field) => {
      if (used.has(field)) return;
      const candidates = FIELD_CANDIDATES[field];
      candidates.forEach((candidate) => {
        const normalizedCandidate = normalize(candidate);
        let score = 0;
        if (normalizedColumn === normalizedCandidate) score = 0.98;
        else if (normalizedColumn.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedColumn))
          score = 0.8;
        else if (levenshteinRatio(normalizedColumn, normalizedCandidate) > 0.7)
          score = 0.6;

        if (score > bestScore) {
          bestScore = score;
          bestField = field;
        }
      });
    });

    if (bestField !== "ignore") used.add(bestField as Exclude<CrmField, "ignore">);

    return {
      csvColumn: column,
      suggestedField: bestScore > 0 ? bestField : "ignore",
      confidence: Math.round(bestScore * 100) / 100,
      sampleValue: sampleRow?.[column] ?? "",
    };
  });
}

function levenshteinRatio(a: string, b: string): number {
  if (!a.length || !b.length) return 0;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const distance = dp[a.length][b.length];
  return 1 - distance / Math.max(a.length, b.length);
}

export const CRM_FIELD_LABELS: Record<CrmField, string> = {
  name: "Name",
  email: "Email",
  mobile: "Mobile",
  company: "Company",
  source: "Source",
  status: "Status",
  notes: "Notes",
  ignore: "Ignore column",
};
