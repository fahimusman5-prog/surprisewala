import type { Metadata } from "next";
import { MemberHeader } from "@/components/member-header";
import { ResetPasswordForm } from "@/components/password-recovery-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return <main className="member-shell"><div className="member-container"><MemberHeader /><section className="auth-wrap"><div className="auth-card glass-card"><p className="auth-eyebrow">Account recovery</p><h1>Choose a new password</h1><p className="auth-copy">Choose a strong password that you do not use elsewhere.</p><ResetPasswordForm /></div></section></div></main>;
}
