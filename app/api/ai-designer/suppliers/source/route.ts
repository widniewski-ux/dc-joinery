import { readFile } from "fs/promises";
import path from "path";

import { getSupplierCatalogById } from "@/lib/ai-designer/supplier-catalog";
import { requiredEnv } from "@/lib/ai-designer/env";

const LOCAL_SUPPLIERS_DIR = "/Users/Dawid/Desktop/Suppliers ";

function detectContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function sanitizeStorageFileName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  const hasExtension = dotIndex > 0;
  const base = hasExtension ? fileName.slice(0, dotIndex) : fileName;
  const ext = hasExtension ? fileName.slice(dotIndex).toLowerCase() : "";
  const safeBase = base
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const fallbackBase = safeBase || "source";
  return `${fallbackBase}${ext}`;
}

function publicStorageBaseUrl(): string {
  const supabaseUrl = requiredEnv("SUPABASE_URL").replace(/\/+$/, "");
  return `${supabaseUrl}/storage/v1/object/public/ai-designer`;
}

function publicImageStorageUrl(supplierId: string, fileName: string): string {
  const safeSupplier = encodeURIComponent(supplierId);
  const safeFile = encodeURIComponent(sanitizeStorageFileName(fileName));
  return `${publicStorageBaseUrl()}/supplier-brochures-assets/${safeSupplier}/${safeFile}`;
}

function publicPdfPageStorageUrl(supplierId: string, documentName: string, page: number): string {
  const safeSupplier = encodeURIComponent(supplierId);
  const safeDocument = encodeURIComponent(sanitizeStorageFileName(documentName));
  const safePage = String(Math.max(1, page)).padStart(4, "0");
  return `${publicStorageBaseUrl()}/supplier-brochures-pages/${safeSupplier}/${safeDocument}/page-${safePage}.pdf`;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplierId = String(searchParams.get("supplier") || "").trim();
  const file = String(searchParams.get("file") || "").trim();
  const requestedPageRaw = Number(searchParams.get("page") || "");
  const requestedPage = Number.isFinite(requestedPageRaw) ? Math.trunc(requestedPageRaw) : null;
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
    const lower = file.toLowerCase();
    if (lower.endsWith(".pdf")) {
      const referencedPages: number[] = [];
      [supplier.styles, supplier.colors, supplier.handles, supplier.worktops, supplier.appliances].forEach(
        (group) => {
          group.forEach((option) => {
            option.references.forEach((ref) => {
              if (ref.document === file && typeof ref.page === "number") {
                referencedPages.push(ref.page);
              }
            });
          });
        }
      );
      const fallbackPage =
        requestedPage && requestedPage > 0
          ? requestedPage
          : referencedPages.length > 0
          ? Math.min(...referencedPages)
          : 1;
      return Response.redirect(publicPdfPageStorageUrl(supplier.id, file, fallbackPage), 307);
    }

    return Response.redirect(publicImageStorageUrl(supplier.id, file), 307);
  }
}
