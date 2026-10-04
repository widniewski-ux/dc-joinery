import { RequestError } from "../security";
import type { LeadInput } from "./types";
import { getSupplierCatalogById, getSupplierOptionValues } from "./supplier-catalog";

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

export function validateUploadFile(file: File | null): File {
  if (!(file instanceof File) || !file.size) {
    throw new RequestError("Please upload a kitchen photo");
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new RequestError(
      "Only JPG, PNG, WEBP, and AVIF files are supported. HEIC/HEIF is not supported in live AI generation."
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new RequestError("Image size must be 3MB or less");
  }
  return file;
}

export function validateSupplierId(supplierId: string): string {
  if (!getSupplierCatalogById(supplierId)) {
    throw new RequestError("Please choose a valid supplier");
  }
  return supplierId;
}

export function validateSupplierStyle(supplierId: string, style: string): string {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new RequestError("Please choose a valid supplier");
  }
  const availableStyles = getSupplierOptionValues(supplier, "styles");
  if (!availableStyles.includes(style)) {
    throw new RequestError("Please choose a valid style for selected supplier");
  }
  return style;
}

export function validatePalette(supplierId: string, rawPalette: string): string[] {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new RequestError("Please choose a valid supplier");
  }
  const palette = rawPalette
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (palette.length === 0) {
    throw new RequestError("Please choose at least one color");
  }
  if (palette.length > 6) {
    throw new RequestError("Please choose up to 6 colors");
  }
  const availableColors = getSupplierOptionValues(supplier, "colors");
  for (const color of palette) {
    if (!availableColors.includes(color)) {
      throw new RequestError(`Color "${color}" is not available for ${supplier.label}`);
    }
  }
  return palette;
}

export function validateSingleSupplierOption(
  supplierId: string,
  value: string,
  optionType: "worktops" | "handles"
): string {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new RequestError("Please choose a valid supplier");
  }
  const source = getSupplierOptionValues(
    supplier,
    optionType === "worktops" ? "worktops" : "handles"
  );
  if (!source.includes(value)) {
    throw new RequestError(`Selected ${optionType.slice(0, -1)} is not available for ${supplier.label}`);
  }
  return value;
}

export function validateAppliances(supplierId: string, rawAppliances: string): string[] {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new RequestError("Please choose a valid supplier");
  }
  const selected = rawAppliances
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (selected.length === 0 || selected.length > 20) {
    throw new RequestError("Please choose at least one appliance preference");
  }
  const availableAppliances = getSupplierOptionValues(supplier, "appliances");
  for (const item of selected) {
    if (!availableAppliances.includes(item)) {
      throw new RequestError(`Appliance "${item}" is not available for ${supplier.label}`);
    }
  }
  return selected;
}

export function validateLeadInput(payload: unknown): LeadInput {
  if (!payload || typeof payload !== "object") {
    throw new RequestError("Invalid lead payload");
  }

  const data = payload as Record<string, unknown>;
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const phone = String(data.phone || "").trim();
  const message = String(data.message || "").trim();

  if (name.length < 2 || name.length > 100) {
    throw new RequestError("Name is required");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequestError("Email is invalid");
  }
  if (phone.length > 30 || !/^[\d\s()+-]+$/.test(phone) || phone.replace(/\D/g, "").length < 10 || phone.replace(/\D/g, "").length > 15) {
    throw new RequestError("Phone number is invalid");
  }
  if (message.length > 1500) {
    throw new RequestError("Message is too long");
  }

  return {
    name,
    email,
    phone,
    message: message || null,
  };
}
