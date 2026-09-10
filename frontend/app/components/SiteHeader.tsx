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
  "group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[12px] font-medium tracking-[0.01em] whitespace-nowrap transition-all duration-200 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-[13px]";

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
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] dark:border-white/20 dark:bg-white/10"
        aria-hidden
      >
        <FolderIcon name="moon" size={18} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] transition hover:bg-[var(--color-surface)] dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      <FolderIcon name={dark ? "sun" : "moon"} size={18} invert={dark} />
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
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[color-mix(in_srgb,#0A0A0B_88%,transparent)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            : "border-transparent bg-transparent dark:border-white/[0.06]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1760px] items-center gap-2 px-3 sm:gap-3 sm:px-5 xl:px-6 2xl:px-8 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark size={36} className="xl:hidden" />
            <LogoMark size={42} className="hidden xl:block" />
            <span className="hidden font-heading text-lg font-bold tracking-tight text-[var(--color-text)] xl:inline">
              Aviator
            </span>
          </Link>

          <nav
            className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t("nav.menu")}
          >
            <div className="flex w-max items-center gap-1 pr-1 sm:gap-1.5">
              {NAV_ITEMS.map(({ key, icon, href }) => {
                const label = t(`nav.${key}`);
                const active =
                  key === "flights"
                    ? activeSection === "search"
                    : key === "deals"
                      ? activeSection === "deals"
                      : comingSoon === label;
                const className = `${NAV_BTN} ${
                  active
                    ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm dark:bg-white dark:text-black"
                    : "bg-transparent text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)] dark:bg-white/[0.04] dark:text-white/75 dark:ring-white/10 dark:hover:bg-white/12 dark:hover:text-white"
                }`;
                const inner = (
                  <>
                    <FolderIcon name={icon} size={18} invert={active} />
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
                        window.setTimeout(
                          () => setComingSoon((cur) => (cur === label ? null : cur)),
                          1600,
                        );
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
              className="group hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] transition hover:bg-[var(--color-surface)] dark:border-white/15 dark:bg-white/[0.04] dark:text-white/90 dark:hover:border-white/40 dark:hover:bg-white/10 2xl:inline-flex"
            >
              <FolderIcon name="support" size={20} className="shrink-0 dark:brightness-0 dark:invert" />
            </button>
            <ThemeToggle />
            <div className="hidden items-center xl:flex">
              <SettingsSwitcher />
            </div>
            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] lg:inline-flex dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-[var(--color-accent-foreground)]">
                  {(user.fullName || user.email)[0]?.toUpperCase()}
                </span>
                <span className="max-w-[7.5rem] truncate">{user.fullName || user.email.split("@")[0]}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="group hidden items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-accent-foreground)] transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] lg:inline-flex"
              >
                <FolderIcon name="login" size={18} invert className="dark:brightness-0" />
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
