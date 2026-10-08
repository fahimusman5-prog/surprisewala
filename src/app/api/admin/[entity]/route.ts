import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { apiFailure, AccessError, getAdmin, sameOrigin } from "@/lib/admin/server";
import { queryAdmin } from "@/lib/admin/queries";
import { identifier, InputError, isEntity, record, tables, validateValues } from "@/lib/admin/model";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ entity: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { entity } = await context.params; if (!isEntity(entity)) throw new AccessError(404, "Section not found.");
    return NextResponse.json(await queryAdmin(entity, new URL(request.url).searchParams), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return error instanceof InputError ? NextResponse.json({ error: error.message }, { status: 400 }) : apiFailure(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const { entity } = await context.params; if (!isEntity(entity)) throw new AccessError(404, "Section not found.");
    const { supabase } = await getAdmin(entity);
    if (Number(request.headers.get("content-length")) > 100000) throw new InputError("The form is too large.");
    let body: Record<string, unknown>; try { body = record(await request.json()); } catch { throw new InputError("Invalid form submission."); }
    const action = String(body.action || "save"); const id = body.id ? identifier(body.id, entity) : null;
    if (entity === "activity") throw new AccessError(403, "Activity records are read-only.");
    if (action === "save") {
      const values = validateValues(entity, body.values);
      if (entity === "packages") {
        const result = await supabase.rpc("save_package", { p_values: { ...values, id: id ?? randomUUID() } });
        if (result.error) throw new AccessError(400, "Package could not be saved. Check its URL, collections and required fields.");
        return NextResponse.json({ row: result.data });
      }
      if (entity === "customers" && !id) throw new InputError("Customers are created from bookings; open a customer to edit internal notes.");
      if (entity === "orders" && !id) throw new InputError("Orders are created from the booking form.");
      if (entity === "admins" && !id) throw new InputError("Use the user ID from a legitimate Supabase Auth account.");
      if (entity === "admins") {
        const result = await supabase.rpc("manage_admin_user", { p_values: { ...values, id } });
        if (result.error) throw new AccessError(400, "Staff access could not be changed. Use an existing Auth account; the primary and final Super Admin must remain active.");
        return NextResponse.json({ row: result.data });
      }
      if (entity === "media") throw new InputError("Use the image upload control.");
      const query = entity === "settings" ? supabase.from(tables[entity]).upsert(values, { onConflict: "key" }) : id ? supabase.from(tables[entity]).update(values).eq("id", id) : supabase.from(tables[entity]).insert(values);
      const result = await query.select("*").single();
      if (result.error) throw new AccessError(400, "This record could not be saved. Check its required fields and unique URL.");
      return NextResponse.json({ row: result.data });
    }
    if (!id) throw new InputError("Choose a record first.");
    if (action === "duplicate" && entity === "packages") {
      const result = await supabase.rpc("duplicate_package", { p_id: id });
      if (result.error) throw new AccessError(400, "Package could not be duplicated.");
      return NextResponse.json({ row: result.data });
    }
    if (action === "archive" && ["packages", "collections", "gallery"].includes(entity)) {
      const result = await supabase.from(tables[entity]).update({ active: false, archived_at: new Date().toISOString() }).eq("id", id).select("id").single();
      if (result.error) throw new AccessError(400, "This record could not be archived.");
      return NextResponse.json({ row: result.data });
    }
    if (action === "delete" && ["gallery", "reviews", "media"].includes(entity)) {
      if (entity === "media") {
        const asset = await supabase.from("media_assets").select("path").eq("id", id).single();
        if (asset.error) throw new AccessError(404, "Image could not be found.");
        const usage = await supabase.rpc("media_asset_usage", { p_id: id });
        if (usage.error || usage.data?.in_use) throw new AccessError(409, "This image is in use. Replace it in the package, collection, gallery or review first.");
        const removal = await supabase.storage.from("business-media").remove([asset.data.path]);
        if (removal.error) throw new AccessError(409, "The image could not be removed. It may still be in use.");
        const result = await supabase.from("media_assets").delete().eq("id", id).select("id").single();
        if (result.error) throw new AccessError(400, "The image registration could not be removed. Refresh and retry.");
        return NextResponse.json({ deleted: true });
      }
      const result = await supabase.from(tables[entity]).delete().eq("id", id).select("id").single();
      if (result.error) throw new AccessError(400, "This record could not be deleted.");
      return NextResponse.json({ deleted: true });
    }
    throw new InputError("This action is not available for this record.");
  } catch (error) { return error instanceof InputError ? NextResponse.json({ error: error.message }, { status: 400 }) : apiFailure(error); }
}
