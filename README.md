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
2. Customer picks supplier and brochure-based options (style, colors, worktops, handles, appliances)
3. AI analyzes image
4. AI generates redesigned kitchen visual
5. AI creates professional design summary based on selected supplier options
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
- `GET /admin/ai-leads` - password form and expiring HttpOnly administrator session

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

# Canonical site origin, required on production for request validation
NEXT_PUBLIC_SITE_URL=https://www.dcjoineryni.uk
```

### Database setup

Run the SQL in:

`db/ai_designer_schema.sql`

on your Supabase/Postgres project, followed by `db/security_migration.sql`. Existing projects only need the security migration. See `SECURITY-ROLLOUT.md` before deployment.

### Storage setup

Create a **private** Supabase storage bucket called:

`ai-designer`

It stores:
- customer input images
- generated PDFs

### Generation processing

- Generation is started asynchronously from `/api/ai-designer/jobs/:jobId/generate`
- Frontend polls `/api/ai-designer/jobs/:jobId` until status is `report_ready` or `failed`

## Security Notes

- Security headers in `next.config.ts`; per-request CSP nonce in `proxy.ts`
- Form honeypot anti-spam in lead/contact flows
- Shared, atomic Supabase rate limits on form, AI and admin requests; production fails closed if unavailable
- Strict server-side validation for file type, file count, and size
- Secrets read only from server environment variables
- Browser ownership cookie for designs; no customer contact details in customer API responses
- Private media with one-hour signed access; seven-day browser ownership cookie
- Image decode, metadata stripping and 3MB upload limits
- Optional analytics requires opt-in

## Development dependency override

The Next ESLint plugin uses `tools/eslint-glob` for directory lookup instead of the vulnerable fast-glob/micromatch/braces chain. All Next/React/TypeScript lint rules remain enabled. Review the scoped adapter when upgrading the Next ESLint plugin.
