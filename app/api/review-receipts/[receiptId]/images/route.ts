import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

type RouteContext = {
  params: Promise<{ receiptId: string }>;
};

function normalizeImagePath(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (raw.startsWith("/review_images/")) return raw.slice(1);
  if (raw.startsWith("review_images/")) return raw;
  if (raw.startsWith("/")) return raw.slice(1);
  return raw;
}

function toProxyImageUrl(value: unknown) {
  const normalized = normalizeImagePath(value);
  if (!normalized) return null;
  return `/api/review-images/file?path=${encodeURIComponent(normalized)}`;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { receiptId } = await context.params;
    const res = await fetch(
      `${EXTERNAL_API.internalBase}/api/review-receipts/${encodeURIComponent(receiptId)}/images`,
      {
        method: "GET",
        headers: {
          ...auth.headers,
        },
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ([]));
    const mapped = Array.isArray(data)
      ? data.map((item) => {
          const record =
            typeof item === "object" && item !== null
              ? (item as Record<string, unknown>)
              : {};
          const proxiedUrl =
            toProxyImageUrl(record.url) ?? toProxyImageUrl(record.filename);
          return {
            ...record,
            url: proxiedUrl,
          };
        })
      : data;
    return NextResponse.json(mapped, { status: res.status });
  } catch (error) {
    console.error("[api/review-receipts/[receiptId]/images] GET error:", error);
    return NextResponse.json(
      { detail: "이미지 목록을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const { receiptId } = await context.params;
    const formData = await request.formData();
    const res = await fetch(
      `${EXTERNAL_API.internalBase}/api/review-receipts/${encodeURIComponent(receiptId)}/images`,
      {
        method: "POST",
        headers: {
          ...auth.headers,
        },
        body: formData,
        cache: "no-store",
      },
    );

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : { detail: await res.text().catch(() => "") };

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/review-receipts/[receiptId]/images] POST error:", error);
    return NextResponse.json(
      { detail: "이미지 업로드에 실패했습니다." },
      { status: 502 },
    );
  }
}
