import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ authenticated: false, configured: false });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json(
      { authenticated: false, configured: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      authenticated: true,
      configured: true,
      name: profile?.full_name || "My Account",
      role: profile?.role === "admin" ? "admin" : "customer",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
