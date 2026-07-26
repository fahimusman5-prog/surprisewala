"use client";

import Link from "next/link";
import { useState } from "react";
import { Chrome, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { getFriendlyAuthError } from "@/lib/auth/messages";
import { getSafeInternalPath } from "@/lib/auth/redirect";
import {
  isStrongPassword,
  isValidEmail,
  isValidFullName,
  isValidPhone,
  normalizeEmail,
  normalizeFullName,
  normalizePhone,
  passwordRequirement,
} from "@/lib/auth/validation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
  initialMessage?: string;
  initialTone?: "error" | "success";
};

export function AuthForm({
  mode,
  nextPath = "/dashboard",
  initialMessage = "",
  initialTone,
}: AuthFormProps) {
  const isSignup = mode === "signup";
  const safeNext = getSafeInternalPath(nextPath);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [tone, setTone] = useState<"error" | "success" | "">(initialTone ?? "");
  const [showPassword, setShowPassword] = useState(false);

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  }

  function registeredLoginPath(requiresConfirmation: boolean) {
    const params = new URLSearchParams({
      registered: requiresConfirmation ? "confirm_email" : "true",
      next: safeNext,
    });
    return `/login?${params.toString()}`;
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
    if (loading || completed) return;
    const form = new FormData(event.currentTarget);
    const email = normalizeEmail(String(form.get("email") || ""));
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const fullName = normalizeFullName(String(form.get("fullName") || ""));
    const phone = normalizePhone(String(form.get("phone") || ""));

    setMessage("");
    setTone("");
    if (isSignup && !fullName) return void (setTone("error"), setMessage("Please enter your full name."));
    if (isSignup && !isValidFullName(fullName)) return void (setTone("error"), setMessage("Full name must contain at least 2 characters."));
    if (isSignup && !phone) return void (setTone("error"), setMessage("Please enter a valid phone number."));
    if (isSignup && !isValidPhone(phone)) return void (setTone("error"), setMessage("Please enter a valid Sri Lankan or international phone number."));
    if (!isValidEmail(email)) return void (setTone("error"), setMessage("Please enter a valid email address."));
    if (!password) return void (setTone("error"), setMessage("Please enter your password."));
    if (isSignup && !isStrongPassword(password)) return void (setTone("error"), setMessage(passwordRequirement));
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
        if (data.user?.identities?.length === 0) {
          setTone("error");
          setMessage("An account already exists with this email. Please log in or reset your password.");
          return;
        }

        const requiresConfirmation = !data.session;
        if (data.session) await supabase.auth.signOut({ scope: "local" });

        setCompleted(true);
        setTone("success");
        setMessage(
          requiresConfirmation
            ? "Your account was created. Please confirm your email before logging in."
            : "Your account was created successfully. You can log in now.",
        );
        window.setTimeout(
          () => window.location.assign(registeredLoginPath(requiresConfirmation)),
          1200,
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign(safeNext);
      }
    } catch (error) {
      setTone("error");
      setMessage(getFriendlyAuthError(error, isSignup ? "signup" : "login"));
    } finally {
      setLoading(false);
    }
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
      <div className="field"><label htmlFor="password">Password</label><div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{isSignup && <small className="field-help">{passwordRequirement}</small>}</div>
      {isSignup && <div className="field"><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required /></div>}
      <button className="liquid-button" disabled={loading || completed} type="submit">{loading || completed ? <LoaderCircle size={18} className="animate-spin" /> : isSignup ? <LockKeyhole size={18} /> : <Mail size={18} />}{completed ? "Account created" : loading ? (isSignup ? "Creating account..." : "Logging in...") : (isSignup ? "Create Account" : "Log in")}</button>
    </form>
    {!isSignup && <p className="auth-meta auth-meta--left"><Link href="/forgot-password">Forgot your password?</Link></p>}
    <div className="auth-divider">or</div>
    <button className="liquid-button liquid-button--ghost w-full" disabled={loading || completed} type="button" onClick={loginWithGoogle}><Chrome size={18} /> Continue with Google</button>
    <p className="status-message" data-tone={tone} aria-live="polite" role={tone === "error" ? "alert" : "status"}>{message}</p>
    <p className="auth-meta">{isSignup ? <>Already a member? <Link href={`/login?next=${encodeURIComponent(safeNext)}`}>Log in</Link></> : <>New to Surprisewala? <Link href={`/signup?next=${encodeURIComponent(safeNext)}`}>Create an account</Link></>}<br />You can still browse and place orders without logging in.</p>
  </>;
}
