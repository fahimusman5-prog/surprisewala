# Surprisewala

Surprisewala is a Next.js storefront with optional Supabase customer membership. Guests can browse, use the cart, customize cakes, complete checkout, and order through WhatsApp without signing in.

## Local setup

Copy `.env.example` to `.env.local` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit `.env.local`. The frontend uses only the public Supabase anon/publishable key; never expose a `service_role` key. `SUPABASE_SERVICE_ROLE_KEY` is reserved for future secure server-only administration and is not required by the current application.

Install and run:

```bash
npm install
npm run dev
```

## Supabase database

Apply the migrations in timestamp order to the dedicated Surprisewala project:

1. [`supabase/migrations/20260621000000_membership.sql`](supabase/migrations/20260621000000_membership.sql)
2. [`supabase/migrations/20260726081816_secure_dedicated_auth.sql`](supabase/migrations/20260726081816_secure_dedicated_auth.sql)
3. [`supabase/migrations/20260726091925_secure_rls_policy_roles.sql`](supabase/migrations/20260726091925_secure_rls_policy_roles.sql)
4. [`supabase/migrations/20260726092223_authorize_admin_policy_function.sql`](supabase/migrations/20260726092223_authorize_admin_policy_function.sql)

They create `profiles`, `addresses`, and `orders`, including foreign keys, indexes, profile automation, secure role protection, grants, and Row Level Security policies. Guest checkout remains a public WhatsApp flow; authenticated checkout additionally saves the order under the signed-in user.

## Email and password authentication

In **Supabase → Authentication → Providers → Email**:

- Enable the Email provider.
- Enable email signup.
- Turn **Confirm email** off for the required create-account-then-login flow.
- Keep password recovery enabled.

The application does not use email OTP or passwordless magic-link login. New customers register with full name, phone number, email, and password, then manually log in with their email and password. Password recovery still sends a recovery link and returns the customer through `/auth/callback`.

In **Supabase → Authentication → URL Configuration**, use:

- Site URL: `https://surprisewala.com`
- Redirect URL: `https://surprisewala.com/auth/callback`
- Redirect URL: `https://www.surprisewala.com/auth/callback`
- Redirect URL: `http://localhost:3000/auth/callback`

Add only the exact Vercel Preview callback URL that is actually used by this project. Do not add a broad wildcard redirect. Callback `next` values are restricted to internal paths.

## Enable Google login

Google OAuth credentials belong in provider dashboards, never in this repository.

1. Open Google Cloud Console and create an OAuth 2.0 Client ID.
2. Copy the authorized redirect URI shown by Supabase and add it to the Google OAuth client.
3. Open **Supabase → Authentication → Providers → Google**.
4. Paste the Google Client ID and Client Secret there.
5. Enable the Google provider.

The application already calls `signInWithOAuth` with provider `google` and returns users to `/auth/callback`.

## Vercel environment variables

In **Vercel → Project Settings → Environment Variables**, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (canonical production domain in Production; `http://localhost:3000` locally)

Apply the Supabase URL and anon key to **Production**, **Preview**, and **Development**. Set `NEXT_PUBLIC_SITE_URL=https://surprisewala.com` in Production. Auth requests use the current browser origin, so a Preview deployment works after its exact `/auth/callback` URL is allow-listed in Supabase. Add `SUPABASE_SERVICE_ROLE_KEY` only if a future server-only administrative feature requires it—never make it public. Do not commit real values to GitHub.

## Deployment verification

Before deployment:

```bash
npm run build
npm run lint
npm audit --omit=dev
```

Verify the homepage, guest-only once-per-session membership popup, authenticated account navigation, guest cart and checkout, cake customization, package filters, WhatsApp actions, `/login`, `/signup`, `/forgot-password`, `/reset-password`, protected `/dashboard`, password login, Google OAuth after provider activation, logout, and authenticated order history.
