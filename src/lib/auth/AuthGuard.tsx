"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_PATHS = ["/login", "/signup", "/find-account"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const notReady = !hasHydrated || isLoading;

  useEffect(() => {
    if (!notReady && !user && !isPublicPath) {
      router.replace("/login");
    }
  }, [notReady, user, isPublicPath, router]);

  if (!isPublicPath && (notReady || !user)) return null;

  return <>{children}</>;
}