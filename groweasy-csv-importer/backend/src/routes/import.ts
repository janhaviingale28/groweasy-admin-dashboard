import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { parseCsv } from "../services/csvParser";
import { processImport } from "../services/batchProcessor";

const router = Router();

/**
 * POST /api/import
 * Accepts the same CSV file the user confirmed on the preview screen,
 * re-parses it, runs every row through the AI mapping/batch pipeline,
 * and returns the full import summary (imported, skipped, error counts
 * plus the standardized CRM records).
 *
 * The API is stateless by design (no server-side upload cache) so the
 * client simply re-submits the file it already has once the user confirms.
 */
router.post(
  "/",
  csvUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded. Send it under field name 'file'.");
    }

    const parsed = parseCsv(req.file.buffer);
    const summary = await processImport(parsed.rows);

    res.json(summary);
  })
);

export default router;
