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

## Security Notes

- Security headers configured in `next.config.ts`
- Form honeypot anti-spam in lead/contact flows
- Strict server-side validation for file type, file count, and size
- Secrets read only from server environment variables
