import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EXTERNAL_API } from "@/lib/external-api";
import { AUTH_TOKEN_COOKIE, verifyAuthToken } from "@/lib/jwt";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function GET() {
  try {
    const auth = await buildProxyAuthHeaders();
    if (auth.ok) {
      const res = await fetch(`${EXTERNAL_API.account}/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...auth.headers,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return NextResponse.json(data, { status: res.status });
      }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { detail: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      username: payload.username,
      user_id: null,
      company_name: null,
      mileage_balance: 0,
      ticket_balances: {},
    });
  } catch (error) {
    console.error("[api/account/me] error:", error);
    return NextResponse.json(
      { detail: "사용자 정보를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
