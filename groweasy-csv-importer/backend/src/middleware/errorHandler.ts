import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { CsvParseError } from "../services/csvParser";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Catches errors thrown/passed by any route and returns a JSON error response. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Request error:", err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large."
        : `Upload error: ${err.message}`;
    return res.status(400).json({ error: message });
  }

  if (err instanceof CsvParseError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Error && err.message === "Only .csv files are allowed.") {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error." });
}

/** Wraps an async route handler so thrown errors reach errorHandler(). */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
