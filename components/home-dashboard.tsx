"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  EyeOff,
  FilePenLine,
  MapPinned,
  Menu,
  PackageSearch,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  Sparkles,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SplitText } from "@/components/split-text/SplitText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type PlaceItem = {
  pid: number;
  alias: string | null;
  name: string | null;
  mid: string | null;
  remaining_scripts: number;
  total: number;
  done: number;
  error: number;
  remaining: number;
  requested: number;
  today: number;
  start_date: string | null;
  receipt_count: number;
  today_target: number;
  billing_owner_display: string | null;
  status?: number | null;
  issue_status?: number | null;
};

type PlacesResponse = {
  success?: boolean;
  items?: PlaceItem[];
  offset?: number;
  limit?: number;
  has_more?: boolean;
  next_offset?: number | null;
};

type ReviewItem = {
  job_id: number | null;
  username: string | number | null;
  user_code: string | null;
  review_id: string | null;
  receipt_id: number | null;
  status: number | null;
  postdate: string | null;
  realdate: string | null;
};

type ScriptListItem = {
  review_script_id: number;
  receipt_id?: number | null;
  status: string | null;
  content: string;
  rdate?: string | null;
};

type GoodthingUiData = {
  message?: string;
  place_id: number;
  reservation_options: string[];
  reservation: string | null;
  goodthing_ori_list: string[];
  goodthing_exclude_list: string[];
};

type ScriptReplaceCountResponse =
  | number
  | {
      count?: number | string | null;
      available_count?: number | string | null;
      script_count?: number | string | null;
      total?: number | string | null;
      available?: number | string | null;
    };

const cardClassName =
  "rounded-[30px] border border-white/70 bg-[#fcf8e9]/94 shadow-[0_22px_60px_rgba(78,52,46,0.12)] backdrop-blur-xl";

function NumberCounter({
  value,
  className = "text-[#4e342e]",
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 15, stiffness: 50 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsub = spring.on("change", (latest: number) =>
      setDisplay(Math.round(latest)),
    );
    return () => unsub();
  }, [spring]);

  return (
    <motion.span
      className={cn("font-bold tracking-tight", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {display.toLocaleString("ko-KR")}
    </motion.span>
  );
}

function formatShortDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function formatReviewDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReviewIdentity(value: string | null) {
  if (!value) return "-";
  return value.slice(0, 3);
}

function getReviewStatusLabel(status: number | null) {
  if (status === 2) return "완료";
  if (status === 5) return "검수";
  if (status === 6) return "보류";
  if (status === 7) return "실패";
  if (status === 8) return "취소";
  return status == null ? "-" : String(status);
}

function getReviewStatusClassName(status: number | null) {
  if (status === 2) {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (status === 5) {
    return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
  }
  if (status === 6) {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }
  if (status === 7) {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  }
  if (status === 8) {
    return "bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300";
  }
  return "bg-[#fff0c8] text-[#8a5a00] ring-1 ring-[#f4d189]";
}

function getScriptStatusLabel(status: string | null) {
  if (status === "assigned") return "배정";
  if (status === "edited") return "수정됨";
  if (status === "script_only") return "영수증 미배정";
  return status ? status : "-";
}

function getScriptStatusClassName(status: string | null) {
  if (status === "assigned") {
    return "bg-[#fff0c8] text-[#8a5a00] ring-1 ring-[#f4d189]";
  }
  if (status === "edited") {
    return "bg-[#ffe4bd] text-[#b26a00] ring-1 ring-[#ffd08a]";
  }
  if (status === "script_only") {
    return "bg-[#efe7e0] text-[#7c5d54] ring-1 ring-[#dcc8bb]";
  }
  return "bg-[#fff8e1] text-[#7d5a24] ring-1 ring-[#f1d18f]";
}

function getScriptPreview(content: string, maxLength = 140) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3)}...`;
}

function parseScriptReplaceCount(data: ScriptReplaceCountResponse) {
  if (typeof data === "number" && Number.isFinite(data)) {
    return data;
  }

  if (typeof data !== "object" || data == null) {
    return 0;
  }

  const candidates = [
    data.count,
    data.available_count,
    data.script_count,
    data.total,
    data.available,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function getPlaceIssueStatus(place: PlaceItem) {
  const value = place.status ?? place.issue_status ?? 1;
  return Number(value) === 0 ? 0 : 1;
}

function getPlaceDisplayName(place: PlaceItem | null) {
  return place?.name ?? place?.alias ?? "";
}

function getReservationSelection(
  reservation: string | null,
  options: string[],
) {
  if (!reservation || reservation === "None") return new Set<string>();
  if (reservation === "random") {
    return new Set(
      ["예약 없이 이용", "예약 후 이용"].filter((item) =>
        options.includes(item),
      ),
    );
  }

  return new Set(
    reservation
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

const NAVER_REVIEW_BASE_URL = "https://m.place.naver.com/my";

export function HomeDashboard({
  username,
}: {
  username?: string;
}) {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loadLimit, setLoadLimit] = useState(200);
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);
  const [openActionMenuDirection, setOpenActionMenuDirection] = useState<
    "up" | "down"
  >("down");
  const [selectedPlaceForReviews, setSelectedPlaceForReviews] =
    useState<PlaceItem | null>(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedPlaceForScripts, setSelectedPlaceForScripts] =
    useState<PlaceItem | null>(null);
  const [scriptsModalOpen, setScriptsModalOpen] = useState(false);
  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [scripts, setScripts] = useState<ScriptListItem[]>([]);
  const [scriptEditorOpen, setScriptEditorOpen] = useState(false);
  const [scriptEditorLoading, setScriptEditorLoading] = useState(false);
  const [scriptSaving, setScriptSaving] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState<number | null>(null);
  const [editingReceiptId, setEditingReceiptId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [selectedPlaceForGoodthing, setSelectedPlaceForGoodthing] =
    useState<PlaceItem | null>(null);
  const [goodthingModalOpen, setGoodthingModalOpen] = useState(false);
  const [goodthingLoading, setGoodthingLoading] = useState(false);
  const [goodthingSaving, setGoodthingSaving] = useState(false);
  const [goodthingData, setGoodthingData] = useState<GoodthingUiData | null>(
    null,
  );
  const [draftSortDir, setDraftSortDir] = useState<"asc" | "desc">("asc");
  const [draftLoadLimit, setDraftLoadLimit] = useState(200);
  const [selectedPlaceForScriptReplace, setSelectedPlaceForScriptReplace] =
    useState<PlaceItem | null>(null);
  const [scriptReplaceModalOpen, setScriptReplaceModalOpen] = useState(false);
  const [scriptReplaceLoading, setScriptReplaceLoading] = useState(false);
  const [scriptReplaceSubmitting, setScriptReplaceSubmitting] = useState(false);
  const [scriptReplaceAvailableCount, setScriptReplaceAvailableCount] =
    useState(0);
  const [scriptReplaceFile, setScriptReplaceFile] = useState<File | null>(null);
  const scriptReplaceFileInputRef = useRef<HTMLInputElement>(null);
  const [issueStatusDialogOpen, setIssueStatusDialogOpen] = useState(false);
  const [selectedPlaceForIssueStatus, setSelectedPlaceForIssueStatus] =
    useState<PlaceItem | null>(null);
  const [pendingIssueStatus, setPendingIssueStatus] = useState<0 | 1 | null>(
    null,
  );
  const [issueStatusSubmitting, setIssueStatusSubmitting] = useState(false);
  const [hidePlaceDialogOpen, setHidePlaceDialogOpen] = useState(false);
  const [selectedPlaceForHide, setSelectedPlaceForHide] =
    useState<PlaceItem | null>(null);
  const [hidePlaceSubmitting, setHidePlaceSubmitting] = useState(false);
  const [purgeReceiptsDialogOpen, setPurgeReceiptsDialogOpen] = useState(false);
  const [selectedPlaceForPurgeReceipts, setSelectedPlaceForPurgeReceipts] =
    useState<PlaceItem | null>(null);
  const [purgeReceiptsSubmitting, setPurgeReceiptsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadPlaces = async () => {
      setPlacesLoading(true);
      try {
        const params = new URLSearchParams({
          offset: "0",
          limit: String(loadLimit),
          q: debouncedSearch,
          sort_by: "id",
          sort_dir: sortDir,
        });
        const res = await fetch(`/api/management/places?${params.toString()}`, {
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as PlacesResponse;

        if (!res.ok) {
          throw new Error(
            typeof (data as { detail?: string }).detail === "string"
              ? (data as { detail: string }).detail
              : "플레이스 목록을 불러오지 못했습니다.",
          );
        }

        if (cancelled) return;
        setPlaces(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (cancelled) return;
        setPlaces([]);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    };

    void loadPlaces();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, loadLimit, sortDir]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize, places.length, sortDir, loadLimit]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-action-menu-root='true']")
      ) {
        return;
      }
      setOpenActionMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const stats = useMemo(() => {
    const registeredPlaces = places.length;
    const completedPlaces = places.filter(
      (item) => item.remaining === 0,
    ).length;
    const completedWorkload = places.reduce((sum, item) => sum + item.done, 0);
    const remainingWorkload = places.reduce(
      (sum, item) => sum + item.remaining,
      0,
    );
    const requestedWorkload = places.reduce(
      (sum, item) => sum + item.requested,
      0,
    );
    const todayTarget = places.reduce(
      (sum, item) => sum + item.today_target,
      0,
    );

    return {
      registeredPlaces,
      completedPlaces,
      completedWorkload,
      remainingWorkload,
      requestedWorkload,
      todayTarget,
    };
  }, [places]);

  const totalPages = Math.max(
    1,
    Math.ceil(places.length / Number(pageSize || 10)),
  );
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedPlaces = useMemo(() => {
    const size = Number(pageSize || 10);
    const start = (safeCurrentPage - 1) * size;
    return places.slice(start, start + size);
  }, [pageSize, places, safeCurrentPage]);

  const pageStart =
    places.length === 0
      ? 0
      : (safeCurrentPage - 1) * Number(pageSize || 10) + 1;
  const openSettingsModal = () => {
    setDraftSortDir(sortDir);
    setDraftLoadLimit(loadLimit);
    setSettingsOpen(true);
  };

  const openReviewsModal = async (place: PlaceItem) => {
    setSelectedPlaceForReviews(place);
    setReviewsModalOpen(true);
    setReviewsLoading(true);
    setReviews([]);

    try {
      const res = await fetch(`/api/reviews/by-place/${place.pid}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => []);
      setReviews(res.ok && Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeScriptsModal = () => {
    setScriptsModalOpen(false);
    setSelectedPlaceForScripts(null);
    setScripts([]);
    setScriptEditorOpen(false);
    setEditingScriptId(null);
    setEditingReceiptId(null);
    setEditingContent("");
  };

  const openScriptsModal = async (place: PlaceItem) => {
    setOpenActionMenuId(null);
    setSelectedPlaceForScripts(place);
    setScriptsModalOpen(true);
    setScriptsLoading(true);
    setScripts([]);

    try {
      const res = await fetch(`/api/places/${place.pid}/assigned-scripts`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "원고 목록을 불러오지 못했습니다.",
        );
      }

      setScripts(Array.isArray(data) ? (data as ScriptListItem[]) : []);
    } catch (error) {
      setScripts([]);
      toast.error(
        error instanceof Error
          ? error.message
          : "원고 목록을 불러오지 못했습니다.",
      );
    } finally {
      setScriptsLoading(false);
    }
  };

  const openScriptEditor = async (script: ScriptListItem) => {
    setEditingScriptId(script.review_script_id);
    setEditingReceiptId(
      typeof script.receipt_id === "number" ? script.receipt_id : null,
    );
    setEditingContent(script.content);
    setScriptEditorOpen(true);
    setScriptEditorLoading(true);

    try {
      const res = await fetch(
        `/api/review-scripts/${script.review_script_id}`,
        {
          cache: "no-store",
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "원고 내용을 불러오지 못했습니다.",
        );
      }

      setEditingContent(
        typeof (data as { content?: string }).content === "string"
          ? (data as { content: string }).content
          : script.content,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "원고 내용을 불러오지 못했습니다.",
      );
    } finally {
      setScriptEditorLoading(false);
    }
  };

  const handleSaveScript = async () => {
    if (editingScriptId == null) return;

    const trimmed = editingContent.trim();
    if (!trimmed) {
      toast.error("수정할 원고 내용을 입력해 주세요.");
      return;
    }

    setScriptSaving(true);

    try {
      const res = await fetch(`/api/review-scripts/${editingScriptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "원고 수정 저장에 실패했습니다.",
        );
      }

      setScripts((current) =>
        current.map((item) =>
          item.review_script_id === editingScriptId
            ? {
                ...item,
                content: trimmed,
                status:
                  item.status === "script_only" ? "script_only" : "edited",
              }
            : item,
        ),
      );
      setScriptEditorOpen(false);
      toast.success("원고를 수정 저장했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "원고 수정 저장에 실패했습니다.",
      );
    } finally {
      setScriptSaving(false);
    }
  };

  const closeGoodthingModal = () => {
    setGoodthingModalOpen(false);
    setSelectedPlaceForGoodthing(null);
    setGoodthingData(null);
  };

  const openGoodthingModal = async (place: PlaceItem) => {
    setOpenActionMenuId(null);
    setSelectedPlaceForGoodthing(place);
    setGoodthingModalOpen(true);
    setGoodthingLoading(true);
    setGoodthingData(null);

    try {
      const res = await fetch(`/api/places/${place.pid}/goodthing/ui`, {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as
        | GoodthingUiData
        | { detail?: string };

      if (!res.ok) {
        throw new Error(
          "detail" in data && typeof data.detail === "string"
            ? data.detail
            : "좋았던점 정보를 불러오지 못했습니다.",
        );
      }

      if ("message" in data && data.message === "Not Allow") {
        throw new Error("비정상적인 접근입니다.");
      }

      setGoodthingData(data as GoodthingUiData);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "좋았던점 정보를 불러오지 못했습니다.",
      );
      closeGoodthingModal();
    } finally {
      setGoodthingLoading(false);
    }
  };

  const patchGoodthing = async (
    placeId: number,
    body: { reservation?: string; goodthing?: string },
  ) => {
    const res = await fetch(`/api/places/${placeId}/goodthing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        typeof (data as { detail?: string }).detail === "string"
          ? (data as { detail: string }).detail
          : "좋았던점 저장에 실패했습니다.",
      );
    }
  };

  const toggleReservation = async (option: string) => {
    if (!goodthingData || goodthingSaving) return;

    const selected = getReservationSelection(
      goodthingData.reservation,
      goodthingData.reservation_options,
    );
    if (selected.has(option)) selected.delete(option);
    else selected.add(option);

    const nextReservation = Array.from(selected).join(",");
    const previous = goodthingData.reservation;
    setGoodthingSaving(true);
    setGoodthingData({ ...goodthingData, reservation: nextReservation });

    try {
      await patchGoodthing(goodthingData.place_id, {
        reservation: nextReservation,
      });
    } catch (error) {
      setGoodthingData({ ...goodthingData, reservation: previous });
      toast.error(
        error instanceof Error
          ? error.message
          : "예약 정보 저장에 실패했습니다.",
      );
    } finally {
      setGoodthingSaving(false);
    }
  };

  const toggleGoodthingExclude = async (item: string) => {
    if (!goodthingData || goodthingSaving) return;

    const excluded = new Set(goodthingData.goodthing_exclude_list);
    const wasExcluded = excluded.has(item);
    if (wasExcluded) excluded.delete(item);
    else excluded.add(item);

    const nextExcludeList = Array.from(excluded);
    setGoodthingSaving(true);
    setGoodthingData({
      ...goodthingData,
      goodthing_exclude_list: nextExcludeList,
    });

    try {
      await patchGoodthing(goodthingData.place_id, {
        goodthing: nextExcludeList.join(","),
      });
    } catch (error) {
      setGoodthingData(goodthingData);
      toast.error(
        error instanceof Error
          ? error.message
          : "좋았던점 저장에 실패했습니다.",
      );
    } finally {
      setGoodthingSaving(false);
    }
  };

  const closeScriptReplaceModal = () => {
    setScriptReplaceModalOpen(false);
    setSelectedPlaceForScriptReplace(null);
    setScriptReplaceLoading(false);
    setScriptReplaceSubmitting(false);
    setScriptReplaceAvailableCount(0);
    setScriptReplaceFile(null);
    if (scriptReplaceFileInputRef.current) {
      scriptReplaceFileInputRef.current.value = "";
    }
  };

  const openScriptReplaceModal = async (place: PlaceItem) => {
    setOpenActionMenuId(null);
    setSelectedPlaceForScriptReplace(place);
    setScriptReplaceModalOpen(true);
    setScriptReplaceLoading(true);
    setScriptReplaceAvailableCount(0);
    setScriptReplaceFile(null);

    if (scriptReplaceFileInputRef.current) {
      scriptReplaceFileInputRef.current.value = "";
    }

    try {
      const res = await fetch(`/api/places/${place.pid}/scripts/count`, {
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as
        | ScriptReplaceCountResponse
        | { detail?: string };

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "교체 가능한 원고 개수를 불러오지 못했습니다.",
        );
      }

      setScriptReplaceAvailableCount(
        parseScriptReplaceCount(data as ScriptReplaceCountResponse),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "교체 가능한 원고 개수를 불러오지 못했습니다.",
      );
    } finally {
      setScriptReplaceLoading(false);
    }
  };

  const handleScriptReplaceFileChange = (nextFile: File | null) => {
    if (!nextFile) return;

    if (!nextFile.name.toLowerCase().endsWith(".txt")) {
      toast.error("TXT 파일만 업로드할 수 있습니다.");
      return;
    }

    setScriptReplaceFile(nextFile);
  };

  const handleScriptReplaceSubmit = async () => {
    if (!selectedPlaceForScriptReplace) {
      toast.error("플레이스 정보를 확인할 수 없습니다.");
      return;
    }

    if (!scriptReplaceFile) {
      toast.error("원고 첨부파일(TXT)을 선택해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", scriptReplaceFile);

    setScriptReplaceSubmitting(true);

    try {
      const res = await fetch(
        `/api/places/${selectedPlaceForScriptReplace.pid}/scripts/replace`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "원고 교체 실행에 실패했습니다.",
        );
      }

      toast.success("원고 교체 요청을 전송했습니다.");
      closeScriptReplaceModal();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "원고 교체 실행에 실패했습니다.",
      );
    } finally {
      setScriptReplaceSubmitting(false);
    }
  };

  const openIssueStatusDialog = (place: PlaceItem) => {
    const currentStatus = getPlaceIssueStatus(place);
    const nextStatus = currentStatus === 1 ? 0 : 1;

    setOpenActionMenuId(null);
    setSelectedPlaceForIssueStatus(place);
    setPendingIssueStatus(nextStatus);
    setIssueStatusDialogOpen(true);
  };

  const resetIssueStatusDialog = () => {
    setIssueStatusDialogOpen(false);
    setSelectedPlaceForIssueStatus(null);
    setPendingIssueStatus(null);
  };

  const closeIssueStatusDialog = () => {
    if (issueStatusSubmitting) return;
    resetIssueStatusDialog();
  };

  const handleConfirmIssueStatus = async () => {
    if (!selectedPlaceForIssueStatus || pendingIssueStatus == null) return;

    const actionLabel = pendingIssueStatus === 1 ? "발행 시작" : "발행 중지";
    setIssueStatusSubmitting(true);

    try {
      const res = await fetch(
        `/api/places/${selectedPlaceForIssueStatus.pid}/issue-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingIssueStatus }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : `${actionLabel} 처리에 실패했습니다.`,
        );
      }

      setPlaces((current) =>
        current.map((item) =>
          item.pid === selectedPlaceForIssueStatus.pid
            ? {
                ...item,
                status: pendingIssueStatus,
                issue_status: pendingIssueStatus,
              }
            : item,
        ),
      );

      toast.success(`${actionLabel} 처리 완료`);
      resetIssueStatusDialog();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `${actionLabel} 처리에 실패했습니다.`,
      );
    } finally {
      setIssueStatusSubmitting(false);
    }
  };

  const openHidePlaceDialog = (place: PlaceItem) => {
    setOpenActionMenuId(null);
    setSelectedPlaceForHide(place);
    setHidePlaceDialogOpen(true);
  };

  const resetHidePlaceDialog = () => {
    setHidePlaceDialogOpen(false);
    setSelectedPlaceForHide(null);
  };

  const closeHidePlaceDialog = () => {
    if (hidePlaceSubmitting) return;
    resetHidePlaceDialog();
  };

  const handleConfirmHidePlace = async () => {
    const alias = selectedPlaceForHide?.alias?.trim();
    if (!selectedPlaceForHide || !alias) {
      toast.error("플레이스 alias 정보를 확인할 수 없습니다.");
      return;
    }

    setHidePlaceSubmitting(true);

    try {
      const res = await fetch("/api/ui/hidden-places/hide-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data as { success?: boolean }).success === false) {
        throw new Error(
          typeof (data as { detail?: string; error?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : typeof (data as { error?: string }).error === "string"
              ? (data as { error: string }).error
              : "플레이스 숨기기에 실패했습니다.",
        );
      }

      setPlaces((current) =>
        current.filter((item) => item.pid !== selectedPlaceForHide.pid),
      );
      toast.success("플레이스를 숨기기 목록에 추가했습니다.");
      resetHidePlaceDialog();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "플레이스 숨기기에 실패했습니다.",
      );
    } finally {
      setHidePlaceSubmitting(false);
    }
  };

  const openPurgeReceiptsDialog = (place: PlaceItem) => {
    setOpenActionMenuId(null);
    setSelectedPlaceForPurgeReceipts(place);
    setPurgeReceiptsDialogOpen(true);
  };

  const resetPurgeReceiptsDialog = () => {
    setPurgeReceiptsDialogOpen(false);
    setSelectedPlaceForPurgeReceipts(null);
  };

  const closePurgeReceiptsDialog = () => {
    if (purgeReceiptsSubmitting) return;
    resetPurgeReceiptsDialog();
  };

  const handleConfirmPurgeReceipts = async () => {
    if (!selectedPlaceForPurgeReceipts) return;

    setPurgeReceiptsSubmitting(true);

    try {
      const res = await fetch(
        `/api/places/${selectedPlaceForPurgeReceipts.pid}/purge-receipts`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "영수증 전체 삭제에 실패했습니다.",
        );
      }

      const receiptsDeleted = Number(
        (data as { receipts_deleted?: number }).receipts_deleted ?? 0,
      );
      const scriptsDeleted = Number(
        (data as { scripts_deleted?: number }).scripts_deleted ?? 0,
      );
      const imagesDeleted = Number(
        (data as { images_deleted?: number }).images_deleted ?? 0,
      );

      toast.success(
        `삭제 완료: 영수증 ${receiptsDeleted}건, 원고 ${scriptsDeleted}건, 이미지 ${imagesDeleted}건`,
      );
      resetPurgeReceiptsDialog();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "영수증 전체 삭제에 실패했습니다.",
      );
    } finally {
      setPurgeReceiptsSubmitting(false);
    }
  };

  const applySettings = () => {
    setSortDir(draftSortDir);
    setLoadLimit(draftLoadLimit);
    setSettingsOpen(false);
  };

  const toggleActionMenu = (
    placeId: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedMenuHeight = 312;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextDirection = spaceBelow < estimatedMenuHeight ? "up" : "down";

    setOpenActionMenuDirection(nextDirection);
    setOpenActionMenuId((current) => (current === placeId ? null : placeId));
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
          className="flex flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4e342e] text-[#fcf8e9] shadow-md"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <Sparkles size={24} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
              <SplitText
                text="메인 대시보드"
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
          </div>
          <p className="text-sm text-[#4e342e]/65">
            {username
              ? `${username}님의 플레이스 현황을 한 화면에서 확인합니다.`
              : "플레이스 현황을 한 화면에서 확인합니다."}
          </p>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <motion.div
          className={cn(cardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#fff0c8] px-3 py-2 text-[#4e342e]">
              <MapPinned className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold text-[#4e342e]/82">
                등록된 플레이스
              </span>
            </div>
            <div className="text-3xl text-[#4e342e]">
              <NumberCounter
                value={stats.registeredPlaces}
                className="text-3xl text-[#4e342e]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cn(cardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#fff0c8] px-3 py-2 text-[#4e342e]">
              <PackageSearch className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold text-[#4e342e]/82">
                요청 작업량
              </span>
            </div>
            <div className="text-3xl text-[#4e342e]">
              <NumberCounter
                value={stats.requestedWorkload}
                className="text-3xl text-[#4e342e]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cn(cardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.11 }}
        >
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#fff0c8] px-3 py-2 text-[#4e342e]">
              <PackageSearch className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold text-[#4e342e]/82">
                남은 작업량
              </span>
            </div>
            <div className="text-3xl text-[#4e342e]">
              <NumberCounter
                value={stats.remainingWorkload}
                className="text-3xl text-[#4e342e]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cn(cardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
        >
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#fff0c8] px-3 py-2 text-[#4e342e]">
              <Sparkles className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold text-[#4e342e]/82">
                완료된 작업량
              </span>
            </div>
            <div className="text-3xl text-[#4e342e]">
              <NumberCounter
                value={stats.completedWorkload}
                className="text-3xl text-[#4e342e]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cn(cardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.17 }}
        >
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#fff0c8] px-3 py-2 text-[#4e342e]">
              <MapPinned className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold text-[#4e342e]/82">
                완료된 플레이스
              </span>
            </div>
            <div className="text-3xl text-[#4e342e]">
              <NumberCounter
                value={stats.completedPlaces}
                className="text-3xl text-[#4e342e]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section>
        <motion.div
          className={cn(cardClassName, "overflow-hidden p-4 sm:p-5 lg:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4e342e]/15 bg-white/80 text-[#4e342e] transition hover:bg-[#fff0c8]"
                  onClick={openSettingsModal}
                  aria-label="테이블 설정 열기"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <div className="text-sm text-[#4e342e]/65">
                  <div className="flex items-center gap-2 text-sm text-[#4e342e]/68">
                    <span>표시 개수</span>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger className="h-10 w-[110px] rounded-full bg-white/85">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10개씩</SelectItem>
                        <SelectItem value="20">20개씩</SelectItem>
                        <SelectItem value="50">50개씩</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[#4e342e]"
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                  >
                    {"<<"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[#4e342e]"
                    onClick={() =>
                      setCurrentPage((current) => Math.max(1, current - 1))
                    }
                    disabled={safeCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[52px] text-center text-sm font-semibold text-[#4e342e]">
                    {safeCurrentPage}/{totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[#4e342e]"
                    onClick={() =>
                      setCurrentPage((current) =>
                        Math.min(totalPages, current + 1),
                      )
                    }
                    disabled={safeCurrentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[#4e342e]"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                  >
                    {">>"}
                  </Button>
                </div>

                <div className="relative w-full sm:w-[260px]">
                  <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4e342e]/35" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="플레이스 검색"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-[520px] overflow-visible rounded-[24px] border border-[#4e342e]/10 bg-white/78">
              <Table className="border-collapse bg-white/75">
                <TableHeader>
                  <TableRow className="border-b border-[#4e342e]/10 bg-[#ffedc8] hover:bg-[#ffedc8]">
                    <TableHead className="h-10 min-w-[56px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      #
                    </TableHead>
                    <TableHead className="h-10 min-w-[160px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      플레이스명
                    </TableHead>
                    <TableHead className="h-10 min-w-[120px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      플레이스 MID
                    </TableHead>
                    <TableHead className="h-10 min-w-[76px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      완료
                    </TableHead>
                    <TableHead className="h-10 min-w-[92px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      인식오류
                    </TableHead>
                    <TableHead className="h-10 min-w-[108px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      남은 작업량
                    </TableHead>
                    <TableHead className="h-10 min-w-[108px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      잔여 영수증
                    </TableHead>
                    <TableHead className="h-10 min-w-[108px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      잔여 원고
                    </TableHead>
                    <TableHead className="h-10 min-w-[108px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      요청 작업량
                    </TableHead>
                    <TableHead className="h-10 min-w-[104px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      발행시작일
                    </TableHead>
                    <TableHead className="h-10 min-w-[108px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      오늘 작업량
                    </TableHead>
                    <TableHead className="h-10 min-w-[132px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPlaces.map((item, index) => {
                    const issueStatus = getPlaceIssueStatus(item);
                    const isIssuePaused = issueStatus === 0;
                    const issueActionLabel = isIssuePaused
                      ? "발행 시작"
                      : "발행 중지";
                    const IssueActionIcon = isIssuePaused ? Play : Pause;

                    return (
                    <TableRow
                      key={item.pid}
                      className="border-b border-[#4e342e]/8 hover:bg-[#ffa000]/8"
                    >
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/80">
                        {pageStart + index}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate px-3 py-2 text-center text-[14px] font-medium text-[#4e342e]/92"
                        title={item.name ?? item.alias ?? "-"}
                      >
                        {item.name ?? item.alias ?? "-"}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                        {item.mid ?? "-"}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]/85">
                        {item.done.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                        {item.error.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]/85">
                        {item.remaining.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                        {item.receipt_count.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                        {item.remaining_scripts.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                        {item.requested.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-3 py-2 text-center text-[14px] text-[#4e342e]/85",
                        )}
                      >
                        {formatShortDate(item.start_date)}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]/85">
                        {item.today.toLocaleString("ko-KR")} /{" "}
                        {item.today_target.toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell
                        className="px-3 py-2 text-center"
                      >
                        <div
                          data-action-menu-root="true"
                          className="relative flex items-center justify-center gap-2"
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#4e342e]/12 bg-white/85 text-[#4e342e] transition hover:bg-[#fff8e1] hover:text-[#4e342e] hover:shadow-sm"
                            aria-label="리뷰목록"
                            title="리뷰목록"
                            onClick={() => void openReviewsModal(item)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:shadow-sm",
                              isIssuePaused
                                ? "border-[#4e342e]/12 bg-white/85 text-[#4e342e] hover:bg-[#fff8e1] hover:text-[#4e342e]"
                                : "border-[#ffa000]/45 bg-[#ffa000]/40 text-[#4e342e] hover:bg-[#ffa000]/50 hover:text-[#4e342e]",
                            )}
                            aria-label="메뉴"
                            title="메뉴"
                            onClick={(event) =>
                              toggleActionMenu(item.pid, event)
                            }
                          >
                            <Menu className="h-4 w-4" />
                          </button>

                          {openActionMenuId === item.pid && (
                            <motion.div
                              className={cn(
                                "absolute right-0 z-20 w-[220px] overflow-hidden rounded-[22px] border border-[#4e342e]/12 bg-[#fcf8e9] p-2 text-left shadow-[0_18px_40px_rgba(78,52,46,0.12)]",
                                openActionMenuDirection === "up"
                                  ? "bottom-[calc(100%+8px)]"
                                  : "top-[calc(100%+8px)]",
                              )}
                              initial={{
                                opacity: 0,
                                y: openActionMenuDirection === "up" ? -8 : 8,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18 }}
                              onMouseDown={(event) => event.stopPropagation()}
                            >
                              {[
                                {
                                  label: issueActionLabel,
                                  icon: IssueActionIcon,
                                },
                                { label: "플레이스 숨기기", icon: EyeOff },
                                { label: "원고 수정", icon: Pencil },
                                { label: "좋았던점 수정", icon: FilePenLine },
                                { label: "원고 교체", icon: RefreshCw },
                                { label: "수동 영수증추가", icon: Plus },
                                { label: "영수증 전체 삭제", icon: Trash2 },
                                { label: "다운로드", icon: Download },
                              ].map((menuItem) => {
                                const MenuIcon = menuItem.icon;
                                return (
                                  <button
                                    key={menuItem.label}
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-medium text-[#4e342e] transition hover:bg-[#ffa000]/40 hover:shadow-sm"
                                    onClick={() => {
                                      if (
                                        menuItem.label === "발행 시작" ||
                                        menuItem.label === "발행 중지"
                                      ) {
                                        openIssueStatusDialog(item);
                                        return;
                                      }
                                      if (menuItem.label === "플레이스 숨기기") {
                                        openHidePlaceDialog(item);
                                        return;
                                      }
                                      if (menuItem.label === "영수증 전체 삭제") {
                                        openPurgeReceiptsDialog(item);
                                        return;
                                      }
                                      if (menuItem.label === "원고 수정") {
                                        void openScriptsModal(item);
                                        return;
                                      }
                                      if (menuItem.label === "원고 교체") {
                                        void openScriptReplaceModal(item);
                                        return;
                                      }
                                      if (menuItem.label === "좋았던점 수정") {
                                        void openGoodthingModal(item);
                                        return;
                                      }
                                      setOpenActionMenuId(null);
                                    }}
                                  >
                                    <MenuIcon className="h-4 w-4 shrink-0 text-[#4e342e]/75" />
                                    <span>{menuItem.label}</span>
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {(placesLoading || places.length === 0) && (
              <div className="rounded-2xl border border-dashed border-[#4e342e]/15 bg-white/60 px-4 py-10 text-center text-sm text-[#4e342e]/55">
                {placesLoading
                  ? "플레이스 목록을 불러오는 중입니다."
                  : "표시할 플레이스가 없습니다."}
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {settingsOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSettingsOpen(false)}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative w-full max-w-[520px] p-6 sm:p-7",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setSettingsOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                테이블 설정
              </h2>
              <p className="mt-2 text-sm text-[#4e342e]/60">
                정렬 방향과 서버 로딩 개수를 조정할 수 있습니다.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-[24px] border border-[#4e342e]/10 bg-white/70 p-4">
                <div className="text-sm font-semibold text-[#4e342e]">
                  정렬 기준
                </div>
                <div className="mt-3 rounded-full border border-[#4e342e]/12 bg-[#fff7e2] px-4 py-3 text-sm font-medium text-[#4e342e]/78">
                  ID 등록 순서
                </div>
              </div>

              <div className="rounded-[24px] border border-[#4e342e]/10 bg-white/70 p-4">
                <div className="text-sm font-semibold text-[#4e342e]">
                  정렬 방향
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-3 text-sm font-semibold transition",
                      draftSortDir === "asc"
                        ? "border-[#ffa000] bg-[#fff0c8] text-[#4e342e]"
                        : "border-[#4e342e]/12 bg-white text-[#4e342e]/72 hover:bg-[#4e342e]/5",
                    )}
                    onClick={() => setDraftSortDir("asc")}
                  >
                    오름차순
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "rounded-full border px-4 py-3 text-sm font-semibold transition",
                      draftSortDir === "desc"
                        ? "border-[#ffa000] bg-[#fff0c8] text-[#4e342e]"
                        : "border-[#4e342e]/12 bg-white text-[#4e342e]/72 hover:bg-[#4e342e]/5",
                    )}
                    onClick={() => setDraftSortDir("desc")}
                  >
                    내림차순
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#4e342e]/10 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[#4e342e]">
                    페이지 로딩 개수
                  </div>
                  <div className="rounded-full bg-[#fff0c8] px-3 py-1 text-sm font-bold text-[#4e342e]">
                    {draftLoadLimit.toLocaleString("ko-KR")}개
                  </div>
                </div>
                <div className="mt-5">
                  <input
                    type="range"
                    min={200}
                    max={1000}
                    step={100}
                    value={draftLoadLimit}
                    onChange={(event) =>
                      setDraftLoadLimit(Number(event.target.value))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8dccf] accent-[#d09c5f]"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#4e342e]/45">
                    <span>200</span>
                    <span>600</span>
                    <span>1000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                onClick={() => setSettingsOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                onClick={applySettings}
              >
                적용
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {reviewsModalOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setReviewsModalOpen(false)}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative flex max-h-[calc(100vh-2rem)] w-full max-w-[1180px] flex-col overflow-hidden p-5 sm:max-h-[calc(100vh-3rem)] sm:p-6 lg:p-7",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setReviewsModalOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                {getPlaceDisplayName(selectedPlaceForReviews)
                  ? `${getPlaceDisplayName(selectedPlaceForReviews)} 리뷰 목록`
                  : "리뷰 목록"}
              </h2>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-[#4e342e]/10 bg-white/78">
              <Table className="border-collapse bg-white/75">
                <TableHeader>
                  <TableRow className="border-b border-[#4e342e]/10 bg-[#ffedc8] hover:bg-[#ffedc8]">
                    <TableHead className="h-10 min-w-[56px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      #
                    </TableHead>
                    <TableHead className="h-10 min-w-[92px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      아이디
                    </TableHead>
                    <TableHead className="h-10 min-w-[220px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      리뷰 URL
                    </TableHead>
                    <TableHead className="h-10 min-w-[128px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      리뷰작성날짜
                    </TableHead>
                    <TableHead className="h-10 min-w-[128px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      영수증날짜
                    </TableHead>
                    <TableHead className="h-10 min-w-[96px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      상태
                    </TableHead>
                    <TableHead className="h-10 min-w-[88px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review, index) => {
                    const reviewUrl =
                      review.user_code && review.review_id
                        ? `${NAVER_REVIEW_BASE_URL}/${encodeURIComponent(review.user_code)}/reviewfeed?reviewId=${encodeURIComponent(review.review_id)}`
                        : "-";

                    return (
                      <TableRow
                        key={`${review.job_id ?? review.review_id ?? index}`}
                        className="border-b border-[#4e342e]/8 hover:bg-[#fff8e1]"
                      >
                        <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/80">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-[14px] font-medium text-[#4e342e]/92">
                          {formatReviewIdentity(
                            review.username == null
                              ? null
                              : String(review.username),
                          )}
                        </TableCell>
                        <TableCell
                          className="max-w-[260px] truncate px-3 py-2 text-center text-[14px] text-[#4e342e]/85"
                          title={reviewUrl}
                        >
                          {review.review_id ? (
                            <a
                              href={reviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[#c27400] underline decoration-[#e7b04f] underline-offset-4 transition hover:text-[#8f5100]"
                            >
                              {reviewUrl}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                          {formatReviewDate(review.postdate)}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                          {formatReviewDate(review.realdate)}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                          <span
                            className={cn(
                              "inline-flex min-w-[64px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
                              getReviewStatusClassName(review.status),
                            )}
                          >
                            {getReviewStatusLabel(review.status)}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-2 text-center">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#4e342e]/12 bg-white/85 text-[#4e342e] transition hover:bg-[#fff8e1] hover:text-[#4e342e] hover:shadow-sm"
                            aria-label="리뷰 메뉴"
                            title="리뷰 메뉴"
                          >
                            <Ellipsis className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {(reviewsLoading || reviews.length === 0) && (
              <div className="mt-4 rounded-2xl border border-dashed border-[#4e342e]/15 bg-white/60 px-4 py-10 text-center text-sm text-[#4e342e]/55">
                {reviewsLoading
                  ? "리뷰 목록을 불러오는 중입니다."
                  : "표시할 리뷰가 없습니다."}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {scriptsModalOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={closeScriptsModal}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative flex max-h-[calc(100vh-2rem)] w-full max-w-[1120px] flex-col overflow-hidden p-5 sm:max-h-[calc(100vh-3rem)] sm:p-6 lg:p-7",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={closeScriptsModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                {getPlaceDisplayName(selectedPlaceForScripts)
                  ? `${getPlaceDisplayName(selectedPlaceForScripts)} 원고 수정`
                  : "원고 수정"}
              </h2>
            </div>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-[#4e342e]/10 bg-white/78">
              <Table className="border-collapse bg-white/75">
                <TableHeader>
                  <TableRow className="border-b border-[#4e342e]/10 bg-[#ffedc8] hover:bg-[#ffedc8]">
                    <TableHead className="h-10 min-w-[56px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      #
                    </TableHead>
                    <TableHead className="h-10 min-w-[120px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      영수증 ID
                    </TableHead>
                    <TableHead className="h-10 min-w-[110px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      상태
                    </TableHead>
                    <TableHead className="h-10 min-w-[420px] bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                      내용(미리보기)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scripts.map((script, index) => (
                    <TableRow
                      key={script.review_script_id}
                      className="border-b border-[#4e342e]/8 hover:bg-[#fff8e1]"
                    >
                      <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/80">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px] font-medium text-[#4e342e]/88">
                        {script.review_script_id}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-center text-[14px]">
                        <span
                          className={cn(
                            "inline-flex min-w-[86px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold",
                            getScriptStatusClassName(script.status),
                          )}
                        >
                          {getScriptStatusLabel(script.status)}
                        </span>
                      </TableCell>
                      <TableCell
                        className="max-w-[560px] px-3 py-2 text-left text-[14px] text-[#4e342e]/85"
                        title={script.content}
                      >
                        <button
                          type="button"
                          className="block w-full truncate text-left font-medium text-[#4e342e] transition hover:text-[#c27400]"
                          onClick={() => void openScriptEditor(script)}
                        >
                          {getScriptPreview(script.content)}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {(scriptsLoading || scripts.length === 0) && (
              <div className="mt-4 rounded-2xl border border-dashed border-[#4e342e]/15 bg-white/60 px-4 py-10 text-center text-sm text-[#4e342e]/55">
                {scriptsLoading
                  ? "수정 가능한 원고를 불러오는 중입니다."
                  : "표시할 원고가 없습니다."}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {scriptEditorOpen && (
        <motion.div
          className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(30,24,20,0.34)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setScriptEditorOpen(false)}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative w-full max-w-[860px] p-5 sm:p-6",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setScriptEditorOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                원고 {editingReceiptId ?? editingScriptId ?? "-"} 편집
              </h2>
            </div>

            <div className="mt-5">
              <textarea
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                className="min-h-[320px] w-full resize-y rounded-[24px] border border-[#4e342e]/12 bg-white/85 px-5 py-4 text-[15px] leading-7 text-[#4e342e] shadow-sm outline-none transition focus:border-[#ffa000]/60 focus:ring-2 focus:ring-[#ffa000]/20"
                placeholder="원고 내용을 입력해 주세요."
                disabled={scriptEditorLoading || scriptSaving}
              />
              {scriptEditorLoading && (
                <div className="mt-3 text-sm text-[#4e342e]/58">
                  최신 원고 내용을 불러오는 중입니다.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                onClick={() => setScriptEditorOpen(false)}
                disabled={scriptSaving}
              >
                닫기
              </Button>
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                onClick={() => void handleSaveScript()}
                disabled={scriptEditorLoading || scriptSaving}
              >
                {scriptSaving ? "저장 중..." : "수정 저장"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {goodthingModalOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={closeGoodthingModal}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative flex max-h-[calc(100vh-2rem)] w-full max-w-[920px] flex-col overflow-hidden p-5 sm:max-h-[calc(100vh-3rem)] sm:p-6 lg:p-7",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={closeGoodthingModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                리뷰 세부사항 수정
                {getPlaceDisplayName(selectedPlaceForGoodthing) ? (
                  <span className="ml-3 text-[#4e342e]/72">
                    - {getPlaceDisplayName(selectedPlaceForGoodthing)}
                  </span>
                ) : null}
              </h2>
            </div>

            {goodthingLoading || !goodthingData ? (
              <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-[#4e342e]/15 bg-white/50 text-sm text-[#4e342e]/55">
                좋았던점 정보를 불러오는 중입니다.
              </div>
            ) : (
              <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
                <section className="rounded-[26px] border border-white/80 bg-white/50 p-5 shadow-sm">
                  <h3 className="text-[22px] font-bold tracking-tight text-[#4e342e]">
                    어떻게 이용하셨나요?
                  </h3>
                  {goodthingData.reservation == null ||
                  goodthingData.reservation === "None" ||
                  goodthingData.reservation_options.length === 0 ? (
                    <p className="mt-3 text-sm text-[#4e342e]/48">
                      아직 정보를 받지 못했거나 선택할 예약이 없습니다.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {goodthingData.reservation_options.map((option) => {
                        const selected = getReservationSelection(
                          goodthingData.reservation,
                          goodthingData.reservation_options,
                        ).has(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => void toggleReservation(option)}
                            disabled={goodthingSaving}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-semibold transition",
                              selected
                                ? "border-[#8fc2ff] bg-[#eef6ff] text-[#1c62b7] shadow-[inset_0_0_0_1px_rgba(143,194,255,0.22)]"
                                : "border-[#d8e6f7] bg-white text-[#7d97bb] hover:bg-[#f7fbff]",
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="mt-5 rounded-[26px] border border-white/80 bg-white/50 p-5 shadow-sm">
                  <h3 className="text-[22px] font-bold tracking-tight text-[#4e342e]">
                    &quot;제외&quot; 할 아이템만 선택하세요
                  </h3>
                  <p className="mt-3 text-sm text-[#4e342e]/55">
                    (리뷰 작성간 랜덤으로 3~4개를 선택합니다)
                  </p>
                  <p className="mt-1 text-sm text-[#4e342e]/55">
                    (체크되지 않은 아이템이 최소 4개 이상 있어야 합니다!)
                  </p>

                  {goodthingData.goodthing_ori_list.length === 0 ? (
                    <p className="mt-4 text-sm text-[#4e342e]/48">
                      아직 정보를 받지 못했거나 선택할 좋은점이 없습니다.
                    </p>
                  ) : (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {goodthingData.goodthing_ori_list.map((item) => {
                        const excluded =
                          goodthingData.goodthing_exclude_list.includes(item);

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => void toggleGoodthingExclude(item)}
                            disabled={goodthingSaving}
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-semibold transition",
                              excluded
                                ? "border-[#ffc8bc] bg-[#fff1ed] text-[#d25a3e] shadow-[inset_0_0_0_1px_rgba(255,200,188,0.22)]"
                                : "border-[#b8d8ff] bg-[#eef6ff] text-[#2d6dbe] shadow-[inset_0_0_0_1px_rgba(184,216,255,0.24)]",
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {issueStatusDialogOpen &&
        selectedPlaceForIssueStatus &&
        pendingIssueStatus != null && (
          <motion.div
            className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(30,24,20,0.34)] p-4 backdrop-blur-[2px] lg:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={closeIssueStatusDialog}
          >
            <motion.div
              className={cn(
                cardClassName,
                "relative w-full max-w-[560px] p-5 sm:p-6",
              )}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="닫기"
                onClick={closeIssueStatusDialog}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
                disabled={issueStatusSubmitting}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-10">
                <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                  {pendingIssueStatus === 1 ? "발행 시작" : "발행 중지"}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[#4e342e]/72">
                  &quot;
                  {selectedPlaceForIssueStatus.name ??
                    selectedPlaceForIssueStatus.alias ??
                    "해당"}
                  &quot; 플레이스를{" "}
                  {pendingIssueStatus === 1 ? "발행 시작" : "발행 중지"}
                  하겠습니까?
                </p>
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                  onClick={closeIssueStatusDialog}
                  disabled={issueStatusSubmitting}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  variant="popcorn"
                  className="h-11 px-5 text-sm font-bold"
                  onClick={() => void handleConfirmIssueStatus()}
                  disabled={issueStatusSubmitting}
                >
                  {issueStatusSubmitting ? "처리 중..." : "확인"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

      {hidePlaceDialogOpen && selectedPlaceForHide && (
        <motion.div
          className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(30,24,20,0.34)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={closeHidePlaceDialog}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative w-full max-w-[580px] p-5 sm:p-6",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={closeHidePlaceDialog}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
              disabled={hidePlaceSubmitting}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                플레이스 숨기기
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-[#4e342e]/72">
                &quot;
                {selectedPlaceForHide.name ??
                  selectedPlaceForHide.alias ??
                  "해당"}
                &quot; 플레이스를 숨기기 목록에 추가하겠습니까?
              </p>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                onClick={closeHidePlaceDialog}
                disabled={hidePlaceSubmitting}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                onClick={() => void handleConfirmHidePlace()}
                disabled={hidePlaceSubmitting}
              >
                {hidePlaceSubmitting ? "처리 중..." : "확인"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {purgeReceiptsDialogOpen && selectedPlaceForPurgeReceipts && (
        <motion.div
          className="fixed inset-0 z-70 flex items-center justify-center bg-[rgba(30,24,20,0.34)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={closePurgeReceiptsDialog}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative w-full max-w-[620px] p-5 sm:p-6",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={closePurgeReceiptsDialog}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
              disabled={purgeReceiptsSubmitting}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#4e342e]">
                영수증 전체 삭제
              </h2>
              <div className="mt-3 space-y-2 text-[15px] leading-7 text-[#4e342e]/72">
                <p>
                  <strong>
                    {selectedPlaceForPurgeReceipts.name ??
                      selectedPlaceForPurgeReceipts.alias ??
                      "해당 플레이스"}
                  </strong>
                  에 올린 영수증 자료를 정리할까요?
                </p>
                <p>현재 작업 중이거나 이미 사용한 영수증은 그대로 남습니다.</p>
                <p>
                  아직 사용하지 않은 영수증, 연결된 원고, 첨부 사진이 함께
                  삭제됩니다.
                </p>
                <p>삭제 후에는 되돌릴 수 없습니다.</p>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                onClick={closePurgeReceiptsDialog}
                disabled={purgeReceiptsSubmitting}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                onClick={() => void handleConfirmPurgeReceipts()}
                disabled={purgeReceiptsSubmitting}
              >
                {purgeReceiptsSubmitting ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {scriptReplaceModalOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(30,24,20,0.28)] p-4 backdrop-blur-[2px] lg:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={closeScriptReplaceModal}
        >
          <motion.div
            className={cn(
              cardClassName,
              "relative w-full max-w-[820px] p-5 sm:p-6 lg:p-7",
            )}
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="닫기"
              onClick={closeScriptReplaceModal}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-[#4e342e]/80 transition-colors hover:bg-[#4e342e]/8"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-10">
              <h2 className="text-[26px] font-bold tracking-tight text-[#4e342e] sm:text-[30px]">
                {getPlaceDisplayName(selectedPlaceForScriptReplace)
                  ? `${getPlaceDisplayName(selectedPlaceForScriptReplace)} 원고 교체`
                  : "원고 교체"}
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-[#4e342e]/72">
                TXT 파일을 업로드하면 원고 가공 처리 후, 해당 플레이스에
                등록된 기존 원고를 위에서부터 순서대로 덮어씁니다.
              </p>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#f2d48a] bg-[#fff1c9]/88 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <div className="text-[22px] font-bold tracking-tight text-[#5d3c05]">
                현재 교체 가능 원고:{" "}
                {scriptReplaceLoading
                  ? "불러오는 중..."
                  : `${scriptReplaceAvailableCount.toLocaleString("ko-KR")}개`}
              </div>
              <div className="mt-3 space-y-1.5 text-[15px] leading-6 text-[#6d542b]">
                <p>- 교체 대상: 영수증 미배정 또는 작업 배정 전인 원고만</p>
                <p>
                  - TXT 가공 후 라인이 50개이고, 기존 원고가 100개면 50개만
                  교체
                </p>
                <p>
                  - TXT 가공 후 라인이 150개이고, 기존 원고가 100개면
                  100개만 교체하고 나머지는 무시
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="text-[15px] font-semibold text-[#4e342e]">
                원고 첨부파일 (TXT)
              </div>
              <input
                ref={scriptReplaceFileInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(event) =>
                  handleScriptReplaceFileChange(
                    event.target.files?.[0] ?? null,
                  )
                }
              />

              <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-[#4e342e]/10 bg-white/78 p-3 shadow-sm sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-[#4e342e]/14 bg-white px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#fff7e2]"
                  onClick={() => scriptReplaceFileInputRef.current?.click()}
                >
                  파일 선택
                </Button>
                <div className="flex min-h-11 flex-1 items-center rounded-xl border border-[#4e342e]/10 bg-white px-4 py-3 text-sm text-[#4e342e]/62">
                  <span className="truncate">
                    {scriptReplaceFile?.name ?? "선택된 파일 없음"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                onClick={closeScriptReplaceModal}
              >
                닫기
              </Button>
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                onClick={() => void handleScriptReplaceSubmit()}
                disabled={
                  scriptReplaceLoading ||
                  scriptReplaceSubmitting ||
                  !scriptReplaceFile
                }
              >
                {scriptReplaceSubmitting ? "교체 실행 중..." : "교체 실행"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
