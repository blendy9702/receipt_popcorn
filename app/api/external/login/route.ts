import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { AUTH_TOKEN_COOKIE, createAuthToken } from "@/lib/jwt";
import {
  establishReviewSession,
  issueReviewSsoTicket,
} from "@/lib/review-sso";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    const upstream = await fetch(EXTERNAL_API.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            data?.message ?? data?.detail ?? "로그인에 실패했습니다.",
        },
        { status: upstream.status },
      );
    }

    const issuedTicket = await issueReviewSsoTicket(username);
    if (!issuedTicket.ok) {
      return NextResponse.json(
        { ok: false, message: issuedTicket.detail },
        { status: issuedTicket.status },
      );
    }

    const sessionLogin = await establishReviewSession(issuedTicket.ticket);
    if (!sessionLogin.ok) {
      return NextResponse.json(
        { ok: false, message: sessionLogin.detail },
        { status: sessionLogin.status },
      );
    }

    const token = await createAuthToken(username);
    const reviewSsoUrl = issuedTicket.launchUrl;

    const response = NextResponse.json({ ok: true, reviewSsoUrl });
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
    console.error("[api/external/login] error:", error);
    return NextResponse.json(
      { ok: false, message: "로그인 요청 처리에 실패했습니다." },
      { status: 502 },
    );
  }
}
