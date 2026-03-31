import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { placeId } = await params;
    const res = await fetch(`${EXTERNAL_API.reviewsByPlace}/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...auth.headers,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/reviews/by-place/[placeId]] error:", error);
    return NextResponse.json(
      { detail: "리뷰 목록을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
