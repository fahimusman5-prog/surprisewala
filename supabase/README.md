# Surprisewala Supabase setup

1. Create a Supabase project and run `migrations/20260621000000_membership.sql` in the SQL editor (or with `supabase db push`).
2. Enable Email and Google providers under Authentication → Providers.
3. Add `https://your-domain.com/auth/callback` and `http://localhost:3000/auth/callback` to Authentication → URL Configuration.
4. Copy `.env.example` to `.env.local` and add the project URL and publishable key. Legacy projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.

The migration enables Row Level Security on every member table. All policies are scoped to `auth.uid()`.
