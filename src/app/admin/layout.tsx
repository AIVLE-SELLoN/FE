"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-white" />;
  }

  // 비로그인 상태 — 로그인 필요 안내 모달
  if (!user) {
    return (
      <LoginRequiredModal
        open
        onClose={() => router.push("/")}
        onLogin={() => router.push("/login")}
        onGoHome={() => router.push("/")}
      />
    );
  }

  // 로그인은 했지만 admin이 아닌 경우
  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white text-center">
        <ShieldAlert className="h-10 w-10 text-slate-300" />
        <p className="text-lg font-bold text-slate-900">접근 권한이 없습니다</p>
        <p className="text-sm text-slate-500">이 페이지는 관리자만 이용할 수 있어요.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-600"
        >
          홈으로 이동
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
