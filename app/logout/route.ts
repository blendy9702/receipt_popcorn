import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { AUTH_TOKEN_COOKIE } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL(
      `${EXTERNAL_API.popcornLogoutUrl}?return_to=${encodeURIComponent(
        `${EXTERNAL_API.reviewPublicOrigin}/login`,
      )}`,
    ),
  );

  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.set(EXTERNAL_API.reviewSessionCookieName, "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
