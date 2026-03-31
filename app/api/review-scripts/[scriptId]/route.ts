import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

type RouteContext = {
  params: Promise<{ scriptId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { scriptId } = await context.params;
    const res = await fetch(
      `${EXTERNAL_API.reviewScriptsBase}/${encodeURIComponent(scriptId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...auth.headers,
        },
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/review-scripts/[scriptId]] GET error:", error);
    return NextResponse.json(
      { detail: "원고 내용을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { scriptId } = await context.params;
    const res = await fetch(
      `${EXTERNAL_API.reviewScriptsBase}/${encodeURIComponent(scriptId)}`,
      {
        method: "PATCH",
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
    console.error("[api/review-scripts/[scriptId]] PATCH error:", error);
    return NextResponse.json(
      { detail: "원고 수정 저장에 실패했습니다." },
      { status: 502 },
    );
  }
}
