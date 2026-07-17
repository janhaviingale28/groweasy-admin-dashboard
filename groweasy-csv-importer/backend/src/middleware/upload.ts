import multer from "multer";
import { Request } from "express";
import { config } from "../config";
import { isCsvFile } from "../utils/validators";

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!isCsvFile(file.originalname, file.mimetype)) {
    cb(new Error("Only .csv files are allowed."));
    return;
  }
  cb(null, true);
}

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSizeBytes },
  fileFilter,
});
