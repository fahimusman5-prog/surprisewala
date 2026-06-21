import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { MemberHeader } from "@/components/member-header";
import { loadDashboardData } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Customer Dashboard" };
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const data = await loadDashboardData();
  return <div className="member-shell"><div className="member-container"><MemberHeader /><DashboardClient user={data.user} initialProfile={data.profile} initialOrders={data.orders} initialAddresses={data.addresses} /></div></div>;
}
