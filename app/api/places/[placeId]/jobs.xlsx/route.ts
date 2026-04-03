import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> },
) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return Response.json({ detail: auth.detail }, { status: auth.status });
    }

    const requestUrl = new URL(request.url);
    const { placeId } = await params;
    const upstreamUrl = new URL(
      `${EXTERNAL_API.placesBase}/${encodeURIComponent(placeId)}/jobs.xlsx`,
    );
    requestUrl.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.append(key, value);
    });

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        ...auth.headers,
      },
      cache: "no-store",
    });

    const body = await res.arrayBuffer();
    const headers = new Headers();
    const contentType = res.headers.get("content-type");
    const contentDisposition = res.headers.get("content-disposition");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }

    return new Response(body, {
      status: res.status,
      headers,
    });
  } catch (error) {
    console.error("[api/places/[placeId]/jobs.xlsx] error:", error);
    return Response.json(
      { detail: "다운로드에 실패했습니다." },
      { status: 502 },
    );
  }
}
