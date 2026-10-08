"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Search, Inbox, LoaderCircle } from "lucide-react";

export type Row = Record<string, unknown>;
export const entities = ["orders", "customers", "packages", "collections", "gallery", "reviews", "content", "media", "settings", "admins", "activity"] as const;
export type Entity = typeof entities[number];
export const labels: Record<Entity, string> = { orders: "Orders", customers: "Customers", packages: "Packages", collections: "Collections", gallery: "Gallery", reviews: "Reviews", content: "Website statistics", media: "Media library", settings: "Business settings", admins: "Admin users", activity: "Activity log" };
export const descriptions: Record<Entity, string> = {
  orders: "Who, when, and where. Keep every surprise on track.", customers: "Customer details and their complete order history.", packages: "Manage pricing, availability, inclusions, and package imagery.", collections: "Create collections and organize your packages without changing code.", gallery: "Choose the moments that appear in your public gallery.", reviews: "Review, publish, and feature customer feedback.", content: "Keep your business counters accurate. Ratings come from published reviews.", media: "Uploaded images, their file details, and where they are used.", settings: "The contact details and social links your customers use.", admins: "Manage access for your Surprisewala team.", activity: "A record of administrative changes and the people who made them.",
};
export const orderStatuses = ["new", "contacted", "confirmed", "preparing", "scheduled", "completed", "cancelled"];
export const paymentStatuses = ["pending", "paid", "partially_paid", "refunded", "failed"];
export function str(row: Row, key: string, fallback = "—") { const v = row[key]; return v === null || v === undefined || v === "" ? fallback : String(v); }
export function record(value: unknown): Row { return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {}; }
export function rows(value: unknown): Row[] { return Array.isArray(value) ? value.map(record) : []; }
export function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase()); }
export function money(value: unknown, currency = "LKR") { if (value === null || value === undefined || value === "") return "Request quote"; const n = Number(value); return Number.isFinite(n) ? new Intl.NumberFormat("en-LK", { style: "currency", currency, maximumFractionDigits: 0 }).format(n) : "—"; }
export function date(value: unknown, withTime = false) { if (!value) return "—"; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat("en-LK", { timeZone: "Asia/Colombo", day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } as const : {}) }).format(d); }
export async function api<T>(url: string, init?: RequestInit): Promise<T> { const response = await fetch(url, { cache: "no-store", ...init }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || data.message || (response.status === 401 ? "Your session has expired. Please sign in again." : "Unable to complete this request. Please try again.")); return data as T; }
export async function mutate(entity: Entity, action: string, id?: string, values?: Row) { return api<{ row?: Row }>(`/api/admin/${entity}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id, values }) }); }
export function Badge({ value }: { value: string }) { return <span className="ad-badge" data-status={value}>{title(value)}</span>; }
export function Notice({ error, success }: { error?: string; success?: string }) { return error ? <div className="ad-notice ad-notice--error" role="alert">{error}</div> : success ? <div className="ad-notice ad-notice--success" role="status">{success}</div> : null; }
export function Empty({ heading = "Nothing here yet", text = "Records will appear here when they are available." }: { heading?: string; text?: string }) { return <div className="ad-empty"><Inbox size={30} aria-hidden="true" /><h3>{heading}</h3><p>{text}</p></div>; }
export function Loading() { return <div className="ad-loading" role="status"><LoaderCircle className="ad-spin" size={22} />Loading records…</div>; }
export function useResource<T>(url: string) {
  const [data, setData] = useState<T>(); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [revision, setRevision] = useState(0);
  useEffect(() => { let current = true; const controller = new AbortController(); api<T>(url, { signal: controller.signal }).then(value => { if (current) { setData(value); setError(""); } }).catch(e => { if (current && e.name !== "AbortError") setError(e.message); }).finally(() => { if (current) setLoading(false); }); return () => { current = false; controller.abort(); }; }, [url, revision]);
  return { data, error, loading, refresh: () => { setLoading(true); setRevision(v => v + 1); } };
}
export function SearchField({ value, onChange, placeholder = "Search records" }: { value: string; onChange: (s: string) => void; placeholder?: string }) { return <label className="ad-search"><Search size={17} /><span className="ad-sr-only">{placeholder}</span><input type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></label>; }
export function Pagination({ page, count, pageSize, onChange }: { page: number; count: number; pageSize: number; onChange: (n: number) => void }) { const pages = Math.max(1, Math.ceil(count / pageSize)); return <div className="ad-pagination"><span>{count ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, count)} of ${count}` : "0 records"}</span><div><button className="ad-icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ArrowLeft size={17} /></button><span>Page {page} of {pages}</span><button className="ad-icon" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ArrowRight size={17} /></button></div></div>; }
export function Retry({ onClick }: { onClick: () => void }) { return <button className="ad-button ad-button--secondary" onClick={onClick}><RefreshCw size={16} />Retry</button>; }
