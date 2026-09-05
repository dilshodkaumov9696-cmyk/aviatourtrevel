"use client";

import { useEffect, useState } from "react";
import SettingsSwitcher from "./SettingsSwitcher";
import { useAuth } from "../context/auth";
import { useSettings } from "../context/settings";
import { IconClose } from "./icons";
import {
  Airplane,
  Buildings,
  MapTrifold,
  SimCard,
  ShieldCheck,
  Train,
  Car,
  Percent,
  Headset,
  User,
  List,
} from "@phosphor-icons/react";
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
    [t("nav.hotels"), Buildings],
    [t("nav.tours"), MapTrifold],
    [t("nav.esim"), SimCard],
    [t("nav.insurance"), ShieldCheck],
    [t("nav.trains"), Train],
    [t("nav.transfers"), Car],
  ] as const;

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
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("nav.menu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
      >
        <List size={20} weight="regular" />
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
                href="/#search"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${activeSection === "search" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"}`}
              >
                <Airplane size={20} weight="regular" />
                {t("nav.flights")}
              </a>
              {upcoming.map(([label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setComingSoon(label);
                    window.setTimeout(() => setComingSoon((cur) => (cur === label ? null : cur)), 1600);
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
                >
                  <Icon size={20} weight="regular" />
                  <span>
                    {label}
                    {comingSoon === label && <span className="ml-2 text-xs font-semibold text-[var(--color-primary)]">{t("nav.coming_soon")}</span>}
                  </span>
                </button>
              ))}
              <a
                href="/#deals"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${activeSection === "deals" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]"}`}
              >
                <Percent size={20} weight="regular" />
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
                <Headset size={22} weight="regular" className="text-[var(--color-primary)]" />
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
                  <User size={18} weight="regular" />
                  {user.fullName || user.email.split("@")[0]}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={login}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-3 text-center text-base font-semibold text-[var(--color-accent-foreground)]"
                >
                  <User size={18} weight="regular" />
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
