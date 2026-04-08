import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { imageId } = await context.params;
    const res = await fetch(
      `${EXTERNAL_API.internalBase}/api/review-images/${encodeURIComponent(imageId)}`,
      {
        method: "DELETE",
        headers: {
          ...auth.headers,
        },
        cache: "no-store",
      },
    );

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : { detail: await res.text().catch(() => "") };

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/review-images/[imageId]] DELETE error:", error);
    return NextResponse.json(
      { detail: "이미지 삭제에 실패했습니다." },
      { status: 502 },
    );
  }
}
