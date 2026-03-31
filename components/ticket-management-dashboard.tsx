"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Building2, Coins, Search, Ticket, Wallet } from "lucide-react";
import { toast } from "sonner";
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
import { SplitText } from "@/components/split-text/SplitText";
import { cn } from "@/lib/utils";

type TransactionType = "add" | "deduct";
type TicketBalanceMap = Record<string, number>;

type MeProfile = {
  userId: number | null;
  username: string;
  companyName: string;
  ticketBalances: TicketBalanceMap;
};

type AccountOption = {
  userId: number;
  username: string;
  companyName?: string;
};

type LedgerItem = {
  id: string;
  accountId: number | null;
  username: string;
  serviceCode: string;
  amount: number;
  signedAmount: number;
  serviceBalance: number | null;
  type: TransactionType;
  txLabel: string;
  description: string;
  createdAt: string;
};

const cardClassName =
  "rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10 flex flex-col h-full min-h-0";
const HIDDEN_SERVICE_CODES = new Set(["place"]);
const KNOWN_SERVICE_LABELS: Record<string, string> = {
  review: "리뷰",
  blog: "블로그",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTicketBalances(data: unknown): TicketBalanceMap {
  if (!isRecord(data)) return {};

  const candidate = isRecord(data.tickets)
    ? data.tickets
    : isRecord(data.ticket_balances)
      ? data.ticket_balances
      : data;

  return Object.entries(candidate).reduce<TicketBalanceMap>((acc, [key, value]) => {
    if (HIDDEN_SERVICE_CODES.has(key)) return acc;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) acc[key] = parsed;
    return acc;
  }, {});
}

function getOrderedServiceCodes(balances: TicketBalanceMap): string[] {
  const codes = Object.keys(balances).filter((code) => !HIDDEN_SERVICE_CODES.has(code));
  const preferred = ["review", "blog"].filter((code) => codes.includes(code));
  const extras = codes.filter((code) => !preferred.includes(code)).sort();
  return [...preferred, ...extras];
}

function getTicketTotal(tickets: TicketBalanceMap) {
  return Object.values(tickets).reduce((sum, value) => sum + value, 0);
}

function getServiceLabel(serviceCode: string) {
  return KNOWN_SERVICE_LABELS[serviceCode] ?? serviceCode;
}

function formatLedgerDate(value: string) {
  const normalized = value.trim().replace("T", " ").replace(/Z$/, "");
  const matched = normalized.match(
    /(\d{4})[-./]\s?(\d{2})[-./]\s?(\d{2})[ ](\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (matched) {
    const [, year, month, day, hour, minute, second = "00"] = matched;
    return `${year}. ${month}. ${day}. ${hour}:${minute}:${second}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || "-";

  const parts = {
    year: String(parsed.getFullYear()),
    month: String(parsed.getMonth() + 1).padStart(2, "0"),
    day: String(parsed.getDate()).padStart(2, "0"),
    hour: String(parsed.getHours()).padStart(2, "0"),
    minute: String(parsed.getMinutes()).padStart(2, "0"),
    second: String(parsed.getSeconds()).padStart(2, "0"),
  };

  return `${parts.year}. ${parts.month}. ${parts.day}. ${parts.hour}:${parts.minute}:${parts.second}`;
}

function inferLedgerType(
  item: Record<string, unknown>,
  amount: number,
): TransactionType {
  if (amount < 0) return "deduct";

  const hint = [
    item.tx_type,
    item.source_type,
    item.mode,
    item.type,
    item.description,
  ]
    .map((value) => (typeof value === "string" ? value.toLowerCase() : ""))
    .join(" ");

  return /(deduct|withdraw|reclaim|minus|decrease|use|consume|차감|회수)/.test(
    hint,
  )
    ? "deduct"
    : "add";
}

function normalizeLedgerResponse(data: unknown): LedgerItem[] {
  const rawItems: unknown[] = Array.isArray(data)
    ? data
    : isRecord(data)
      ? Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.ledger)
            ? data.ledger
            : Array.isArray(data.ledgers)
              ? data.ledgers
              : Array.isArray(data.rows)
                ? data.rows
                : Array.isArray(data.records)
                  ? data.records
                  : Array.isArray(data.transactions)
                    ? data.transactions
                    : []
      : [];

  return rawItems
    .map((item, index) => {
      if (!isRecord(item)) return null;

      const rawAmount =
        Number(item.amount ?? item.delta ?? item.quantity ?? item.count ?? 0) || 0;
      const accountIdRaw = Number(
        item.user_id ?? item.account_id ?? item.child_user_id ?? item.target_user_id,
      );
      const serviceBalanceRaw =
        item.balance_after ??
        item.balanceAfter ??
        item.balance ??
        item.remaining_balance ??
        item.remainingBalance ??
        item.service_balance ??
        item.serviceBalance;
      const serviceCodeRaw =
        item.service_code ?? item.service ?? item.ticket_type ?? item.category;
      const createdAtRaw =
        item.created_at ?? item.createdAt ?? item.tx_time ?? item.date ?? "-";
      const usernameRaw =
        item.username ??
        item.account_username ??
        item.child_username ??
        item.target_username ??
        item.user_name ??
        "-";

      return {
        id: String(item.id ?? `${createdAtRaw}-${index}`),
        accountId:
          Number.isFinite(accountIdRaw) && accountIdRaw > 0 ? accountIdRaw : null,
        username:
          typeof usernameRaw === "string" && usernameRaw.trim()
            ? usernameRaw.trim()
            : "-",
        serviceCode:
          typeof serviceCodeRaw === "string" && serviceCodeRaw.trim()
            ? serviceCodeRaw.trim()
            : "-",
        amount: Math.abs(rawAmount),
        signedAmount: rawAmount,
        serviceBalance: Number.isFinite(Number(serviceBalanceRaw))
          ? Number(serviceBalanceRaw)
          : null,
        type: inferLedgerType(item, rawAmount),
        txLabel:
          typeof item.tx_type === "string" && item.tx_type.trim()
            ? item.tx_type.trim()
            : typeof item.txType === "string" && item.txType.trim()
              ? item.txType.trim()
              : typeof item.transaction_type === "string" &&
                  item.transaction_type.trim()
                ? item.transaction_type.trim()
                : typeof item.source_type === "string" && item.source_type.trim()
                  ? item.source_type.trim()
                  : typeof item.mode === "string" && item.mode.trim()
                    ? item.mode.trim()
                    : item.type === "deduct"
                      ? "deduct"
                      : "grant",
        description:
          typeof item.description === "string" && item.description.trim()
            ? item.description.trim()
            : typeof item.memo === "string" && item.memo.trim()
              ? item.memo.trim()
              : typeof item.reason === "string" && item.reason.trim()
                ? item.reason.trim()
                : "-",
        createdAt:
          typeof createdAtRaw === "string" && createdAtRaw.trim()
            ? createdAtRaw.trim()
            : "-",
      } satisfies LedgerItem;
    })
    .filter((item): item is LedgerItem => item !== null);
}

function collectAccountsFromTree(data: unknown): AccountOption[] {
  const sources: unknown[] = Array.isArray(data)
    ? data
    : isRecord(data)
      ? Array.isArray(data.children)
        ? data.children
        : Array.isArray(data.accounts)
          ? data.accounts
          : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.data)
              ? data.data
              : []
      : [];

  return sources
    .filter(isRecord)
    .reduce<AccountOption[]>((accounts, value) => {
      const userId = Number(value.user_id ?? value.id ?? value.account_id);
      const usernameRaw = value.username ?? value.name ?? value.account_name;
      const ticketBalances = normalizeTicketBalances(value);

      if (
        !Number.isFinite(userId) ||
        userId <= 0 ||
        typeof usernameRaw !== "string" ||
        !usernameRaw.trim()
      ) {
        return accounts;
      }

      accounts.push({
        userId,
        username: usernameRaw.trim(),
        companyName:
          typeof value.company_name === "string" && value.company_name.trim()
            ? value.company_name.trim()
            : undefined,
      });

      return accounts;
    }, [])
    .sort((a, b) => a.userId - b.userId);
}

function TicketSummary({
  tickets,
  accent = false,
  emptyMessage = "이용권 정보가 없습니다.",
}: {
  tickets: TicketBalanceMap;
  accent?: boolean;
  emptyMessage?: string;
}) {
  const serviceCodes = getOrderedServiceCodes(tickets);

  if (serviceCodes.length === 0) {
    return <p className="text-sm text-[#4e342e]/60">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {serviceCodes.map((code) => (
        <div
          key={code}
          className="flex items-center justify-between gap-3 text-sm text-[#4e342e]/75"
        >
          <span>{getServiceLabel(code)}</span>
          <span
            className={cn(
              "font-semibold text-[#4e342e]",
              accent && "text-[#ffa000]",
            )}
          >
            {tickets[code].toLocaleString("ko-KR")}개
          </span>
        </div>
      ))}
    </div>
  );
}

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
      className={cn("font-bold", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {display.toLocaleString("ko-KR")}
    </motion.span>
  );
}

export function TicketManagementDashboard() {
  const [me, setMe] = useState<MeProfile>({
    userId: null,
    username: "Popcorn",
    companyName: "-",
    ticketBalances: {},
  });
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [lookupKeyword, setLookupKeyword] = useState("");
  const [lookupAccountId, setLookupAccountId] = useState("");
  const [actionKeyword, setActionKeyword] = useState("");
  const [actionAccountId, setActionAccountId] = useState("");
  const [actionServiceCode, setActionServiceCode] = useState("blog");
  const [actionAmount, setActionAmount] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [ledgerAccountKeyword, setLedgerAccountKeyword] = useState("");
  const [ledgerAccountId, setLedgerAccountId] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [pageSize, setPageSize] = useState("20");
  const [currentPage, setCurrentPage] = useState(1);
  const [profileLoading, setProfileLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [lookupBalances, setLookupBalances] = useState<TicketBalanceMap>({});
  const [lookupBalanceLoading, setLookupBalanceLoading] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const [accountRes, ticketRes] = await Promise.all([
        fetch("/api/account/me", { cache: "no-store" }),
        fetch("/api/tickets/balance", { cache: "no-store" }),
      ]);
      const accountData = await accountRes.json().catch(() => ({}));
      const ticketData = await ticketRes.json().catch(() => ({}));

      setMe({
        userId:
          Number.isFinite(Number(accountData.user_id)) && Number(accountData.user_id) > 0
            ? Number(accountData.user_id)
            : null,
        username:
          typeof accountData.username === "string" && accountData.username.trim()
            ? accountData.username.trim()
            : "Popcorn",
        companyName:
          typeof accountData.company_name === "string" && accountData.company_name.trim()
            ? accountData.company_name.trim()
            : "-",
        ticketBalances: normalizeTicketBalances(ticketData),
      });
    } catch {
      setMe({
        userId: null,
        username: "Popcorn",
        companyName: "-",
        ticketBalances: {},
      });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let cancelled = false;

    const loadAccounts = async () => {
      setAccountsLoading(true);
      try {
        const res = await fetch("/api/parent/my-children-tree", {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setAccounts(collectAccountsFromTree(data));
      } catch {
        if (!cancelled) setAccounts([]);
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    };

    void loadAccounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const res = await fetch("/api/tickets/ledger?limit=100&offset=0", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => []);
      setLedger(res.ok ? normalizeLedgerResponse(data) : []);
    } catch {
      setLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const lookupOptions = useMemo(() => {
    const keyword = lookupKeyword.trim().toLowerCase();
    if (!keyword) return accounts;
    return accounts.filter(
      (account) =>
        account.username.toLowerCase().includes(keyword) ||
        (account.companyName ?? "").toLowerCase().includes(keyword) ||
        String(account.userId).includes(keyword),
    );
  }, [accounts, lookupKeyword]);

  const actionOptions = useMemo(() => {
    const keyword = actionKeyword.trim().toLowerCase();
    if (!keyword) return accounts;
    return accounts.filter(
      (account) =>
        account.username.toLowerCase().includes(keyword) ||
        (account.companyName ?? "").toLowerCase().includes(keyword) ||
        String(account.userId).includes(keyword),
    );
  }, [accounts, actionKeyword]);

  useEffect(() => {
    if (lookupOptions.length === 0) {
      setLookupAccountId("");
      return;
    }

    if (!lookupOptions.some((account) => String(account.userId) === lookupAccountId)) {
      setLookupAccountId(String(lookupOptions[0].userId));
    }
  }, [lookupAccountId, lookupOptions]);

  useEffect(() => {
    if (actionOptions.length === 0) {
      setActionAccountId("");
      return;
    }

    if (!actionOptions.some((account) => String(account.userId) === actionAccountId)) {
      setActionAccountId(String(actionOptions[0].userId));
    }
  }, [actionAccountId, actionOptions]);

  useEffect(() => {
    let cancelled = false;

    const loadLookupBalance = async () => {
      if (!lookupAccountId) {
        setLookupBalances({});
        return;
      }

      setLookupBalanceLoading(true);
      try {
        const res = await fetch(`/api/tickets/balance/${lookupAccountId}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setLookupBalances(res.ok ? normalizeTicketBalances(data) : {});
      } catch {
        if (!cancelled) setLookupBalances({});
      } finally {
        if (!cancelled) setLookupBalanceLoading(false);
      }
    };

    void loadLookupBalance();

    return () => {
      cancelled = true;
    };
  }, [lookupAccountId]);

  const ledgerAccountOptions = useMemo(() => {
    const keyword = ledgerAccountKeyword.trim().toLowerCase();
    if (!keyword) return accounts;
    return accounts.filter(
      (account) =>
        account.username.toLowerCase().includes(keyword) ||
        (account.companyName ?? "").toLowerCase().includes(keyword) ||
        String(account.userId).includes(keyword),
    );
  }, [accounts, ledgerAccountKeyword]);

  useEffect(() => {
    if (ledgerAccountOptions.length === 0) {
      setLedgerAccountId("");
      return;
    }

    if (
      ledgerAccountId &&
      ledgerAccountOptions.some((account) => String(account.userId) === ledgerAccountId)
    ) {
      return;
    }

    setLedgerAccountId("");
  }, [ledgerAccountId, ledgerAccountOptions]);

  useEffect(() => {
    if (ledgerAccountId) {
      setMineOnly(false);
    }
  }, [ledgerAccountId]);

  const handleTransfer = useCallback(
    async (mode: "allocate" | "reclaim") => {
      const quantity = Number(actionAmount.replace(/[^0-9]/g, ""));
      const targetUserId = Number(actionAccountId);

      if (!Number.isFinite(targetUserId) || targetUserId <= 0) {
        toast.error("대상 계정을 선택해 주세요.");
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error("수량을 입력해 주세요.");
        return;
      }

      setActionSubmitting(true);

      try {
        const res = await fetch("/api/tickets/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_user_id: targetUserId,
            service_code: actionServiceCode,
            quantity,
            description: actionDescription.trim() || "",
            mode,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "이용권 지급/회수 요청에 실패했습니다.",
          );
        }

        setActionAmount("");
        setActionDescription("");
        toast.success(`이용권을 ${mode === "allocate" ? "지급" : "회수"}했습니다.`);

        await Promise.all([
          loadProfile(),
          loadLedger(),
          lookupAccountId ? fetch(`/api/tickets/balance/${lookupAccountId}`, { cache: "no-store" })
            .then((result) => result.json().catch(() => ({})))
            .then((result) => {
              setLookupBalances(normalizeTicketBalances(result));
            })
            .catch(() => {})
            : Promise.resolve(),
        ]);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "이용권 지급/회수 요청에 실패했습니다.",
        );
      } finally {
        setActionSubmitting(false);
      }
    },
    [
      actionAccountId,
      actionAmount,
      actionDescription,
      actionServiceCode,
      loadLedger,
      loadProfile,
      lookupAccountId,
    ],
  );

  const filteredLedger = useMemo(() => {
    const selectedLedgerUserId = Number(ledgerAccountId);
    return ledger.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter;
      const matchesSelectedAccount =
        !ledgerAccountId ||
        (Number.isFinite(selectedLedgerUserId) && item.accountId === selectedLedgerUserId);
      const matchesMine =
        !mineOnly ||
        item.username === me.username ||
        (me.userId != null && item.accountId === me.userId);
      return matchesFilter && matchesSelectedAccount && matchesMine;
    });
  }, [filter, ledger, ledgerAccountId, mineOnly, me.userId, me.username]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, ledgerAccountId, mineOnly, pageSize]);

  const totalLedgerPages = Math.max(
    1,
    Math.ceil(filteredLedger.length / Number(pageSize || 20)),
  );
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalLedgerPages);
  const paginatedLedger = useMemo(() => {
    const size = Number(pageSize || 20);
    const start = (safeCurrentPage - 1) * size;
    return filteredLedger.slice(start, start + size);
  }, [filteredLedger, pageSize, safeCurrentPage]);

  const pageStart =
    filteredLedger.length === 0 ? 0 : (safeCurrentPage - 1) * Number(pageSize) + 1;
  const pageEnd = Math.min(safeCurrentPage * Number(pageSize), filteredLedger.length);

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
              <Ticket size={24} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
            <SplitText
              text="이용권 관리"
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

      <section className="grid gap-4 xl:grid-cols-3 xl:gap-5 2xl:gap-6">
        <motion.div
          className={cardClassName}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex h-full flex-col text-[#4e342e]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#4e342e]/70">
              <Wallet className="h-4 w-4" />
              내 계정
            </div>
            <motion.div
              className="mt-3 text-2xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.12 }}
            >
              {profileLoading ? "불러오는 중..." : me.username}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className={cardClassName}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex h-full flex-col text-[#4e342e]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#4e342e]/70">
              <Building2 className="h-4 w-4" />
              회사명
            </div>
            <motion.div
              className="mt-3 text-2xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.16 }}
            >
              {profileLoading ? "불러오는 중..." : me.companyName || "-"}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className={cardClassName}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex h-full flex-col text-[#4e342e]">
            <div className="flex items-center gap-2 text-sm font-medium text-[#4e342e]/90">
              <Coins className="h-4 w-4" />
              보유 이용권
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-[#ffa000]">
              총{" "}
              <NumberCounter
                value={getTicketTotal(me.ticketBalances)}
                className="text-[#ffa000] text-3xl font-extrabold tracking-tight"
              />
              <span className="ml-1 text-base font-bold">개</span>
            </div>
            <div className="mt-4">
              <TicketSummary
                tickets={me.ticketBalances}
                accent
                emptyMessage="보유 이용권이 없습니다."
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 xl:gap-5 2xl:gap-6">
        <div className={cardClassName}>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4e342e]">
                계정 이용권 조회
              </h2>
            </div>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#4e342e]/35"
              />
              <Input
                value={lookupKeyword}
                onChange={(event) => setLookupKeyword(event.target.value)}
                placeholder="ID 또는 계정명 검색"
                className="pl-10"
              />
            </div>

            <Select
              value={lookupAccountId}
              onValueChange={setLookupAccountId}
              disabled={lookupOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    accountsLoading ? "계정 불러오는 중" : "계정 선택"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {lookupOptions.map((account) => (
                  <SelectItem key={account.userId} value={String(account.userId)}>
                    {account.username} ({account.userId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="rounded-[24px] bg-white/65 px-4 py-4 ring-1 ring-[#4e342e]/8">
              {lookupAccountId ? (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-[#4e342e]/75">
                    서비스별 잔여
                  </div>
                  {lookupBalanceLoading ? (
                    <p className="text-sm text-[#4e342e]/60">
                      이용권 정보를 불러오는 중입니다.
                    </p>
                  ) : (
                    <TicketSummary
                      tickets={lookupBalances}
                      emptyMessage="선택 계정의 이용권 정보가 없습니다."
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#4e342e]/60">
                  {accountsLoading
                    ? "하위 계정 목록을 불러오는 중입니다."
                    : "선택 가능한 하위 계정이 없습니다."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={cardClassName}>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#4e342e]">
                이용권 지급 / 회수
              </h2>
            </div>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#4e342e]/35"
              />
              <Input
                value={actionKeyword}
                onChange={(event) => setActionKeyword(event.target.value)}
                placeholder="대상 계정 검색"
                className="pl-10"
              />
            </div>

            <Select
              value={actionAccountId}
              onValueChange={setActionAccountId}
              disabled={actionOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    accountsLoading ? "계정 불러오는 중" : "계정 선택"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((account) => (
                  <SelectItem key={account.userId} value={String(account.userId)}>
                    {account.username} ({account.userId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-3 sm:grid-cols-3">
              <Select value={actionServiceCode} onValueChange={setActionServiceCode}>
                <SelectTrigger>
                  <SelectValue placeholder="서비스 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">블로그</SelectItem>
                  <SelectItem value="review">리뷰</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={actionAmount}
                onChange={(event) =>
                  setActionAmount(event.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="수량"
                inputMode="numeric"
              />
              <Input
                value={actionDescription}
                onChange={(event) => setActionDescription(event.target.value)}
                placeholder="설명(선택)"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="glass"
                className="h-12 rounded-full border border-[#ffa000]/70 bg-[#fff3d6] text-base font-semibold text-[#4e342e] hover:bg-[#ffe9b0]"
                disabled={actionSubmitting}
                onClick={() => void handleTransfer("allocate")}
              >
                지급
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border border-[#4e342e]/20 bg-white/70 text-base font-semibold text-[#4e342e] hover:bg-[#4e342e]/6"
                disabled={actionSubmitting}
                onClick={() => void handleTransfer("reclaim")}
              >
                회수
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={cardClassName}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#4e342e]">
                이용권 거래 내역
              </h2>
              <p className="mt-1 text-sm text-[#4e342e]/60">
                거래 유형별로 필터링하고 계정별 거래 내역을 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]",
                  filter === "all" && "border-[#ffa000]/70 bg-[#fff3d6]",
                )}
                onClick={() => setFilter("all")}
              >
                전체
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]",
                  filter === "add" && "border-[#ffa000]/70 bg-[#fff3d6]",
                )}
                onClick={() => setFilter("add")}
              >
                추가
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]",
                  filter === "deduct" && "border-[#ffa000]/70 bg-[#fff3d6]",
                )}
                onClick={() => setFilter("deduct")}
              >
                차감
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-[220px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#4e342e]/35"
              />
              <Input
                value={ledgerAccountKeyword}
                onChange={(event) => setLedgerAccountKeyword(event.target.value)}
                placeholder="ID 또는 닉네임 검색"
                className="h-10 rounded-xl pl-10"
              />
            </div>
            <div className="w-full lg:max-w-[220px]">
              <Select
                value={ledgerAccountId}
                onValueChange={setLedgerAccountId}
                disabled={ledgerAccountOptions.length === 0}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue
                    placeholder={
                      accountsLoading ? "거래 내역 계정 선택" : "거래 내역 계정 선택"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {ledgerAccountOptions.map((account) => (
                    <SelectItem key={account.userId} value={String(account.userId)}>
                      {account.username} ({account.userId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-10 rounded-full bg-white/80 px-4 text-sm font-semibold text-[#4e342e]",
                mineOnly && "border-[#ffa000]/70 bg-[#fff3d6]",
              )}
              onClick={() => {
                setLedgerAccountId("");
                setLedgerAccountKeyword("");
                setMineOnly(true);
              }}
            >
              내 거래 보기
            </Button>
          </div>

          <div className="overflow-hidden rounded-[24px] ring-1 ring-[#4e342e]/8">
            <Table className="border-collapse bg-white/70">
              <TableHeader>
                <TableRow className="border-b border-[#4e342e]/10 bg-[#ffedc8] hover:bg-[#ffedc8]">
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    날짜
                  </TableHead>
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    서비스
                  </TableHead>
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    유형
                  </TableHead>
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    수량
                  </TableHead>
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    서비스 잔여
                  </TableHead>
                  <TableHead className="h-9 bg-[#ffedc8] px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]">
                    설명
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLedger.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-[#4e342e]/8 hover:bg-[#ffa000]/8"
                  >
                    <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                      {formatLedgerDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/85">
                      {getServiceLabel(item.serviceCode)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center text-[14px] text-[#4e342e]/75">
                      {item.txLabel}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2 text-center text-[14px] font-semibold",
                        item.signedAmount < 0 ? "text-[#c2410c]" : "text-[#059669]",
                      )}
                    >
                      {`${item.signedAmount > 0 ? "+" : ""}${item.signedAmount.toLocaleString("ko-KR")}개`}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center text-[14px] font-semibold text-[#4e342e]/85">
                      {item.serviceBalance != null
                        ? `${item.serviceBalance.toLocaleString("ko-KR")}개`
                        : "-"}
                    </TableCell>
                    <TableCell
                      className="max-w-[240px] px-3 py-2 truncate text-center text-[14px] text-[#4e342e]/75"
                      title={item.description}
                    >
                      {item.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 pt-1 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-[#4e342e]/65">
              <span>페이지당 목록 수</span>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="h-10 w-[88px] rounded-full bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-[#4e342e]/65">
              총 {filteredLedger.length.toLocaleString("ko-KR")}개 중 {pageStart}-
              {pageEnd}개 표시
            </div>

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
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                disabled={safeCurrentPage === 1}
              >
                {"<"}
              </Button>
              <div className="min-w-[52px] text-center text-sm font-semibold text-[#4e342e]">
                {safeCurrentPage}/{totalLedgerPages}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#4e342e]"
                onClick={() =>
                  setCurrentPage((current) => Math.min(totalLedgerPages, current + 1))
                }
                disabled={safeCurrentPage === totalLedgerPages}
              >
                {">"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#4e342e]"
                onClick={() => setCurrentPage(totalLedgerPages)}
                disabled={safeCurrentPage === totalLedgerPages}
              >
                {">>"}
              </Button>
            </div>
          </div>

          {(ledgerLoading || filteredLedger.length === 0) && (
            <div className="rounded-2xl border border-dashed border-[#4e342e]/15 bg-white/60 px-4 py-10 text-center text-sm text-[#4e342e]/55">
              {ledgerLoading
                ? "거래 내역을 불러오는 중입니다."
                : "조건에 맞는 거래 내역이 없습니다."}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
