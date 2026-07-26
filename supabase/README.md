# Surprisewala Supabase setup

1. Apply all files in `migrations/` in timestamp order to the dedicated Surprisewala project.
2. Under Authentication → Providers → Email, enable Email and email signup, then turn **Confirm email** off for immediate password login after registration. Password recovery remains enabled.
3. Add `https://surprisewala.com/auth/callback` and `http://localhost:3000/auth/callback` to Authentication → URL Configuration. Add a Vercel Preview callback only when its exact project URL is known; do not use an unrestricted wildcard.
4. Enable Google under Authentication → Providers only after its project-specific OAuth credentials are configured.
5. Copy `.env.example` to `.env.local` and add the project URL, anon/publishable key, and local site URL. Never put a service-role key in a public variable or browser code.

The application uses email-and-password login. It does not use passwordless magic-link or OTP login. Password recovery and optional Google OAuth continue to use `/auth/callback`.

The migrations enable Row Level Security on every member table. Customer policies are scoped to `auth.uid()`, the profile trigger always assigns the `customer` role, and customer profile updates cannot change role or email authorization fields.
