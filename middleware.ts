import { NextResponse, type NextRequest } from "next/server";

// Cache windows by path prefix.
// Static marketing pages can be cached aggressively at the edge — Cloudflare
// will serve them from its POPs and only revalidate occasionally.
const STATIC_PATHS = [
  "/",
  "/features",
  "/pricing",
  "/about",
  "/help",
  "/security",
  "/contact",
  "/changelog",
  "/blog",
  "/api-docs",
  "/integrations",
  "/privacy",
  "/terms",
];

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(self), microphone=(self), geolocation=(), interest-cohort=()",
  // Don't set HSTS in middleware — Caddy already does that with longer max-age.
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const res = NextResponse.next();

  // Common security headers on every response.
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }

  // Edge cache for static marketing pages.
  // s-maxage controls CDN; stale-while-revalidate keeps perceived speed high.
  if (STATIC_PATHS.includes(path)) {
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400",
    );
  }

  // No caching for any /console, /admin, /api, /signin etc.
  if (
    path.startsWith("/console") ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/auth")
  ) {
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  // Run on every page request, but skip Next internals and static assets to
  // keep the middleware cheap.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|css|js|woff|woff2|ttf|eot)).*)"],
};
