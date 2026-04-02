"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Coins,
  LayoutDashboard,
  LogOut,
  MapPinned,
  EyeOff,
  Ticket,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FlowingMenuItem } from "@/components/flowing-menu/FlowingMenuItem";
import { DEV_AUTH_BYPASS_ENABLED } from "@/lib/auth-mode";
import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { label: "대시보드", href: "/", icon: LayoutDashboard },
  { label: "화면 관리", href: "/screen-management", icon: EyeOff },
  { label: "이용권 관리", href: "/ticket-management", icon: Ticket },
  { label: "플레이스 대량등록", href: "/place-bulk-upload", icon: Upload },
  {
    label: "하위 계정 플레이스 배정",
    href: "/sub-account-place-assignment",
    icon: MapPinned,
  },
  { label: "계정 관리", href: "/account-management", icon: Users },
];

const sidebarCardClassName =
  "w-full h-full bg-[#fcf8e9] flex flex-col overflow-hidden";

const stripeStyle = {
  height: "12px",
  background:
    "repeating-linear-gradient(90deg, #f8ad9d 0, #f8ad9d 12px, #f9f9f9 12px, #f9f9f9 24px)",
};

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState({
    username: "Popcorn",
    reviewTickets: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/account/me", { cache: "no-store" }).then(async (res) => ({
        status: res.status,
        data: res.ok ? await res.json() : null,
      })),
      fetch("/api/tickets/balance", { cache: "no-store" }).then(
        async (res) => ({
          status: res.status,
          data: res.ok ? await res.json() : null,
        }),
      ),
    ])
      .then(([accountResult, ticketResult]) => {
        if (accountResult.status === 401 || ticketResult.status === 401) {
          if (!DEV_AUTH_BYPASS_ENABLED) {
            router.push("/");
            router.refresh();
          }
          return;
        }

        const accountData = accountResult.data;
        const ticketData = ticketResult.data;
        setProfile({
          username:
            typeof accountData?.username === "string"
              ? accountData.username
              : "Popcorn",
          reviewTickets:
            typeof ticketData?.tickets?.review === "number"
              ? ticketData.tickets.review
              : 0,
        });
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    window.location.href = "/logout";
  };

  return (
    <>
      {onClose && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          className={cn(
            "fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity xl:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "z-50 w-[260px] transition-transform duration-300 ease-out",
          "fixed left-0 top-0 h-screen rounded-none",
          "xl:left-0 xl:top-0 xl:h-screen xl:translate-x-[24px] xl:rounded-l-[24px] xl:shadow-[4px_0_20px_rgba(78,52,46,0.12)] xl:duration-0",
          onClose && !mobileOpen && "-translate-x-full",
          onClose && mobileOpen && "translate-x-0",
        )}
      >
        <div className={sidebarCardClassName}>
          <div className="flex h-full min-h-0 min-w-0 flex-col">
            <div
              className="shrink-0 w-full py-4"
              style={stripeStyle}
              aria-hidden
            />

            <div className="flex items-center justify-center px-6 pt-4 pb-4 shrink-0">
              <div className="flex items-center justify-between gap-12">
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="POPCORN 로고">
                    <Image
                      src="/popcorn.png"
                      alt="POPCORN 로고"
                      width={32}
                      height={32}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </button>
                  <span className="text-xl font-bold tracking-tight text-[#4e342e]">
                    POPCORN
                  </span>
                </div>
                {onClose && (
                  <button
                    type="button"
                    aria-label="메뉴 닫기"
                    className="rounded-full p-2 text-[#4e342e]/80 hover:bg-[#4e342e]/10 xl:hidden"
                    onClick={onClose}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <div
              className="shrink-0 w-full py-4"
              style={stripeStyle}
              aria-hidden
            />

            <nav className="sidebar-nav no-scrollbar flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <ul className="space-y-0.5">
                {menuItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <FlowingMenuItem
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={isActive}
                        onClick={onClose}
                        variant="cream"
                      />
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              className="shrink-0 w-full py-4"
              style={stripeStyle}
              aria-hidden
            />

            <div className="mt-auto flex shrink-0 flex-col gap-2 px-6 pb-6 pt-4">
              <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#4e342e]/20 bg-[#4e342e]/5 px-2 py-2">
                <Avatar className="h-11 w-11 shrink-0 rounded-xl border-2 border-[#4e342e]/25 shadow-sm">
                  <AvatarFallback className="rounded-xl bg-[#fcf8e9] text-[#4e342e]">
                    <User size={22} strokeWidth={1.5} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 truncate text-[13px] font-medium text-[#4e342e]">
                    <User size={14} className="shrink-0 text-[#4e342e]" />
                    {profile.username}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4e342e]">
                    <Coins size={14} className="shrink-0 text-[#ffa000]" />
                    <span>리뷰 이용권</span>
                    <span>
                      {profile.reviewTickets.toLocaleString("ko-KR")}개
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 overflow-hidden rounded-full border-4 border-[#f8ad9d] px-3 py-2.5 text-left text-[14px] font-extrabold whitespace-nowrap text-[#4e342e]/70 transition-all hover:bg-red-500/15 hover:text-red-600"
              >
                <LogOut size={18} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
