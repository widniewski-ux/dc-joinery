import { apiError, boundedBody, assertSameOrigin, customerJob, ownerHash, privateHeaders, RequestError } from "@/lib/security";
import { checkedImage } from "@/lib/uploads";
import { randomUUID } from "crypto";

import {
  assertRateLimit,
  getRequestIdentifier,
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
    assertSameOrigin(request);
    if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024) throw new RequestError("Upload too large.", 413);
    const identifier = getRequestIdentifier(request);
    await assertRateLimit(`ai-designer:create:${identifier}`, 5, 3_600_000);

    const formData = await (await boundedBody(request, 4 * 1024 * 1024)).formData().catch(() => { throw new RequestError("Invalid upload."); });
    const imageFile = validateUploadFile(formData.get("photo") as File | null);
    const supplierId = validateSupplierId(String(formData.get("supplier") || ""));
    const style = validateSupplierStyle(supplierId, String(formData.get("style") || ""));
    const supplier = getSupplierCatalogById(supplierId);
    if (!supplier) {
      throw new RequestError("Please choose a valid supplier");
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
    if (userNotes.length > 1500) throw new RequestError("Notes must be 1500 characters or less.");
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

    const uploadPath = `inputs/${randomUUID()}.jpg`;
    const imageBytes = await checkedImage(imageFile);
    const imageBuffer = Uint8Array.from(imageBytes).buffer;
    const inputImageUrl = await uploadAssetToStorage(uploadPath, imageBuffer, "image/jpeg");

    const job = await createKitchenDesignJob({
      ownerHash: (await ownerHash(true))!,
      inputImageUrl,
      style: `${supplier.label} - ${style}`,
      colorPalette: palette,
      budgetMin: INTERNAL_BUDGET_MIN,
      budgetMax: INTERNAL_BUDGET_MAX,
      customerNotes,
    });

    return Response.json({ job: await customerJob(job) }, { status: 201, headers: privateHeaders });
  } catch (error) { return apiError(error); }
}
