# Surprisewala Supabase setup

1. Create the dedicated Surprisewala Supabase project and apply both migrations in timestamp order, beginning with `migrations/20260621000000_membership.sql` and then `migrations/20260726081816_secure_dedicated_auth.sql`.
2. Enable Email and Google providers under Authentication → Providers.
3. Add `https://your-domain.com/auth/callback` and `http://localhost:3000/auth/callback` to Authentication → URL Configuration.
4. Copy `.env.example` to `.env.local` and add the project URL, anon/publishable key, and local site URL. Never put a service-role key in a public variable or browser code.

The migration enables Row Level Security on every member table. All policies are scoped to `auth.uid()`.
