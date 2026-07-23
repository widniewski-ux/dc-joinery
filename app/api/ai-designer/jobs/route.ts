import { randomUUID } from "crypto";

import {
  assertRateLimit,
  getRequestIdentifier,
  RateLimitError,
} from "@/lib/ai-designer/rate-limit";
import { createKitchenDesignJob, uploadAssetToStorage } from "@/lib/ai-designer/supabase-rest";
import {
  validateAppliances,
  validatePalette,
  validateSingleSupplierOption,
  validateSupplierId,
  validateSupplierStyle,
  validateUploadFile,
} from "@/lib/ai-designer/validation";
import { getSupplierCatalogById } from "@/lib/ai-designer/supplier-catalog";

const INTERNAL_BUDGET_MIN = 5000;
const INTERNAL_BUDGET_MAX = 25000;

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const identifier = getRequestIdentifier(request);
    assertRateLimit(`ai-designer:create:${identifier}`, 10, 60_000);

    const formData = await request.formData();
    const imageFile = validateUploadFile(formData.get("photo") as File | null);
    const supplierId = validateSupplierId(String(formData.get("supplier") || ""));
    const style = validateSupplierStyle(supplierId, String(formData.get("style") || ""));
    const supplier = getSupplierCatalogById(supplierId);
    if (!supplier) {
      throw new Error("Please choose a valid supplier");
    }
    const palette = validatePalette(supplierId, String(formData.get("palette") || ""));
    const worktop = validateSingleSupplierOption(
      supplierId,
      String(formData.get("worktop") || ""),
      "worktops"
    );
    const handles = validateSingleSupplierOption(
      supplierId,
      String(formData.get("handles") || ""),
      "handles"
    );
    const appliances = validateAppliances(supplierId, String(formData.get("appliances") || ""));
    const userNotes = String(formData.get("notes") || "").trim();
    const customerNotes =
      [
        `Supplier: ${supplierId}`,
        `Style: ${style}`,
        `Worktop: ${worktop}`,
        `Handles: ${handles}`,
        `Appliances: ${appliances.join(", ")}`,
        userNotes ? `Client note: ${userNotes}` : "",
      ]
        .filter(Boolean)
        .join(" | ") || null;

    const uploadPath = `inputs/${Date.now()}-${randomUUID()}-${imageFile.name}`;
    const imageBuffer = await imageFile.arrayBuffer();
    const inputImageUrl = await uploadAssetToStorage(uploadPath, imageBuffer, imageFile.type);

    const job = await createKitchenDesignJob({
      inputImageUrl,
      style: `${supplier.label} - ${style}`,
      colorPalette: palette,
      budgetMin: INTERNAL_BUDGET_MIN,
      budgetMax: INTERNAL_BUDGET_MAX,
      customerNotes,
    });

    return Response.json({ job }, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    const message = error instanceof Error ? error.message : "Failed to create AI design job";
    return Response.json({ error: message }, { status: 400 });
  }
}
