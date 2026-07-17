import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { parseCsv } from "../services/csvParser";

const router = Router();

const PREVIEW_ROW_LIMIT = 20;

/**
 * POST /api/upload
 * Accepts a multipart/form-data upload with field name "file".
 * Parses the CSV and returns a preview (headers + first N rows) without
 * performing any AI extraction yet, so the user can confirm before import.
 */
router.post(
  "/",
  csvUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded. Send it under field name 'file'.");
    }

    const parsed = parseCsv(req.file.buffer);

    res.json({
      fileName: req.file.originalname,
      headers: parsed.headers,
      totalRows: parsed.totalRows,
      previewRows: parsed.rows.slice(0, PREVIEW_ROW_LIMIT),
    });
  })
);

export default router;
