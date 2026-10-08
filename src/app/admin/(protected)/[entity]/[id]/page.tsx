import { notFound } from "next/navigation";
import { AdminDetail } from "@/components/admin/editor";
import { entities, type Entity } from "@/components/admin/shared";
import { requireAdmin } from "@/lib/admin/server";
export default async function AdminRecordPage({ params }: { params: Promise<{ entity: string; id: string }> }) { const { entity, id } = await params; if (!entities.includes(entity as Entity) || ["settings", "activity"].includes(entity) || (id === "new" && ["orders", "customers", "media"].includes(entity))) notFound(); await requireAdmin(entity); return <AdminDetail entity={entity as Entity} id={id} />; }
