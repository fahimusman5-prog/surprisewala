# Surprisewala PayHere preparation — 8 October 2026

## Status

**READY locally:** four legal pages, shared premium layout, footer links, checkout consent, server-side payment preparation, verified callbacks, payment state UI, scoped database migration, account payment entry, staff payment metadata and regression tests.

**REQUIRES OWNER INPUT:** legal business name, postal/business address, support email, refund-request and cancellation notice periods, data-retention policy, policy approval and operational pricing/coverage decisions. This implementation is **not a declaration of PayHere approval or complete merchant compliance**.

**REQUIRES PAYHERE DASHBOARD CONFIGURATION:** merchant account, approved integration domain, domain-specific Merchant Secret, matching sandbox/live credentials, externally accessible callback and real sandbox transaction verification.

No production deployment, Git publication, remote schema change, customer message or financial transaction was performed. The checkout, schema and CMS files already contained substantial uncommitted work; that work was preserved. The connected Supabase account exposed YARAPRODUCTIONS (`yhywklzutqzwafulnpcu`) only, so no remote Surprisewala schema or customer records were queried or modified.

## Architecture inspection

- Next.js App Router; package.json pins Next 16.2.9, React 19.2.4. Installed Next runtime reports 16.2.12; reconcile installation/lockfile versions in release CI. No application dependency was added.
- The public storefront is rendered from `public/storefront.html` by `src/lib/storefront.ts`; runtime code is `public/script.js` and `public/membership-home.js`. Root `index.html` / `script.js` / `styles.css` are legacy mirrors and were not rebuilt.
- Packages, cakes, gallery and contact routes redirect to existing homepage sections. About is `/#story`; contact is `/#contact`. Collection routes reuse the same storefront renderer.
- Existing typography uses Inter and Cormorant Garamond/Georgia fallbacks; dark navy/black surfaces, teal accents, gradients, rounded panels and animated storefront sections. New CSS is scoped to legal/payment layouts, footer additions and the existing admin namespace.
- Supabase project configuration is restricted to `pzjbfhwzaettkzaxjdte`. SSR cookie authentication and `src/proxy.ts` remain in use. Admin authorisation still relies on `admin_users` roles, not an email comparison.
- Existing `profiles`, `addresses`, `orders`, customers and CMS catalog tables remain intact. The current migration history provides booking snapshots, submission keys, order references, server-side catalog pricing and RLS.
- `POST /api/orders` validates booking details, dates in Asia/Colombo, package IDs and quantities. Managed CMS bookings use `submit_booking`; legacy signed-in bookings use extracted catalog prices. WhatsApp guests retain the existing fallback. Custom/enquiry/cake pricing is unconfirmed and excluded from online payment.
- Four currently displayed fixed packages cost LKR 14,000 / 18,000 / 26,000 / 28,000. Existing packages state additional charges apply outside Colombo. No new prices, fees, service areas or guarantees were invented.
- No existing legal policy routes were found. Verified published support is +94 76 050 5866 / `https://wa.me/94760505866`. No verified support email, postal address or contracting legal name was found.

## Implemented customer experience

Routes: `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/delivery-policy`.

All use `LegalPageLayout`, breadcrumb, brand hero, numbered readable sections, desktop sticky contents, mobile expandable contents, update date, visible draft notice, support details, keyboard focus and a skip link. Metadata and sitemap entries make the legal pages indexable. Owner approval and missing values are centralised in `src/lib/legal.ts`; the draft notice only disappears when `legalPublicationReady` becomes true. Update the date/version when approving or changing policies.

The existing footer gains Legal and About links with a responsive layout. Verified central business name/email/address will populate its Reach Us column when supplied; missing values are not fabricated. Legal-page footers currently show obvious placeholders.

Both cart checkout review and direct package enquiries show linked Terms, Privacy and Refund consent statements. Billing checkout separately requires an **unchecked** consent checkbox and validates consent again on the server.

`/payment/checkout?order=<saved-order-uuid>` presents the trusted amount and billing form. To avoid charging before availability and location costs are agreed, online payment requires an authenticated owner, managed CMS, a fixed-price order and fulfilment status `confirmed`, `preparing` or `scheduled`. A `new` booking cannot be paid. Signed-in customers can use **Pay online** on confirmed orders in account history when enabled. New bookings retain team confirmation through WhatsApp. Custom quotes, cakes and unpriced arrangements stay with the existing team workflow.

Payment results at `/payment/return?attempt=<uuid>` and `/payment/cancel?attempt=<uuid>` show processing, pending, paid, failed, cancelled, refunded or chargeback information. A cancellation URL by itself does not cancel a database payment. Paid requires both stored `paid` status and a verified timestamp. Pending payments are polled for up to one minute, then customers can recheck or contact support. Unknown/unowned records show unavailable status; `?success=true` has no effect.

Staff can see the latest PayHere attempt metadata on order detail pages. Provider payment status is read-only there; existing fulfilment and internal-note management remains available. Offline payment management remains unchanged.

## Files created

- `src/lib/legal.ts`, `src/lib/policies.ts`
- `src/components/legal/layout.tsx`, `src/components/legal/legal.css`
- `src/app/(storefront)/privacy-policy/page.tsx`
- `src/app/(storefront)/terms-and-conditions/page.tsx`
- `src/app/(storefront)/refund-policy/page.tsx`
- `src/app/(storefront)/delivery-policy/page.tsx`
- `src/lib/payhere/core.ts`, `src/lib/payhere/server.ts`
- `src/app/api/payhere/initiate/route.ts`, `notify/route.ts`, `status/route.ts`, `availability/route.ts`
- `src/app/(storefront)/payment/checkout/page.tsx`, `return/page.tsx`, `cancel/page.tsx`
- `src/components/payhere-checkout.tsx`, `src/components/payhere-state.tsx`
- `supabase/migrations/20261008044037_payhere_payments.sql` (created with official Supabase CLI)
- `tests/payhere.test.cjs`, `tests/payhere-database.mjs`
- `src/app/admin/admin.css` — scoped styling for existing admin components; its import previously referenced a missing file and blocked the production build.
- This report and `legal-desktop.png`, `legal-mobile.png`, `billing-mobile-fixture.png` under `docs/payhere/`.

## Files modified by this task

- `.env.example`, `package.json`, `eslint.config.mjs`, `tsconfig.json`, `README.md`
- `public/storefront.html`, `public/styles.css`, `public/script.js`
- `public/sitemap.xml`, `sitemap.xml`
- `src/lib/storefront.ts`
- `src/app/(storefront)/page.tsx`, `src/app/(storefront)/collections/[slug]/page.tsx` (all active script consumers cache-busted)
- `src/app/api/orders/route.ts` (minimal pre-existing TypeScript typing repair; booking rules preserved)
- `src/proxy.ts` (payment session refresh paths; notify remains public)
- `src/lib/dashboard.ts`, `src/components/dashboard-client.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/[section]/page.tsx`
- `src/lib/admin/server.ts`, `src/lib/admin/queries.ts`, `src/lib/admin/model.ts`, `src/components/admin/list.tsx`, `src/components/admin/operations.tsx`
- `supabase/migrations/20261004214628_admin_business_cms.sql` (removed a pre-existing extra closing parenthesis in `valid_content_path`; necessary for the local baseline schema to execute)
- `tests/checkout-validation.mjs` (updated script version assertion)

Minimal unrelated build repairs were required: a missing JSX brace in the existing admin list, nullable admin display name typing, dynamic Supabase select-result typing, duplicate local `@types/* 2` directory discovery (explicit TypeScript types), and CommonJS test lint configuration. No account permissions or existing admin business workflows were replaced.

## Database migration

Apply only after inspecting the actual Surprisewala database and confirming earlier migrations. It has **not** been applied remotely.

- Adds `payhere_payments`: provider, mode, immutable authoritative amount/currency, order relation, unique provider payment ID, status, method, paid/verified dates and policy consent version/date.
- Adds `payhere_events`: only a verified checksum, attempt, payment ID, status and receipt date. No raw callback, full card number, CVV, card expiry or cardholder record is stored.
- Enables RLS. Only authorised order staff may read payment metadata. Anon/customers have no direct payment-table access; the owner-authenticated status API returns selected fields. Events are service-role only.
- Adds server-only `SECURITY INVOKER` RPCs `begin_payhere_payment` and `apply_payhere_notification`. Execute is revoked from PUBLIC/anon/authenticated and granted to service_role.
- Initiation locks the existing order, checks ownership, confirmed fulfilment state, CMS activation, fixed-price snapshot lines and stored totals. It blocks pending or settled attempts; each attempt receives a unique UUID. No client amount is trusted.
- Notifications lock order then attempt in the same order, validate amount/currency/mode/payment ID, deduplicate verified checksums and update attempt + aggregate order status in one transaction. A paid state cannot regress due to late pending/failed/cancelled callbacks. Chargeback is handled separately.
- Existing order-history protections are retained. Adds failed/chargeback states and a narrow authorised existence helper so staff cannot manually forge gateway status. Booking/pricing snapshots remain immutable.
- No inventory, email, customer-confirmation or fulfilment side effect is introduced by callbacks, so callback retries do not duplicate those operations.
- A second settlement or inconsistent provider payment ID requires reconciliation and is not acknowledged as successfully applied. Pending or missed notifications must be checked with support/PayHere before another payment.

## Environment and URLs

Keep credentials out of Git and browser/public env variables:

```env
PAYHERE_ENABLED=false
PAYHERE_MODE=sandbox
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_SITE_URL=https://surprisewala.com
SUPABASE_SERVICE_ROLE_KEY=
SURPRISEWALA_CMS_ENABLED=false
# Existing Supabase public URL/key variables remain required.
```

`PAYHERE_ENABLED=true` and `SURPRISEWALA_CMS_ENABLED=true` are only appropriate after the schema, CMS pricing, policies and dashboard configuration are verified. The database also checks `cms_enabled=true`. `PAYHERE_SITE_URL` must be the exact registered HTTPS origin; it does not come from browser input or an untrusted Host header.

| Purpose | URL with the illustrated origin |
| --- | --- |
| Initiate | `POST https://surprisewala.com/api/payhere/initiate` |
| Public callback | `POST https://surprisewala.com/api/payhere/notify` |
| Return | `https://surprisewala.com/payment/return?attempt=<server-generated-uuid>` |
| Cancel | `https://surprisewala.com/payment/cancel?attempt=<server-generated-uuid>` |
| Owner status | `GET https://surprisewala.com/api/payhere/status?attempt=<uuid>` |
| Sandbox hosted checkout | `https://sandbox.payhere.lk/pay/checkout` |
| Live hosted checkout | `https://www.payhere.lk/pay/checkout` |

Live initiation also requires `legalPublicationReady=true`; sandbox can be tested while the policies remain visibly marked as drafts.

Notify deliberately keeps accepting verified callbacks when new checkout is disabled, provided credentials and database access remain configured. Do not rotate mode/secrets or remove callback infrastructure while unresolved attempts exist without reconciling them first.

The hash and callback checksum follow [PayHere’s current Checkout API](https://support.payhere.lk/api-%26-mobile-sdk/checkout-api). Database execution privileges follow [Supabase database functions](https://supabase.com/docs/guides/database/functions) and [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Verification evidence and limits

- `npm run lint`: passed, zero errors, seven existing/direct-image optimisation warnings.
- `npm run typecheck`: passed.
- `npm run test`: 19 tests passed plus checkout form regression checks. Tests cover official hash formatting; valid status mappings; invalid checksum/merchant/currency/malformed fields; authoritative totals; owner filter; missing consent/billing; unsigned-in/cross-origin initiation; safe fields with no secret; notification persistence/error retry; live owner-approval/disabled checkout gates; and actual React processing/success/pending/failed/cancelled/chargeback/refund output with the verified timestamp requirement.
- Disposable local PostgreSQL (PGlite): **31 assertions passed** against the actual three baseline migrations plus the new migration, with mocked Supabase Auth/Storage schemas. Covers successful/pending/cancelled/failed/chargeback updates, wrong amount/currency/mode/user, duplicate callback, late callbacks, pending initiation, uniqueness, protected provider status, staff-only metadata reads, preserved admin fulfilment/notes, guest/member `submit_booking`, price manipulation rejection and submission-key deduplication. This is not a remote Supabase integration test or a multi-connection load test.
- Production build: `npm run build -- --webpack` passed. Default Turbopack initially exposed the pre-existing missing admin stylesheet; the repaired project was verified using the standard Next webpack production build.
- Browser: all four legal routes, existing booking checkout and payment return/cancel/disabled checkout fitted **320, 375, 390, 430, 768, 1024 and 1440 px**, with no measured horizontal overflow. Real billing component was also rendered in a disposable local static fixture at all seven widths: consent unchecked, every required billing field present and Pay Securely height 48 px. The fixture was removed from public assets before the build.
- Footer legal links were clicked and resolved to correct pages/titles. Mobile contents expanded successfully. Existing add-to-cart, guest checkout, incomplete-field rejection and completed booking review worked. Policy links preserved checkout by opening a new tab. No browser errors were observed in the inspected journey; legal-page images loaded.
- A direct forged success URL and refresh did not produce a paid result. Account ownership/saved-order success was tested in code/local DB; **no live signed-in customer, live admin mutation, remote Supabase update or real PayHere-hosted sandbox transaction was claimed**.
- Browser/public bundle scans found no Merchant Secret or service-role variable in client assets. Secrets are referenced only by server modules. No credentials were entered, printed or committed.

## Reviewer journey audit (local public customer view)

| Requirement | Finding |
| --- | --- |
| Actual packages/services | Present on existing homepage/packages section |
| Actual fixed pricing | Present; custom items require team quote |
| Ordering process | Existing package/cart/booking/WhatsApp journey retained |
| Checkout/payment process | Prepared; online payment gated pending required setup |
| About | Existing `/#story`, now linked from footer/legal header |
| Contact | Existing `/#contact` and published WhatsApp support |
| Business/brand name | Surprisewala present; contracting legal name missing |
| Phone | +94 76 050 5866 verified in project |
| Support email | Missing, central placeholder |
| Postal/business address | Missing, central placeholder |
| Privacy / Terms / Refund / Delivery | Implemented, navigable; drafts await owner approval |

**Merchant-review readiness remains incomplete.** The updated implementation has not been deployed, so this table does not assert these new pages exist on the public production domain.

## Owner decisions before publication

Supply the legal contracting name, real postal address and support email; confirm the published phone. Approve cancellation and refund-request windows, rescheduling rules, preparation/perishable/personalised exclusions, allowable deductions and refund processing communication. Confirm data-retention periods and privacy contact handling, Sri Lankan governing law, coverage/location fee rules, recipient unavailable/redelivery charges, substitutions and last-minute booking conditions.

No gateway surcharge is added by the new integration. Stored server-side fees are honoured; existing unused browser fee definitions do not determine payment amounts. Orders with extra costs or custom quotations require a separately approved authoritative pricing workflow before online collection; this preparation does not invent one.

After approval, replace placeholders in `src/lib/legal.ts`, review the tailored text in `src/lib/policies.ts`, update the policy date/version, and set `business.policiesApproved=true`. Verify the legal notice disappears only when all required decisions/details are supplied.

## Sandbox testing instructions

1. Use a **public HTTPS staging origin**, registered in a PayHere sandbox account. A localhost callback cannot be received by PayHere.
2. Connect staging to an authorised Surprisewala test database or approved staging clone. Inspect schema/RLS and apply the existing prerequisites and new migration once. Do not run the schema against YARA.
3. Configure matching sandbox Merchant ID, domain-specific Merchant Secret, staging `PAYHERE_SITE_URL`, server-only Supabase service-role key and existing public Supabase credentials. Enable the managed catalog in both app and DB only after verifying it.
4. Finish owner policy/contact setup before merchant review. Enable payments **on staging**. Sign in, create a fixed-price booking, and have authorised staff confirm availability/location charges and mark it confirmed. Use account history’s Pay online link.
5. Enter billing information, check consent, review the authoritative amount and open PayHere hosted sandbox checkout. Use [PayHere’s official sandbox test instructions](https://support.payhere.lk/sandbox-and-testing), never a real customer card.
6. Confirm actual notify delivery on the publicly accessible callback. Inspect `payhere_payments`, `payhere_events` and existing `orders.payment_status`; return state must remain pending without notification.
7. Exercise provider-supported success/failure/cancel/pending flows, duplicate notify delivery, invalid signatures, wrong amounts/currencies/merchant IDs, forged return URLs and refresh. Check admin fulfilment updates and offline WhatsApp ordering again on staging.
8. Record actual provider transaction IDs and acceptance results without logging secrets or card credentials. Keep new checkout disabled in production until these checks pass.

Local PostgreSQL tests can be rerun using a temporary installation, without adding an app dependency:

```sh
npm install --prefix /tmp/surprisewala-sql-qa --no-package-lock --ignore-scripts @electric-sql/pglite
PGLITE_MODULE=/tmp/surprisewala-sql-qa/node_modules/@electric-sql/pglite/dist/index.js node tests/payhere-database.mjs
```

## Production deployment checklist — not executed

- [ ] Owner details completed and legal policies approved; dates/version updated.
- [ ] Actual target database identity and live schema/RLS inspected; prerequisite CMS migration/seed status verified.
- [ ] New migration applied in staging, advisors checked, then approved production application planned.
- [ ] Confirmed fixed-price/payment workflow and extra-charge limitations accepted by owner.
- [ ] PayHere merchant/domain integration approved; correct domain-specific live credentials obtained.
- [ ] Complete hosted sandbox flow, live Supabase ownership checks and authorised admin workflows verified on staging.
- [ ] Resolve package.json/installed dependency version drift and reproduce lint/typecheck/tests/build in clean release CI.
- [ ] New migration tracked normally; all prior working-tree changes separately reviewed before a release commit.
- [ ] Environment configured; callback publicly reachable without auth redirects or deployment protection.
- [ ] Explicit production deployment instruction obtained. No deployment is authorised by this task.
- [ ] After authorised release, verify all legal/footer/checkout links and the published public journey again.
- [ ] Only after separate authorisation, verify any live payment transaction; maintain reconciliation/support procedures for pending payments, refunds and chargebacks.
