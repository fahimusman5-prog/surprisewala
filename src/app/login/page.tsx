import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { MemberHeader } from "@/components/member-header";
import { getSafeInternalPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Member Login" };

type LoginSearchParams = {
  error?: string;
  next?: string;
  password_reset?: string;
  registered?: string;
};

function getLoginNotice({ error, password_reset: passwordReset, registered }: LoginSearchParams) {
  if (registered === "true") {
    return {
      message: "Your account was created successfully. Please log in with your email and password.",
      tone: "success" as const,
    };
  }
  if (registered === "confirm_email") {
    return {
      message: "Your account was created. Please confirm your email before logging in.",
      tone: "success" as const,
    };
  }
  if (passwordReset === "true") {
    return {
      message: "Your password was reset successfully. Please log in with your new password.",
      tone: "success" as const,
    };
  }
  if (error === "auth_callback") {
    return {
      message: "This authentication request is invalid or has expired. Please try again.",
      tone: "error" as const,
    };
  }
  if (error === "auth_unavailable") {
    return {
      message: "We could not verify your session. Please log in again.",
      tone: "error" as const,
    };
  }
  return {};
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<LoginSearchParams> }) {
  const params = await searchParams;
  const notice = getLoginNotice(params);
  return (
    <main className="member-shell">
      <div className="member-container">
        <MemberHeader />
        <section className="auth-wrap">
          <div className="auth-card glass-card">
            <p className="auth-eyebrow">Surprisewala membership</p>
            <h1>Login to Get Special Updates</h1>
            <p className="auth-copy">Access your order history, save your details, receive exclusive surprise offers and get updates from Surprisewala.</p>
            <AuthForm
              mode="login"
              nextPath={getSafeInternalPath(params.next)}
              initialMessage={notice.message}
              initialTone={notice.tone}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
