import { NextResponse } from "next/server";
import { getAdmin, apiFailure } from "@/lib/admin/server";
export async function GET() {
  try { const { admin } = await getAdmin(); return NextResponse.json({ admin }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return apiFailure(error); }
}
