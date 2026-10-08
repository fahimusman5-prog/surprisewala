import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getStorefrontMarkup, loadStorefrontData } from "@/lib/storefront";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadStorefrontData();
  const collection = data.collections.find((item) => item.slug === slug);
  return {
    title: collection ? `${collection.name} | Surprisewala` : "Collections | Surprisewala",
    description: collection?.short_description || "Explore Surprisewala surprise packages.",
    alternates: { canonical: `https://surprisewala.com/collections/${encodeURIComponent(slug)}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = await loadStorefrontData();
  if (data.source !== "unavailable" && !data.collections.some((item) => item.slug === slug)) notFound();
  return (
    <>
      <div className="storefront-root" dangerouslySetInnerHTML={{ __html: getStorefrontMarkup(data, slug) }} />
      <Script src="/script.js?v=legal-payhere-20261008" strategy="afterInteractive" />
      <Script src="/membership-home.js" strategy="afterInteractive" />
    </>
  );
}
