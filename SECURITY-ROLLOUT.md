# Security fixes — deployment requirements

The code is prepared locally. No production database migration or deployment has been performed. Existing provider keys are reused; none were generated, changed or copied into source control.

Vercel project `dc-joinery` deploys the public repository `widniewski-ux/dc-joinery` on `main`. This local checkout originally used the separate private repository `dc-joinery-main`. Production commit `c6d74ad` has been merged into the local fix branch so the latest gallery, photos, canonical URLs and consent-controlled event tracking are preserved. Publish to the connected public repository after resolving GitHub authentication and Supabase access.

## Deployment order

1. Use a preview environment and a Supabase backup/snapshot. Verify that the configured Supabase project and Vercel project belong to this website.
2. Apply `db/security_migration.sql` with the Supabase SQL editor (new databases must first run `db/ai_designer_schema.sql`). The migration adds ownership/email-delivery columns, enables RLS, removes anonymous table access, installs shared atomic request limits and makes the existing `ai-designer` bucket private. It does not remove customer data or objects. Existing designs without an ownership hash remain accessible to administrators, not anonymous browsers.
3. Deploy this code immediately after the migration in a planned maintenance window: the old app uses public media links, and those stop working when the bucket becomes private. Do not deploy the new app first: it requires the new columns and RPC. Check storage policies in the actual project; the migration adds a restrictive policy for anonymous and authenticated roles while service-role access remains server-only.
4. Keep existing `OPENAI_API_KEY`, Supabase service role, Resend, Replicate, PDFShift and admin token in hosting settings. Set `NEXT_PUBLIC_SITE_URL` to the exact HTTPS origin used by customers. Redirect the other www/non-www hostname to that origin at the host. Never put provider keys in `NEXT_PUBLIC_*` settings. Local Windows testing needs separately authorised transfer of the existing credentials into ignored `.env.local`; it has not happened.
5. On Vercel the application trusts the ingress-owned `x-vercel-forwarded-for` IP header. Elsewhere set `TRUSTED_CLIENT_IP_HEADER` only if the reverse proxy overwrites it and direct origin access is blocked. Without that setting all visitors share a conservative rate limit. Production requests fail closed when the shared rate-limit service is unavailable.
6. Optional: set `SUPPLIER_SOURCE_DIR` to an absolute folder containing supplier subfolders. Without it, catalog-allowlisted brochure links are signed through Supabase, including brochures already stored in the same bucket.
7. Verify two separate browsers cannot open or modify each other's projects; anonymous database/storage reads fail; authorised images, PDFs and brochures work. Run one authorised paid AI generation and one enquiry delivery. Inspect Resend delivery and the saved lead. These live checks have not been run locally because production credentials are absent.
8. Sign in at `/admin/ai-leads` with the existing admin token in the password field. Old `?token=` URLs no longer log in. If a token was previously shared or logged in a URL, consider rotating that admin token separately (the OpenAI key is unchanged). Confirm login/logout and email-notification retries. A saved lead is considered accepted even if its notification email fails; the dashboard shows missing delivery confirmation and offers a retry after five minutes. Provider idempotency helps with retries within its supported time window; it is not an indefinite exactly-once guarantee.
9. Confirm analytics is absent before opt-in, rejecting works, and withdrawing removes analytics cookies. Review `/privacy` against the actual supplier contracts, retention policy and processing arrangements before publication. No invented automatic deletion policy is implemented.

## Behaviour changes

- Customer project access uses a seven-day HttpOnly browser cookie, checked against a hash stored with the job. Customer responses explicitly omit contact details and internal provider responses.
- Private asset links expire after an hour. Reopen/refresh the project or admin page for fresh links. Admin notification emails link to the authenticated dashboard instead of permanent public files.
- Uploads: AI photo up to 3MB; enquiries up to five files and 3MB combined. Supported attachments are images and PDF; Word documents must be exported to PDF. Images are decoded, resized and stripped of EXIF metadata. PDF signature checks are not antivirus scanning.
- AI generation is claimed atomically and bounded by a 250-second overall provider deadline; the hosting function still needs a 300-second maximum duration. Process termination or platform outages can still leave an active status requiring operational investigation; a durable external queue is not introduced here.
- Initial photo check verifies decoding and dimensions; genuine AI analysis runs during generation. No demo result or pretend enquiry-success fallback remains.
- CSP nonces require dynamic page rendering. Image optimisation and static assets still use Next.js. Existing original photos and the optional MOV file are preserved.
- The unfinished cost tracker, workbook, audit snapshot and scheduled GitHub workflow have been removed. Removing the workflow on GitHub is part of publishing these changes.

## Dependency hardening

The development-only Next ESLint directory lookup now uses a scoped local adapter backed by maintained `tinyglobby`. The vulnerable `fast-glob`/`micromatch`/`braces` chain has been removed. `npm audit` reports zero findings for all installed dependencies. Next, React and TypeScript lint rules remain enabled. Review the adapter when updating Next ESLint.

## Rollback

Keep a pre-deployment code revision and database backup. The migration is additive except for access restrictions. Prefer rolling forward. Rolling back application code alone will break legacy public asset links; do not make the customer bucket public again just to recover links. Keep privacy protections and repair the signing path, or restore into an isolated environment for investigation. Do not drop the new columns or delete existing projects as a rollback shortcut.

## References

- Next.js CSP/nonces: https://nextjs.org/docs/app/guides/content-security-policy
- Supabase private media: https://supabase.com/docs/guides/storage/serving/downloads
- Vercel ingress headers: https://vercel.com/docs/headers/request-headers
- Resolved development advisory: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
