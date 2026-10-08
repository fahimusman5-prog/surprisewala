import { NextResponse } from "next/server";
import { sameOrigin, AccessError } from "@/lib/admin/server";
import { authoritativeAmount, checkoutHash } from "@/lib/payhere/core";
import { payhereConfig, paymentDatabase, paymentUser, uuid } from "@/lib/payhere/server";
import { business } from "@/lib/legal";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const config = payhereConfig();
    const user = await paymentUser();
    const raw = await request.text();
    if (raw.length > 5000) throw new AccessError(413,"Request too large.");
    const input = JSON.parse(raw);
    const orderId = uuid(input.orderId);
    if (input.consent !== true) throw new AccessError(400,"Please agree to the policies before paying.");
    const billing: Record<string,string> = {};
    for (const key of ["first_name","last_name","email","phone","address","city","country"]) {
      const value = input.billing?.[key];
      if (typeof value !== "string" || !value.trim() || value.length > 240 || /[<>\u0000-\u001f]/.test(value)) throw new AccessError(400,"Complete your billing details.");
      billing[key] = value.trim();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email) || !/^\+?[0-9 ()-]{7,25}$/.test(billing.phone)) throw new AccessError(400,"Enter a valid billing email and phone.");
    const db = paymentDatabase();
    const { data:order, error } = await db.from("orders").select("*").eq("id",orderId).eq("user_id",user.id).maybeSingle();
    if (error) throw new AccessError(503,"Order access is temporarily unavailable.");
    if (!order) throw new AccessError(404,"Order not found.");
    const amount = authoritativeAmount(order);
    // RPC locks the order, checks the amount/ownership and reuses a pending attempt.
    const attempt = await db.rpc("begin_payhere_payment", { p_order:orderId, p_user:user.id, p_amount:amount, p_mode:config.mode, p_policy_version:business.version });
    if (attempt.error || !attempt.data?.id) throw new AccessError(409,"This order cannot start a new payment. Check its status or contact support.");
    const id = attempt.data.id;
    const fields = { merchant_id:config.merchant, return_url:`${config.origin}/payment/return?attempt=${id}`, cancel_url:`${config.origin}/payment/cancel?attempt=${id}`, notify_url:`${config.origin}/api/payhere/notify`, ...billing, order_id:id, items:`Surprisewala ${order.order_reference || order.id}`, currency:"LKR", amount, hash:checkoutHash(config.merchant,id,amount,"LKR",config.secret) };
    return NextResponse.json({ endpoint:config.endpoint, fields },{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) {
    return NextResponse.json({error:error instanceof AccessError ? error.message : "Payment could not be prepared. Check your order and billing details."},{status:error instanceof AccessError ? error.status : 400,headers:{"Cache-Control":"no-store"}});
  }
}
