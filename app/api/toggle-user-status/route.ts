import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function POST(request: Request) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const res = await fetch(
      `${EXTERNAL_API.internalBase}/api/toggle-user-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth.headers,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/toggle-user-status] error:", error);
    return NextResponse.json(
      { detail: "계정 상태 변경에 실패했습니다." },
      { status: 502 },
    );
  }
}
