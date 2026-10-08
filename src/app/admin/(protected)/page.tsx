import { AdminDashboard } from "@/components/admin/dashboard";
import { requireAdmin } from "@/lib/admin/server";
export default async function AdminHome() { const { admin } = await requireAdmin(); return <AdminDashboard role={admin.role} />; }
