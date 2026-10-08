import { notFound } from "next/navigation";
import { AdminList } from "@/components/admin/list";
import { BusinessSettings } from "@/components/admin/settings";
import { entities, type Entity } from "@/components/admin/shared";
import { requireAdmin } from "@/lib/admin/server";
export default async function AdminEntityPage({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) { const { entity } = await params; if (!entities.includes(entity as Entity)) notFound(); await requireAdmin(entity); const query = await searchParams; const filters = Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string] => typeof entry[1] === "string")); return entity === "settings" ? <BusinessSettings /> : <AdminList entity={entity as Entity} initialFilters={filters} />; }
