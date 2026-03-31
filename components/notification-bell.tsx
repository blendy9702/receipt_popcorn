"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: number;
  category: string;
  notification_type: string;
  shortage_amount_total: number;
  payload_json: Record<string, unknown> | null;
  is_resolved: boolean;
  is_read: boolean;
  created_at: string;
  last_occurred_at: string;
};

type NotificationMeResponse = {
  summary?: {
    unread_count?: number;
    total_count?: number;
  };
  items?: NotificationItem[];
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function formatKst(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

function itemTitle(item: NotificationItem) {
  const title = asString(item.payload_json?.title);
  if (title) return title;
  if (
    item.notification_type === "point_insufficient_hold" ||
    item.category === "point"
  ) {
    return "이용권 부족";
  }
  return "시스템 알림";
}

function itemMessage(item: NotificationItem) {
  const message = asString(item.payload_json?.message);
  if (message) return message;
  if (
    item.notification_type === "point_insufficient_hold" ||
    item.category === "point"
  ) {
    return `누적 부족 이용권: ${item.shortage_amount_total.toLocaleString("ko-KR")}`;
  }
  return "새 알림이 도착했습니다.";
}

export function NotificationBell() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [previewItems, setPreviewItems] = useState<NotificationItem[]>([]);
  const [modalItems, setModalItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async (limit: number) => {
    const qs = new URLSearchParams({
      limit: String(limit),
      offset: "0",
      unread_only: "false",
    });
    const res = await fetch(`/api/notifications/me?${qs.toString()}`, {
      cache: "no-store",
    });
    const data = (await res
      .json()
      .catch(() => ({}))) as NotificationMeResponse;
    if (!res.ok) {
      throw new Error(
        (data as { detail?: string })?.detail ?? "알림을 불러오지 못했습니다.",
      );
    }
    return data;
  };

  const refreshPreview = async () => {
    setLoadingPreview(true);
    try {
      const data = await fetchNotifications(5);
      setPreviewItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.summary?.unread_count ?? 0));
      setTotalCount(Number(data.summary?.total_count ?? 0));
    } catch {
      setPreviewItems([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  const loadModal = async () => {
    setLoadingModal(true);
    try {
      const data = await fetchNotifications(20);
      setModalItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(Number(data.summary?.unread_count ?? 0));
      setTotalCount(Number(data.summary?.total_count ?? 0));
    } catch {
      setModalItems([]);
    } finally {
      setLoadingModal(false);
    }
  };

  useEffect(() => {
    void refreshPreview();
    const timer = window.setInterval(() => {
      void refreshPreview();
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!previewOpen || !wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) {
        setPreviewOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [previewOpen]);

  const unreadBadge = useMemo(() => {
    if (unreadCount <= 0) return null;
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  return (
    <>
      <div
        ref={wrapRef}
        className="fixed right-4 top-3 z-40 xl:right-8 xl:top-6"
      >
        {previewOpen && (
          <motion.div
            className={cn(
              "absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[26px]",
              "border border-[#4e342e]/15 bg-[#fcf8e9]/98 text-[#4e342e]",
              "shadow-[0_18px_40px_rgba(78,52,46,0.16)]",
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#4e342e]/10 bg-linear-to-r from-[#ffedc8]/95 to-[#fcf8e9] px-4 py-3">
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  최근 알림
                </p>
                <p className="mt-0.5 text-[11px] text-[#4e342e]/55">
                  최근 5건 미리보기
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-[#4e342e]/15 bg-white/80 px-3 py-1.5 text-xs font-semibold transition hover:bg-[#fff0c8]"
                onClick={() => {
                  setModalOpen(true);
                  setPreviewOpen(false);
                  void loadModal();
                }}
              >
                전체 보기
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loadingPreview ? (
                <div className="flex items-center gap-2 px-4 py-8 text-sm text-[#4e342e]/55">
                  <Loader2 className="h-4 w-4 animate-spin text-[#d08900]" />
                  불러오는 중...
                </div>
              ) : previewItems.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-[#4e342e]/65">
                  새 알림이 없습니다.
                </div>
              ) : (
                previewItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full flex-col gap-1 border-b border-[#4e342e]/8 px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fff8e1]"
                    onClick={() => {
                      setModalOpen(true);
                      setPreviewOpen(false);
                      void loadModal();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {!item.is_read && (
                        <span className="inline-flex rounded-full bg-[#ffa000]/20 px-2 py-0.5 text-[11px] font-semibold text-[#a35c00]">
                          NEW
                        </span>
                      )}
                      <span className="truncate text-sm font-semibold text-[#4e342e]">
                        {itemTitle(item)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-[#4e342e]/68">
                      {itemMessage(item)}
                    </p>
                    <p className="text-[11px] text-[#4e342e]/45">
                      {formatKst(item.last_occurred_at || item.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        <button
          type="button"
          aria-label="알림 열기"
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4e342e]/15",
            "bg-[#fcf8e9]/92 text-[#4e342e] shadow-[0_12px_30px_rgba(78,52,46,0.12)] backdrop-blur-xl",
            "transition hover:-translate-y-0.5 hover:bg-[#fff0c8] hover:shadow-[0_16px_36px_rgba(78,52,46,0.18)]",
          )}
          onClick={() => {
            setPreviewOpen((current) => !current);
            if (!previewOpen) {
              void refreshPreview();
            }
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadBadge && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffa000] px-1 text-[11px] font-bold text-[#4e342e] ring-2 ring-[#fcf8e9]">
              {unreadBadge}
            </span>
          )}
        </button>
      </div>

      {modalOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[860px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[#fcf8e9]/96 p-5 shadow-[0_22px_60px_rgba(78,52,46,0.16)] backdrop-blur-xl sm:max-h-[calc(100vh-3rem)] sm:p-6"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                알림 목록
              </h2>
              <p className="mt-2 text-sm text-[#4e342e]/60">
                전체 {totalCount.toLocaleString("ko-KR")}건, 미읽음{" "}
                {unreadCount.toLocaleString("ko-KR")}건
              </p>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-[#4e342e]/10 bg-white/75">
              {loadingModal ? (
                <div className="flex items-center gap-2 px-5 py-10 text-sm text-[#4e342e]/55">
                  <Loader2 className="h-4 w-4 animate-spin text-[#d08900]" />
                  알림을 불러오는 중입니다.
                </div>
              ) : modalItems.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-[#4e342e]/65">
                  표시할 알림이 없습니다.
                </div>
              ) : (
                modalItems.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-[#4e342e]/8 px-5 py-4 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {!item.is_read && (
                        <span className="inline-flex rounded-full bg-[#ffa000]/20 px-2 py-0.5 text-[11px] font-semibold text-[#a35c00]">
                          미읽음
                        </span>
                      )}
                      {item.is_resolved && (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          해결됨
                        </span>
                      )}
                      <span className="text-sm font-semibold text-[#4e342e]">
                        {itemTitle(item)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#4e342e]/72">
                      {itemMessage(item)}
                    </p>
                    <p className="mt-2 text-xs text-[#4e342e]/45">
                      {formatKst(item.last_occurred_at || item.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
