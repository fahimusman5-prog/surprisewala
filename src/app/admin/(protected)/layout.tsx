import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/admin/server";
export const dynamic = "force-dynamic";
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) { const { admin } = await requireAdmin(); return <AdminShell admin={admin}>{children}</AdminShell>; }
