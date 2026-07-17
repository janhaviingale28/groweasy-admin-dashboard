import OpenAI from "openai";
import { config } from "../config";
import { ALLOWED_STATUSES, CrmRecord, LeadStatus, RawCsvRow } from "../types/crm";

const SYSTEM_PROMPT = `You are a CRM data extraction assistant.
You will be given an array of raw CSV rows (as JSON objects) exported from
places like Facebook Lead Ads, Google Ads, Excel, or other CRMs. The column
names are inconsistent and vary between sources.

For EACH row, extract a standardized CRM lead record with exactly these fields:
- name (string or null)
- email (string or null)
- mobile (string or null)
- company (string or null)
- source (string or null)
- status (must be exactly one of: ${ALLOWED_STATUSES.join(", ")})
- notes (string or null, any extra useful context)

Rules:
1. NEVER invent or hallucinate data that is not present in the row.
2. If a row has neither an email nor a mobile number, set "skip": true for
   that row instead of a record.
3. "status" must always be one of the allowed values. If unclear, default to "new".
4. Respond with ONLY a JSON array, one object per input row, in the same order.
   Each element must be shaped as:
   { "skip": false, "record": { ...CrmRecord fields... } }
   or
   { "skip": true, "reason": "short reason" }
No prose, no markdown fences — pure JSON array only.`;

interface AiRowResult {
  skip: boolean;
  reason?: string;
  record?: Partial<CrmRecord>;
}

let openaiClient: OpenAI | null = null;

function getOpenAiClient(): OpenAI {
  if (!openaiClient) {
    if (!config.ai.openaiApiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set but AI_PROVIDER=openai. Set it in .env."
      );
    }
    openaiClient = new OpenAI({ apiKey: config.ai.openaiApiKey });
  }
  return openaiClient;
}

/**
 * Maps a batch of raw CSV rows to standardized CRM records using the
 * configured AI provider. Falls back to a deterministic heuristic mapper
 * when AI_PROVIDER=none (or on AI failure after retries), so the app is
 * always testable end-to-end without external API keys.
 */
export async function mapBatchToCrm(
  rows: RawCsvRow[]
): Promise<AiRowResult[]> {
  if (config.ai.provider === "openai") {
    try {
      return await mapWithOpenAi(rows);
    } catch (err) {
      console.error(
        "AI mapping failed, falling back to heuristic mapper:",
        (err as Error).message
      );
      return rows.map(heuristicMapRow);
    }
  }

  return rows.map(heuristicMapRow);
}

async function mapWithOpenAi(rows: RawCsvRow[]): Promise<AiRowResult[]> {
  const client = getOpenAiClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.ai.maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: config.ai.openaiModel,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(rows) },
        ],
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error("Empty response from AI provider.");

      const parsed = extractJsonArray(raw);
      if (parsed.length !== rows.length) {
        throw new Error(
          `AI returned ${parsed.length} results for ${rows.length} input rows.`
        );
      }
      return parsed;
    } catch (err) {
      lastError = err as Error;
      console.warn(`AI batch attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("AI mapping failed for unknown reasons.");
}

/**
 * The model may wrap the array in an object (e.g. { "results": [...] })
 * despite instructions. This normalizes either shape into an array.
 */
function extractJsonArray(raw: string): AiRowResult[] {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.results)) return parsed.results;
  const firstArrayValue = Object.values(parsed).find((v) => Array.isArray(v));
  if (firstArrayValue) return firstArrayValue as AiRowResult[];
  throw new Error("Could not locate a JSON array in the AI response.");
}

/**
 * Deterministic, no-AI fallback: maps common header name variants to CRM
 * fields using fuzzy matching. Used when AI_PROVIDER=none, or as a safety
 * net if the AI call fails.
 */
function heuristicMapRow(row: RawCsvRow): AiRowResult {
  const get = (candidates: string[]): string | null => {
    const keys = Object.keys(row);
    for (const candidate of candidates) {
      const match = keys.find(
        (k) => normalizeHeader(k) === normalizeHeader(candidate)
      );
      if (match && row[match]?.trim()) return row[match].trim();
    }
    // fallback: partial match
    for (const candidate of candidates) {
      const match = keys.find((k) =>
        normalizeHeader(k).includes(normalizeHeader(candidate))
      );
      if (match && row[match]?.trim()) return row[match].trim();
    }
    return null;
  };

  const email = get(["email", "e-mail", "emailaddress", "email address"]);
  const mobile = get([
    "mobile",
    "phone",
    "phonenumber",
    "phone number",
    "contact number",
    "cell",
  ]);

  if (!email && !mobile) {
    return { skip: true, reason: "Missing both email and mobile number." };
  }

  const name = get(["name", "fullname", "full name", "lead name", "contact name"]);
  const company = get(["company", "company name", "organization", "business"]);
  const source = get(["source", "lead source", "campaign", "platform"]);
  const statusRaw = get(["status", "lead status", "stage"]);

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

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeStatus(raw: string | null): LeadStatus {
  if (!raw) return "new";
  const normalized = raw.toLowerCase().trim();
  const match = ALLOWED_STATUSES.find((s) => s === normalized);
  return match ?? "new";
}
