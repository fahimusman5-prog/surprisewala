"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validPassword = (value: string) => value.length >= 10 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
const recoveryErrorMessage = (error: Error | null) => {
  if (error?.message.toLowerCase().includes("rate limit")) {
    return "Please wait before requesting another email. For security, Surprisewala limits email sends.";
  }

  return "We could not send a reset email. Please try again later.";
};

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const email = String(new FormData(event.currentTarget).get("email") || "").trim().toLowerCase();
    if (!validEmail.test(email)) return setMessage("Please enter a valid email address.");
    const supabase = getSupabaseBrowserClient(); if (!supabase) return setMessage("Membership is not configured yet. Please contact Surprisewala.");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password` });
    setBusy(false); setMessage(error ? recoveryErrorMessage(error) : "If an account is eligible for recovery, we have sent instructions to that email.");
  }
  return <form className="auth-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required /></div><button className="liquid-button" disabled={busy}>{busy && <LoaderCircle size={18} className="animate-spin" />}{busy ? "Sending..." : "Send reset link"}</button><p className="status-message" data-tone={message.includes("could not") || message.includes("valid") ? "error" : "success"} aria-live="polite">{message}</p><p className="auth-meta"><Link href="/login">Back to login</Link></p></form>;
}

export function ResetPasswordForm() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [show, setShow] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget); const password = String(form.get("password") || ""); const confirm = String(form.get("confirmPassword") || "");
    if (!validPassword(password)) return setMessage("Use at least 10 characters with an uppercase letter, lowercase letter and number.");
    if (password !== confirm) return setMessage("Passwords do not match.");
    const supabase = getSupabaseBrowserClient(); if (!supabase) return setMessage("Membership is not configured yet. Please contact Surprisewala.");
    setBusy(true); setMessage(""); const { error } = await supabase.auth.updateUser({ password }); setBusy(false);
    if (error) return setMessage("This reset link is invalid or has expired. Request a new one.");
    window.location.assign("/dashboard");
  }
  return <form className="auth-form" onSubmit={submit} noValidate><div className="field"><label htmlFor="password">New password</label><div className="password-field"><input id="password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required /><button className="password-toggle" type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div><div className="field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type={show ? "text" : "password"} autoComplete="new-password" required /></div><button className="liquid-button" disabled={busy}>{busy && <LoaderCircle size={18} className="animate-spin" />}{busy ? "Updating..." : "Set new password"}</button><p className="status-message" data-tone={message ? "error" : ""} aria-live="polite">{message}</p></form>;
}
