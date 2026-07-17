import { parse } from "csv-parse/sync";
import { CsvPreview, RawCsvRow } from "../types/crm";

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

/**
 * Parses raw CSV file contents into headers + row objects.
 * Handles varying delimiters commas, tolerates BOM, and validates
 * that the file actually looks like a CSV before handing it off.
 */
export function parseCsv(fileBuffer: Buffer): CsvPreview {
  const content = stripBom(fileBuffer.toString("utf-8")).trim();

  if (!content) {
    throw new CsvParseError("The uploaded file is empty.");
  }

  let records: RawCsvRow[];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as RawCsvRow[];
  } catch (err) {
    throw new CsvParseError(
      `Could not parse file as CSV: ${(err as Error).message}`
    );
  }

  if (records.length === 0) {
    throw new CsvParseError("No data rows found in the CSV file.");
  }

  const headers = Object.keys(records[0]);

  return {
    headers,
    rows: records,
    totalRows: records.length,
  };
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Splits an array of rows into fixed-size batches for AI processing. */
export function batchRows<T>(rows: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }
  return batches;
}
