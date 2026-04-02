import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { detail: "업로드할 TXT 파일이 필요합니다." },
        { status: 400 },
      );
    }

    const nextFormData = new FormData();
    nextFormData.append("file", file);

    const { placeId } = await params;
    const res = await fetch(
      `${EXTERNAL_API.placesBase}/${encodeURIComponent(placeId)}/scripts/replace`,
      {
        method: "POST",
        headers: {
          ...auth.headers,
        },
        body: nextFormData,
        cache: "no-store",
      },
    );

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : { detail: await res.text().catch(() => "") };

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/places/[placeId]/scripts/replace] error:", error);
    return NextResponse.json(
      { detail: "원고 교체 실행에 실패했습니다." },
      { status: 502 },
    );
  }
}
