import type { Metadata } from "next";
import Script from "next/script";
import { getStorefrontMarkup, loadStorefrontData } from "@/lib/storefront";

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const data = await loadStorefrontData();
  return (
    <>
      <div className="storefront-root" dangerouslySetInnerHTML={{ __html: getStorefrontMarkup(data) }} />
      <Script src="/script.js?v=legal-payhere-20261008" strategy="afterInteractive" />
      <Script src="/membership-home.js" strategy="afterInteractive" />
    </>
  );
}
