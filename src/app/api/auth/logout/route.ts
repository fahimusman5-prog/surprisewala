import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { signedOut: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    return NextResponse.json(
      { signedOut: false },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { signedOut: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
