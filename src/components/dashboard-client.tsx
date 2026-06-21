"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, LogOut, MapPin, Package, Pencil, Plus, UserRound, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Section = "orders" | "addresses" | "profile";
type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string } | null;
type Order = { id: string; order_type: string; items: unknown; total_amount: number; status: string; customer_notes: string | null; created_at: string };
type Address = { id: string; label: string; full_name: string; phone: string; address_line: string; city: string; country: string; is_default: boolean; created_at: string };
type UserData = { id: string; email: string; metadata: Record<string, unknown> };

const currency = new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" });

function itemSummary(items: unknown) {
  if (!Array.isArray(items)) return "Order details saved";
  return items.map((item) => {
    const value = item as { name?: string; quantity?: number };
    return `${value.name || "Item"} × ${value.quantity || 1}`;
  }).join(", ");
}

export function DashboardClient({ user, initialProfile, initialOrders, initialAddresses, initialSection = "orders" }: {
  user: UserData; initialProfile: Profile; initialOrders: Order[]; initialAddresses: Address[]; initialSection?: Section;
}) {
  const router = useRouter();
  const [section, setSection] = useState<Section>(initialSection);
  const [profile, setProfile] = useState(initialProfile);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressDialog, setAddressDialog] = useState<Address | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const displayName = profile?.full_name || String(user.metadata.full_name || "there");

  function selectSection(next: Section) {
    setSection(next);
    history.replaceState(null, "", next === "orders" ? "/dashboard" : `/dashboard/${next}`);
  }

  async function logout() {
    setBusy(true);
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/"); router.refresh();
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const form = new FormData(event.currentTarget); setBusy(true); setMessage("");
    const changes = { id: user.id, email: user.email, full_name: String(form.get("fullName") || "").trim(), phone: String(form.get("phone") || "").trim() };
    const { data, error } = await supabase.from("profiles").upsert(changes, { onConflict: "id" }).select().single();
    setBusy(false); setMessage(error ? error.message : "Profile updated."); if (data) setProfile(data as Profile);
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const form = new FormData(event.currentTarget); setBusy(true); setMessage("");
    const values = { user_id: user.id, label: String(form.get("label") || "Home"), full_name: String(form.get("fullName") || ""), phone: String(form.get("phone") || ""), address_line: String(form.get("addressLine") || ""), city: String(form.get("city") || ""), country: String(form.get("country") || "Sri Lanka"), is_default: form.get("isDefault") === "on" };
    const current = addressDialog === "new" ? null : addressDialog;
    const query = current ? supabase.from("addresses").update(values).eq("id", current.id) : supabase.from("addresses").insert(values);
    const { data, error } = await query.select().single();
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    if (values.is_default) setAddresses((list) => list.map((address) => ({ ...address, is_default: false })));
    setAddresses((list) => current ? list.map((address) => address.id === current.id ? data as Address : address) : [data as Address, ...list]);
    setAddressDialog(null); setMessage("Address saved.");
  }

  async function deleteAddress(id: string) {
    if (!window.confirm("Delete this saved address?")) return;
    const { error } = await getSupabaseBrowserClient()!.from("addresses").delete().eq("id", id);
    if (error) setMessage(error.message); else { setAddresses((list) => list.filter((address) => address.id !== id)); setMessage("Address deleted."); }
  }

  async function makeDefault(id: string) {
    const { error } = await getSupabaseBrowserClient()!.from("addresses").update({ is_default: true }).eq("id", id);
    if (error) setMessage(error.message); else setAddresses((list) => list.map((address) => ({ ...address, is_default: address.id === id })));
  }

  return (
    <main className="dashboard-main">
      <section className="dashboard-hero glass-card">
        <div><p className="auth-eyebrow">Your happiness hub</p><h1 className="dashboard-title">Welcome, {displayName}</h1><p>Manage your surprises, orders and saved details in one place.</p></div>
        <Link className="liquid-button liquid-button--ghost" href="/#packages"><Home size={18} /> Browse surprises</Link>
      </section>
      <div className="dashboard-grid">
        <nav className="dashboard-nav glass-card" aria-label="Customer dashboard">
          <button className={section === "orders" ? "is-active" : ""} onClick={() => selectSection("orders")}><Package size={19} /> Orders</button>
          <button className={section === "addresses" ? "is-active" : ""} onClick={() => selectSection("addresses")}><MapPin size={19} /> Addresses</button>
          <button className={section === "profile" ? "is-active" : ""} onClick={() => selectSection("profile")}><UserRound size={19} /> Profile</button>
          <button onClick={logout} disabled={busy}><LogOut size={19} /> Logout</button>
        </nav>
        <section className="dashboard-content glass-card" aria-live="polite">
          {section === "orders" && <><div className="section-heading"><h2>Order history</h2><span className="pill">{initialOrders.length} orders</span></div>{initialOrders.length === 0 ? <div className="empty-state"><Package size={32} className="mx-auto mb-3" /><strong>No orders yet.</strong><p>Orders placed while logged in will appear here automatically.</p></div> : <div className="order-list">{initialOrders.map((order) => <article className="order-card" key={order.id}><div className="order-card__top"><h3>Order {order.id.slice(0, 8).toUpperCase()}</h3><span className="pill">{order.status}</span></div><p>{itemSummary(order.items)}</p><p>{date.format(new Date(order.created_at))} · {order.total_amount > 0 ? currency.format(order.total_amount) : "Customized total"}</p></article>)}</div>}</>}
          {section === "addresses" && <><div className="section-heading"><h2>Saved addresses</h2><button className="liquid-button" onClick={() => setAddressDialog("new")}><Plus size={17} /> Add address</button></div>{addresses.length === 0 ? <div className="empty-state"><MapPin size={32} className="mx-auto mb-3" /><strong>No saved addresses yet.</strong></div> : <div className="address-list">{addresses.map((address) => <article className="address-card" key={address.id}><div className="address-card__top"><h3>{address.label}</h3>{address.is_default && <span className="pill">Default</span>}</div><p>{address.full_name} · {address.phone}<br />{address.address_line}, {address.city}, {address.country}</p><div className="card-actions"><button className="text-button" onClick={() => setAddressDialog(address)}><Pencil size={15} className="inline" /> Edit</button>{!address.is_default && <button className="text-button" onClick={() => makeDefault(address.id)}>Set default</button>}<button className="text-button text-button--danger" onClick={() => deleteAddress(address.id)}>Delete</button></div></article>)}</div>}</>}
          {section === "profile" && <><div className="section-heading"><h2>Your profile</h2></div><form className="auth-form" onSubmit={saveProfile}><div className="field"><label htmlFor="profileName">Full name</label><input id="profileName" name="fullName" defaultValue={profile?.full_name || String(user.metadata.full_name || "")} required /></div><div className="field"><label htmlFor="profilePhone">Phone number</label><input id="profilePhone" name="phone" type="tel" defaultValue={profile?.phone || String(user.metadata.phone || "")} /></div><div className="field"><label htmlFor="profileEmail">Email address</label><input id="profileEmail" value={user.email} readOnly aria-readonly="true" /></div><button className="liquid-button" disabled={busy}>Save profile</button></form></>}
          <p className="status-message" aria-live="polite">{message}</p>
        </section>
      </div>
      {addressDialog && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setAddressDialog(null); }}><div className="dialog-card glass-card" role="dialog" aria-modal="true" aria-labelledby="address-title"><div className="dialog-titlebar"><h2 id="address-title">{addressDialog === "new" ? "Add address" : "Edit address"}</h2><button className="icon-button" onClick={() => setAddressDialog(null)} aria-label="Close"><X /></button></div><AddressForm address={addressDialog === "new" ? null : addressDialog} busy={busy} onSubmit={saveAddress} /></div></div>}
    </main>
  );
}

function AddressForm({ address, busy, onSubmit }: { address: Address | null; busy: boolean; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form className="form-grid" onSubmit={onSubmit}><div className="field"><label htmlFor="label">Label</label><input id="label" name="label" defaultValue={address?.label || "Home"} required /></div><div className="field"><label htmlFor="addressName">Full name</label><input id="addressName" name="fullName" defaultValue={address?.full_name || ""} autoComplete="name" required /></div><div className="field"><label htmlFor="addressPhone">Phone</label><input id="addressPhone" name="phone" type="tel" defaultValue={address?.phone || ""} autoComplete="tel" required /></div><div className="field"><label htmlFor="city">City</label><input id="city" name="city" defaultValue={address?.city || ""} autoComplete="address-level2" required /></div><div className="field field--full"><label htmlFor="addressLine">Address</label><textarea id="addressLine" name="addressLine" defaultValue={address?.address_line || ""} autoComplete="street-address" required /></div><div className="field"><label htmlFor="country">Country</label><input id="country" name="country" defaultValue={address?.country || "Sri Lanka"} autoComplete="country-name" required /></div><label className="flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" name="isDefault" defaultChecked={address?.is_default || false} className="size-5 accent-teal-300" /> Set as default</label><button className="liquid-button field--full" disabled={busy}>{busy ? "Saving…" : "Save address"}</button></form>;
}
