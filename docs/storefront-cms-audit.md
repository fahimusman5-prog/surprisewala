# Surprisewala storefront audit and CMS transition

## Existing architecture

The application is Next.js App Router. `/` reads the body of `public/storefront.html`, imports `public/styles.css`, and loads `public/script.js` plus the membership helper. `/packages`, `/cakes`, `/gallery` and `/contact` are retained redirects to homepage anchors. Package details and booking forms use the existing modals, rather than separate product routes.

The root `index.html`, `script.js`, `styles.css` and membership helper were legacy copies. Before this work, the live public script read old form fields (`fullName`, `phone`, `date`) while the served HTML used the newer structured booking fields. The implementation aligns the runtime script with the actual served form and removes duplicate legacy order events. The package API also previously omitted packages and disagreed on the `boat` identifier.

## Business content map

| Public section | Existing source | Business editing | Managed integration |
| --- | --- | --- | --- |
| Package cards/details | HTML cards and JavaScript package object | Name, price, description, availability, quote/cart/cake ordering, badge, note, includes, images, existing video, featured and order | `packages`, `package_items`, `package_images` |
| Category filters and links | For Him, For Her, Cakes, Gifts, Flowers hardcoded in HTML/JS | Collection names, descriptions, cover, active/featured/order and package assignment | `collections`, `package_collections`; dynamic `/collections/[slug]` |
| Gallery carousel | JavaScript array of six photographs and three videos | Media, title/caption, active/featured/order | `gallery_items`; existing videos remain supported |
| Testimonials | 19 unique HTML entries, repeated to animate the marquee | Review text, customer name/image, rating, publication and order | `reviews`; only published records appear after activation |
| Counters | 4,880+ Surprises Delivered, 9 Countries Active, manually fixed rating 5 | First two counter values, label/suffix/active/order | `site_statistics`; rating derived from published rated reviews |
| Reach Us and social actions | Phone/WhatsApp plus Instagram/Facebook/TikTok/Google review link | Only those actual contact links | Allowlisted `site_settings` keys |
| Customer/account pages | Supabase profiles/addresses and own orders | Customer operations and order history | Existing ownership/data preserved by admin work |
| Bookings | Structured booking HTML and `/api/orders` | Operational details, statuses, notes and historical price snapshots | Existing `orders` plus secure booking RPC |
| Header/hero/story/purpose/footer brand copy | Existing HTML and CSS | Code controlled | Preserved structure and visual design |
| Fonts/colors/spacing/animation/mobile layout | Existing CSS and script | Code controlled | No generic heading editor or page builder |
| Country selector/carousel | Nine existing countries and flags | Code controlled in this scope | Continues using the existing country presentation |

The displayed country counter remains a business statistic. Changing that value does not invent or automatically add countries to the existing operation selector.

## Audited seed snapshot

`src/data/storefront-seed.json` contains the extracted existing business content, not example data:

- 35 packages: 14 surprise experiences and 21 existing cake designs.
- Six collections: the five existing filters plus Surprise Packages, an explicit collection for cards previously marked `all`.
- 35 package/collection assignments. For Him, For Her, Gifts and Flowers remain empty until staff assigns real packages; no audience membership is invented.
- 105 existing inclusion labels and 17 existing detail photographs.
- Nine gallery items, preserving six images and three MP4s.
- 19 unique existing testimonials, initially **unpublished** because their Google-review provenance is not available in the repository.
- Two editable business statistics and seven limited settings keys.

The first four packages have actual fixed prices of LKR 14,000, 18,000, 26,000 and 28,000. Other surprise packages currently advertise customized pricing. Their hidden JavaScript numbers are not seeded as advertised prices: these records use `price=null` and enquiry mode. Cakes also remain quotes, with the existing weight/topper/wording selection. No price formula, orders, customers, notifications, admin accounts or activity records are invented.

`order_mode` preserves the real ordering differences: `cart`, `enquiry`, or `cake`. The package CMS can change that behavior deliberately without special-casing future collections or package IDs. Standalone cake inquiries retain the current WhatsApp quote behavior; they lack the scheduled recipient/order fields, so they do not create incomplete scheduled orders.

## Safe activation and authority

The public site uses the extracted snapshot while the one-time deployment gate `SURPRISEWALA_CMS_ENABLED` is absent or false. This path makes no Supabase CMS reads and preserves the working site during the blocked live migration. After schema/seed verification, set the server-only deployment gate to `true` and activate `site_settings.cms_enabled=true`. Both gates are required; packages, collections, gallery, reviews, statistics and settings are then read together from Supabase. Active records, published reviews and order values come from the database. Empty managed sections are real empty states; they do not pull items back from the snapshot.

An error while reading activated datasets returns an unavailable state and removes managed catalog actions. It does not republish old prices or removed gallery/review records. A settings connectivity/policy error also returns unavailable. With the deployment gate enabled, even missing tables, missing configuration or an absent/false activation record produce an explicit unavailable state. No error can silently reactivate legacy data. Keep the deployment gate enabled after rollout; removing it is an intentional deployment rollback. Changing/removing the activation record is a privileged operation, not a routine rollback.

The snapshot is a temporary deployment compatibility source, not a second editable CMS. There are no live hardcoded business arrays in the runtime script or template. Runtime media URLs and text are validated/escaped, including modal inclusions and gallery labels.

## Applying extracted content

Run `node scripts/generate-cms-seed.mjs` to generate `supabase/seed-cms.sql`. This command only writes a reviewable SQL file and never contacts Supabase. The seed is separate from schema migrations and has an explicit project-confirmation execution guard.

Before applying SQL, reconnect an exclusively scoped connector for `pzjbfhwzaettkzaxjdte`, inspect the live tables/columns/policies/buckets and reconcile the migration with actual existing content. Do not apply this seed to another project. The current session's live connector is not scoped to this project, so no remote application, provisioning or production-data preservation claim has been made.

The generated transaction populates content modules only when they were empty at transaction start, preserves existing rows, and uses deterministic identifiers plus `ON CONFLICT DO NOTHING`. Inclusion/images/collection links are added only for newly seeded packages. Settings add missing keys without replacing existing settings or enabling the CMS. Re-running it cannot reset the CMS activation setting or overwrite staff changes. If a live table already contains content, staff must reconcile it deliberately after the live audit; the seed does not blindly merge an unknown catalog.

After applying and verifying the schema/seed, staff should verify original asset paths, assign real collection memberships, verify and publish legitimate reviews, test all three roles and order privacy, and only then activate managed data from Settings and enable the server-only deployment gate. Future package or collection edits do not require deployment changes. Local assets remain valid originals; uploading to Supabase Storage is supported for new media, without rewriting existing assets or storing Base64 in the database.

## Booking integration

The runtime submits one structured request with all cart item IDs and quantities, recipient details, a stable UUID submission key for retries, and the WhatsApp payment method. The API/database calculates prices from the current managed catalog and snapshots historical names/prices. The frontend never submits an authoritative price. Existing direct quotation forms submit an enquiry item with the same structured scheduling data.

The original Card/Koko/Mintpay buttons did not connect to a gateway, but their client-side fees changed the WhatsApp amount while the database stored no fees. Those nonworking controls are replaced with an honest booking confirmation and package total. WhatsApp remains a normal user-initiated link; no WhatsApp API is introduced. Saving failures are displayed so staff/customer users are not told an order was persisted when it was not.
