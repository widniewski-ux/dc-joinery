import "server-only";
import sharp from "sharp";
import { RequestError } from "./security";

export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export async function checkedImage(file: File) {
  if (!(file instanceof File) || !file.size || file.size > MAX_FILE_BYTES) throw new RequestError("Please upload an image up to 3MB.");
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 25_000_000, animated: false });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp", "avif", "heif"].includes(metadata.format || "") || !metadata.width || !metadata.height) throw new Error("Invalid image");
    // Decode fully, limit dimensions and strip location/camera metadata before sharing.
    return await image.rotate().resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
  } catch { throw new RequestError("The image could not be read. Please choose a valid JPG, PNG, WEBP or AVIF photo."); }
}
export async function checkedAttachments(entries: FormDataEntryValue[]) {
  if (entries.some(value => !(value instanceof File))) throw new RequestError("Invalid attachment.");
  const files = (entries as File[]).filter(file => file.size > 0);
  if (files.length > 5 || files.reduce((sum, file) => sum + file.size, 0) > MAX_FILE_BYTES) throw new RequestError("Choose up to 5 files, with a combined size of 3MB or less.");
  return Promise.all(files.map(async file => {
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "attachment";
    if (/\.(jpg|jpeg|png|webp|avif)$/i.test(filename)) return { filename: filename.replace(/\.[^.]+$/, ".jpg"), content: await checkedImage(file) };
    const bytes = Buffer.from(await file.arrayBuffer());
    if (/\.pdf$/i.test(filename) && bytes.subarray(0, 5).toString() === "%PDF-" && bytes.subarray(-1024).includes(Buffer.from("%%EOF"))) return { filename, content: bytes };
    throw new RequestError("Attachments must be valid PDF or image files. Please export Word documents as PDF.");
  }));
}
