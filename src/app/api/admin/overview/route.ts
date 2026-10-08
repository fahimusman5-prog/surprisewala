import { NextResponse } from "next/server";
import { AccessError, apiFailure, getAdmin } from "@/lib/admin/server";
import { localDate } from "@/lib/admin/model";
export async function GET() {
  try {
    const { supabase, admin } = await getAdmin();
    const operational = admin.role !== "editor";
    const counts = [
      { key: "activePackages", query: supabase.from("packages").select("id", { count: "exact", head: true }).eq("active", true).is("archived_at", null) },
      { key: "collections", query: supabase.from("collections").select("id", { count: "exact", head: true }).eq("active", true).is("archived_at", null) },
      { key: "publishedReviews", query: supabase.from("reviews").select("id", { count: "exact", head: true }).eq("published", true) },
      { key: "galleryItems", query: supabase.from("gallery_items").select("id", { count: "exact", head: true }).eq("active", true).is("archived_at", null) },
      ...(operational ? [
        { key: "totalOrders", query: supabase.from("orders").select("id", { count: "exact", head: true }) },
        { key: "newOrders", query: supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["new", "pending"]) },
        { key: "confirmedOrders", query: supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "confirmed") },
        { key: "completedOrders", query: supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "completed") },
        { key: "upcomingSurprises", query: supabase.from("orders").select("id", { count: "exact", head: true }).gte("surprise_date", localDate()).not("status", "in", "(completed,cancelled)") },
        { key: "totalCustomers", query: supabase.from("customers").select("id", { count: "exact", head: true }) },
      ] : []),
    ];
    const orderFields = "id,order_reference,customer_name,customer_phone,package_name,surprise_date,surprise_time,surprise_location,total_amount,status,payment_status,created_at";
    const [results, recent, upcoming, customers, activity] = await Promise.all([
      Promise.all(counts.map(async c => ({ key: c.key, result: await c.query }))),
      operational ? supabase.from("orders").select(orderFields).order("created_at", { ascending: false }).limit(6) : Promise.resolve(null),
      operational ? supabase.from("orders").select(orderFields).gte("surprise_date", localDate()).not("status", "in", "(completed,cancelled)").order("surprise_date").order("surprise_time").limit(6) : Promise.resolve(null),
      operational ? supabase.from("customers").select("id,full_name,phone,created_at").order("created_at", { ascending: false }).limit(5) : Promise.resolve(null),
      admin.role === "super_admin" ? supabase.from("admin_activity_logs").select("id,action,entity_type,entity_id,created_at").order("created_at", { ascending: false }).limit(6) : Promise.resolve(null),
    ]);
    if (results.some(r => r.result.error) || [recent, upcoming, customers, activity].some(r => r?.error)) throw new AccessError(503, "The dashboard could not load business data. Retry or verify the database setup.");
    return NextResponse.json({ metrics: Object.fromEntries(results.map(r => [r.key, r.result.count ?? 0])), recentOrders: recent?.data ?? [], upcoming: upcoming?.data ?? [], recentCustomers: customers?.data ?? [], recentActivity: activity?.data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiFailure(error); }
}
