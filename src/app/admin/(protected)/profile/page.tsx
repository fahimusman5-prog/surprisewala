import { AdminProfile } from "@/components/admin/settings";
import { requireAdmin } from "@/lib/admin/server";
export default async function AdminProfilePage() { const { admin } = await requireAdmin("profile"); return <AdminProfile admin={admin} />; }
