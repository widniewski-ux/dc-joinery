import type { KitchenStyle, LeadInput } from "./types";

const ALLOWED_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

export const KITCHEN_STYLES: KitchenStyle[] = [
  "Modern Minimal",
  "Shaker",
  "Industrial",
  "Classic Luxury",
  "Scandinavian",
];

export function validateUploadFile(file: File | null): File {
  if (!file) {
    throw new Error("Please upload a kitchen photo");
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP files are supported");
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Image size must be 8MB or less");
  }
  return file;
}

export function validateStyle(style: string): KitchenStyle {
  if (!KITCHEN_STYLES.includes(style as KitchenStyle)) {
    throw new Error("Please choose a valid kitchen style");
  }
  return style as KitchenStyle;
}

export function validatePalette(rawPalette: string): string[] {
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
  return palette;
}

export function validateBudget(rawMin: string, rawMax: string): { min: number; max: number } {
  const min = Number(rawMin);
  const max = Number(rawMax);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("Budget values are invalid");
  }
  if (min < 2000 || max > 100000 || min >= max) {
    throw new Error("Please choose a realistic budget range");
  }
  return { min, max };
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
