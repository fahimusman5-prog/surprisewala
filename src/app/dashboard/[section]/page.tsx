import { notFound } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { MemberHeader } from "@/components/member-header";
import { loadDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(["orders", "addresses", "profile"] as const).includes(section as "orders" | "addresses" | "profile")) notFound();
  const data = await loadDashboardData();
  return <div className="member-shell"><div className="member-container"><MemberHeader /><DashboardClient user={data.user} initialProfile={data.profile} initialOrders={data.orders} initialAddresses={data.addresses} initialSection={section as "orders" | "addresses" | "profile"} /></div></div>;
}
