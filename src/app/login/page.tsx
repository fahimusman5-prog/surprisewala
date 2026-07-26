import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { MemberHeader } from "@/components/member-header";
import { getSafeInternalPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Member Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="member-shell">
      <div className="member-container">
        <MemberHeader />
        <section className="auth-wrap">
          <div className="auth-card glass-card">
            <p className="auth-eyebrow">Surprisewala membership</p>
            <h1>Login to Get Special Updates</h1>
            <p className="auth-copy">Access your order history, save your details, receive exclusive surprise offers and get updates from Surprisewala.</p>
            <AuthForm mode="login" nextPath={getSafeInternalPath(next)} />
          </div>
        </section>
      </div>
    </main>
  );
}
