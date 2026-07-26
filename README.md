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

Create a new dedicated Supabase project, then apply the migrations in timestamp order:

1. [`supabase/migrations/20260621000000_membership.sql`](supabase/migrations/20260621000000_membership.sql)
2. [`supabase/migrations/20260726081816_secure_dedicated_auth.sql`](supabase/migrations/20260726081816_secure_dedicated_auth.sql)

They create `profiles`, `addresses`, and `orders`, including foreign keys, indexes, profile automation, secure role protection, grants, and Row Level Security policies. Guest checkout remains a public WhatsApp flow; authenticated checkout additionally saves the order under the signed-in user.

## Authentication URL configuration

In **Supabase → Authentication → URL Configuration**, set:

- Site URL: `https://surprisewala.com`
- Redirect URL: `https://surprisewala.com/auth/callback`
- Redirect URL: `https://www.surprisewala.com/auth/callback`
- Redirect URL: `http://localhost:3000/auth/callback`
- For Vercel previews: `https://*-<your-vercel-team-or-account>.vercel.app/**`

Enable Email authentication with confirmation required, secure email-change enabled, and password recovery enabled. If you customize Supabase email templates, use `{{ .RedirectTo }}` for the action URL so confirmation and reset links return to this app.

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

Apply the Supabase URL and anon key to **Production**, **Preview**, and **Development**. Add `NEXT_PUBLIC_SITE_URL` with the canonical production URL in Production; previews use Vercel’s `NEXT_PUBLIC_VERCEL_URL` fallback. Add `SUPABASE_SERVICE_ROLE_KEY` only if a future server-only administrative feature requires it—never make it public. Do not commit real values to GitHub.

## Deployment verification

Before deployment:

```bash
npm run build
npm run lint
npm audit --omit=dev
```

Verify the homepage, once-per-session membership popup, guest cart and checkout, cake customization, package filters, WhatsApp actions, `/login`, `/signup`, `/forgot-password`, `/reset-password`, protected `/dashboard`, email confirmation, password login, Google OAuth after provider activation, logout, and authenticated order history after applying the SQL migration.
