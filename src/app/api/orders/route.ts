import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CheckoutPayload = {
  items?: unknown[];
  totalAmount?: number;
  customerNotes?: string;
  customer?: { fullName?: string; phone?: string; email?: string };
  orderType?: string;
};

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ saved: false, reason: "not_configured" }, { status: 202 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ saved: false, reason: "guest" }, { status: 202 });

  let payload: CheckoutPayload;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid order payload." }, { status: 400 }); }

  if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 100) {
    return NextResponse.json({ error: "Order items are required." }, { status: 400 });
  }
  const totalAmount = Number(payload.totalAmount ?? 0);
  if (!Number.isFinite(totalAmount) || totalAmount < 0 || totalAmount > 100_000_000) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  const customer = payload.customer ?? {};
  const [{ error: orderError }, { error: profileError }] = await Promise.all([
    supabase.from("orders").insert({
      user_id: user.id,
      order_type: String(payload.orderType || "whatsapp_checkout").slice(0, 80),
      items: payload.items,
      total_amount: totalAmount,
      status: "pending",
      customer_notes: String(payload.customerNotes || "").slice(0, 2000),
    }),
    supabase.from("profiles").update({
      full_name: String(customer.fullName || user.user_metadata.full_name || "").slice(0, 160),
      phone: String(customer.phone || user.user_metadata.phone || "").slice(0, 40),
    }).eq("id", user.id),
  ]);

  if (orderError) {
    console.error("Authenticated order save failed", { code: orderError.code });
    return NextResponse.json({ error: "We could not save this order to your account. Your checkout can still continue." }, { status: 500 });
  }
  if (profileError) console.error("Profile sync failed", { code: profileError.code });
  return NextResponse.json({ saved: true });
}
