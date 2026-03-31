"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPinned, Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SplitText } from "@/components/split-text/SplitText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChildAccount = {
  id: number;
  username: string;
  nickname: string | null;
  status: string;
  assignedCount: number;
};

type PlaceMeta = {
  alias: string;
  placename: string;
  mid: string | null;
  amount: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeChildren(data: unknown): ChildAccount[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter(isRecord)
    .map((item) => {
      const id = Number(item.id);
      const username =
        typeof item.username === "string" && item.username.trim()
          ? item.username.trim()
          : "";

      return {
        id: Number.isFinite(id) ? id : 0,
        username,
        nickname:
          typeof item.nickname === "string" && item.nickname.trim()
            ? item.nickname.trim()
            : null,
        status:
          typeof item.status === "string" && item.status.trim()
            ? item.status.trim().toLowerCase()
            : "inactive",
        assignedCount: Number(item.assigned_count ?? item.assignedCount ?? 0) || 0,
      } satisfies ChildAccount;
    })
    .filter((item) => item.id > 0 && item.username);
}

function normalizePlaces(data: unknown): PlaceMeta[] {
  const meta = isRecord(data) && Array.isArray(data.meta) ? data.meta : [];

  return meta
    .filter(isRecord)
    .map((item) => ({
      alias:
        typeof item.alias === "string" && item.alias.trim() ? item.alias.trim() : "",
      placename:
        typeof item.placename === "string" && item.placename.trim()
          ? item.placename.trim()
          : typeof item.alias === "string" && item.alias.trim()
            ? item.alias.trim()
            : "이름 없음",
      mid:
        item.mid == null || item.mid === ""
          ? null
          : String(item.mid).trim() || null,
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : null,
    }))
    .filter((item) => item.alias);
}

function normalizeAssignedAliases(data: unknown): string[] {
  if (!isRecord(data) || !Array.isArray(data.aliases)) return [];
  return data.aliases
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getStatusLabel(status: string) {
  if (status === "active") return "활성";
  if (status === "locked") return "잠김";
  return "비활성";
}

function getStatusClassName(status: string) {
  if (status === "active") {
    return "bg-[#e8f6ea] text-[#2e7d32] ring-[#2e7d32]/12";
  }
  if (status === "locked") {
    return "bg-[#fff4df] text-[#b26a00] ring-[#b26a00]/12";
  }
  return "bg-[#f6ebe7] text-[#8d6e63] ring-[#8d6e63]/10";
}

function areSetsEqual(left: Set<string>, right: Set<string>) {
  if (left.size !== right.size) return false;
  for (const value of left) {
    if (!right.has(value)) return false;
  }
  return true;
}

const shellCardClassName =
  "rounded-[30px] border border-white/70 bg-[#fcf8e9]/94 shadow-[0_22px_60px_rgba(78,52,46,0.12)] backdrop-blur-xl";

export function SubAccountPlaceAssignmentDashboard() {
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [allowedPlaces, setAllowedPlaces] = useState<PlaceMeta[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildAccount | null>(null);
  const [assignedAliases, setAssignedAliases] = useState<Set<string>>(new Set());
  const [draftAliases, setDraftAliases] = useState<Set<string>>(new Set());
  const [leftSearch, setLeftSearch] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      setChildrenLoading(true);
      setPlacesLoading(true);

      try {
        const [childrenRes, placesRes] = await Promise.all([
          fetch("/api/parent/my-children", { cache: "no-store" }),
          fetch("/api/parent/allowed-places", { cache: "no-store" }),
        ]);

        const [childrenData, placesData] = await Promise.all([
          childrenRes.json().catch(() => []),
          placesRes.json().catch(() => ({ aliases: [], meta: [] })),
        ]);

        if (cancelled) return;

        setChildren(childrenRes.ok ? normalizeChildren(childrenData) : []);
        setAllowedPlaces(placesRes.ok ? normalizePlaces(placesData) : []);
      } catch {
        if (cancelled) return;
        setChildren([]);
        setAllowedPlaces([]);
        toast.error("하위 계정 또는 플레이스 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setChildrenLoading(false);
          setPlacesLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredChildren = useMemo(() => {
    const keyword = leftSearch.trim().toLowerCase();
    if (!keyword) return children;

    return children.filter(
      (item) =>
        item.username.toLowerCase().includes(keyword) ||
        (item.nickname ?? "").toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword) ||
        getStatusLabel(item.status).includes(keyword),
    );
  }, [children, leftSearch]);

  const filteredPlaces = useMemo(() => {
    const keyword = placeSearch.trim().toLowerCase();
    if (!keyword) return allowedPlaces;

    return allowedPlaces.filter(
      (item) =>
        item.alias.toLowerCase().includes(keyword) ||
        item.placename.toLowerCase().includes(keyword) ||
        (item.mid ?? "").toLowerCase().includes(keyword),
    );
  }, [allowedPlaces, placeSearch]);

  const isDirty = useMemo(
    () => !areSetsEqual(assignedAliases, draftAliases),
    [assignedAliases, draftAliases],
  );

  const handleSelectChild = async (child: ChildAccount) => {
    setSelectedChild(child);
    setSelectionLoading(true);
    setPlaceSearch("");

    try {
      const res = await fetch(
        `/api/parent/child-assigned-places?username=${encodeURIComponent(child.username)}`,
        { cache: "no-store" },
      );
      const data = await res.json().catch(() => ({ aliases: [] }));
      const aliases = res.ok ? normalizeAssignedAliases(data) : [];
      const nextSet = new Set(aliases);
      setAssignedAliases(nextSet);
      setDraftAliases(new Set(aliases));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "배정된 플레이스를 불러오지 못했습니다.",
        );
      }
    } catch (error) {
      setAssignedAliases(new Set());
      setDraftAliases(new Set());
      toast.error(
        error instanceof Error
          ? error.message
          : "배정된 플레이스를 불러오지 못했습니다.",
      );
    } finally {
      setSelectionLoading(false);
    }
  };

  const togglePlace = (alias: string) => {
    if (!selectedChild) return;

    setDraftAliases((current) => {
      const next = new Set(current);
      if (next.has(alias)) {
        next.delete(alias);
      } else {
        next.add(alias);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedChild) return;

    setSaving(true);

    try {
      const aliases = Array.from(draftAliases);
      const res = await fetch("/api/parent/save-child-assigned-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedChild.username,
          aliases,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string" ? data.detail : "저장에 실패했습니다.",
        );
      }

      setAssignedAliases(new Set(aliases));
      setChildren((current) =>
        current.map((item) =>
          item.username === selectedChild.username
            ? { ...item, assignedCount: aliases.length }
            : item,
        ),
      );
      setSelectedChild((current) =>
        current ? { ...current, assignedCount: aliases.length } : current,
      );
      toast.success("플레이스 배정을 저장했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="popcorn-container space-y-6 md:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <section className="py-2">
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4e342e] text-[#fcf8e9] shadow-md"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <MapPinned size={24} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
            <SplitText
              text="하위 계정 플레이스 배정"
              tag="span"
              splitType="chars"
              delay={40}
              duration={0.9}
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              rootMargin="-50px"
              className="inline"
            />
          </h1>
        </motion.div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[500px_minmax(0,1fr)]">
        <div className={cn(shellCardClassName, "overflow-hidden p-4 sm:p-5")}>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4e342e]/35"
              />
              <Input
                value={leftSearch}
                onChange={(event) => setLeftSearch(event.target.value)}
                placeholder="하위 계정 검색(+아이디)"
                className="pl-10"
              />
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-[#4e342e]/10 bg-white/78">
              <div className="min-w-[436px]">
                <div className="grid grid-cols-[52px_minmax(0,1.4fr)_92px_112px_88px] border-b border-[#4e342e]/10 bg-[#fff0c8] px-3 py-3 text-center text-[13px] font-bold text-[#4e342e]">
                  <span>#</span>
                  <span>아이디</span>
                  <span>상태</span>
                  <span>현재 배정 수</span>
                  <span>Action</span>
                </div>

                <div className="max-h-[560px] overflow-y-auto">
                  {childrenLoading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-[#4e342e]/60">
                      <Loader2 size={16} className="animate-spin" />
                      하위 계정을 불러오는 중입니다.
                    </div>
                  ) : filteredChildren.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-[#4e342e]/55">
                      검색 결과가 없습니다.
                    </div>
                  ) : (
                    filteredChildren.map((child, index) => {
                      const isSelected = selectedChild?.username === child.username;
                      const displayName = child.nickname || child.username;

                      return (
                        <div
                          key={child.id}
                          className={cn(
                            "grid grid-cols-[52px_minmax(0,1.4fr)_92px_112px_88px] items-center border-b border-[#4e342e]/8 px-3 py-3 text-center text-[13px] last:border-b-0",
                            isSelected && "bg-[#fff7e2]",
                          )}
                        >
                          <span className="font-medium text-[#4e342e]/75">
                            {index + 1}
                          </span>
                          <span
                            className="truncate text-center font-semibold text-[#4e342e]"
                            title={displayName}
                          >
                            {child.username}
                          </span>
                          <span className="flex justify-center">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                                getStatusClassName(child.status),
                              )}
                            >
                              {getStatusLabel(child.status)}
                            </span>
                          </span>
                          <span className="font-semibold text-[#4e342e]/80">
                            {child.assignedCount.toLocaleString("ko-KR")}
                          </span>
                          <span className="flex justify-center">
                            <Button
                              type="button"
                              variant={isSelected ? "popcorn" : "outline"}
                              size="sm"
                              className={cn(
                                "h-9 min-w-[58px] rounded-full text-[12px] font-semibold",
                                !isSelected &&
                                  "border-[#4e342e]/12 bg-white text-[#4e342e] hover:bg-[#4e342e]/6",
                              )}
                              onClick={() => void handleSelectChild(child)}
                            >
                              변경
                            </Button>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(shellCardClassName, "p-4 sm:p-5 lg:p-6")}>
          {!selectedChild ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[26px] border border-dashed border-[#4e342e]/15 bg-white/42 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3d6] text-[#ffa000] shadow-sm">
                <MapPinned size={28} />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-[#4e342e]">
                하위 계정을 선택해 주세요
              </h2>
              <p className="mt-2 break-keep text-sm leading-6 text-[#4e342e]/58">
                왼쪽 목록에서 `변경` 버튼을 누르면 해당 계정의 플레이스 배정 목록을
                확인하고 수정할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-[28px] font-bold tracking-tight text-[#4e342e] sm:text-[32px]">
                    {(selectedChild.nickname || selectedChild.username) +
                      " - 플레이스 배정"}
                  </h2>
                  <div className="mt-3 rounded-2xl border border-[#7ac7d8]/24 bg-[#dff5fb] px-4 py-3 text-sm leading-6 text-[#4e342e]/72">
                    이 하위 계정은 부모 계정에 배정된 플레이스 중에서만 선택할 수
                    있습니다.
                  </div>
                </div>

                <Button
                  type="button"
                  variant="popcorn"
                  className="h-11 shrink-0 px-5 text-sm font-bold"
                  disabled={saving || selectionLoading || !isDirty}
                  onClick={() => void handleSave()}
                >
                  {saving ? "저장 중..." : "저장"}
                </Button>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4e342e]/35"
                />
                <Input
                  value={placeSearch}
                  onChange={(event) => setPlaceSearch(event.target.value)}
                  placeholder="플레이스 검색(이름/별칭)"
                  className="pl-10"
                  disabled={selectionLoading || placesLoading}
                />
              </div>

              <div className="min-h-[420px]">
                {selectionLoading || placesLoading ? (
                  <div className="flex min-h-[420px] items-center justify-center gap-2 rounded-[26px] border border-[#4e342e]/10 bg-white/42 text-sm text-[#4e342e]/60">
                    <Loader2 size={16} className="animate-spin" />
                    플레이스 정보를 불러오는 중입니다.
                  </div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="flex min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-[#4e342e]/15 bg-white/42 px-6 text-center text-sm text-[#4e342e]/55">
                    검색 조건에 맞는 플레이스가 없습니다.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
                    {filteredPlaces.map((place) => {
                      const isSelected = draftAliases.has(place.alias);

                      return (
                        <button
                          key={place.alias}
                          type="button"
                          onClick={() => togglePlace(place.alias)}
                          className={cn(
                            "group rounded-[22px] border bg-white/86 px-4 py-4 text-left shadow-sm transition-all",
                            "hover:-translate-y-0.5 hover:shadow-md",
                            isSelected
                              ? "border-[#ffa000]/75 bg-[#fff3d6] shadow-[0_2px_0_rgba(255,160,0,0.18)] ring-2 ring-[#ffa000]/18"
                              : "border-[#4e342e]/10 hover:border-[#4e342e]/18",
                          )}
                          aria-pressed={isSelected}
                          title={place.placename}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[15px] font-semibold text-[#4e342e]">
                                {place.placename}
                              </div>
                              <div
                                className="mt-2 truncate text-sm text-[#4e342e]/70"
                                title={`작업량: ${
                                  place.amount != null
                                    ? `${place.amount.toLocaleString("ko-KR")}개`
                                    : "-"
                                }`}
                              >
                                작업량:{" "}
                                {place.amount != null
                                  ? `${place.amount.toLocaleString("ko-KR")}개`
                                  : "-"}
                              </div>
                              <div
                                className="mt-1 truncate text-sm text-[#4e342e]/58"
                                title={place.mid ?? undefined}
                              >
                                MID: {place.mid ?? "-"}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 rounded-full border transition-colors",
                                isSelected
                                  ? "border-[#ffa000] bg-[#ffa000]"
                                  : "border-[#4e342e]/15 bg-white",
                              )}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
