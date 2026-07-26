"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { getFriendlyAuthError } from "@/lib/auth/messages";
import {
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  passwordRequirement,
} from "@/lib/auth/validation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "">("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const email = normalizeEmail(String(new FormData(event.currentTarget).get("email") || ""));
    if (!isValidEmail(email)) {
      setTone("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setTone("error");
      setMessage("Membership is not configured yet. Please contact Surprisewala.");
      return;
    }

    setBusy(true);
    setMessage("");
    setTone("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
    });
    setBusy(false);
    setTone(error ? "error" : "success");
    setMessage(
      error
        ? getFriendlyAuthError(error, "forgot-password")
        : "If an account is eligible for recovery, we have sent instructions to that email.",
    );
  }

  return <form className="auth-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required /></div><button className="liquid-button" disabled={busy}>{busy && <LoaderCircle size={18} className="animate-spin" />}{busy ? "Sending..." : "Send reset link"}</button><p className="status-message" data-tone={tone} role={tone === "error" ? "alert" : "status"} aria-live="polite">{message}</p><p className="auth-meta"><Link href="/login">Back to login</Link></p></form>;
}

export function ResetPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "">("");
  const [show, setShow] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || completed) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirmPassword") || "");
    if (!isStrongPassword(password)) {
      setTone("error");
      setMessage(passwordRequirement);
      return;
    }
    if (password !== confirm) {
      setTone("error");
      setMessage("Passwords do not match.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setTone("error");
      setMessage("Membership is not configured yet. Please contact Surprisewala.");
      return;
    }

    setBusy(true);
    setMessage("");
    setTone("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      setTone("error");
      setMessage(getFriendlyAuthError(error, "reset-password"));
      return;
    }

    await supabase.auth.signOut({ scope: "local" });
    setBusy(false);
    setCompleted(true);
    setTone("success");
    setMessage("Your password was reset successfully. You can log in now.");
    window.setTimeout(() => window.location.assign("/login?password_reset=true"), 1000);
  }

  return <form className="auth-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="password">New password</label><div className="password-field"><input id="password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} /><button className="password-toggle" type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><small className="field-help">{passwordRequirement}</small></div><div className="field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type={show ? "text" : "password"} autoComplete="new-password" required /></div><button className="liquid-button" disabled={busy || completed}>{busy && <LoaderCircle size={18} className="animate-spin" />}{completed ? "Password reset" : busy ? "Updating..." : "Set new password"}</button><p className="status-message" data-tone={tone} role={tone === "error" ? "alert" : "status"} aria-live="polite">{message}</p></form>;
}
