"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { Sidebar } from "@/components/sidebar";

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-zinc-950/20 px-4 pr-16 backdrop-blur-xl xl:hidden">
        <button
          type="button"
          aria-label="메뉴 열기"
          className="-ml-2 rounded-full p-2 text-white/90 hover:bg-white/10"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fcf8e9] text-[#4e342e] overflow-hidden shrink-0">
            <Image
              src="/popcorn.png"
              alt="POPCORN 로고"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            POPCORN
          </span>
        </div>
      </header>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <NotificationBell />
      <main className="flex-1 w-full min-h-screen overflow-x-hidden px-4 pb-6 pt-[72px] xl:pl-[300px] xl:pr-8 xl:pt-8 xl:pb-8">
        {children}
      </main>
    </div>
  );
}
