import { NextResponse } from "next/server";
import { apiFailure, getAdmin, sameOrigin, AccessError } from "@/lib/admin/server";
import { InputError, record, textValue } from "@/lib/admin/model";
export async function POST(request: Request) {
  try {
    sameOrigin(request); const { supabase } = await getAdmin("profile");
    const body = record(await request.json());
    if (Object.keys(body).some(key => key !== "display_name")) throw new InputError("Only your display name can be edited here.");
    const displayName = textValue(body.display_name, 160, true);
    const result = await supabase.rpc("update_admin_profile", { p_display_name: displayName });
    if (result.error) throw new AccessError(400, "Your profile could not be updated.");
    return NextResponse.json({ admin: result.data });
  } catch (error) { return error instanceof InputError ? NextResponse.json({ error: error.message }, { status: 400 }) : apiFailure(error); }
}
