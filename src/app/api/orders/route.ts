import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import seed from "@/data/storefront-seed.json";
import { InputError, localDate, normalizePhone, record, textValue } from "@/lib/admin/model";
import { sameOrigin, AccessError } from "@/lib/admin/server";

const required = ["customer_name", "customer_phone", "surprise_date", "surprise_location", "surprise_time", "surprise_type", "recipient_name", "recipient_relationship"];
const surpriseTypes = ["Birthday", "Anniversary", "Proposal", "Romantic Surprise", "Graduation", "Welcome Surprise", "Baby Shower", "Other"];
const relationships = ["Husband", "Wife", "Boyfriend", "Girlfriend", "Fiancé", "Fiancée", "Friend", "Best Friend", "Mother", "Father", "Brother", "Sister", "Family Member", "Colleague", "Other"];
type BookingItem = { id: string; quantity: number; customization?: { weight: string; topper: string; message: string } };
function validateBooking(payload: Record<string, unknown>) {
  const keys = [ ...required, "customer_email", "custom_surprise_type", "recipient_phone", "custom_relationship", "special_notes", "payment_method" ];
  const values: Record<string, string> = Object.fromEntries(keys.map(key => [key, textValue(payload[key], key === "special_notes" ? 2000 : 240)]));
  if (required.some(key => !values[key]) || values.customer_name.length < 2 || values.recipient_name.length < 2 || values.surprise_location.length < 2) throw new InputError("Please complete all required booking fields.");
  if (values.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) throw new InputError("Please enter a valid email address.");
  for (const key of ["customer_phone", "recipient_phone"]) if (values[key] && (!/^\+?[0-9 ()-]{7,25}$/.test(values[key]) || normalizePhone(values[key]).length < 7)) throw new InputError("Please enter a valid phone number.");
  if (!surpriseTypes.includes(values.surprise_type) || !relationships.includes(values.recipient_relationship) || (values.surprise_type === "Other" && !values.custom_surprise_type) || (values.recipient_relationship === "Other" && !values.custom_relationship)) throw new InputError("Please choose valid booking options.");
  const date = new Date(`${values.surprise_date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.surprise_date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== values.surprise_date || values.surprise_date < localDate()) throw new InputError("Choose a valid surprise date today or later.");
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(values.surprise_time)) throw new InputError("Please choose a valid surprise time.");
  if (values.payment_method && !["bank", "bank_transfer", "cash", "card", "koko", "mintpay", "whatsapp"].includes(values.payment_method)) throw new InputError("Choose a valid payment method.");
  const rawItems = payload.items ?? [{ id: payload.package_id, quantity: 1 }];
  if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 25) throw new InputError("Select between 1 and 25 packages.");
  const items: BookingItem[] = rawItems.map(raw => {
    const item = record(raw), id = textValue(item.id, 100, true), quantity = item.quantity ?? 1;
    if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(id) || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new InputError("Check the package and quantity.");
    if (item.customization == null) return { id, quantity };
    const custom = record(item.customization);
    const weight = textValue(custom.weight, 40), topper = textValue(custom.topper, 100), message = textValue(custom.message, 300);
    if (!["1kg", "1.5kg", "2kg", "1 kg", "1.5 kg", "2 kg"].includes(weight) || !["None", "none", "Happy Birthday", "Happy Anniversary"].includes(topper)) throw new InputError("Choose valid cake customization options.");
    return { id, quantity, customization: { weight, topper, message } };
  });
  const submissionKey = textValue(payload.submission_key, 36, true);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionKey)) throw new InputError("Please reopen the booking form and try again.");
  return { ...values, special_notes: values.special_notes, items, submission_key: submissionKey };
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (Number(request.headers.get("content-length")) > 32000) throw new InputError("The booking form is too large.");
    let payload: Record<string, unknown>; try { payload = record(await request.json()); } catch { throw new InputError("Invalid booking payload."); }
    const booking = validateBooking(payload);
    const supabase = await getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ saved: false, reason: "not_configured" }, { status: 202 });
    const activation = await supabase.from("site_settings").select("value").eq("key", "cms_enabled").maybeSingle();
    if (activation.error && !["42P01", "PGRST205"].includes(activation.error.code)) return NextResponse.json({ error: "We couldn't load the current catalog. Please try again." }, { status: 503 });
    if (activation.data?.value === "true") {
      const result = await supabase.rpc("submit_booking", { p_payload: booking });
      if (result.error || !result.data?.id) return NextResponse.json({ error: "Your booking could not be saved. Check package availability and your details, then retry." }, { status: 400 });
      return NextResponse.json({ saved: true, orderId: result.data.id, orderReference: result.data.order_reference, subtotal: result.data.subtotal, total: result.data.total, customizable: result.data.customizable });
    }
    // Only the known, explicitly disabled pre-CMS phase uses the extracted catalog.
    // Activation moves pricing and submission permanently into the database.
    const selected = booking.items.map(item => {
      const pack = seed.packages.find(pack => pack.id === item.id);
      if (!pack?.active) throw new InputError("That package is no longer available.");
      return { ...item, name: pack.name, price: pack.price, order_mode: pack.order_mode };
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ saved: false, reason: "guest" }, { status: 202 });
    const subtotal = selected.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
    const customizable = selected.some(item => item.order_mode !== "cart");
    const details = Object.fromEntries(Object.entries(booking).filter(([key]) => !["items", "submission_key"].includes(key)));
    const result = await supabase.from("orders").insert({ ...details, user_id: user.id, order_type: customizable ? "custom_package" : "package", items: selected, total_amount: subtotal, status: "pending", customer_notes: booking.special_notes || null, package_id: selected[0].id, package_name: selected.map(item => item.name).join(" + "), currency: "LKR", subtotal, fees: 0, total: subtotal, payment_status: "pending", order_status: "pending" }).select("id").single();
    if (result.error) return NextResponse.json({ error: "We couldn't save your booking details. Please try again." }, { status: 500 });
    return NextResponse.json({ saved: true, orderId: result.data.id, subtotal, total: subtotal, customizable });
  } catch (error) {
    if (error instanceof InputError || error instanceof AccessError) return NextResponse.json({ error: error.message }, { status: error instanceof AccessError ? error.status : 400 });
    return NextResponse.json({ error: "Your booking could not be saved. Please try again." }, { status: 500 });
  }
}
