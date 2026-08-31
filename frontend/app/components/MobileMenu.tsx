"use client";

import { useEffect, useState } from "react";
import SettingsSwitcher from "./SettingsSwitcher";
import { useAuth } from "../context/auth";
import { useSettings } from "../context/settings";
import { IconClose, IconHeadset, IconUser } from "./icons";
import LogoMark from "./Logo";
import Link from "next/link";

type SectionKey = "search" | "directions" | "deals" | "help";

export default function MobileMenu({
  onLogin,
  activeSection,
}: {
  onLogin: () => void;
  activeSection: SectionKey;
}) {
  const { t } = useSettings();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const upcoming = [
    t("nav.hotels"),
    t("nav.tours"),
    t("nav.esim"),
    t("nav.insurance"),
    t("nav.trains"),
    t("nav.transfers"),
  ];

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
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={t("nav.menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div className="animate-fade-in fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="animate-slide-in-right fixed inset-y-0 right-0 z-[70] flex w-[min(84%,22rem)] max-w-sm flex-col bg-[var(--color-surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <span className="flex items-center gap-2">
                <LogoMark size={32} />
                <span className="font-heading text-lg font-bold text-[var(--color-text)]">Aviator</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
              >
                <IconClose size={18} />
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              <a
                href="#search"
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-semibold transition ${activeSection === "search" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"}`}
              >
                {t("nav.flights")}
              </a>
              {upcoming.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setComingSoon(label);
                    window.setTimeout(() => setComingSoon((cur) => (cur === label ? null : cur)), 1600);
                  }}
                  className="rounded-xl px-4 py-3 text-left text-base font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                >
                  {label}
                  {comingSoon === label && <span className="ml-2 text-xs font-semibold text-[var(--color-primary)]">{t("nav.coming_soon")}</span>}
                </button>
              ))}
              <a
                href="#deals"
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-semibold transition ${activeSection === "deals" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"}`}
              >
                {t("nav.deals")}
              </a>
            </nav>

            <div className="border-t border-[var(--color-border)] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("open-chat"));
                }}
                className="mb-4 flex w-full min-h-12 items-center gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2 text-left"
              >
                <IconHeadset size={22} className="text-[var(--color-primary)]" />
                <span>
                  <span className="block text-sm font-semibold text-[var(--color-text)]">{t("nav.support")}</span>
                  <span className="text-xs font-bold tracking-wide text-[var(--color-primary)]">{t("nav.support_247")}</span>
                </span>
              </button>
              <SettingsSwitcher align="left" />
            </div>

            <div className="mt-auto border-t border-[var(--color-border)] px-5 py-4">
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-base font-semibold text-white"
                >
                  <IconUser size={18} />
                  {user.fullName || user.email.split("@")[0]}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={login}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-center text-base font-semibold text-[var(--color-accent-foreground)]"
                >
                  <IconUser size={18} />
                  {t("nav.login")}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
