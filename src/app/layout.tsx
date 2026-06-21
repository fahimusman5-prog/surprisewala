import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Surprisewala", template: "%s | Surprisewala" },
  description: "Premium surprise planning and customer membership in Sri Lanka.",
  icons: { icon: "/assets-1/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
