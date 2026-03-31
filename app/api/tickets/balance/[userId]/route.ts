import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { userId } = await context.params;
    const safeUserId = encodeURIComponent(userId);

    const res = await fetch(`${EXTERNAL_API.ticketsBalance}/${safeUserId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/tickets/balance/[userId]] error:", error);
    return NextResponse.json(
      { detail: "계정 이용권 정보를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
