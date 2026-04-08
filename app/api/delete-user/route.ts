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
    const res = await fetch(`${EXTERNAL_API.internalBase}/api/delete-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/delete-user] error:", error);
    return NextResponse.json(
      { detail: "계정 삭제에 실패했습니다." },
      { status: 502 },
    );
  }
}
