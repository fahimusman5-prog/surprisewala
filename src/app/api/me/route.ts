import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ authenticated: false, configured: false });
  const { data, error } = await supabase.auth.getClaims();
  return NextResponse.json({ authenticated: Boolean(!error && data?.claims?.sub), configured: true });
}
