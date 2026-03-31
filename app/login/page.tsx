"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Popcorn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEV_AUTH_BYPASS_ENABLED } from "@/lib/auth-mode";

export default function LoginPage() {
  const [ssoError, setSsoError] = useState("");
  const [shouldAutoRedirect, setShouldAutoRedirect] = useState(false);

  const startSso = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const target = new URL("https://popcorn1.me/api/review-sso/start");
    target.searchParams.set("return_to", `${window.location.origin}/`);
    target.searchParams.set("entry_url", `${window.location.origin}/sso/callback`);
    return target.toString();
  }, []);

  useEffect(() => {
    if (DEV_AUTH_BYPASS_ENABLED) {
      setShouldAutoRedirect(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error")?.trim() ?? "";
    setSsoError(error);
    setShouldAutoRedirect(!error);
  }, []);

  useEffect(() => {
    if (!shouldAutoRedirect || !startSso) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.location.replace(startSso);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [shouldAutoRedirect, startSso]);

  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center bg-[#f2f2f2] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-full max-w-[400px] rounded-[32px] bg-white p-8 shadow-xl md:p-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#fff8e1] text-[#4e342e] shadow-md">
            <Popcorn size={28} />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            {DEV_AUTH_BYPASS_ENABLED
              ? "개발용 SSO 우회가 켜져 있습니다."
              : ssoError
              ? "SSO 로그인에 실패했습니다. 다시 시도해 주세요."
              : "popcorn1.me 로그인 페이지로 이동 중입니다."}
          </p>
        </div>

        <div className="space-y-6">
          {DEV_AUTH_BYPASS_ENABLED ? (
            <div className="rounded-2xl bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
              `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` 상태입니다.
            </div>
          ) : ssoError ? (
            <div className="rounded-2xl bg-red-50 p-3 text-center text-sm font-medium text-red-600">
              {ssoError}
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
              잠시만 기다려 주세요.
            </div>
          )}
          <Button
            variant="popcorn"
            onClick={() => {
              if (DEV_AUTH_BYPASS_ENABLED) {
                window.location.assign("/");
                return;
              }

              if (startSso) {
                window.location.assign(startSso);
              }
            }}
            className="h-14 w-full font-extrabold shadow-black/20"
          >
            {DEV_AUTH_BYPASS_ENABLED ? (
              <span className="flex items-center gap-2">
                개발 모드로 진입 <ArrowRight className="h-4 w-4" />
              </span>
            ) : !ssoError ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                popcorn1.me에서 다시 로그인 <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
