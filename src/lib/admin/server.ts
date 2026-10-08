import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { canAccess, type AdminRole } from "./model";

export class AccessError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function getAdmin(section = "dashboard") {
  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new AccessError(503, "Admin access is not configured.");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new AccessError(401, "Please sign in to continue.");
  const result = await supabase.from("admin_users").select("id,display_name,email,role,active").eq("id", user.id).maybeSingle();
  if (result.error) throw new AccessError(503, "Admin access is unavailable. The database setup must be verified.");
  const admin = result.data as { id: string; display_name: string | null; email: string; role: AdminRole; active: boolean } | null;
  if (!admin?.active || !["super_admin", "admin", "editor"].includes(admin.role) || !canAccess(admin.role, section)) throw new AccessError(403, "You do not have access to this section.");
  return { supabase, user, admin: { ...admin, display_name: admin.display_name || admin.email } };
}
export async function requireAdmin(section = "dashboard") {
  try { return await getAdmin(section); }
  catch (error) {
    if (error instanceof AccessError) {
      if (error.status === 401) redirect("/admin/login");
      if (error.status === 403) redirect("/admin/denied");
      redirect("/admin/login?error=setup_required");
    }
    throw error;
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new AccessError(403, "This request could not be verified. Refresh the page and try again.");
}
export function apiFailure(error: unknown) {
  if (error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ error: "This change could not be completed. Check your values and try again." }, { status: 500 });
}
