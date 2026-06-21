import type { Metadata } from "next";
import Script from "next/script";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const metadata: Metadata = {
  title: "Surprisewala | Premium Surprise Planner in Sri Lanka",
  description: "Plan birthdays, proposals, cakes, gifts, flowers and customized surprise packages with Surprisewala.",
  alternates: { canonical: "https://surprisewala.com/" },
  openGraph: {
    title: "Surprisewala | Premium Surprise Planner in Sri Lanka",
    description: "Plan birthdays, proposals, cakes, gifts, flowers and customized surprise packages with Surprisewala.",
    url: "https://surprisewala.com/",
    siteName: "Surprisewala",
    images: ["https://surprisewala.com/assets-1/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surprisewala | Premium Surprise Planner in Sri Lanka",
    description: "Plan birthdays, proposals, cakes, gifts, flowers and customized surprise packages with Surprisewala.",
    images: ["https://surprisewala.com/assets-1/logo.png"],
  },
};

function getStorefrontMarkup() {
  const html = readFileSync(join(process.cwd(), "public", "storefront.html"), "utf8");
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error("The storefront HTML is missing its body content.");
  return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

export default function HomePage() {
  return (
    <>
      <div className="storefront-root" dangerouslySetInnerHTML={{ __html: getStorefrontMarkup() }} />
      <Script src="/script.js" strategy="afterInteractive" />
      <Script src="/membership-home.js" strategy="afterInteractive" />
    </>
  );
}
