"use client";

import { useState } from "react";
import { useAuth } from "../context/auth";
import AuthModal from "../components/AuthModal";

/** Блок "кто вошёл" вверху личного кабинета: аватар + выход, либо приглашение войти. */
export default function AccountHeader() {
  const { user, loading, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading) {
    return <div className="mb-6 h-12 animate-pulse rounded-xl bg-[var(--color-bg-soft)]" />;
  }

  if (!user) {
    return (
      <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[var(--color-text-muted)]">
          Вы не вошли. Войдите, чтобы заказы и история поиска сохранялись за вашим аккаунтом.
        </div>
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="shrink-0 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          Войти или зарегистрироваться
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
          {(user.fullName || user.email)[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--color-text)]">{user.fullName || "Без имени"}</div>
          <div className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="shrink-0 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Выйти
      </button>
    </div>
  );
}
