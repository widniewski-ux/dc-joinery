import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const storage = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "https://*.supabase.co";
  const csp = [
    "default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", `img-src 'self' blob: data: ${storage}`,
    "font-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
    `connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com${dev ? " ws: wss:" : ""}`,
    "media-src 'self'", "frame-src 'none'", ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  if (request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|mp4)$).*)"] };
