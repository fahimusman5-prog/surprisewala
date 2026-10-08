import { readFileSync } from "node:fs";
import { join } from "node:path";
import { business } from "@/lib/legal";
import seed from "@/data/storefront-seed.json";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderMode = "cart" | "enquiry" | "cake";
export type StorefrontPackage = {
  id: string; slug: string; name: string; badge: string | null; description: string | null;
  price: number | null; price_note: string | null; main_image: string | null;
  video_url: string | null; video_orientation: string | null; order_mode: OrderMode;
  active: boolean; featured: boolean; display_order: number; archived_at: string | null;
};
export type StorefrontCollection = {
  id: string; name: string; slug: string; short_description: string | null;
  cover_image: string | null; active: boolean; featured: boolean; display_order: number;
  archived_at: string | null;
};
export type StorefrontReview = {
  id: string; customer_name: string; review: string; rating: number | null;
  customer_image: string | null; package_id: string | null; published: boolean;
  featured: boolean; display_order: number;
};
export type StorefrontData = {
  source: "legacy" | "managed" | "unavailable";
  message: string | null;
  packages: StorefrontPackage[];
  collections: StorefrontCollection[];
  package_collections: { package_id: string; collection_id: string }[];
  package_items: { id: string; package_id: string; label: string; display_order: number }[];
  package_images: { id: string; package_id: string; image_path: string; alt_text: string | null; display_order: number }[];
  gallery_items: { id: string; image_path: string; media_type: string; title: string | null; caption: string | null; active: boolean; featured: boolean; display_order: number; archived_at: string | null }[];
  reviews: StorefrontReview[];
  site_statistics: { id: string; key: string; label: string; value: number; suffix: string | null; active: boolean; display_order: number }[];
  site_settings: { key: string; value: string }[];
};

export function legacyStorefrontData(): StorefrontData {
  return {
    ...seed,
    packages: seed.packages as StorefrontPackage[],
    // The migration queues these existing testimonials for verification. During the
    // explicitly disabled CMS transition, preserve the current public presentation.
    reviews: seed.reviews.map((review) => ({ ...review, published: true })),
    source: "legacy", message: null,
  };
}

function unavailable(message: string): StorefrontData {
  return { source: "unavailable", message, packages: [], collections: [], package_collections: [], package_items: [], package_images: [], gallery_items: [], reviews: [], site_statistics: [], site_settings: [] };
}

export async function loadStorefrontData(): Promise<StorefrontData> {
  // One deployment gate prevents an unverified or partially applied migration
  // from changing the working public site. Routine CMS edits need no code change.
  if (process.env.SURPRISEWALA_CMS_ENABLED !== "true") return legacyStorefrontData();
  const supabase = await getSupabaseServerClient();
  if (!supabase) return unavailable("Our catalog is temporarily unavailable. Please try again shortly.");
  const setting = await supabase.from("site_settings").select("key,value").eq("key", "cms_enabled").maybeSingle();
  if (setting.error) {
    return unavailable("Our catalog is temporarily unavailable. Please try again shortly.");
  }
  if (setting.data?.value !== "true") return unavailable("Our managed catalog is being prepared. Please try again shortly.");
  const results = await Promise.all([
    supabase.from("packages").select("id,slug,name,badge,description,price,price_note,main_image,video_url,video_orientation,order_mode,active,featured,display_order,archived_at").eq("active", true).is("archived_at", null).order("display_order"),
    supabase.from("collections").select("id,name,slug,short_description,cover_image,active,featured,display_order,archived_at").eq("active", true).is("archived_at", null).order("display_order"),
    supabase.from("package_collections").select("package_id,collection_id"),
    supabase.from("package_items").select("id,package_id,label,display_order").order("display_order"),
    supabase.from("package_images").select("id,package_id,image_path,alt_text,display_order").order("display_order"),
    supabase.from("gallery_items").select("id,image_path,media_type,title,caption,active,featured,display_order,archived_at").eq("active", true).is("archived_at", null).order("display_order"),
    supabase.from("reviews").select("id,customer_name,review,rating,customer_image,package_id,published,featured,display_order").eq("published", true).order("display_order"),
    supabase.from("site_statistics").select("id,key,label,value,suffix,active,display_order").eq("active", true).order("display_order"),
    supabase.from("site_settings").select("key,value").in("key", ["phone", "whatsapp", "instagram", "facebook", "tiktok", "google_review_url", "cms_enabled"]),
  ]);
  if (results.some((result) => result.error)) return unavailable("Our catalog is temporarily unavailable. Please try again shortly.");
  const [packages, collections, package_collections, package_items, package_images, gallery_items, reviews, site_statistics, site_settings] = results.map((result) => result.data ?? []);
  return { source: "managed", message: null, packages, collections, package_collections, package_items, package_images, gallery_items, reviews, site_statistics, site_settings } as StorefrontData;
}

export function escapeMarkup(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

export function safeMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\/(?!\/)/.test(value)) return value;
  if (/^assets-[123]\//.test(value)) return `/${value}`;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; }
}

export function averagePublishedRating(reviews: StorefrontReview[]) {
  const rated = reviews.filter((review) => review.published && typeof review.rating === "number" && review.rating >= 1 && review.rating <= 5);
  return rated.length ? rated.reduce((sum, review) => sum + review.rating!, 0) / rated.length : null;
}

function renderPackageCards(data: StorefrontData, selectedCollection?: StorefrontCollection) {
  const selectedIds = selectedCollection ? new Set(data.package_collections.filter((link) => link.collection_id === selectedCollection.id).map((link) => link.package_id)) : null;
  const collections = new Map(data.collections.map((collection) => [collection.id, collection]));
  return data.packages.filter((pack) => !selectedIds || selectedIds.has(pack.id)).map((pack) => {
    const categories = ["all", ...data.package_collections.filter((link) => link.package_id === pack.id).flatMap((link) => collections.get(link.collection_id)?.slug ?? [])].join(",");
    const cake = pack.order_mode === "cake";
    const image = safeMediaUrl(pack.main_image);
    const price = pack.price === null || pack.order_mode !== "cart" ? "Can be customized" : `LKR ${Number(pack.price).toLocaleString("en-LK")}`;
    const key = escapeMarkup(pack.id);
    return `<article class="package-card${cake ? " cake-card" : ""}" data-package-card data-category="${escapeMarkup(categories)}">
      <div class="package-card__media${cake ? " cake-card__media" : ""}">${image ? `<img src="${escapeMarkup(image)}" alt="${escapeMarkup(pack.name)}" loading="lazy" decoding="async" />` : `<div class="media-placeholder">Image unavailable</div>`}</div>
      <div class="package-card__body"><div class="package-card__topline"><h3>${escapeMarkup(pack.name)}</h3><span class="price-badge">${escapeMarkup(price)}</span></div>
      <p>${escapeMarkup(pack.description)}</p><div class="package-card__actions${cake ? " cake-card__actions" : ""}">
      ${cake ? `<button class="package-button package-button--solid" type="button" data-customize-cake="${key}">Customize Cake</button>` : `<button class="package-button package-button--ghost" type="button" data-view-package="${key}">View Details</button><button class="package-button package-button--solid" type="button" data-${pack.order_mode === "cart" ? "add" : "order"}-package="${key}">${pack.order_mode === "cart" ? "Add to Cart" : "Book Now"}</button>`}
      </div></div></article>`;
  }).join("");
}

function renderReviewCards(data: StorefrontData) {
  const reviews = data.reviews.filter((review) => review.published);
  if (!reviews.length) return `<p class="cms-empty">Customer reviews will appear here after publication.</p>`;
  const rowCount = Math.min(3, reviews.length);
  return Array.from({ length: rowCount }, (_, index) => {
    const row = reviews.filter((_, number) => number % rowCount === index);
    const cards = row.map((review) => `<article class="review-card"><div class="review-card__top"><h3>${escapeMarkup(review.customer_name)}</h3>${safeMediaUrl(review.customer_image) ? `<img src="${escapeMarkup(safeMediaUrl(review.customer_image))}" alt="" width="32" height="32" loading="lazy" />` : ""}</div>${review.rating === null ? "" : `<p class="review-stars" aria-label="${review.rating} star rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</p>`}<p>${escapeMarkup(review.review)}</p></article>`).join("");
    return `<div class="review-row review-row--${index === 1 ? "left" : "right"}${index === 2 ? " review-row--slow" : ""}"><div class="review-track">${cards}<div class="review-track-copy" aria-hidden="true" style="display:contents">${cards}</div></div></div>`;
  }).join("");
}

export function getStorefrontMarkup(data: StorefrontData, collectionSlug?: string) {
  const html = readFileSync(join(process.cwd(), "public", "storefront.html"), "utf8");
  let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error("The storefront HTML is missing its body content.");
  body = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const collection = collectionSlug ? data.collections.find((item) => item.slug === collectionSlug) : undefined;
  const rating = averagePublishedRating(data.reviews);
  const settings = Object.fromEntries(data.site_settings.map((setting) => [setting.key, setting.value]));
  const filters = `<button class="package-filter is-active" type="button" data-package-filter="all">All</button>${data.collections.map((item) => `<button class="package-filter" type="button" data-package-filter="${escapeMarkup(item.slug)}">${escapeMarkup(item.name)}</button>`).join("")}`;
  const nav = `<a href="/#packages" data-menu-link data-menu-package-filter="all">All</a>${data.collections.map((item) => `<a href="/collections/${encodeURIComponent(item.slug)}#packages" data-menu-link data-menu-package-filter="${escapeMarkup(item.slug)}">${escapeMarkup(item.name)}</a>`).join("")}`;
  const statistics = data.site_statistics.filter((stat) => stat.active && stat.key !== "average-rating").map((stat) => `<article class="stat-card"><p class="stat-card__number"><span data-count-to="${Number(stat.value)}" data-suffix="${escapeMarkup(stat.suffix)}">${escapeMarkup(stat.value)}${escapeMarkup(stat.suffix)}</span></p><p class="stat-card__label">${escapeMarkup(stat.label)}</p></article>`).join("");
  const verifiedBusiness = [business.legalName,business.email,business.address].filter(value => !value.includes("[")).map(value => `<p>${escapeMarkup(value)}</p>`).join("");
  body = body.replace("<!-- CMS_LEGAL_BUSINESS_DETAILS -->",verifiedBusiness);
  body = body.replace("<!-- CMS_STATISTICS -->", `${statistics}<article class="stat-card"><p class="stat-card__number">${rating === null ? `<span>—</span>` : `<span data-count-to="${rating.toFixed(1)}" data-decimals="1">${rating.toFixed(1)}</span>`}</p><p class="stat-card__label">Average Rating${rating === null ? " · No rated reviews" : ""}</p></article>`);
  body = body.replace("<!-- CMS_PACKAGES -->", renderPackageCards(data, collection));
  body = body.replace("<!-- CMS_COLLECTION_FILTERS -->", filters);
  body = body.replace("<!-- CMS_COLLECTION_NAV -->", nav);
  body = body.replace("<!-- CMS_FOOTER_COLLECTIONS -->", data.collections.map((item) => `<a href="/collections/${encodeURIComponent(item.slug)}#packages">${escapeMarkup(item.name)}</a>`).join(""));
  body = body.replace("<!-- CMS_REVIEWS -->", renderReviewCards(data));
  body = body.replace("<!-- CMS_REVIEW_SUMMARY -->", rating === null ? "Customer experiences" : `<span>${rating.toFixed(1)} stars</span> from ${data.reviews.filter((review) => review.published && review.rating !== null).length} rated reviews`);
  body = body.replace("<!-- CMS_GALLERY_EMPTY -->", data.gallery_items.length ? "" : `<p class="cms-empty">Gallery moments will appear here when available.</p>`);
  body = body.replace("<!-- CMS_COLLECTION_ANCHORS -->", data.collections.map((item) => `<section class="seo-sitelink-anchor" id="${escapeMarkup(item.slug)}" aria-label="${escapeMarkup(item.name)}"><h3>${escapeMarkup(item.name)}</h3><p>${escapeMarkup(item.short_description)}</p></section>`).join(""));
  const whatsapp = (settings.whatsapp || "").replace(/\D/g, "");
  body = body.replaceAll("https://wa.me/94760505866", whatsapp ? `https://wa.me/${whatsapp}` : "#contact").replaceAll("WhatsApp: +94 76 050 5866", whatsapp ? `WhatsApp: ${escapeMarkup(settings.phone || whatsapp)}` : "Contact information temporarily unavailable");
  for (const [key, original] of [["instagram", "https://www.instagram.com/surprisewala.lk"], ["facebook", "https://www.facebook.com/share/1CQxMihCMG/"], ["tiktok", "https://www.tiktok.com/@surprisewala.lk_?_r=1&amp;_t=ZS-96Jz6Fm1V25"]]) {
    const value = safeMediaUrl(settings[key]);
    body = body.replaceAll(original, escapeMarkup(value || "#contact"));
  }
  if (settings.google_review_url) body = body.replace(/(<a class="reviews__button" href=")[^"]*(")/, `$1${escapeMarkup(safeMediaUrl(settings.google_review_url))}$2`);
  if (settings.instagram) {
    try { const handle = new URL(settings.instagram).pathname.replace(/^\//, "").replace(/\/$/, ""); body = body.replace("Instagram: @surprisewala.lk", `Instagram: @${escapeMarkup(handle)}`); } catch { /* Invalid setting is omitted from the link above. */ }
  }
  if (collection) {
    body = body.replace("<!-- CMS_PACKAGES_TITLE -->", escapeMarkup(collection.name));
    body = body.replace("<!-- CMS_PACKAGES_DESCRIPTION -->", escapeMarkup(collection.short_description || "Explore the packages in this collection."));
  } else {
    body = body.replace("<!-- CMS_PACKAGES_TITLE -->", "Surprise packages for every moment");
    body = body.replace("<!-- CMS_PACKAGES_DESCRIPTION -->", "Choose from our signature customized surprise packages for birthday surprises, proposal setups, cakes, flowers and romantic events.");
  }
  if (data.source === "unavailable") body = body.replace("<!-- CMS_STATUS -->", `<p class="cms-empty" role="status">${escapeMarkup(data.message)} <a href="/#contact">Contact us</a></p>`);
  else body = body.replace("<!-- CMS_STATUS -->", "");
  const publicData = { ...data, initial_collection: collection?.slug ?? "all", site_settings: data.site_settings.filter((setting) => setting.key !== "cms_enabled") };
  return `${body}<script id="storefront-data" type="application/json">${JSON.stringify(publicData).replaceAll("<", "\\u003c")}</script>`;
}
