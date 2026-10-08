import { createHash, timingSafeEqual } from "node:crypto";
export const paymentStatuses: Record<string,string> = { "2":"paid", "0":"pending", "-1":"cancelled", "-2":"failed", "-3":"chargeback" };
export function amountString(value: unknown): string {
  const raw = String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw)) throw new Error("Invalid amount");
  const [whole, fraction = ""] = raw.split(".");
  return `${Number(whole)}.${fraction.padEnd(2,"0")}`;
}
export const md5 = (value: string) => createHash("md5").update(value).digest("hex").toUpperCase();
export function checkoutHash(merchant: string, order: string, amount: string, currency: string, secret: string) {
  return md5(merchant + order + amountString(amount) + currency + md5(secret));
}
export function verifyNotification(fields: URLSearchParams, merchant: string, secret: string) {
  const required = ["merchant_id","order_id","payment_id","payhere_amount","payhere_currency","status_code","md5sig"];
  if (required.some(key => fields.getAll(key).length !== 1 || !fields.get(key) || fields.get(key)!.length > 160)) throw new Error("Invalid notification");
  const status = fields.get("status_code")!;
  if (!Object.hasOwn(paymentStatuses,status) || fields.get("merchant_id") !== merchant || fields.get("payhere_currency") !== "LKR") throw new Error("Invalid notification");
  const rawAmount = fields.get("payhere_amount")!;
  const amount = amountString(rawAmount);
  if (Number(amount) <= 0 || !/^[0-9a-f-]{36}$/i.test(fields.get("order_id")!) || !/^[a-zA-Z0-9_-]{1,100}$/.test(fields.get("payment_id")!)) throw new Error("Invalid notification");
  const expected = md5(merchant + fields.get("order_id") + rawAmount + "LKR" + status + md5(secret));
  const supplied = fields.get("md5sig")!;
  if (!/^[A-Fa-f0-9]{32}$/.test(supplied) || !timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(supplied,"hex"))) throw new Error("Invalid signature");
  return { attemptId: fields.get("order_id")!, paymentId: fields.get("payment_id")!, amount, currency:"LKR", status:paymentStatuses[status], method:(fields.get("method") || "").slice(0,40), signature: supplied.toUpperCase() };
}
// Price only immutable snapshots written by the existing trusted order endpoint/RPC.
export function authoritativeAmount(order: { items: unknown; subtotal: unknown; fees: unknown; total: unknown; total_amount: unknown; currency: unknown; order_type: unknown; payment_status?: unknown; order_status?: unknown; status?: unknown }) {
  if (order.currency !== "LKR" || order.order_type !== "package" || ["cancelled","completed"].includes(String(order.order_status || order.status))) throw new Error("This order needs team confirmation before payment.");
  if (!["confirmed","preparing","scheduled"].includes(String(order.order_status || order.status))) throw new Error("Our team must confirm availability and location charges before online payment. Contact support with your order reference.");
  if (["paid","partially_paid","deposit_paid","refunded","chargeback"].includes(String(order.payment_status))) throw new Error("This order is settled or needs payment reconciliation. Contact support.");
  if (!Array.isArray(order.items) || !order.items.length) throw new Error("Invalid order");
  let cents = 0;
  for (const item of order.items) {
    if (!item || item.order_mode !== "cart" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new Error("This order needs a confirmed quote.");
    cents += Math.round(Number(amountString(item.price))*100) * item.quantity;
  }
  const fees = Math.round(Number(amountString(order.fees))*100);
  const total = cents + fees;
  if (cents !== Math.round(Number(amountString(order.subtotal))*100) || total <= 0 || total !== Math.round(Number(amountString(order.total))*100) || total !== Math.round(Number(amountString(order.total_amount))*100)) throw new Error("Order price needs review.");
  return (total/100).toFixed(2);
}
