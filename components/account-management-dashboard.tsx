"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  KeyRound,
  Loader2,
  Search,
  Trash2,
  UserPlus,
  Users,
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type DescendantAccount = {
  id: number;
  username: string;
  status: string;
  depth: number;
};

type DirectAccount = {
  id: number;
  username: string;
  status: string;
  descendants: DescendantAccount[];
};

type SelectableAccount = {
  id: number;
  username: string;
  status: string;
  depth: number;
  isDirect: boolean;
};

type DisplayRow = {
  id: number;
  username: string;
  status: string;
  depth: number;
  isDirect: boolean;
  hasChildren: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTree(data: unknown): DirectAccount[] {
  if (!Array.isArray(data)) return [];

  return data
    .filter(isRecord)
    .map((item) => {
      const id = Number(item.id);
      const username =
        typeof item.username === "string" && item.username.trim()
          ? item.username.trim()
          : "";
      const descendants = Array.isArray(item.descendants)
        ? item.descendants
            .filter(isRecord)
            .map((child) => {
              const childId = Number(child.id);
              const childUsername =
                typeof child.username === "string" && child.username.trim()
                  ? child.username.trim()
                  : "";
              return {
                id: Number.isFinite(childId) ? childId : 0,
                username: childUsername,
                status:
                  typeof child.status === "string" && child.status.trim()
                    ? child.status.trim().toLowerCase()
                    : "inactive",
                depth: Math.max(1, Number(child.depth) || 1),
              } satisfies DescendantAccount;
            })
            .filter((child) => child.id > 0 && child.username)
        : [];

      return {
        id: Number.isFinite(id) ? id : 0,
        username,
        status:
          typeof item.status === "string" && item.status.trim()
            ? item.status.trim().toLowerCase()
            : "inactive",
        descendants,
      } satisfies DirectAccount;
    })
    .filter((item) => item.id > 0 && item.username);
}

function getStatusLabel(status: string) {
  return status === "active" ? "활성" : "비활성";
}

function getStatusClassName(status: string) {
  if (status === "active") {
    return "bg-[#e8f6ea] text-[#2e7d32] ring-[#2e7d32]/12";
  }
  return "bg-[#f6ebe7] text-[#8d6e63] ring-[#8d6e63]/10";
}

const shellCardClassName =
  "rounded-[30px] border border-white/70 bg-[#fcf8e9]/94 shadow-[0_22px_60px_rgba(78,52,46,0.12)] backdrop-blur-xl";

export function AccountManagementDashboard() {
  const [tree, setTree] = useState<DirectAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [lookupKeyword, setLookupKeyword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [creating, setCreating] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copying, setCopying] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent/my-children-tree", { cache: "no-store" });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "계정 목록을 불러오지 못했습니다.",
        );
      }

      setTree(normalizeTree(data));
    } catch (error) {
      setTree([]);
      toast.error(
        error instanceof Error ? error.message : "계정 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  const allSelectableAccounts = useMemo(() => {
    return tree.flatMap<SelectableAccount>((direct) => [
      {
        id: direct.id,
        username: direct.username,
        status: direct.status,
        depth: 0,
        isDirect: true,
      },
      ...direct.descendants.map((child) => ({
        id: child.id,
        username: child.username,
        status: child.status,
        depth: child.depth,
        isDirect: false,
      })),
    ]);
  }, [tree]);

  const filteredSelectableAccounts = useMemo(() => {
    const keyword = lookupKeyword.trim().toLowerCase();
    if (!keyword) return allSelectableAccounts;

    return allSelectableAccounts.filter(
      (account) =>
        account.username.toLowerCase().includes(keyword) ||
        String(account.id).includes(keyword),
    );
  }, [allSelectableAccounts, lookupKeyword]);

  useEffect(() => {
    if (filteredSelectableAccounts.length === 0) {
      setSelectedAccountId("");
      return;
    }

    if (
      !filteredSelectableAccounts.some(
        (account) => String(account.id) === selectedAccountId,
      )
    ) {
      setSelectedAccountId(String(filteredSelectableAccounts[0].id));
    }
  }, [filteredSelectableAccounts, selectedAccountId]);

  useEffect(() => {
    setGeneratedLink("");
  }, [selectedAccountId]);

  const displayRows = useMemo(() => {
    return tree.flatMap<DisplayRow>((direct) => {
      const rows: DisplayRow[] = [
        {
          id: direct.id,
          username: direct.username,
          status: direct.status,
          depth: 0,
          isDirect: true,
          hasChildren: direct.descendants.length > 0,
        },
      ];

      if (expandedIds.has(direct.id)) {
        rows.push(
          ...direct.descendants.map((child) => ({
            id: child.id,
            username: child.username,
            status: child.status,
            depth: child.depth,
            isDirect: false,
            hasChildren: false,
          })),
        );
      }

      return rows;
    });
  }, [expandedIds, tree]);

  const handleCreateAccount = async () => {
    const username = createUsername.trim();
    const password = createPassword.trim();

    if (!username || !password) {
      toast.error("아이디와 비밀번호를 입력해 주세요.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/parent/create-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "계정 생성에 실패했습니다.",
        );
      }

      setCreateUsername("");
      setCreatePassword("");
      await loadTree();
      toast.success("계정을 생성했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "계정 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateLink = async () => {
    const userId = Number(selectedAccountId);
    if (!Number.isFinite(userId) || userId <= 0) {
      toast.error("계정을 선택해 주세요.");
      return;
    }

    setGeneratingLink(true);
    try {
      const res = await fetch("/api/admin/password-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "비밀번호 링크 생성에 실패했습니다.",
        );
      }

      const nextLink =
        typeof data.reset_url === "string" && data.reset_url.trim()
          ? data.reset_url.trim()
          : "";

      if (!nextLink) {
        throw new Error("비밀번호 링크를 생성하지 못했습니다.");
      }

      setGeneratedLink(nextLink);
      toast.success("비밀번호 링크를 생성했습니다.");
    } catch (error) {
      setGeneratedLink("");
      toast.error(
        error instanceof Error ? error.message : "비밀번호 링크 생성에 실패했습니다.",
      );
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) {
      toast.error("먼저 비밀번호 링크를 생성해 주세요.");
      return;
    }

    setCopying(true);
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("링크를 복사했습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    } finally {
      setCopying(false);
    }
  };

  const toggleExpanded = (row: DisplayRow) => {
    if (!row.isDirect || !row.hasChildren) return;

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  };

  const handleToggleStatus = async (row: DisplayRow) => {
    if (!row.isDirect) return;

    setTogglingId(row.id);
    try {
      const res = await fetch("/api/parent/toggle-child-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "상태 변경에 실패했습니다.",
        );
      }

      setTree((current) =>
        current.map((account) =>
          account.id === row.id
            ? {
                ...account,
                status:
                  typeof data.new_status === "string" && data.new_status.trim()
                    ? data.new_status.trim().toLowerCase()
                    : account.status === "active"
                      ? "inactive"
                      : "active",
              }
            : account,
        ),
      );
      toast.success("상태를 변경했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "상태 변경에 실패했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (row: DisplayRow) => {
    if (!row.isDirect) return;
    if (!window.confirm(`"${row.username}" 계정을 삭제하시겠습니까?`)) return;

    setDeletingId(row.id);
    try {
      const res = await fetch("/api/parent/delete-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: row.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string" ? data.detail : "삭제에 실패했습니다.",
        );
      }

      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      await loadTree();
      toast.success("계정을 삭제했습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
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
            <Users size={24} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
            <SplitText
              text="계정관리"
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

      <section className="grid gap-5 xl:grid-cols-2">
        <motion.div
          className={cn(shellCardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4e342e]">계정 생성</h2>
              <p className="mt-1 text-sm text-[#4e342e]/60">
                직속 하위 계정을 새로 만들 수 있습니다.
              </p>
            </div>

            <Input
              value={createUsername}
              onChange={(event) => setCreateUsername(event.target.value)}
              placeholder="아이디 입력"
              maxLength={50}
            />
            <Input
              type="password"
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
              placeholder="비밀번호 입력"
              maxLength={100}
            />
            <Button
              type="button"
              variant="popcorn"
              className="h-11 px-5 text-sm font-bold"
              disabled={creating}
              onClick={() => void handleCreateAccount()}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  계정 생성
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          className={cn(shellCardClassName, "p-5 sm:p-6")}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4e342e]">
                비밀번호 링크 발급
              </h2>
              <p className="mt-1 text-sm text-[#4e342e]/60">
                직속 계정과 그 하위 계정까지 선택할 수 있습니다.
              </p>
            </div>

            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#4e342e]/35"
              />
              <Input
                value={lookupKeyword}
                onChange={(event) => setLookupKeyword(event.target.value)}
                placeholder="아이디 검색"
                className="pl-10"
              />
            </div>

            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              disabled={filteredSelectableAccounts.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "계정 불러오는 중" : "계정 선택"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSelectableAccounts.map((account) => (
                  <SelectItem key={account.id} value={String(account.id)}>
                    {`${account.depth > 0 ? `${"  ".repeat(account.depth)}└ ` : ""}${account.username} (${account.id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="popcorn"
                className="h-11 px-5 text-sm font-bold"
                disabled={generatingLink || !selectedAccountId}
                onClick={() => void handleGenerateLink()}
              >
                {generatingLink ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    비밀번호 링크 생성
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-[#4e342e]/16 bg-white/80 px-5 text-sm font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                disabled={copying || !generatedLink}
                onClick={() => void handleCopyLink()}
              >
                <Copy className="mr-2 h-4 w-4" />
                링크 복사
              </Button>
            </div>

            <div className="rounded-[24px] border border-[#4e342e]/10 bg-white/72 px-4 py-4 text-sm text-[#4e342e]/70">
              {generatedLink ? (
                <span className="break-all">{generatedLink}</span>
              ) : (
                "생성된 링크가 여기에 표시됩니다."
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <section className={cn(shellCardClassName, "overflow-hidden p-4 sm:p-5 lg:p-6")}>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#4e342e]">계정 목록</h2>
            <p className="mt-1 text-sm text-[#4e342e]/60">
              직속 계정을 클릭하면 하위 계정을 펼쳐서 볼 수 있습니다.
            </p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#4e342e]/10 bg-white/78">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="border-b border-[#4e342e]/10 bg-[#fff0c8] hover:bg-[#fff0c8]">
                  <TableHead className="h-11 w-16 bg-[#fff0c8] px-3 py-3 text-center text-[14px] font-semibold text-[#4e342e]">
                    #
                  </TableHead>
                  <TableHead className="h-11 bg-[#fff0c8] px-3 py-3 text-left text-[14px] font-semibold text-[#4e342e]">
                    아이디
                  </TableHead>
                  <TableHead className="h-11 w-28 bg-[#fff0c8] px-3 py-3 text-center text-[14px] font-semibold text-[#4e342e]">
                    상태
                  </TableHead>
                  <TableHead className="h-11 w-28 bg-[#fff0c8] px-3 py-3 text-center text-[14px] font-semibold text-[#4e342e]">
                    토글
                  </TableHead>
                  <TableHead className="h-11 w-20 bg-[#fff0c8] px-3 py-3 text-center text-[14px] font-semibold text-[#4e342e]">
                    삭제
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, index) => {
                  const isExpanded = expandedIds.has(row.id);
                  const isBusy = togglingId === row.id || deletingId === row.id;

                  return (
                    <TableRow
                      key={`${row.id}-${row.depth}`}
                      className={cn(
                        "border-b border-[#4e342e]/8 hover:bg-[#ffa000]/8",
                        row.depth > 0 && "bg-[#fffaf0]",
                      )}
                    >
                      <TableCell className="px-3 py-3 text-center text-[14px] text-[#4e342e]/75">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-[14px] text-[#4e342e]">
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-2 text-left",
                            row.isDirect && row.hasChildren
                              ? "cursor-pointer"
                              : "cursor-default",
                          )}
                          style={{ paddingLeft: row.depth * 18 }}
                          onClick={() => toggleExpanded(row)}
                          disabled={!row.isDirect || !row.hasChildren}
                        >
                          {row.isDirect && row.hasChildren ? (
                            isExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-[#4e342e]/70" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-[#4e342e]/70" />
                            )
                          ) : (
                            <span className="w-4 shrink-0" aria-hidden />
                          )}
                          {row.depth > 0 && (
                            <span className="shrink-0 text-[#4e342e]/45">└</span>
                          )}
                          <span className="font-medium">{row.username}</span>
                        </button>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                            getStatusClassName(row.status),
                          )}
                        >
                          {getStatusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center">
                        <div className="inline-flex items-center justify-center">
                          <Switch
                            checked={row.status === "active"}
                            onCheckedChange={() => void handleToggleStatus(row)}
                            disabled={!row.isDirect || isBusy}
                            aria-label={`${row.username} 상태 토글`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-[#4e342e]/75 hover:bg-red-500/12 hover:text-red-600"
                          onClick={() => void handleDelete(row)}
                          disabled={!row.isDirect || isBusy}
                        >
                          {deletingId === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {loading && (
            <div className="rounded-[24px] border border-dashed border-[#4e342e]/15 bg-white/55 px-4 py-10 text-center text-sm text-[#4e342e]/60">
              <div className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                계정 목록을 불러오는 중입니다.
              </div>
            </div>
          )}

          {!loading && displayRows.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-[#4e342e]/15 bg-white/55 px-4 py-10 text-center text-sm text-[#4e342e]/55">
              표시할 계정이 없습니다.
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
