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
    const supabase = getClient();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    setLoading(true); setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: isSignup,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: isSignup ? { full_name: fullName, phone } : undefined,
      },
    });
    setLoading(false);
    if (error) { setTone("error"); setMessage(error.message); return; }
    setTone("success");
    setMessage(`Check ${email} for your secure login link.`);
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
      <form className="auth-form" onSubmit={submitOtp}>
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
          {isSignup ? "Create account with email" : "Email me a login link"}
        </button>
      </form>

      <div className="auth-divider">or</div>
      <button className="liquid-button liquid-button--ghost w-full" disabled={loading} type="button" onClick={loginWithGoogle}>
        <Chrome size={18} /> Continue with Google
      </button>
      <p className="status-message" data-tone={tone} aria-live="polite">{message}</p>
      <p className="auth-meta">
        {isSignup ? <>Already a member? <Link href="/login">Log in</Link></> : <>New to Surprisewala? <Link href="/signup">Create an account</Link></>}
        <br />You can still browse and place orders without logging in.
      </p>
    </>
  );
}
