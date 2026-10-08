import { NextResponse } from "next/server";
import { verifyNotification } from "@/lib/payhere/core";
import { payhereConfig, paymentDatabase } from "@/lib/payhere/server";
import { AccessError } from "@/lib/admin/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/x-www-form-urlencoded") return new NextResponse("Unsupported content type",{status:415});
    const raw = await request.text();
    if (raw.length > 16000) return new NextResponse("Notification too large",{status:413});
    const config = payhereConfig(false);
    let verified;
    try { verified = verifyNotification(new URLSearchParams(raw),config.merchant,config.secret); }
    catch { return new NextResponse("Invalid notification",{status:400}); }
    const result = await paymentDatabase().rpc("apply_payhere_notification", { p_attempt:verified.attemptId, p_payment_id:verified.paymentId, p_amount:verified.amount, p_currency:verified.currency, p_status:verified.status, p_method:verified.method, p_signature:verified.signature, p_mode:config.mode });
    // Non-2xx permits provider retries; never acknowledge a failed database update.
    if (result.error) return new NextResponse("Notification not applied",{status:503});
    return new NextResponse("OK",{status:200});
  } catch(error) {
    return new NextResponse("Payment service unavailable",{status:error instanceof AccessError ? error.status : 503});
  }
}
