import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { config } from "./config";
import uploadRouter from "./routes/upload";
import importRouter from "./routes/import";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// --- Security middleware ---
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST"],
  })
);

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." },
});
app.use("/api", limiter);

app.use(express.json());

// --- Routes ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "groweasy-csv-importer-backend" });
});

app.use("/api/upload", uploadRouter);
app.use("/api/import", importRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// --- Error handler (must be last) ---
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GrowEasy CSV Importer backend listening on port ${config.port}`);
  console.log(`AI provider: ${config.ai.provider}`);
});
