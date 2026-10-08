export const entities = ["orders", "customers", "packages", "collections", "gallery", "reviews", "content", "media", "settings", "admins", "activity"] as const;
export type AdminEntity = (typeof entities)[number];
export type AdminRole = "super_admin" | "admin" | "editor";
export const orderStatuses = ["pending", "new", "contacted", "confirmed", "preparing", "scheduled", "completed", "cancelled"] as const;
export const paymentStatuses = ["pending", "unpaid", "deposit_paid", "partially_paid", "paid", "refunded", "cancelled", "failed", "chargeback"] as const;
export const settingKeys = ["phone", "whatsapp", "instagram", "facebook", "tiktok", "google_review_url"] as const;
export const tables: Record<AdminEntity, string> = { orders: "orders", customers: "customers", packages: "packages", collections: "collections", gallery: "gallery_items", reviews: "reviews", content: "site_statistics", media: "media_assets", settings: "site_settings", admins: "admin_users", activity: "admin_activity_logs" };
export function isEntity(value: string): value is AdminEntity { return entities.includes(value as AdminEntity); }
export function canAccess(role: AdminRole, section: string) {
  if (section === "dashboard" || section === "profile") return true;
  if (role === "super_admin") return isEntity(section);
  if (role === "admin") return isEntity(section) && !["admins", "activity"].includes(section);
  return ["packages", "collections", "gallery", "reviews", "media"].includes(section);
}
export function localDate(offset = 0, now = new Date()) {
  const date = new Date(now.getTime() + offset * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("00") ? digits.slice(2) : digits.length === 10 && digits.startsWith("0") ? `94${digits.slice(1)}` : digits;
}
export function safeInternalPath(value: string | null, fallback = "/dashboard") {
  return value && /^\/(?!\/)[a-zA-Z0-9/_?=&%#.-]*$/.test(value) && !/%(?:2f|5c)/i.test(value) ? value : fallback;
}
export class InputError extends Error {}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("Please check the form values.");
  return value as Record<string, unknown>;
}
export function textValue(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" && value != null) throw new InputError("Please enter valid text.");
  const text = String(value ?? "").trim();
  if (text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text) || (required && !text)) throw new InputError(`Please enter ${required ? "a value with " : ""}no more than ${max} characters.`);
  return text;
}
export function imagePath(value: unknown) {
  const text = textValue(value, 2000);
  if (!text) return null;
  if (/^\/(?!\/)[a-zA-Z0-9/_ .-]+\.(?:jpe?g|png|webp|mp4)$/i.test(text)) return text;
  try { const url = new URL(text); if (url.protocol === "https:" && url.hostname === "pzjbfhwzaettkzaxjdte.supabase.co" && url.pathname.startsWith("/storage/v1/object/public/")) return text; } catch {}
  throw new InputError("Choose an uploaded image or an existing website asset.");
}
function numberValue(value: unknown, max = 100000000, nullable = false) {
  if (nullable && (value == null || value === "")) return null;
  const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  if (!Number.isFinite(number) || number < 0 || number > max) throw new InputError("Please enter a valid positive number.");
  return number;
}
function choice(value: unknown, choices: readonly string[]) {
  if (typeof value !== "string" || !choices.includes(value)) throw new InputError("Please choose a valid option.");
  return value;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function identifier(value: unknown, entity: AdminEntity) {
  const id = textValue(value, 100, true);
  if (entity === "packages" ? !/^[a-z0-9][a-z0-9-]{0,99}$/.test(id) : entity === "settings" ? !settingKeys.includes(id as typeof settingKeys[number]) : !uuid.test(id)) throw new InputError("Invalid record reference.");
  return id;
}
export function validateValues(entity: AdminEntity, input: unknown): Record<string, unknown> {
  const source = record(input), result: Record<string, unknown> = {};
  const fields: Partial<Record<AdminEntity, string[]>> = {
    orders: ["status", "payment_status", "admin_notes"], customers: ["admin_notes"],
    packages: ["name", "slug", "badge", "description", "price", "price_note", "main_image", "video_url", "video_orientation", "order_mode", "active", "featured", "display_order", "collection_ids", "items", "images"],
    collections: ["name", "slug", "short_description", "cover_image", "active", "featured", "display_order"],
    gallery: ["image_path", "media_type", "title", "caption", "active", "featured", "display_order"],
    reviews: ["customer_name", "review", "rating", "customer_image", "package_id", "published", "featured", "display_order"],
    content: ["key", "label", "value", "suffix", "active", "display_order"], settings: ["key", "value"], admins: ["id", "display_name", "role", "active"],
  };
  if (!fields[entity]) throw new InputError("This section is read-only.");
  for (const key of Object.keys(source)) if (!fields[entity]!.includes(key)) throw new InputError("This field cannot be changed.");
  for (const [key, value] of Object.entries(source)) {
    if (["active", "featured", "published"].includes(key)) { if (typeof value !== "boolean") throw new InputError("Choose a valid status."); result[key] = value; }
    else if (key === "display_order") { const n = numberValue(value, 1000000)!; if (!Number.isInteger(n)) throw new InputError("Display order must be a whole number."); result[key] = n; }
    else if (key === "price") result[key] = numberValue(value, 100000000, true);
    else if (key === "value" && entity === "content") result[key] = numberValue(value);
    else if (key === "rating") { const n = numberValue(value, 5, true); if (n !== null && (n < 1 || !Number.isInteger(n))) throw new InputError("Rating must be between 1 and 5 stars."); result[key] = n; }
    else if (key === "slug") { const slug = textValue(value, 100, true); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new InputError("Use lowercase letters, numbers and hyphens for the URL."); result[key] = slug; }
    else if (["main_image", "cover_image", "image_path", "customer_image", "video_url"].includes(key)) result[key] = imagePath(value);
    else if (key === "order_mode") result[key] = choice(value, ["cart", "enquiry", "cake"]);
    else if (key === "media_type") result[key] = choice(value, ["image", "video"]);
    else if (key === "video_orientation") result[key] = choice(value, ["portrait", "landscape"]);
    else if (key === "status") result[key] = choice(value, orderStatuses);
    else if (key === "payment_status") result[key] = choice(value, paymentStatuses);
    else if (key === "role") result[key] = choice(value, ["super_admin", "admin", "editor"]);
    else if (key === "id") result[key] = identifier(value, "admins");
    else if (key === "package_id") result[key] = value ? identifier(value, "packages") : null;
    else if (key === "collection_ids") { if (!Array.isArray(value) || value.length > 50) throw new InputError("Choose up to 50 collections."); result[key] = [...new Set(value.map(v => identifier(v, "collections")))]; }
    else if (key === "items" || key === "images") {
      if (!Array.isArray(value) || value.length > 50) throw new InputError("Use no more than 50 items or images.");
      result[key] = value.map((item, index) => { const child = record(item); return key === "items" ? { label: textValue(child.label, 1000, true), display_order: index } : { image_path: imagePath(child.image_path), alt_text: textValue(child.alt_text, 300), display_order: index }; });
    } else result[key] = textValue(value, ["description", "review", "admin_notes"].includes(key) ? 5000 : 500, ["name", "customer_name", "review", "label"].includes(key));
  }
  if (entity === "settings") {
    const key = choice(result.key, settingKeys); const value = String(result.value ?? "");
    if (["phone", "whatsapp"].includes(key) && !/^\+?[0-9 ()-]{7,25}$/.test(value)) throw new InputError("Enter a valid contact number.");
    if (!["phone", "whatsapp"].includes(key) && value) { try { const u = new URL(value); if (u.protocol !== "https:") throw new Error(); } catch { throw new InputError("Use a complete HTTPS link."); } }
  }
  if (entity === "content" && (result.key === "average_rating" || /rating/i.test(String(result.key)))) throw new InputError("Average rating is calculated from published reviews.");
  if (entity === "packages" && source.order_mode && source.order_mode !== "cart") result.price = null;
  return result;
}
