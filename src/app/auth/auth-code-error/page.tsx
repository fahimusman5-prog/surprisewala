import Link from "next/link";
export default function AuthCodeErrorPage() {
  return <main className="member-shell grid place-items-center p-6"><div className="glass-card max-w-lg p-8 text-center"><h1 className="text-3xl">That login link didn’t work</h1><p className="my-4 text-[var(--sw-muted)]">It may have expired or already been used. Request a fresh secure link and try again.</p><Link className="liquid-button" href="/login">Return to login</Link></div></main>;
}
