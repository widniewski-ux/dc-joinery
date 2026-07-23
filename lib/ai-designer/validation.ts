import type { LeadInput } from "./types";
import { getSupplierCatalogById } from "./supplier-catalog";

const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

export function validateUploadFile(file: File | null): File {
  if (!file) {
    throw new Error("Please upload a kitchen photo");
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new Error(
      "Only JPG, PNG, WEBP, and AVIF files are supported. HEIC/HEIF is not supported in live AI generation."
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Image size must be 50MB or less");
  }
  return file;
}

export function validateSupplierId(supplierId: string): string {
  if (!getSupplierCatalogById(supplierId)) {
    throw new Error("Please choose a valid supplier");
  }
  return supplierId;
}

export function validateSupplierStyle(supplierId: string, style: string): string {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new Error("Please choose a valid supplier");
  }
  if (!supplier.styles.includes(style)) {
    throw new Error("Please choose a valid style for selected supplier");
  }
  return style;
}

export function validatePalette(supplierId: string, rawPalette: string): string[] {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new Error("Please choose a valid supplier");
  }
  const palette = rawPalette
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (palette.length === 0) {
    throw new Error("Please choose at least one color");
  }
  if (palette.length > 6) {
    throw new Error("Please choose up to 6 colors");
  }
  for (const color of palette) {
    if (!supplier.colors.includes(color)) {
      throw new Error(`Color "${color}" is not available for ${supplier.label}`);
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
    throw new Error("Please choose a valid supplier");
  }
  const source = optionType === "worktops" ? supplier.worktops : supplier.handles;
  if (!source.includes(value)) {
    throw new Error(`Selected ${optionType.slice(0, -1)} is not available for ${supplier.label}`);
  }
  return value;
}

export function validateAppliances(supplierId: string, rawAppliances: string): string[] {
  const supplier = getSupplierCatalogById(supplierId);
  if (!supplier) {
    throw new Error("Please choose a valid supplier");
  }
  const selected = rawAppliances
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (selected.length === 0) {
    throw new Error("Please choose at least one appliance preference");
  }
  for (const item of selected) {
    if (!supplier.appliances.includes(item)) {
      throw new Error(`Appliance "${item}" is not available for ${supplier.label}`);
    }
  }
  return selected;
}

export function validateLeadInput(payload: unknown): LeadInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid lead payload");
  }

  const data = payload as Record<string, unknown>;
  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const phone = String(data.phone || "").trim();
  const message = String(data.message || "").trim();

  if (name.length < 2) {
    throw new Error("Name is required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email is invalid");
  }
  if (!/^[\d\s()+-]{10,}$/.test(phone)) {
    throw new Error("Phone number is invalid");
  }
  if (message.length > 1500) {
    throw new Error("Message is too long");
  }

  return {
    name,
    email,
    phone,
    message: message || null,
  };
}
