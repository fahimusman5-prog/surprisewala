import { NextResponse } from "next/server";
import { paymentDatabase, paymentUser, uuid } from "@/lib/payhere/server";
import { AccessError } from "@/lib/admin/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const user = await paymentUser();
    const id = uuid(new URL(request.url).searchParams.get("attempt"));
    const db = paymentDatabase();
    const result = await db.from("payhere_payments").select("id,order_id,status,amount,currency,verified_at,paid_at,orders!inner(user_id,order_reference,package_name,surprise_date,surprise_time)").eq("id",id).eq("orders.user_id",user.id).maybeSingle();
    if (result.error) throw new AccessError(503,"Payment status is unavailable. Contact support before retrying.");
    if (!result.data) throw new AccessError(404,"Payment record not found.");
    const { orders, ...payment } = result.data;
    const order = orders as unknown as { order_reference:string; package_name:string; surprise_date:string; surprise_time:string };
    return NextResponse.json({ ...payment, order_reference:order.order_reference, package_name:order.package_name, surprise_date:order.surprise_date, surprise_time:order.surprise_time },{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) { return NextResponse.json({error:error instanceof AccessError ? error.message : "Unable to confirm payment."},{status:error instanceof AccessError ? error.status : 503,headers:{"Cache-Control":"no-store"}}); }
}
