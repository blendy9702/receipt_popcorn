import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { DEV_AUTH_BYPASS_ENABLED } from "@/lib/auth-mode";
import { AUTH_TOKEN_COOKIE, verifyAuthToken } from "@/lib/jwt";

function getPublicOrigin(request: NextRequest) {
  const forwardedProto = (request.headers.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim();
  const forwardedHost = (request.headers.get("x-forwarded-host") || "")
    .split(",")[0]
    .trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const host = (request.headers.get("host") || "").trim();
  if (host) {
    const protocol = forwardedProto || "https";
    return `${protocol}://${host}`;
  }
  return EXTERNAL_API.reviewPublicOrigin;
}

function buildPopcornSsoRedirect(request: NextRequest) {
  const target = new URL(EXTERNAL_API.popcornReviewSsoStartUrl);
  const publicOrigin = getPublicOrigin(request);
  const currentUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, publicOrigin);
  target.searchParams.set("return_to", currentUrl.toString());
  target.searchParams.set("entry_url", `${publicOrigin}/sso/callback`);
  return NextResponse.redirect(target);
}

export async function proxy(request: NextRequest) {
  if (DEV_AUTH_BYPASS_ENABLED) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;
  const isPublicPath =
    pathname === "/login" || pathname === "/logout" || pathname === "/sso/callback";

  if (isPublicPath) {
    if (token) {
      const payload = await verifyAuthToken(token);
      if (payload && pathname === "/login") {
        return NextResponse.redirect(new URL("/", getPublicOrigin(request)));
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return buildPopcornSsoRedirect(request);
  }

  const payload = await verifyAuthToken(token);
  if (payload) {
    return NextResponse.next();
  }

  const response = buildPopcornSsoRedirect(request);
  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
