"use client";

import { useEffect, useState } from "react";
import SettingsSwitcher from "./SettingsSwitcher";

type SectionKey = "search" | "directions" | "deals" | "help";

const NAV: Array<{ href: string; label: string; section: SectionKey }> = [
  { href: "#search", label: "Авиабилеты", section: "search" },
  { href: "#directions", label: "Направления", section: "directions" },
  { href: "#deals", label: "Акции", section: "deals" },
  { href: "#help", label: "Помощь", section: "help" },
];

export default function MobileMenu({ onLogin, activeSection }: { onLogin: () => void; activeSection: SectionKey }) {
  const [open, setOpen] = useState(false);

  // Esc для закрытия + блокировка прокрутки фона, пока меню открыто
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function login() {
    setOpen(false);
    onLogin();
  }

  return (
    <div className="lg:hidden">
      {/* Кнопка-бургер */}
      <button
        type="button"
        aria-label="Открыть меню"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          {/* Затемнение фона */}
          <div
            className="animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Выезжающая панель */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Меню навигации"
            className="animate-slide-in-right fixed inset-y-0 right-0 z-50 flex w-[84%] max-w-sm flex-col bg-[var(--color-surface)] shadow-2xl"
          >
            {/* Шапка панели */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] font-bold text-white">A</span>
                <span className="text-lg font-bold text-[var(--color-primary)]">Aviator</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Навигация */}
            <nav className="flex flex-col gap-1 px-3 py-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-base font-medium transition ${activeSection === n.section ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"}`}
                >
                  {n.label}
                </a>
              ))}
            </nav>

            {/* Язык и валюта */}
            <div className="border-t border-[var(--color-border)] px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Язык и валюта
              </p>
              <div className="flex flex-col items-start gap-1">
                <SettingsSwitcher align="left" />
              </div>
            </div>

            {/* Войти — внизу */}
            <div className="mt-auto border-t border-[var(--color-border)] px-5 py-4">
              <button
                type="button"
                onClick={login}
                className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Войти
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
