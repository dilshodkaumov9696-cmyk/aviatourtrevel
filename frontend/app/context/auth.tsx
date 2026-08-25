"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AuthUser, fetchCurrentUser, loginUser, logoutUser, registerUser } from "../lib/api";

interface Ctx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем cookie-сессию один раз при загрузке приложения.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((u) => { if (!cancelled) setUser(u); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await loginUser({ email, password }));
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    setUser(await registerUser({ email, password, fullName }));
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return ctx;
}
