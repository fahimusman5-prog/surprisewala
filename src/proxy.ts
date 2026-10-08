import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const redirectWithCookies = (url: URL) => {
    const redirected = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie));
    redirected.headers.set("Cache-Control", "private, no-store");
    return redirected;
  };
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let user: User | null = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error) throw error;
    user = data?.claims?.sub ? ({ id: data.claims.sub } as User) : null;
  } catch {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "auth_unavailable");
      return redirectWithCookies(url);
    }
    return response;
  }
  const pathname = request.nextUrl.pathname;
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return redirectWithCookies(url);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*", "/api/admin/:path*", "/api/orders", "/api/me", "/api/payhere/initiate", "/api/payhere/status", "/payment/:path*"] };
