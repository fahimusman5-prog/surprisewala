import "server-only";
import { getAdmin, AccessError } from "./server";
import { tables, localDate, identifier, type AdminEntity } from "./model";

const searchFields: Partial<Record<AdminEntity, string[]>> = { orders: ["order_reference", "customer_name", "customer_phone", "recipient_name", "package_name"], customers: ["full_name", "phone", "normalized_phone"], packages: ["name", "slug"], collections: ["name", "slug"], gallery: ["title", "caption"], reviews: ["customer_name", "review"], admins: ["display_name", "email"], activity: ["action", "entity_type"], media: ["path"] };
const sortable: Partial<Record<AdminEntity, string[]>> = { orders: ["created_at", "surprise_date", "total_amount", "customer_name"], customers: ["created_at", "full_name"], packages: ["display_order", "name", "price", "created_at"], collections: ["display_order", "name", "created_at"], gallery: ["display_order", "created_at"], reviews: ["display_order", "created_at"], content: ["display_order", "created_at"], settings: ["key"], media: ["created_at"], admins: ["created_at", "display_name"], activity: ["created_at"] };
function check(error: unknown) { if (error) throw new AccessError(503, "Business data could not be loaded. Please retry or verify the database setup."); }
export async function queryAdmin(entity: AdminEntity, params: URLSearchParams) {
  const { supabase } = await getAdmin(entity);
  const id = params.get("id");
  if (id) {
    identifier(id, entity);
    const result = await supabase.from(tables[entity]).select("*").eq(entity === "settings" ? "key" : "id", id).maybeSingle();
    check(result.error);
    if (!result.data) throw new AccessError(404, "This record could not be found.");
    const row = result.data;
    if (entity === "orders" && process.env.PAYHERE_ENABLED === "true") {
      const payments = await supabase.from("payhere_payments").select("id,provider,status,amount,currency,payment_id,method,paid_at,verified_at,created_at").eq("order_id",id).order("created_at",{ascending:false}).limit(1);
      if (!payments.error) row.payhere_payment = payments.data?.[0] ?? null;
      else row.payment_metadata_unavailable = true;
    }
    if (entity === "packages") {
      const [items, images, links] = await Promise.all([
        supabase.from("package_items").select("id,label,display_order").eq("package_id", id).order("display_order"),
        supabase.from("package_images").select("id,image_path,alt_text,display_order").eq("package_id", id).order("display_order"),
        supabase.from("package_collections").select("collection_id").eq("package_id", id),
      ]); [items, images, links].forEach(r => check(r.error));
      row.items = items.data; row.images = images.data; row.collection_ids = links.data?.map(l => l.collection_id) ?? [];
    }
    if (entity === "customers") {
      const orders = await supabase.from("orders").select("id,order_reference,package_name,customer_name,surprise_date,surprise_time,total_amount,status,order_status,created_at", { count: "exact" }).eq("customer_id", id).order("created_at", { ascending: false }).limit(25);
      check(orders.error); row.order_history = orders.data; row.total_orders = orders.count; row.latest_order = orders.data?.[0]?.created_at ?? null;
    }
    return { row };
  }
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.get("page")) || 1))); const pageSize = Math.max(1, Math.min(200, Math.floor(Number(params.get("pageSize")) || 20)));
  const select = entity === "customers" ? "*,orders(count)" : "*";
  let query = supabase.from(tables[entity]).select(select, { count: "exact" });
  const q = (params.get("q") || "").trim().slice(0, 120).replace(/[^\p{L}\p{N}@ _+.-]/gu, "");
  if (q && searchFields[entity]) {
    const filters = searchFields[entity]!.map(f => `${f}.ilike.%${q}%`);
    if (entity === "orders" && /^[0-9a-f-]{36}$/i.test(q)) filters.push(`id.eq.${q}`);
    query = query.or(filters.join(","));
  }
  if (["packages", "collections", "gallery"].includes(entity)) query = query.is("archived_at", null);
  const status = params.get("status");
  if (entity === "orders") {
    if (status) query = query.eq("status", status);
    for (const key of ["package_id", "payment_status"]) if (params.get(key)) query = query.eq(key, params.get(key));
    const collection = params.get("collection_id");
    if (collection) {
      identifier(collection, "collections");
      const links = await supabase.from("package_collections").select("package_id").eq("collection_id", collection); check(links.error);
      if (!links.data?.length) return { rows: [], count: 0, page, pageSize };
      query = query.in("package_id", links.data.map(l => l.package_id));
    }
    const upcoming = params.get("upcoming");
    if (upcoming) {
      query = query.not("status", "in", "(completed,cancelled)");
      if (upcoming === "today") query = query.eq("surprise_date", localDate());
      else if (upcoming === "tomorrow") query = query.eq("surprise_date", localDate(1));
      else { query = query.gte("surprise_date", localDate()); if (upcoming === "week") query = query.lte("surprise_date", localDate(6)); }
    }
    for (const [param, op] of [["from", "gte"], ["to", "lte"]] as const) {
      const day = params.get(param); if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) query = query[op]("surprise_date", day);
    }
  } else if (status === "active" || status === "inactive") query = query.eq("active", status === "active");
  else if (entity === "reviews" && ["published", "pending"].includes(status || "")) query = query.eq("published", status === "published");
  if (entity === "settings") query = query.neq("key", "cms_enabled");
  const requestedSort = params.get("sort")?.split(":") ?? [];
  const sort = sortable[entity]!.includes(requestedSort[0]) ? requestedSort[0] : entity === "orders" && params.get("upcoming") ? "surprise_date" : sortable[entity]![0];
  const ascending = requestedSort[1] === "asc" || (!requestedSort.length && ["display_order", "key", "surprise_date"].includes(sort));
  query = query.order(sort, { ascending, nullsFirst: false });
  if (sort === "surprise_date") query = query.order("surprise_time", { ascending: true, nullsFirst: false });
  query = query.order(entity === "settings" ? "key" : "id", { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1);
  const result = await query; check(result.error);
  let rows: Record<string, unknown>[] = (result.data ?? []) as unknown as Record<string, unknown>[];
  if (entity === "customers") {
    const ids = rows.map(row => row.id);
    if (ids.length) {
      const latest = await supabase.rpc("customer_order_summary", { p_customer_ids: ids });
      check(latest.error);
      const summaries = new Map((latest.data ?? []).map((s: { customer_id: string; total_orders: number; latest_order: string | null }) => [s.customer_id, s]));
      rows = rows.map(row => ({ ...row, ...(summaries.get(row.id) ?? {}), total_orders: (row.orders as { count: number }[] | undefined)?.[0]?.count ?? 0 }));
    }
  }
  if (entity === "media") rows = rows.map(row => ({ ...row, url: supabase.storage.from("business-media").getPublicUrl(String(row.path)).data.publicUrl }));
  return { rows, count: result.count ?? 0, page, pageSize };
}
