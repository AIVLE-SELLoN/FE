"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

const PUBLIC_PATHS = ["/login", "/signup", "/find-account"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.replace("/login");
    }
  }, [isLoading, user, isPublicPath, router]);

  if (!isPublicPath && (isLoading || !user)) return null;

  return <>{children}</>;
}