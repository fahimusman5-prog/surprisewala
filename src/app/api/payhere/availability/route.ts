import { NextResponse } from "next/server";
import { payhereConfig } from "@/lib/payhere/server";
export function GET() {
  let enabled = false;
  try { payhereConfig(); enabled = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY); } catch { /* preparation mode */ }
  return NextResponse.json({enabled},{headers:{"Cache-Control":"no-store"}});
}
