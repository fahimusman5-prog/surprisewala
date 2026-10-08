import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiFailure, getAdmin, sameOrigin, AccessError } from "@/lib/admin/server";
import { InputError } from "@/lib/admin/model";
import { inspectImage, maxImageBytes } from "@/lib/admin/upload";
export async function POST(request: Request) {
  try {
    sameOrigin(request); const { supabase, user } = await getAdmin("media");
    if (Number(request.headers.get("content-length")) > maxImageBytes + 100000) throw new InputError("Choose an image smaller than 8 MB.");
    const form = await request.formData(); const file = form.get("file"); const folder = String(form.get("folder") ?? "gallery");
    if (!(file instanceof File) || !["packages", "collections", "gallery", "reviews"].includes(folder)) throw new InputError("Select an image and a valid destination.");
    if (file.size > maxImageBytes) throw new InputError("Choose an image smaller than 8 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer()); const extension = inspectImage(bytes, file.name, file.type);
    const path = `${folder}/${randomUUID()}.${extension}`;
    const upload = await supabase.storage.from("business-media").upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (upload.error) throw new AccessError(400, "Image upload failed. Check your permissions and retry.");
    const asset = await supabase.from("media_assets").insert({ path, mime_type: file.type, size: file.size, created_by: user.id }).select("id").single();
    if (asset.error) { await supabase.storage.from("business-media").remove([path]); throw new AccessError(400, "The image could not be registered. Please upload it again."); }
    return NextResponse.json({ id: asset.data.id, path, url: supabase.storage.from("business-media").getPublicUrl(path).data.publicUrl });
  } catch (error) { return error instanceof InputError ? NextResponse.json({ error: error.message }, { status: 400 }) : apiFailure(error); }
}
