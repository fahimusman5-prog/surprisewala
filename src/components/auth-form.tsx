"use client";

import { useState } from "react";
import Link from "next/link";
import { Chrome, LoaderCircle, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthFormProps = { mode: "login" | "signup" };

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"error" | "success" | "">("");

  const getClient = () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setTone("error");
      setMessage("Membership is not configured yet. Add the Supabase environment variables to enable login.");
    }
    return supabase;
  };

  async function submitOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();

    if (isSignup) {
      console.info("Signup button clicked");
      console.info("Submitted signup email:", email);
    }

    setMessage("");
    setTone("");

    if (!email || (isSignup && (!fullName || !phone))) {
      setTone("error");
      setMessage("Please fill all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setTone("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getClient();
      if (!supabase) return;

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: isSignup,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: isSignup ? { full_name: fullName, phone } : undefined,
        },
      });

      if (isSignup) console.info("Supabase signup response:", data);

      if (error) {
        if (isSignup) console.error("Supabase signup error:", error);
        setTone("error");
        setMessage(error.message);
        return;
      }

      setTone("success");
      setMessage(
        isSignup
          ? "Account created successfully. Please check your email to continue."
          : `Check ${email} for your secure login link.`,
      );
    } catch (caughtError) {
      const errorMessage = caughtError instanceof Error
        ? caughtError.message
        : "Unable to contact Supabase. Please try again.";
      if (isSignup) console.error("Supabase signup error:", caughtError);
      setTone("error");
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle() {
    const supabase = getClient();
    if (!supabase) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setLoading(false); setTone("error"); setMessage(error.message); }
  }

  return (
    <>
      <form className="auth-form" onSubmit={submitOtp} noValidate>
        {isSignup && (
          <>
            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" autoComplete="name" required maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} />
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <button className="liquid-button" disabled={loading} type="submit">
          {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Mail size={18} />}
          {loading
            ? (isSignup ? "Creating account..." : "Sending login link...")
            : (isSignup ? "Create Account" : "Email me a login link")}
        </button>
      </form>

      <div className="auth-divider">or</div>
      <button className="liquid-button liquid-button--ghost w-full" disabled={loading} type="button" onClick={loginWithGoogle}>
        <Chrome size={18} /> Continue with Google
      </button>
      <p className="status-message" data-tone={tone} aria-live="polite" role={tone === "error" ? "alert" : "status"}>{message}</p>
      <p className="auth-meta">
        {isSignup ? <>Already a member? <Link href="/login">Log in</Link></> : <>New to Surprisewala? <Link href="/signup">Create an account</Link></>}
        <br />You can still browse and place orders without logging in.
      </p>
    </>
  );
}
