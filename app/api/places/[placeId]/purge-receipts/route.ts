import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { placeId } = await params;
    const res = await fetch(
      `${EXTERNAL_API.placesBase}/${encodeURIComponent(placeId)}/purge-receipts`,
      {
        method: "DELETE",
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
    console.error("[api/places/[placeId]/purge-receipts] error:", error);
    return NextResponse.json(
      { detail: "영수증 전체 삭제에 실패했습니다." },
      { status: 502 },
    );
  }
}
