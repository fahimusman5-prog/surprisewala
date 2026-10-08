import { InputError } from "./model";
export const maxImageBytes = 8 * 1024 * 1024;
export function inspectImage(bytes: Uint8Array, filename: string, mime: string) {
  const allowed: Record<string, { extensions: string[]; extension: string; valid: boolean }> = {
    "image/jpeg": { extensions: ["jpg", "jpeg"], extension: "jpg", valid: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
    "image/png": { extensions: ["png"], extension: "png", valid: [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n) },
    "image/webp": { extensions: ["webp"], extension: "webp", valid: String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP" },
  };
  const format = allowed[mime]; const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  if (bytes.length === 0 || bytes.length > maxImageBytes) throw new InputError("Choose an image smaller than 8 MB.");
  if (!format || !format.extensions.includes(extension) || !format.valid) throw new InputError("Choose a valid JPEG, PNG or WebP image.");
  return format.extension;
}
