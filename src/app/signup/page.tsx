import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { MemberHeader } from "@/components/member-header";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <main className="member-shell">
      <div className="member-container">
        <MemberHeader />
        <section className="auth-wrap">
          <div className="auth-card glass-card">
            <p className="auth-eyebrow">A little more magic</p>
            <h1>Create your account</h1>
            <p className="auth-copy">Create your Surprisewala account to save your orders, addresses and receive special updates.</p>
            <AuthForm mode="signup" />
          </div>
        </section>
      </div>
    </main>
  );
}
