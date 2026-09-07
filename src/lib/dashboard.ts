import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function loadDashboardData() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login?error=not_configured");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, ordersResult, addressesResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, phone, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("orders").select("id, order_type, items, total_amount, status, customer_notes, created_at, customer_name, customer_phone, customer_email, surprise_date, surprise_location, surprise_time, surprise_type, custom_surprise_type, recipient_name, recipient_phone, recipient_relationship, custom_relationship, special_notes, package_name, currency, subtotal, fees, total, payment_method, payment_status, order_status").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("addresses").select("id, label, full_name, phone, address_line, city, country, is_default, created_at").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  return {
    user: { id: user.id, email: user.email ?? "", metadata: user.user_metadata },
    profile: profileResult.data,
    orders: ordersResult.data ?? [],
    addresses: addressesResult.data ?? [],
  };
}
