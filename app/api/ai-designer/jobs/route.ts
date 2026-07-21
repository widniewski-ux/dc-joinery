import { randomUUID } from "crypto";

import { createKitchenDesignJob, uploadAssetToStorage } from "@/lib/ai-designer/supabase-rest";
import {
  validateBudget,
  validatePalette,
  validateStyle,
  validateUploadFile,
} from "@/lib/ai-designer/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = validateUploadFile(formData.get("photo") as File | null);
    const style = validateStyle(String(formData.get("style") || ""));
    const palette = validatePalette(String(formData.get("palette") || ""));
    const { min, max } = validateBudget(
      String(formData.get("budgetMin") || ""),
      String(formData.get("budgetMax") || "")
    );
    const customerNotes = String(formData.get("notes") || "").trim() || null;

    const uploadPath = `inputs/${Date.now()}-${randomUUID()}-${imageFile.name}`;
    const imageBuffer = await imageFile.arrayBuffer();
    const inputImageUrl = await uploadAssetToStorage(uploadPath, imageBuffer, imageFile.type);

    const job = await createKitchenDesignJob({
      inputImageUrl,
      style,
      colorPalette: palette,
      budgetMin: min,
      budgetMax: max,
      customerNotes,
    });

    return Response.json({ job }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create AI design job";
    return Response.json({ error: message }, { status: 400 });
  }
}
