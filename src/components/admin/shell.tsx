"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, UsersRound, Gift, Layers3, Images, Star, ChartNoAxesCombined, FolderOpen, Settings2, ShieldCheck, History, Menu, X, LogOut, ArrowUpRight, ChevronDown } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Notice } from "./shared";

type Admin = { id: string; display_name: string; email: string; role: string; active: boolean };
const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/orders", label: "Orders", icon: CalendarDays }, { href: "/admin/customers", label: "Customers", icon: UsersRound },
  { href: "/admin/packages", label: "Packages", icon: Gift }, { href: "/admin/collections", label: "Collections", icon: Layers3 }, { href: "/admin/gallery", label: "Gallery", icon: Images }, { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/content", label: "Statistics", icon: ChartNoAxesCombined }, { href: "/admin/media", label: "Media library", icon: FolderOpen }, { href: "/admin/settings", label: "Settings", icon: Settings2 }, { href: "/admin/admins", label: "Admin users", icon: ShieldCheck }, { href: "/admin/activity", label: "Activity log", icon: History },
];
const editorPaths = new Set(["/admin", "/admin/packages", "/admin/collections", "/admin/gallery", "/admin/reviews", "/admin/media"]);
export function AdminShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [loggingOut, setLoggingOut] = useState(false); const [error, setError] = useState("");
  const allowed = navigation.filter(item => admin.role === "super_admin" || (admin.role === "editor" ? editorPaths.has(item.href) : !["/admin/admins", "/admin/activity"].includes(item.href)));
  const page = navigation.find(item => item.href !== "/admin" && pathname.startsWith(item.href))?.label || (pathname.includes("profile") ? "Your profile" : "Dashboard");
  async function logout() { setLoggingOut(true); setError(""); try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Unable to connect. Please try again."); const { error } = await client.auth.signOut(); if (error) throw error; router.replace("/admin/login"); router.refresh(); } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign out."); setLoggingOut(false); } }
  return <div className="ad-shell"><a className="ad-skip" href="#admin-main">Skip to content</a>{open && <button className="ad-sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside className={`ad-sidebar ${open ? "is-open" : ""}`}><div className="ad-brand"><Link href="/admin" onClick={() => setOpen(false)}><img src="/assets-1/logo.png" alt="Surprisewala" /><span>Business console</span></Link><button className="ad-icon ad-mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="ad-nav-label">Workspace</div><nav aria-label="Admin navigation">{allowed.map(item => { const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><item.icon size={18} strokeWidth={1.75} /><span>{item.label}</span>{active && <span className="ad-nav-dot" />}</Link>; })}</nav>
      <div className="ad-sidebar-bottom"><Link className="ad-storefront" href="/" target="_blank" rel="noopener noreferrer">View website <ArrowUpRight size={16} /></Link><button className="ad-logout" disabled={loggingOut} onClick={logout}><LogOut size={17} />{loggingOut ? "Signing out…" : "Sign out"}</button><span className="ad-version">Surprisewala · Team workspace</span></div></aside>
    <div className="ad-workspace"><header className="ad-topbar"><div className="ad-topbar-heading"><button className="ad-icon ad-menu-button" onClick={() => setOpen(!open)} aria-label="Open navigation" aria-expanded={open}><Menu size={21} /></button><span className="ad-breadcrumb">Workspace <span>/</span> <strong>{page}</strong></span></div><Link className="ad-profile-link" href="/admin/profile"><span className="ad-avatar">{(admin.display_name || admin.email || "A").slice(0, 1).toUpperCase()}</span><span className="ad-profile-text"><strong>{admin.display_name || "Team member"}</strong><small>{admin.role.replaceAll("_", " ")}</small></span><ChevronDown size={15} /></Link></header><main className="ad-main" id="admin-main"><Notice error={error} />{children}</main><footer className="ad-footer">Built for every unforgettable moment.<span>Surprisewala</span></footer></div>
  </div>;
}
