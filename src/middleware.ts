import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/login": { max: 10, windowMs: 15 * 60 * 1000 },
  "/api/cadastro": { max: 5, windowMs: 60 * 60 * 1000 },
  "/api/esqueci-senha": { max: 3, windowMs: 15 * 60 * 1000 },
  "/api/redefinir-senha": { max: 5, windowMs: 15 * 60 * 1000 },
  "/api/admin/alterar-senha": { max: 5, windowMs: 15 * 60 * 1000 },
  "/api/conta/alterar-senha": { max: 5, windowMs: 15 * 60 * 1000 },
  "/api/checkout": { max: 10, windowMs: 15 * 60 * 1000 },
  "/api/orders": { max: 10, windowMs: 15 * 60 * 1000 },
};

function getRateLimitKey(ip: string, pathname: string): string {
  return `${ip}:${pathname}`;
}

function checkRateLimit(
  ip: string,
  pathname: string,
): { allowed: boolean; remaining: number; resetTime: number } {
  const rule = Object.entries(RATE_LIMITS).find(([path]) =>
    pathname.startsWith(path),
  );

  if (!rule) return { allowed: true, remaining: 999, resetTime: 0 };

  const [, { max, windowMs }] = rule;
  const key = getRateLimitKey(ip, pathname);
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: max - 1, resetTime: now + windowMs };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: max - entry.count,
    resetTime: entry.resetTime,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";

  if (pathname.startsWith("/api/")) {
    const rateLimit = checkRateLimit(ip, pathname);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Muitas requisições. Tente novamente mais tarde.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
            ),
            "X-RateLimit-Limit": "0",
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set(
      "X-RateLimit-Remaining",
      String(rateLimit.remaining),
    );
    return response;
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/conta")) {
    const sessionCookie = request.cookies.get("vizion_session");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/conta/:path*",
  ],
};
