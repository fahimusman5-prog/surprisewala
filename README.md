# Surprisewala

Surprisewala is a Next.js storefront with optional Supabase customer membership. Guests can browse, use the cart, customize cakes, complete checkout, and order through WhatsApp without signing in.

## Local setup

Copy `.env.example` to `.env.local` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_ORDER_EMAIL=
```

Never commit `.env.local`. The frontend uses only the public Supabase anon/publishable key; never expose a `service_role` key.

Install and run:

```bash
npm install
npm run dev
```

## Supabase database

Open **Supabase → SQL Editor → New Query**, paste the complete contents of [`supabase/migrations/20260621000000_membership.sql`](supabase/migrations/20260621000000_membership.sql), and run it.

The migration creates `profiles`, `addresses`, and `orders`, including foreign keys, indexes, profile automation, single-default-address enforcement, grants, and Row Level Security policies. Guest checkout remains a public WhatsApp flow; authenticated checkout additionally saves the order under the signed-in user.

## Authentication URL configuration

In **Supabase → Authentication → URL Configuration**, set:

- Site URL: `https://surprisewala.com`
- Redirect URL: `https://surprisewala.com/auth/callback`
- Redirect URL: `https://www.surprisewala.com/auth/callback`
- Redirect URL: `http://localhost:3000/auth/callback`

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
- `ADMIN_ORDER_EMAIL`

Apply all three variables to **Production**, **Preview**, and **Development**, then redeploy. Do not commit real values to GitHub.

## Deployment verification

Before deployment:

```bash
npm run build
npm run lint
npm audit --omit=dev
```

Verify the homepage, once-per-session membership popup, guest cart and checkout, cake customization, package filters, WhatsApp actions, `/login`, `/signup`, protected `/dashboard`, email OTP, Google OAuth after provider activation, logout, and authenticated order history after applying the SQL migration.
