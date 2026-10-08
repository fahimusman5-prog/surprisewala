import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";
import { legalPublicationReady } from "@/lib/legal";
import { AccessError } from "@/lib/admin/server";

export function payhereConfig(requireEnabled = true) {
  const merchant = process.env.PAYHERE_MERCHANT_ID, secret = process.env.PAYHERE_MERCHANT_SECRET;
  const mode = process.env.PAYHERE_MODE || "sandbox", origin = process.env.PAYHERE_SITE_URL;
  if ((requireEnabled && (process.env.PAYHERE_ENABLED !== "true" || process.env.SURPRISEWALA_CMS_ENABLED !== "true")) || !merchant || !secret || !origin || !["sandbox","live"].includes(mode)) throw new AccessError(503,"Online payment is being prepared. Please contact our team.");
  if (requireEnabled && mode === "live" && !legalPublicationReady) throw new AccessError(503,"Business details and policies must be approved before live payments.");
  const site = new URL(origin);
  if (site.protocol !== "https:" || site.pathname !== "/" || site.search || site.hash || site.username || site.password) throw new AccessError(503,"Payment configuration needs review.");
  return { merchant, secret, mode, origin:site.origin, endpoint:mode === "live" ? "https://www.payhere.lk/pay/checkout" : "https://sandbox.payhere.lk/pay/checkout" };
}
export function paymentDatabase() {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new AccessError(503,"Payment database is not configured.");
  return createClient(supabaseUrl!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function paymentUser() {
  const client = await getSupabaseServerClient();
  if (!client) throw new AccessError(503,"Account access is unavailable.");
  const { data:{user},error } = await client.auth.getUser();
  if (error || !user) throw new AccessError(401,"Please sign in to pay for your saved booking. Guest WhatsApp ordering remains available.");
  return user;
}
export function uuid(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new AccessError(400,"Invalid order reference.");
  return value;
}
