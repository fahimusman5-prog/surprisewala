import { NextResponse } from "next/server";
import { loadStorefrontData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await loadStorefrontData();
  return NextResponse.json(data, { status: data.source === "unavailable" ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}
