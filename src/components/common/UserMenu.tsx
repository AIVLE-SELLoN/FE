"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const homeHref = user.role === "ADMIN" ? "/admin/cs" : "/channel";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    useAuthStore.getState().clearTokens();
  };

  return (
    <div ref={wrapRef} className="relative flex items-center">
      <Link
        href={homeHref}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 sm:px-3"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-indigo-50 text-sm font-bold text-indigo-500">
          {user.name?.[0] ?? "?"}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block truncate text-sm font-bold leading-tight text-slate-800">
            {user.name}
          </span>
          <span className="block truncate text-xs leading-tight text-slate-500">
            {user.role === "ADMIN" ? "관리자 계정" : "Premium Plan"}
          </span>
        </span>
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-expanded={open}
        aria-label="계정 메뉴"
      >
        <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="flex w-[150px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
