# DC Joinery - Next.js Website

Production website for DC Joinery (UK), including:

- Kitchen Fitting
- Kitchen Supply & Installation
- Kitchen Renovations
- Fitted Bedrooms
- Bespoke Joinery

The project now includes a premium **AI Kitchen Designer** flow.

## Local Development

Run:

```bash
npm run dev
```

Production checks:

```bash
npm run lint
npm run build
```

## AI Kitchen Designer

### User flow

1. Customer uploads kitchen photo
2. Customer picks style, colors, and budget
3. AI analyzes image
4. AI generates redesigned kitchen visual
5. AI creates professional description + indicative cost
6. PDF report is generated
7. Customer submits enquiry
8. Admin receives full report by email

### New routes

- `GET /ai-kitchen-designer` - customer wizard
- `POST /api/ai-designer/jobs` - create job + upload photo
- `POST /api/ai-designer/jobs/:jobId/generate` - run AI pipeline
- `GET /api/ai-designer/jobs/:jobId` - fetch job status/result
- `POST /api/ai-designer/jobs/:jobId/lead` - submit lead + trigger admin report
- `GET /api/admin/ai-kitchen-designer/reports` - admin feed (requires `x-admin-token`)
- `GET /admin/ai-leads?token=...` - lightweight admin view

### Required environment variables

```bash
# Supabase (DB + Storage)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AI providers
OPENAI_API_KEY=
REPLICATE_API_TOKEN=
REPLICATE_MODEL_VERSION=

# PDF generation
PDFSHIFT_API_KEY=

# Emailing reports
RESEND_API_KEY=
AI_DESIGNER_ADMIN_EMAIL=info@dcjoinery.uk

# Admin endpoint protection
AI_DESIGNER_ADMIN_TOKEN=

# Optional, for server-side admin page fetch
NEXT_PUBLIC_SITE_URL=https://www.dcjoineryni.uk
```

### Database setup

Run the SQL in:

`db/ai_designer_schema.sql`

on your Supabase/Postgres project.

### Storage setup

Create a **public** Supabase storage bucket called:

`ai-designer`

It stores:
- customer input images
- generated PDFs

### Generation processing

- Generation is started asynchronously from `/api/ai-designer/jobs/:jobId/generate`
- Frontend polls `/api/ai-designer/jobs/:jobId` until status is `report_ready` or `failed`

## Security Notes

- Security headers configured in `next.config.ts`
- Form honeypot anti-spam in lead/contact flows
- In-memory rate limiting on AI endpoints (create/generate/lead/admin reports)
- Strict server-side validation for file type, file count, and size
- Secrets read only from server environment variables

## Project Cost Tracker (Excel)

- Workbook path: `ops/costs/dcjoineryni-cost-tracker.xlsx`
- Audit snapshot path: `ops/costs/provider-audit.json`
- Includes:
  - full cost ledger (domains, email, hosting, AI/API, tools)
  - automatic monthly rollups
  - dashboard with category split and monthly trend charts
  - verification columns (`VerificationStatus`, `Evidence`) so no assumed values are hidden

Commands:

```bash
# one-time dependency
pip3 install openpyxl

# pull provider audit snapshot (real API checks, no guessed prices)
# default window = last 28 days
python3 scripts/cost_tracker.py audit --vercel-token <YOUR_VERCEL_TOKEN> --days 28

# (re)create workbook from audit snapshot (fills verified + pending rows)
python3 scripts/cost_tracker.py init

# add a new cost entry (auto-updates formulas/charts in workbook)
python3 scripts/cost_tracker.py add \
  --vendor "Vercel" \
  --service "Production hosting" \
  --category Hosting \
  --billing-cycle monthly \
  --unit-cost-gbp 20 \
  --qty 1 \
  --verification-status verified \
  --evidence "Invoice #1234" \
  --notes "July invoice"
```

### Fully automatic refresh (no monthly manual edits)

Workflow file: `.github/workflows/cost-sync.yml`

- runs every 6 hours
- refreshes `ops/costs/provider-audit.json`
- rebuilds `ops/costs/dcjoineryni-cost-tracker.xlsx`
- auto-commits updated artifacts

Required GitHub Actions secrets:

- `VERCEL_TOKEN`
- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PDFSHIFT_API_KEY`
- `DOMAIN_INVOICE_REFERENCE`
