import { NextRequest, NextResponse } from "next/server";
import { EXTERNAL_API } from "@/lib/external-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username =
      typeof body?.username === "string" ? body.username.trim() : "";

    if (!username) {
      return NextResponse.json(
        { status: "inactive", message: "아이디를 입력해 주세요." },
        { status: 400 },
      );
    }

    const upstream = await fetch(EXTERNAL_API.usersExists, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    const exists = data?.user_id != null;

    return NextResponse.json(
      exists
        ? { status: "active" }
        : {
            status: "inactive",
            message: data?.message ?? data?.detail ?? "사용할 수 없는 계정입니다.",
          },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    console.error("[api/account/check] error:", error);
    return NextResponse.json(
      { status: "inactive", message: "계정 상태 확인에 실패했습니다." },
      { status: 502 },
    );
  }
}
