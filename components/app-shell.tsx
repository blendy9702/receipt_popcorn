"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, Popcorn, X } from "lucide-react";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
        isActive
          ? "bg-[#4e342e] text-[#fcf8e9] shadow-[0_10px_24px_rgba(78,52,46,0.18)]"
          : "text-[#4e342e]/80 hover:bg-[#4e342e]/8",
      ].join(" ")}
    >
      <LayoutDashboard size={18} />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-white/20 bg-[#4e342e]/88 px-4 text-[#fcf8e9] backdrop-blur-xl lg:hidden">
        <button
          type="button"
          aria-label="메뉴 열기"
          className="rounded-full p-2 hover:bg-white/10"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fcf8e9] text-[#4e342e] shadow-sm">
            <Popcorn size={18} />
          </div>
          <span className="text-base font-bold tracking-tight">POPCORN</span>
        </div>
      </header>

      <button
        type="button"
        aria-label="메뉴 닫기"
        className={[
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-[260px] transition-transform duration-300 ease-out lg:translate-x-[16px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-[16px]",
        ].join(" ")}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-none bg-[#fcf8e9] shadow-[4px_0_20px_rgba(78,52,46,0.12)] lg:rounded-l-[24px]">
          <div className="sidebar-stripe h-3 shrink-0" aria-hidden />

          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4e342e] text-[#fcf8e9] shadow-sm">
                <Popcorn size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#4e342e]">
                POPCORN
              </span>
            </div>
            <button
              type="button"
              aria-label="메뉴 닫기"
              className="rounded-full p-2 text-[#4e342e]/75 hover:bg-[#4e342e]/10 lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="sidebar-stripe h-3 shrink-0" aria-hidden />

          <nav className="flex-1 px-5 py-6">
            <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4e342e]/45">
              Menu
            </div>
            <div className="space-y-2">
              <NavItem href="/" label="대시보드" />
            </div>
          </nav>

          <div className="sidebar-stripe h-3 shrink-0" aria-hidden />

          <div className="px-5 py-5">
            <div className="rounded-[24px] border border-[#4e342e]/15 bg-[#4e342e]/5 p-4 text-[#4e342e]">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4e342e]/45">
                Dashboard
              </div>
              <p className="mt-2 break-keep text-sm leading-6 text-[#4e342e]/80">
                `nrbrank` 디자인을 기준으로 메인 화면부터 `app` 라우터에 맞게
                옮긴 첫 페이지입니다.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 px-4 pb-8 pt-20 lg:pl-[300px] lg:pr-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
