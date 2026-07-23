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

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supplierId = String(searchParams.get("supplier") || "").trim();
  const file = String(searchParams.get("file") || "").trim();

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
    return Response.json({ error: "Source file not found on local disk" }, { status: 404 });
  }
}
