import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const CATALOG: Record<string, { name: string; price: number | null; customizable: boolean }> = {
  "simple-elegant": { name: "Simple but elegant Surprise", price: 14000, customizable: false },
  "on-the-go": { name: "Unexpected surprise on the go", price: 18000, customizable: false },
  flashmob: { name: "A flashmob surprise to your loved ones", price: 26000, customizable: false },
  emotions: { name: "Those emotions what we live for!", price: 28000, customizable: false },
  "unique-wow": { name: "Unique way to surprise your loved to feel wow", price: null, customizable: true },
  "car-surprise": { name: "Car Surprise", price: null, customizable: true },
  "cafe-surprise": { name: "Cafe Surprise", price: null, customizable: true },
  "beach-surprise": { name: "Beach Surprise", price: null, customizable: true },
  "romantic-room": { name: "Romantic Room Setup", price: null, customizable: true },
  "solo-boat": { name: "Private Solo Boat Surprise", price: null, customizable: true },
};
const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const phone = (value: unknown) => text(value, 40).replace(/[\u0000-\u001f]/g, "");
const required = ["customer_name", "customer_phone", "surprise_date", "surprise_location", "surprise_time", "surprise_type", "recipient_name", "recipient_relationship"] as const;

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ saved: false, reason: "not_configured" }, { status: 202 });
  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid booking payload." }, { status: 400 }); }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ saved: false, reason: "guest" }, { status: 202 });

  if (!payload.package_id) {
    if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 100) return NextResponse.json({ error: "Order items are required." }, { status: 400 });
    const totalAmount = Number(payload.totalAmount ?? 0);
    if (!Number.isFinite(totalAmount) || totalAmount < 0 || totalAmount > 100_000_000) return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    const customer = (payload.customer || {}) as Record<string, unknown>;
    const [{ error: orderError }, { error: profileError }] = await Promise.all([
      supabase.from("orders").insert({ user_id: user.id, order_type: text(payload.orderType || "whatsapp_checkout", 80), items: payload.items, total_amount: totalAmount, status: "pending", customer_notes: text(payload.customerNotes, 2000) }),
      supabase.from("profiles").update({ full_name: text(customer.fullName || user.user_metadata.full_name, 160), phone: phone(customer.phone || user.user_metadata.phone) }).eq("id", user.id),
    ]);
    if (orderError) return NextResponse.json({ error: "We could not save this order to your account. Your checkout can still continue." }, { status: 500 });
    if (profileError) console.error("Profile sync failed", { code: profileError.code });
    return NextResponse.json({ saved: true });
  }

  const packageId = text(payload.package_id, 80);
  const pack = CATALOG[packageId];
  if (!pack) return NextResponse.json({ error: "That package is no longer available." }, { status: 400 });
  const values = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, text(value, key === "special_notes" ? 2000 : 240)])) as Record<string, string>;
  if (required.some((key) => !values[key])) return NextResponse.json({ error: "Please complete all required booking fields." }, { status: 400 });
  if (values.customer_name.length < 2 || values.recipient_name.length < 2 || values.surprise_location.length < 2 || (values.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email))) return NextResponse.json({ error: "Please check the booking details and try again." }, { status: 400 });
  const surpriseTypes = ["Birthday", "Anniversary", "Proposal", "Romantic Surprise", "Graduation", "Welcome Surprise", "Baby Shower", "Other"];
  const relationships = ["Husband", "Wife", "Boyfriend", "Girlfriend", "Fiancé", "Fiancée", "Friend", "Best Friend", "Mother", "Father", "Brother", "Sister", "Family Member", "Colleague", "Other"];
  if (!surpriseTypes.includes(values.surprise_type) || !relationships.includes(values.recipient_relationship) || (values.surprise_type === "Other" && !values.custom_surprise_type) || (values.recipient_relationship === "Other" && !values.custom_relationship)) return NextResponse.json({ error: "Please choose valid booking options." }, { status: 400 });
  if (!/^\+?[0-9 ()-]{7,25}$/.test(phone(values.customer_phone)) || (values.recipient_phone && !/^\+?[0-9 ()-]{7,25}$/.test(phone(values.recipient_phone)))) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  const date = new Date(`${values.surprise_date}T00:00:00+05:30`);
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })); today.setHours(0, 0, 0, 0);
  if (Number.isNaN(date.getTime()) || date < today) return NextResponse.json({ error: "Surprise date cannot be in the past." }, { status: 400 });
  const subtotal = pack.price === null ? 0 : pack.price;
  const row = { user_id: user.id, order_type: pack.customizable ? "custom_package" : "package", items: [{ id: packageId, name: pack.name, quantity: 1, price: pack.price }], total_amount: subtotal, status: "pending", customer_notes: values.special_notes || null, customer_name: values.customer_name, customer_phone: phone(values.customer_phone), customer_email: values.customer_email || null, surprise_date: values.surprise_date, surprise_location: values.surprise_location, surprise_time: values.surprise_time, surprise_type: values.surprise_type, custom_surprise_type: values.custom_surprise_type || null, recipient_name: values.recipient_name, recipient_phone: values.recipient_phone ? phone(values.recipient_phone) : null, recipient_relationship: values.recipient_relationship, custom_relationship: values.custom_relationship || null, special_notes: values.special_notes || null, package_id: packageId, package_name: pack.name, currency: "LKR", subtotal, fees: 0, total: subtotal, payment_status: "pending", order_status: "pending" };
  const { data, error } = await supabase.from("orders").insert(row).select("id").single();
  if (error) return NextResponse.json({ error: "We couldn't save your booking details. Please try again." }, { status: 500 });
  return NextResponse.json({ saved: true, orderId: data.id, subtotal, total: subtotal, customizable: pack.customizable });
}
