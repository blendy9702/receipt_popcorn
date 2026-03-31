"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  CheckCheck,
  LayoutGrid,
  Search,
  Tags,
  X,
} from "lucide-react";
import { SplitText } from "@/components/split-text/SplitText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ScreenCard = {
  id: string;
  name: string;
  alias: string;
};

const screenCards: ScreenCard[] = [
  { id: "1", name: "TSG통삼각 신사점", alias: "tsgtongsam12" },
  { id: "2", name: "아우리움헤어 천호점", alias: "auriumhair" },
  { id: "3", name: "한다히논술연구소", alias: "handahuenon" },
  { id: "4", name: "온다스시 고양화정점", alias: "ondagoyang825" },
  { id: "5", name: "맛단식육식당", alias: "makdansik" },
  { id: "6", name: "장씨해녀집 연화리", alias: "jangyunhwa" },
  { id: "7", name: "엘리제커피 서천점", alias: "elize" },
  { id: "8", name: "보배반점 명동점", alias: "bobaemyungdong" },
  { id: "9", name: "브이회원 수성점", alias: "vhossustung" },
  { id: "10", name: "쌤슨 광고점", alias: "samsungwang1" },
  { id: "11", name: "도선재", alias: "dosunjae1" },
  { id: "12", name: "스케쳐스 도곡점", alias: "skechers1" },
  { id: "13", name: "로얄베이크하우스 강남역점", alias: "royalbakegangnam" },
  { id: "14", name: "플로렌스요가앤필라테스 수원점", alias: "florencesuwon" },
  { id: "15", name: "더브런치랩 해운대점", alias: "thebrunchlabhaeundae" },
  { id: "16", name: "에이치큐스터디카페 동탄점", alias: "hqstudydongtan" },
  { id: "17", name: "오리온 고양화정점", alias: "oriongaoyang" },
  { id: "18", name: "스타벅스 고양화정점", alias: "starbucksgaoyang" },
  { id: "19", name: "카페베네 고양화정점", alias: "cafebene" },
  { id: "20", name: "투썸플레이스 고양화정점", alias: "twosumplay" },
  { id: "21", name: "더브런치랩 고양화정점", alias: "thebrunchlabgaoyang" },
  { id: "22", name: "에이치큐스터디카페 고양화정점", alias: "hqstudygaoyang" },
  { id: "23", name: "오리온 고양화정점", alias: "oriongaoyang" },
  { id: "24", name: "스타벅스 고양화정점", alias: "starbucksgaoyang" },
];

const textareaClassName =
  "min-h-[92px] w-full rounded-[24px] border border-[#4e342e]/15 bg-white/85 px-4 py-3 text-sm text-[#4e342e] shadow-sm transition-colors placeholder:text-[#4e342e]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4e342e]/15 disabled:cursor-not-allowed disabled:opacity-50";

export function ScreenManagementDashboard() {
  const [search, setSearch] = useState("");
  const [bulkExclude, setBulkExclude] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "카드를 선택한 뒤 저장 유형을 선택할 수 있습니다.",
  );

  const filteredCards = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return screenCards;
    }

    return screenCards.filter(
      (card) =>
        card.name.toLowerCase().includes(keyword) ||
        card.alias.toLowerCase().includes(keyword),
    );
  }, [search]);

  const selectedCards = useMemo(
    () => screenCards.filter((card) => selectedIds.includes(card.id)),
    [selectedIds],
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allFilteredSelected =
    filteredCards.length > 0 &&
    filteredCards.every((card) => selectedSet.has(card.id));

  const toggleCard = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredCards.map((card) => card.id));
    setStatusMessage(
      `${filteredCards.length.toLocaleString("ko-KR")}개의 화면을 전체 선택했습니다.`,
    );
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    setStatusMessage("선택된 화면을 모두 해제했습니다.");
  };

  const handleSave = (mode: "replace" | "append") => {
    const excludeList = bulkExclude
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const selectedNames = selectedCards.map((card) => card.name).slice(0, 3);
    const selectedSummary =
      selectedNames.length > 0
        ? `${selectedNames.join(", ")}${
            selectedCards.length > 3
              ? ` 외 ${selectedCards.length - 3}개`
              : ""
          }`
        : "선택된 화면 없음";

    setStatusMessage(
      `${mode === "replace" ? "저장(교체)" : "저장(추가)"}: ${selectedSummary} / 제외 alias ${excludeList.length}개`,
    );
  };

  return (
    <motion.div
      className="popcorn-container space-y-6 md:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
            <LayoutGrid size={24} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
            <SplitText
              text="화면 관리"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <section className="rounded-[28px] bg-[#fcf8e9]/94 p-6 shadow-[0_18px_55px_rgba(78,52,46,0.08)] ring-1 ring-white/70 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#4e342e]">
                  선택 조건
                </h2>
                <p className="mt-1 text-sm text-[#4e342e]/60">
                  검색과 제외 alias를 입력해 저장 대상을 좁힐 수 있습니다.
                </p>
              </div>
              <div className="hidden rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#4e342e]/60 ring-1 ring-[#4e342e]/8 sm:block">
                총 {screenCards.length.toLocaleString("ko-KR")}개
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#4e342e]">
                검색 (이름/별칭)
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#4e342e]/35"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="검색어 입력"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#4e342e]">
                대량 제외 (alias를 ,로 구분)
              </label>
              <div className="relative">
                <Tags
                  size={16}
                  className="pointer-events-none absolute left-4 top-4 z-10 text-[#4e342e]/35"
                />
                <textarea
                  value={bulkExclude}
                  onChange={(event) => setBulkExclude(event.target.value)}
                  placeholder="예: aliasA, aliasB"
                  className={cn(textareaClassName, "resize-none pl-10")}
                />
              </div>
              <p className="text-sm leading-6 text-[#4e342e]/45">
                선택한 카드와 제외 alias를 기준으로 저장 대상을 조정합니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="glass"
                className="h-12 rounded-full border border-[#ffa000]/70 bg-[#fff3d6] text-base font-semibold text-[#4e342e] hover:bg-[#ffe9b0]"
                onClick={() => handleSave("replace")}
              >
                저장(교체)
              </Button>
              <Button
                variant="glass"
                className="h-12 rounded-full border border-[#ffa000]/70 bg-[#fff3d6] text-base font-semibold text-[#4e342e] hover:bg-[#ffe9b0]"
                onClick={() => handleSave("append")}
              >
                저장(추가)
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-[#fcf8e9]/94 p-6 shadow-[0_18px_55px_rgba(78,52,46,0.08)] ring-1 ring-white/70 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#4e342e]">
                  화면 목록
                </h2>
                <p className="mt-1 text-sm text-[#4e342e]/60">
                  원하는 화면을 선택하고 저장 대상에 포함할 수 있습니다.
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]"
                  onClick={handleSelectAll}
                >
                  <CheckCheck size={16} />
                  전체선택
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]"
                  onClick={handleClearAll}
                >
                  <X size={16} />
                  전체해제
                </Button>
              </div>
            </div>

            <div className="grid h-[520px] grid-cols-1 gap-3 overflow-y-auto overscroll-y-contain px-1 py-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCards.map((card) => {
                const isSelected = selectedSet.has(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    title={`${card.name} (${card.alias})`}
                    className={cn(
                      "min-w-0 rounded-2xl border bg-white/88 px-4 py-3 text-left shadow-sm transition-all",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      isSelected
                        ? "border-[#ffa000]/80 bg-[#fff3d6] shadow-[inset_0_0_0_1px_rgba(255,160,0,0.22),0_10px_24px_rgba(255,160,0,0.16)]"
                        : "border-[#4e342e]/10 hover:border-[#4e342e]/20",
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${card.name} (${card.alias})`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="max-w-full truncate text-[15px] font-semibold text-[#4e342e]">
                          {card.name}
                        </div>
                        <div className="mt-1 max-w-full truncate text-sm text-[#4e342e]/55">
                          {card.alias}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#ffa000] bg-[#ffa000] text-white"
                            : "border-[#4e342e]/15 bg-white text-transparent",
                        )}
                      >
                        <CheckCheck size={12} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredCards.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#4e342e]/15 bg-white/60 px-4 py-10 text-center text-sm text-[#4e342e]/55">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
