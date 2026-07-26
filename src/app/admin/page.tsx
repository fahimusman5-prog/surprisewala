import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberHeader } from "@/components/member-header";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) redirect("/login?error=not_configured");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fadmin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard?error=admin_required");

  const [{ count: customerCount }, { count: orderCount }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  return (
    <main className="member-shell">
      <div className="member-container">
        <MemberHeader />
        <section className="dashboard-main">
          <div className="dashboard-hero glass-card">
            <div>
              <p className="auth-eyebrow">Administration</p>
              <h1 className="dashboard-title">Surprisewala Admin</h1>
              <p>Secure access to member and checkout activity.</p>
            </div>
          </div>
          <div className="dashboard-grid">
            <section className="dashboard-content glass-card" aria-label="Admin overview">
              <h2>Overview</h2>
              <p>{customerCount ?? 0} customer account{customerCount === 1 ? "" : "s"} and {orderCount ?? 0} saved order{orderCount === 1 ? "" : "s"}.</p>
              <p className="auth-meta">Administrative capabilities will appear here as they are added to the product.</p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
