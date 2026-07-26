import Link from "next/link";
export default function AuthCodeErrorPage() {
  return <main className="member-shell grid place-items-center p-6"><div className="glass-card max-w-lg p-8 text-center"><h1 className="text-3xl">We could not verify this request</h1><p className="my-4 text-[var(--sw-muted)]">The authentication or recovery request may be invalid or expired. Please return to login and try again.</p><Link className="liquid-button" href="/login">Return to login</Link></div></main>;
}
