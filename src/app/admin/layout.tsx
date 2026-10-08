import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: { default: "Admin | Surprisewala", template: "%s | Surprisewala Admin" }, robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="ad-root">{children}</div>; }
