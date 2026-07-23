import { readFile } from "fs/promises";
import path from "path";

import { getSupplierCatalogById } from "@/lib/ai-designer/supplier-catalog";

const LOCAL_SUPPLIERS_DIR = "/Users/Dawid/Desktop/Suppliers ";

function detectContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function prettyFileName(fileName: string): string {
  const decoded = (() => {
    try {
      return decodeURIComponent(fileName);
    } catch {
      return fileName;
    }
  })();
  return decoded.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplierId = String(searchParams.get("supplier") || "").trim();
  const file = String(searchParams.get("file") || "").trim();
  const requestedPageRaw = Number(searchParams.get("page") || "");
  const requestedPage = Number.isFinite(requestedPageRaw) ? requestedPageRaw : null;

  if (!supplierId || !file) {
    return Response.json({ error: "Missing supplier or file parameter" }, { status: 400 });
  }

  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    return Response.json({ error: "Unknown supplier" }, { status: 404 });
  }

  const allowedFiles = new Set<string>();
  supplier.documents.forEach((doc) => {
    allowedFiles.add(doc.name);
    doc.samples?.forEach((sample) => allowedFiles.add(sample));
  });
  [supplier.styles, supplier.colors, supplier.handles, supplier.worktops, supplier.appliances].forEach(
    (group) => {
      group.forEach((option) => {
        option.references.forEach((ref) => {
          allowedFiles.add(ref.document);
          if (ref.image) {
            allowedFiles.add(ref.image);
          }
        });
      });
    }
  );

  if (!allowedFiles.has(file)) {
    return Response.json({ error: "File is not in supplier catalog" }, { status: 403 });
  }

  const safePath = path.join(LOCAL_SUPPLIERS_DIR, supplier.label, file);
  try {
    const content = await readFile(safePath);
    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": detectContentType(file),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    const referenceRows: Array<{
      category: string;
      option: string;
      page?: number;
      snippet?: string;
      image?: string;
    }> = [];

    const groups = [
      { label: "Style", options: supplier.styles },
      { label: "Color", options: supplier.colors },
      { label: "Handle", options: supplier.handles },
      { label: "Worktop", options: supplier.worktops },
      { label: "Appliance", options: supplier.appliances },
    ] as const;

    groups.forEach((group) => {
      group.options.forEach((option) => {
        option.references.forEach((ref) => {
          if (ref.document === file || ref.image === file) {
            referenceRows.push({
              category: group.label,
              option: option.value,
              page: ref.page,
              snippet: ref.snippet,
              image: ref.image,
            });
          }
        });
      });
    });

    const sortedRows = referenceRows.sort((a, b) => {
      if (requestedPage !== null) {
        const aDelta = Math.abs((a.page ?? requestedPage) - requestedPage);
        const bDelta = Math.abs((b.page ?? requestedPage) - requestedPage);
        if (aDelta !== bDelta) return aDelta - bDelta;
      }
      return (a.page ?? Number.MAX_SAFE_INTEGER) - (b.page ?? Number.MAX_SAFE_INTEGER);
    });

    const itemListHtml =
      sortedRows.length > 0
        ? sortedRows
            .slice(0, 12)
            .map(
              (row) => `<li>
  <strong>${escapeHtml(row.category)}:</strong> ${escapeHtml(row.option)}
  ${row.page ? `&middot; page ${row.page}` : ""}
  ${row.snippet ? `<br /><span class="snippet">${escapeHtml(row.snippet)}</span>` : ""}
</li>`
            )
            .join("\n")
        : `<li>No detailed option references found for this source file yet.</li>`;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Brochure reference • ${escapeHtml(supplier.label)}</title>
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; background: #0a0a0a; color: #f5f5f5; font-family: Inter, system-ui, -apple-system, sans-serif; }
      main { max-width: 860px; margin: 0 auto; padding: 24px 16px 40px; }
      .badge { display: inline-block; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #f5c451; margin-bottom: 10px; }
      h1 { margin: 0 0 10px; font-size: 22px; line-height: 1.3; }
      p { color: #d4d4d4; line-height: 1.5; }
      ul { margin: 16px 0 0; padding-left: 18px; }
      li { margin-bottom: 14px; line-height: 1.5; }
      .snippet { color: #a3a3a3; font-size: 14px; }
      .box { border: 1px solid #2a2a2a; background: #111; border-radius: 12px; padding: 14px; margin-top: 14px; }
    </style>
  </head>
  <body>
    <main>
      <span class="badge">Brochure reference</span>
      <h1>${escapeHtml(supplier.label)} &middot; ${escapeHtml(prettyFileName(file))}</h1>
      <p>
        This public environment cannot read files from your private desktop folder, so this page shows the matched brochure references stored in the catalog.
        ${requestedPage ? `Requested page: ${requestedPage}.` : ""}
      </p>
      <div class="box">
        <strong>Matched options</strong>
        <ul>
          ${itemListHtml}
        </ul>
      </div>
    </main>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
