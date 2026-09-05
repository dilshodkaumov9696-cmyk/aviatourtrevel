"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/auth";
import { getAuthProviders, googleLoginUrl } from "../lib/api";
import LogoMark from "./Logo";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "register";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconMail({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconLock({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconUserOutline({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.3-3.6 4.3-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
    </svg>
  );
}

function IconEye({ className = "" }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className = "" }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.64A10.6 10.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.14 3.9M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.47-.3 3.5-.78" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function IconClose({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className={className} aria-hidden="true" {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Левая иллюстрация окна: авиационная сцена в цветах бренда — без стоковых персонажей. */
function AuthIllustration() {
  return (
    <div className="relative hidden w-[38%] shrink-0 overflow-hidden sm:block">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #0A1B38 0%, #123361 42%, #2454D6 78%, #4a86e0 100%)",
        }}
      />
      {/* мягкие облака */}
      <div className="absolute left-7 top-12 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-3 top-28 h-12 w-12 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -left-4 bottom-24 h-24 w-24 rounded-full bg-white/[0.06] blur-2xl" />
      <div className="absolute right-8 bottom-10 h-16 w-16 rounded-full bg-white/[0.06] blur-xl" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 560" fill="none" aria-hidden="true">
        <path
          d="M46 500 C 92 380, 58 250, 176 96"
          stroke="#E2A63B"
          strokeWidth="2"
          strokeDasharray="1.5 11"
          strokeLinecap="round"
          opacity="0.75"
          className="auth-trail"
        />
        <circle cx="46" cy="500" r="4.5" fill="#E2A63B" />
        <circle cx="46" cy="500" r="9" fill="none" stroke="#E2A63B" strokeWidth="1.4" opacity="0.5" />

        <g className="auth-plane-float" style={{ transformOrigin: "176px 96px" }}>
          <g transform="translate(176,96) rotate(-38) scale(2.7) translate(-12,-12)">
            <path
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
              fill="#ffffff"
            />
          </g>
        </g>

        <circle cx="238" cy="150" r="3" fill="#ffffff" opacity="0.65" />
        <circle cx="262" cy="214" r="2" fill="#ffffff" opacity="0.4" />
        <circle cx="96" cy="330" r="2.5" fill="#ffffff" opacity="0.45" />
        <circle cx="208" cy="420" r="2" fill="#ffffff" opacity="0.35" />
      </svg>

      <div className="absolute bottom-7 left-7 flex items-center gap-2">
        <LogoMark size={26} />
        <span className="font-heading text-[15px] font-bold tracking-tight text-white">Aviator</span>
      </div>
    </div>
  );
}

export default function AuthModal({ open, onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
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

  const isLogin = tab === "login";

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

  const inputCls =
    "peer w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#189A63] focus:ring-2 focus:ring-[#189A63]/15";
  const inputIconCls =
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-[#189A63]";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      {/* Затемнение */}
      <div
        className="animate-fade-in fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Окно */}
      <div className="animate-scale-in relative z-10 my-8 w-full max-w-3xl">
        {/* Закрыть — вне overflow-hidden карточки, чтобы не обрезалось скруглением */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute -right-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:text-slate-900 sm:-right-4 sm:-top-4 sm:h-11 sm:w-11"
        >
          <IconClose />
        </button>

        <div className="flex overflow-hidden rounded-3xl bg-white shadow-2xl">
          <AuthIllustration />

          {/* Форма */}
          <div className="w-full px-6 py-8 sm:w-[62%] sm:px-10 sm:py-10">
          {submitted ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#189A63]/10 text-3xl text-[#0F7A4C]">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isLogin ? "Вы вошли" : "Аккаунт создан"}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{email}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-[#189A63] py-3 text-sm font-semibold text-white transition hover:bg-[#0F7A4C]"
              >
                Понятно
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-[25px] font-extrabold leading-tight text-slate-900 sm:text-[27px]">
                {isLogin ? "Вход на сайт" : "Регистрация"}
              </h2>
              <span
                className="mt-3 block h-1 w-16 rounded-full"
                style={{ background: "linear-gradient(90deg, #189A63, #2FD98A)" }}
              />
              <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
                {isLogin
                  ? "Войдите, чтобы управлять бронированиями, получать бонусы и персональные предложения."
                  : "Создайте аккаунт — быстрые бронирования, бонусы и персональные предложения."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-3.5" noValidate>
                {tab === "register" && (
                  <div className="relative">
                    <IconUserOutline className={inputIconCls} />
                    <input
                      type="text"
                      placeholder="Как вас зовут?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                )}

                <div className="relative">
                  <IconMail className={inputIconCls} />
                  <input
                    type="email"
                    required
                    placeholder="Электронная почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="relative">
                  <IconLock className={inputIconCls} />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#189A63]"
                  >
                    {showPass ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex select-none items-center gap-2 text-[13px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300"
                      style={{ accentColor: "#189A63" }}
                    />
                    Запомнить меня
                  </label>
                  {isLogin && (
                    <Link
                      href="/forgot-password"
                      onClick={onClose}
                      className="text-[13px] font-semibold text-slate-900 hover:text-[#189A63] hover:underline"
                    >
                      Забыли пароль?
                    </Link>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#189A63] py-3 text-sm font-semibold text-white shadow-md shadow-[#189A63]/20 transition hover:bg-[#0F7A4C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Секунду…" : isLogin ? "Войти" : "Зарегистрироваться"}
                </button>
              </form>

              {/* Разделитель */}
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">или</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Соц-вход */}
              {googleEnabled ? (
                <a
                  href={googleLoginUrl()}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.7 29.4 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.7 2.6-7.4 2.6-5.2 0-9.6-3.3-11.2-8l-6.5 5C9 40.3 15.9 45 24 45z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3C41.6 36 45 30.6 45 24c0-1.2-.1-2.3-.4-3.5z" />
                  </svg>
                  Вход с аккаунтом Google
                </a>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-[13px] text-slate-400">
                  Вход через Google скоро будет доступен
                </div>
              )}

              {/* Переключение вкладки */}
              <p className="mt-5 text-center text-sm text-slate-500">
                {isLogin ? "Ещё нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab(isLogin ? "register" : "login");
                    setError("");
                  }}
                  className="font-semibold text-[#189A63] hover:underline"
                >
                  {isLogin ? "Зарегистрируйтесь" : "Войдите"}
                </button>
              </p>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
