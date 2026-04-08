import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { AUTH_TOKEN_COOKIE, createAuthToken } from "@/lib/jwt";
import { establishReviewSession } from "@/lib/review-sso";

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

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/login", getPublicOrigin(request));
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

function resolveReturnTo(request: NextRequest) {
  const publicOrigin = getPublicOrigin(request);
  const raw = (request.nextUrl.searchParams.get("return_to") || "").trim();
  if (!raw) {
    return new URL("/", publicOrigin);
  }

  try {
    const target = new URL(raw, publicOrigin);
    if (target.origin !== publicOrigin) {
      return new URL("/", publicOrigin);
    }
    return target;
  } catch {
    return new URL("/", publicOrigin);
  }
}

export async function GET(request: NextRequest) {
  const ticket = (request.nextUrl.searchParams.get("ticket") || "").trim();
  if (!ticket) {
    return redirectWithError(request, "SSO ticket이 없습니다.");
  }

  try {
    const sessionLogin = await establishReviewSession(ticket);
    if (!sessionLogin.ok) {
      return redirectWithError(request, sessionLogin.detail);
    }

    const token = await createAuthToken(
      sessionLogin.username,
      sessionLogin.role,
    );
    const response = NextResponse.redirect(resolveReturnTo(request));
    response.cookies.set(AUTH_TOKEN_COOKIE, token, {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.headers.append("set-cookie", sessionLogin.sessionCookie);
    return response;
  } catch (error) {
    console.error("[sso/callback] error:", error);
    return redirectWithError(request, "SSO 로그인 요청 처리에 실패했습니다.");
  }
}
