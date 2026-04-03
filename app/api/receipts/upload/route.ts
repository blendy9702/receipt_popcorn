import { NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";
import { buildProxyAuthHeaders } from "@/lib/proxy-auth";

export async function POST(request: Request) {
  try {
    const auth = await buildProxyAuthHeaders();
    if (!auth.ok) {
      return NextResponse.json({ detail: auth.detail }, { status: auth.status });
    }

    const formData = await request.formData();

    const res = await fetch(`${EXTERNAL_API.internalBase}/api/receipts/upload`, {
      method: "POST",
      headers: { ...auth.headers },
      body: formData,
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : { detail: await res.text().catch(() => "") };

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[api/receipts/upload] error:", error);
    return NextResponse.json(
      { detail: "영수증 업로드에 실패했습니다." },
      { status: 502 },
    );
  }
}
