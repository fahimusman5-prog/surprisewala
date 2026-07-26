import type { Metadata } from "next";
import { MemberHeader } from "@/components/member-header";
import { ForgotPasswordForm } from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <main className="member-shell"><div className="member-container"><MemberHeader /><section className="auth-wrap"><div className="auth-card glass-card"><p className="auth-eyebrow">Account recovery</p><h1>Reset your password</h1><p className="auth-copy">Enter your email and we’ll send a secure reset link if an eligible account exists.</p><ForgotPasswordForm /></div></section></div></main>;
}
