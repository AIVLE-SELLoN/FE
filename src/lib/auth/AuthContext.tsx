"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "ADMIN" | "ROOT" | "MEMBER";

export type AuthUser = {
  email: string;
  name: string;
  role: Role;
  profileImageUrl?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "sellon_auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // 저장된 값이 깨져있으면 비로그인 상태로 취급
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // 저장 실패해도 현재 세션 상태는 유지
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const nextUser = { ...currentUser, ...updates };
      try {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      } catch {
        // 저장 실패해도 현재 세션 상태는 유지
      }
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있어요.");
  return ctx;
}
