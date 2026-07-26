"use client";

import Link from "next/link";
import { useState } from "react";
import { Chrome, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { getSafeInternalPath } from "@/lib/auth/redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = { mode: "login" | "signup"; nextPath?: string };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s().-]{6,38}$/;
const passwordMessage = "Use at least 10 characters with an uppercase letter, lowercase letter and number.";

function isStrongPassword(password: string) {
  return password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Incorrect email or password.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before logging in. You can resend the confirmation below.";
  if (lower.includes("already registered") || lower.includes("already been registered")) return "If this email can create an account, we have sent the next steps to it.";
  if (lower.includes("rate limit")) return "Please wait a moment before trying again.";
  return "We could not complete that request. Please try again.";
}

export function AuthForm({ mode, nextPath = "/dashboard" }: AuthFormProps) {
  const isSignup = mode === "signup";
  const safeNext = getSafeInternalPath(nextPath);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  }

  function accountCreatedPath() {
    return `${safeNext}${safeNext.includes("?") ? "&" : "?"}account_created=1`;
  }

  function getClient() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setTone("error");
      setMessage("Membership is not configured yet. Please contact Surprisewala.");
    }
    return supabase;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();

    setMessage(""); setTone(""); setEmailForResend(email);
    if (!emailPattern.test(email)) return void (setTone("error"), setMessage("Please enter a valid email address."));
    if (!password) return void (setTone("error"), setMessage("Enter your password."));
    if (isSignup && (!fullName || !phone)) return void (setTone("error"), setMessage("Please fill all required fields."));
    if (isSignup && !phonePattern.test(phone)) return void (setTone("error"), setMessage("Please enter a valid Sri Lankan or international phone number."));
    if (isSignup && !isStrongPassword(password)) return void (setTone("error"), setMessage(passwordMessage));
    if (isSignup && password !== confirmPassword) return void (setTone("error"), setMessage("Passwords do not match."));

    setLoading(true);
    try {
      const supabase = getClient();
      if (!supabase) return;
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl(), data: { full_name: fullName.slice(0, 160), phone: phone.slice(0, 40) } },
        });
        if (error) throw error;
        if (data.session) window.location.assign(accountCreatedPath());
        else { setTone("success"); setMessage("Check your email to confirm your account, then return here to log in."); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign(safeNext);
      }
    } catch (error) {
      setTone("error"); setMessage(friendlyAuthError(error instanceof Error ? error.message : ""));
    } finally { setLoading(false); }
  }

  async function resendConfirmation() {
    if (!emailForResend || loading) return;
    const supabase = getClient(); if (!supabase) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.resend({ type: "signup", email: emailForResend, options: { emailRedirectTo: callbackUrl() } });
    setLoading(false);
    setTone(error ? "error" : "success");
    setMessage(error ? friendlyAuthError(error.message) : "If this account needs confirmation, a fresh email has been sent.");
  }

  async function loginWithGoogle() {
    const supabase = getClient(); if (!supabase || loading) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl() } });
    if (error) { setLoading(false); setTone("error"); setMessage("Google login is unavailable right now. Please use email and password."); }
  }

  return <>
    <form className="auth-form" onSubmit={submit} noValidate>
      {isSignup && <><div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" autoComplete="name" required maxLength={160} /></div><div className="field"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} inputMode="tel" /></div></>}
      <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{isSignup && <small className="field-help">{passwordMessage}</small>}</div>
      {isSignup && <div className="field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required /></div>}
      <button className="liquid-button" disabled={loading} type="submit">{loading ? <LoaderCircle size={18} className="animate-spin" /> : isSignup ? <LockKeyhole size={18} /> : <Mail size={18} />}{loading ? (isSignup ? "Creating account..." : "Logging in...") : (isSignup ? "Create Account" : "Log in")}</button>
    </form>
    {!isSignup && <p className="auth-meta auth-meta--left"><Link href="/forgot-password">Forgot your password?</Link></p>}
    <div className="auth-divider">or</div>
    <button className="liquid-button liquid-button--ghost w-full" disabled={loading} type="button" onClick={loginWithGoogle}><Chrome size={18} /> Continue with Google</button>
    <p className="status-message" data-tone={tone} aria-live="polite" role={tone === "error" ? "alert" : "status"}>{message}</p>
    {tone === "error" && emailForResend && <button type="button" className="text-button" onClick={resendConfirmation} disabled={loading}>Resend confirmation email</button>}
    <p className="auth-meta">{isSignup ? <>Already a member? <Link href={`/login?next=${encodeURIComponent(safeNext)}`}>Log in</Link></> : <>New to Surprisewala? <Link href={`/signup?next=${encodeURIComponent(safeNext)}`}>Create an account</Link></>}<br />You can still browse and place orders without logging in.</p>
  </>;
}
