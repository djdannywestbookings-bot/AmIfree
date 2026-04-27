import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Global middleware — runs on every non-asset request.
 *
 * Phase 22 owner-only beta:
 * - Unauthenticated access to (app)/* routes redirects to /login.
 * - Authenticated access to /login redirects to /agenda (default landing).
 * - Session cookies are refreshed on every request via updateSession().
 */

const APP_ROUTE_PREFIXES = [
  "/agenda",
  "/calendar",
  "/coverage",
  "/employees",
  "/intake",
  "/my-calendar",
  "/onboarding",
  "/positions",
  "/settings",
  "/venues",
];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAppRoute = APP_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    // Calendar is the primary surface as of Phase 29; sign-in lands
    // there. Schedule (list view) stays accessible from the nav.
    url.pathname = "/calendar";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip middleware for Next.js internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
