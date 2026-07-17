import dotenv from "dotenv";

dotenv.config();

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const config = {
  port: envInt("PORT", 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  ai: {
    provider: (process.env.AI_PROVIDER || "none") as "openai" | "none",
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
    batchSize: envInt("AI_BATCH_SIZE", 25),
    maxRetries: envInt("AI_MAX_RETRIES", 2),
  },

  upload: {
    maxFileSizeBytes: envInt("MAX_FILE_SIZE_MB", 10) * 1024 * 1024,
  },

  rateLimit: {
    windowMs: envInt("RATE_LIMIT_WINDOW_MS", 60_000),
    maxRequests: envInt("RATE_LIMIT_MAX_REQUESTS", 30),
  },
};
