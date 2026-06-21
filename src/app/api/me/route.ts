import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ authenticated: false, configured: false });
  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({ authenticated: Boolean(user), configured: true });
}
