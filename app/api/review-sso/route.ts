import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE, verifyAuthToken } from "@/lib/jwt";
import { issueReviewSsoLaunchUrl } from "@/lib/review-sso";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, detail: "Not authenticated" },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, detail: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const reviewSso = await issueReviewSsoLaunchUrl(payload.username);
    if (!reviewSso.ok) {
      return NextResponse.json(
        { ok: false, detail: reviewSso.detail },
        { status: reviewSso.status },
      );
    }

    return NextResponse.json({
      ok: true,
      launchUrl: reviewSso.launchUrl,
      audience: reviewSso.audience,
      expiresIn: reviewSso.expiresIn,
    });
  } catch (error) {
    console.error("[api/review-sso] error:", error);
    return NextResponse.json(
      { ok: false, detail: "리뷰 SSO URL 생성에 실패했습니다." },
      { status: 502 },
    );
  }
}
