import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { placeId } = await params;
    const res = await fetch(
      `${EXTERNAL_API.placesBase}/${encodeURIComponent(placeId)}/goodthing`,
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
    console.error("[api/places/[placeId]/goodthing] error:", error);
    return NextResponse.json(
      { detail: "좋았던점 저장에 실패했습니다." },
      { status: 502 },
    );
  }
}
