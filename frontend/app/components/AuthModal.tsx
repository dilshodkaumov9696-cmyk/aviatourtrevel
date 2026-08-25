"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/auth";
import { getAuthProviders, googleLoginUrl } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "register";

const inputCls =
  "w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]";

const labelCls = "block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5";

export default function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Esc для закрытия + блокировка прокрутки фона
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setShowPass(false);
      setError("");
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [open]);

  useEffect(() => {
    if (open) void getAuthProviders().then((providers) => setGoogleEnabled(providers.google));
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить вход");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      {/* Затемнение */}
      <div
        className="animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Окно */}
      <div className="animate-scale-in relative z-10 my-8 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl sm:p-7">
        {/* Закрыть */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]"
        >
          ✕
        </button>

        {/* Лого + заголовок */}
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] font-bold text-white">
            A
          </div>
          <span className="text-xl font-bold text-[var(--color-primary)]">Aviator</span>
        </div>

        {/* Вкладки */}
        <div className="mb-6 flex rounded-xl bg-[var(--color-bg-soft)] p-1">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setSubmitted(false);
                setError("");
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {t === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              {tab === "login" ? "Вы вошли" : "Аккаунт создан"}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">
              {email}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              Понятно
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {tab === "register" && (
                <div>
                  <label className={labelCls}>Имя</label>
                  <input
                    type="text"
                    placeholder="Как вас зовут?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  >
                    {showPass ? "Скрыть" : "Показать"}
                  </button>
                </div>
                {tab === "login" && (
                  <Link
                    href="/forgot-password"
                    onClick={onClose}
                    className="mt-2 inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--color-primary-dark)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Секунду…" : tab === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </form>

            {/* Разделитель */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted)]">или</span>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            {/* Соц-вход */}
            {googleEnabled ? <a
              href={googleLoginUrl()}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-bg-soft)]"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.7 2.6-7.4 2.6-5.2 0-9.6-3.3-11.2-8l-6.5 5C9 40.3 15.9 45 24 45z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C41.6 36 45 30.6 45 24c0-1.2-.1-2.3-.4-3.5z" />
              </svg>
              Продолжить с Google
            </a> : <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 text-center text-sm text-[var(--color-text-muted)]">
              Вход через Google появится после подключения сервиса
            </div>}

            {/* Переключение вкладки */}
            <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
              {tab === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button
                type="button"
                onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); }}
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                {tab === "login" ? "Зарегистрируйтесь" : "Войдите"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
