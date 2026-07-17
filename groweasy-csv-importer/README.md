# GrowEasy Admin Dashboard

A full admin dashboard built around the original AI-powered CSV importer.
Intelligently imports CRM lead data from CSV files with varying formats
(Facebook Ads exports, Google Ads exports, Excel sheets, other CRMs, etc.)
using AI to map columns instead of fixed/hardcoded column mapping — now
wrapped in a production-style SaaS dashboard.

**Import workflow:** Upload CSV → AI Field Mapping (review/edit suggested
column → CRM field mapping) → Preview → Confirm Import → Backend Parses →
Batch Records → AI Extraction → Standardized CRM JSON → Results.

## What's new in the dashboard

- 📊 **Dashboard** — live stat cards, leads-imported trend chart, lead status
  breakdown, recent imports table
- 👥 **User Management** — searchable team table with invite/edit/delete
  (role + status management)
- 📂 **CSV Import Wizard** — multi-step flow: Upload → AI Field Mapping →
  Preview → Import → Results
- 🤖 **AI Field Mapping** — per-column suggested CRM field with a confidence
  score, fully editable before import
- 📜 **Import History** — persisted log of every import, searchable, exportable to CSV
- 📈 **Analytics & Charts** — leads by source, success-rate trend, status
  breakdown (Recharts)
- ⚙️ **Settings** — theme, backend API URL, notification preferences, API key info
- 🌙 **Dark / Light Mode** — toggle in the top bar, persisted, respects OS preference on first load
- 📱 **Fully responsive** — collapsible sidebar drawer on mobile, adaptive grids everywhere

The frontend works standalone: if the Express backend isn't running, it
automatically falls back to a client-side CSV parser + heuristic mapper, so
the whole dashboard (including real imports) is usable the moment you run
`npm run dev` — no backend required to try it out. Point
`NEXT_PUBLIC_API_URL` at the Express backend to use the full AI mapping
pipeline (OpenAI, with the same heuristic fallback server-side).

## Tech Stack

| Layer     | Technology                              |
|-----------|------------------------------------------|
| Frontend  | Next.js 15, TypeScript, Tailwind CSS     |
| Backend   | Node.js, Express, TypeScript             |
| AI        | OpenAI (pluggable; heuristic fallback included) |
| Deployment| Vercel (frontend) + Render (backend)     |

## Project Structure

```
groweasy-csv-importer/
├── backend/            # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts           # App entrypoint, security middleware
│   │   ├── config.ts          # Env-based config
│   │   ├── routes/
│   │   │   ├── upload.ts      # POST /api/upload  -> preview
│   │   │   └── import.ts      # POST /api/import   -> AI extraction + summary
│   │   ├── services/
│   │   │   ├── csvParser.ts   # CSV parsing + batching
│   │   │   ├── aiMapper.ts    # AI field mapping (OpenAI or heuristic fallback)
│   │   │   └── batchProcessor.ts
│   │   ├── middleware/
│   │   │   ├── upload.ts      # multer config + file validation
│   │   │   └── errorHandler.ts
│   │   ├── utils/validators.ts
│   │   └── types/crm.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/           # Next.js app
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            # Upload -> Preview -> Import -> Results
    │   └── globals.css
    ├── components/
    │   ├── CsvUploader.tsx     # Drag & drop + browse
    │   ├── PreviewTable.tsx
    │   └── ImportResults.tsx
    ├── lib/
    │   ├── api.ts              # Fetch client for the backend
    │   └── types.ts
    ├── package.json
    ├── tailwind.config.js
    └── .env.local.example
```

## 1. Run the Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:4000`. By default `AI_PROVIDER=none` in
`.env`, which uses a built-in heuristic column mapper (fuzzy header
matching for name/email/mobile/company/source/status) — so you can test
the entire app with **no OpenAI API key**. To use real AI extraction, set:

```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

### API Endpoints

| Method | Endpoint      | Description                                              |
|--------|---------------|-----------------------------------------------------------|
| POST   | /api/upload   | Accepts a CSV (`file` field), returns headers + preview rows |
| POST   | /api/import   | Accepts the same CSV, runs full AI batch extraction, returns `{ totalRows, imported, skipped, errors, records, outcomes }` |
| GET    | /health       | Health check                                              |

## 2. Run the Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. Drag & drop (or browse for) a CSV file —
you'll see a preview, then can confirm the import to see AI-mapped CRM
records plus a summary of imported/skipped/error counts.

## 3. Try It With a Sample CSV

Create a file like this (headers deliberately messy, to prove the AI/
heuristic mapper handles varying formats):

```csv
Full Name,Email Address,Phone Number,Company,Lead Source,Stage
John Doe,john@example.com,555-123-4567,Acme Inc,Facebook Ads,new
Jane Smith,,555-987-6543,Widgets Co,Google Ads,contacted
No Contact Person,,,Unknown Co,Excel Import,new
```

The third row has neither email nor phone and will be correctly **skipped**
per the AI prompt rule: "skip records without email/mobile."

## 4. AI Prompt Design

The system prompt (`backend/src/services/aiMapper.ts`) instructs the model to:
- Extract exactly: name, email, mobile, company, source, status, notes
- **Never invent data** not present in the row
- Skip rows missing both email and mobile
- Only use the allowed status values (`new`, `contacted`, `qualified`,
  `unqualified`, `converted`, `lost`)
- Return pure JSON, no prose/markdown

A validation layer (`utils/validators.ts`) double-checks every AI-returned
record afterward (valid email/phone format + allowed status) as a safety
net against hallucinated or malformed output.

## 5. Error Handling & Performance

- Backend: centralized Express error handler, file-type/size validation,
  AI call retries with fallback to the heuristic mapper on failure.
- Rows are processed in configurable batches (`AI_BATCH_SIZE`, default 25)
  to keep AI requests small and retryable per-batch.

## 6. Security

- `helmet` for HTTP security headers
- `cors` restricted to the configured frontend origin
- `express-rate-limit` on all `/api` routes
- File type + size validation on upload (`.csv` only, size-capped)
- Secrets loaded from `.env` (never committed — see `.gitignore`)

## 7. Deployment

- **Frontend** → Vercel: set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend** → Render (or similar Node host): set the `.env` variables in
  your host's dashboard, including `FRONTEND_URL` for CORS.

## 8. Future Improvements (from the original roadmap)

- Redis-backed job queues for very large files
- OCR support for scanned/image-based lead sheets
- User authentication + import history
- Native Excel (.xlsx) upload support
