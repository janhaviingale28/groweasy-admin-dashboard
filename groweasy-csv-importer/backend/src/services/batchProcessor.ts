import { config } from "../config";
import { CrmRecord, ImportOutcome, ImportSummary, RawCsvRow } from "../types/crm";
import { batchRows } from "./csvParser";
import { mapBatchToCrm } from "./aiMapper";
import { isValidRecord } from "../utils/validators";

/**
 * Processes all CSV rows through the AI mapper in batches, validates the
 * resulting records, and produces a full import summary.
 */
export async function processImport(rows: RawCsvRow[]): Promise<ImportSummary> {
  const batches = batchRows(rows, config.ai.batchSize);
  const outcomes: ImportOutcome[] = [];

  for (const batch of batches) {
    const results = await mapBatchToCrm(batch);

    results.forEach((result, idx) => {
      const row = batch[idx];

      if (result.skip || !result.record) {
        outcomes.push({
          row,
          record: null,
          status: "skipped",
          reason: result.reason || "Row skipped by AI mapper.",
        });
        return;
      }

      const candidate = result.record as CrmRecord;
      if (!isValidRecord(candidate)) {
        outcomes.push({
          row,
          record: null,
          status: "error",
          reason: "AI-mapped record failed validation.",
        });
        return;
      }

      outcomes.push({ row, record: candidate, status: "imported" });
    });
  }

  const imported = outcomes.filter((o) => o.status === "imported");
  const skipped = outcomes.filter((o) => o.status === "skipped");
  const errors = outcomes.filter((o) => o.status === "error");

  return {
    totalRows: rows.length,
    imported: imported.length,
    skipped: skipped.length,
    errors: errors.length,
    records: imported.map((o) => o.record as CrmRecord),
    outcomes,
  };
}
