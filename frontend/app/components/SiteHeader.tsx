"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoMark from "./Logo";
import AuthModal from "./AuthModal";
import SettingsSwitcher from "./SettingsSwitcher";
import MobileMenu from "./MobileMenu";
import { FolderIcon, NAV_ITEMS } from "./navIcons";
import { useAuth } from "../context/auth";
import { useSettings } from "../context/settings";

const NAV_BTN =
  "group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-medium tracking-[0.01em] whitespace-nowrap transition-colors duration-200 sm:gap-2 sm:px-3";
const NAV_IDLE =
  "text-[var(--color-text)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]";
const NAV_ACTIVE =
  "bg-[var(--color-primary-light)] text-[var(--color-primary)]";

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  if (dark === null) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]" aria-hidden>
        <FolderIcon name="moon" size={18} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:bg-[var(--color-bg-soft)]"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      <FolderIcon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}

export default function SiteHeader({
  scrolled = true,
  activeSection = "search",
}: {
  scrolled?: boolean;
  activeSection?: "search" | "directions" | "deals" | "help";
}) {
  const { t } = useSettings();
  const { user } = useAuth();
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(18,24,32,0.04)]" : "shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 xl:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoMark size={36} className="xl:hidden" />
            <LogoMark size={42} className="hidden xl:block" />
            <span className="hidden font-heading text-lg font-bold tracking-tight text-[var(--color-text)] xl:inline">Aviator</span>
          </Link>

          <nav
            className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t("nav.menu")}
          >
            <div className="flex w-max items-center gap-1 pr-1 sm:gap-1.5">
              {NAV_ITEMS.map(({ key, icon, href }) => {
                const label = t(`nav.${key}`);
                const active =
                  key === "flights" ? activeSection === "search" : key === "deals" ? activeSection === "deals" : comingSoon === label;
                const className = `${NAV_BTN} ${active ? NAV_ACTIVE : NAV_IDLE}`;
                const inner = (
                  <>
                    <FolderIcon name={icon} size={20} />
                    <span>{label}</span>
                  </>
                );
                if (href) {
                  return (
                    <Link key={key} href={href} className={className} title={label}>
                      {inner}
                    </Link>
                  );
                }
                return (
                  <div key={key} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setComingSoon(label);
                        window.setTimeout(() => setComingSoon((cur) => (cur === label ? null : cur)), 1600);
                      }}
                      className={className}
                      title={label}
                    >
                      {inner}
                    </button>
                    {comingSoon === label && (
                      <span className="animate-fade-in-down pointer-events-none absolute left-1/2 top-full z-30 mt-2.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--color-ink)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg ring-1 ring-white/10">
                        {t("nav.coming_soon")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              title={`${t("nav.support")} — ${t("nav.support_247")}`}
              aria-label={`${t("nav.support")} — ${t("nav.support_247")}`}
              className="group hidden h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition hover:bg-[var(--color-bg-soft)] 2xl:inline-flex"
            >
              <FolderIcon name="support" size={22} className="shrink-0" />
            </button>
            <ThemeToggle />
            <div className="hidden items-center xl:flex">
              <SettingsSwitcher variant="light" />
            </div>
            {user ? (
              <Link
                href="/account"
                className="hidden min-h-11 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] lg:inline-flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">
                  {(user.fullName || user.email)[0]?.toUpperCase()}
                </span>
                <span className="max-w-[7.5rem] truncate">{user.fullName || user.email.split("@")[0]}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="group hidden min-h-11 items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[var(--color-primary-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] lg:inline-flex"
              >
                <FolderIcon name="login" size={18} invert />
                {t("nav.login")}
              </button>
            )}
            <MobileMenu activeSection={activeSection} onLogin={() => setAuthOpen(true)} />
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
