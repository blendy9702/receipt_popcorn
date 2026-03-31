"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import "./FlowingMenu.css";

type FlowingMenuItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
  variant?: "light" | "dark" | "cream";
};

export function FlowingMenuItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  variant = "light",
}: FlowingMenuItemProps) {
  const inactiveClass =
    variant === "dark"
      ? "text-zinc-300 lg:text-zinc-400 hover:text-white"
      : variant === "cream"
        ? "text-[#4e342e] hover:bg-[#f8d89a]/40"
        : "text-[#1e1e1e] lg:text-gray-500 hover:text-black";

  const activeClass =
    variant === "cream"
      ? "bg-[#f8d89a] text-[#4e342e] shadow-md shadow-[#4e342e]/8"
      : "bg-[#2A2A3E] text-white shadow-lg shadow-black/20";

  return (
    <div
      className={
        variant === "cream"
          ? "flowing-menu-item flowing-menu-item--zoom"
          : "flowing-menu-item flowing-menu-item--zoom hover:text-white"
      }
    >
      <Link
        href={href}
        onClick={onClick}
        className={`flowing-menu-item__link ${isActive ? activeClass : inactiveClass}`}
      >
        <Icon size={18} strokeWidth={2} className="shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </div>
  );
}
