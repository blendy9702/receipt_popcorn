import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

function normalizeImagePath(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.startsWith("review_images/")) return raw;
  if (raw.startsWith("/review_images/")) return raw.slice(1);
  return "";
}

export async function GET(request: Request) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return Response.json({ detail: auth.detail }, { status: auth.status });
    }

    const path = normalizeImagePath(
      new URL(request.url).searchParams.get("path") ?? "",
    );
    if (!path) {
      return Response.json(
        { detail: "이미지 경로가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const res = await fetch(`${EXTERNAL_API.internalBase}/${path}`, {
      method: "GET",
      headers: {
        ...auth.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { detail: "이미지를 불러오지 못했습니다." },
        { status: res.status },
      );
    }

    const contentType =
      res.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/review-images/file] GET error:", error);
    return Response.json(
      { detail: "이미지 프리뷰를 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}
