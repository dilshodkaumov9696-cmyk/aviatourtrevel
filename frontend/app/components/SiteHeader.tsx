"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoMark from "./Logo";
import AuthModal from "./AuthModal";
import SettingsSwitcher from "./SettingsSwitcher";
import MobileMenu from "./MobileMenu";
import { NAV_ITEMS } from "./navIcons";
import { ANIMATED_ICON_MAP, AnimLogin, AnimMoon, AnimSun, AnimSupport } from "./animatedIcons";
import { useAuth } from "../context/auth";
import { useSettings } from "../context/settings";

const NAV_BTN =
  "group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[12px] font-medium tracking-[0.01em] whitespace-nowrap transition-all duration-200 sm:gap-2 sm:px-3 sm:py-2.5 sm:text-[13px]";
const NAV_IDLE =
  "bg-white/[0.045] text-white/78 ring-1 ring-inset ring-white/10 hover:bg-white/14 hover:text-white hover:ring-white/22";
const NAV_ACTIVE =
  "bg-white/16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-inset ring-white/28";

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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white" aria-hidden>
        <AnimMoon size={18} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? <AnimSun size={18} /> : <AnimMoon size={18} />}
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
          scrolled ? "border-white/10 shadow-[0_12px_40px_rgba(2,8,20,0.45)]" : "border-white/[0.06]"
        }`}
        style={{
          background: scrolled
            ? "linear-gradient(180deg, #06101f 0%, #0a1c38 100%)"
            : "linear-gradient(180deg, #071428 0%, #0a1d3c 58%, #0c274c 100%)",
        }}
      >
        <div className={`mx-auto flex max-w-[1760px] items-center gap-2 px-3 sm:gap-3 sm:px-5 xl:px-6 2xl:px-8 ${scrolled ? "py-3" : "py-5"}`}>
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoMark size={36} className="xl:hidden" />
            <LogoMark size={42} className="hidden xl:block" />
            <span className="hidden font-heading text-lg font-bold tracking-tight text-white xl:inline">Aviator</span>
          </Link>

          <nav
            className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t("nav.menu")}
          >
            <div className="flex w-max items-center gap-1 pr-1 sm:gap-1.5">
              {NAV_ITEMS.map(({ key, icon, href }) => {
                const label = t(`nav.${key}`);
                const Icon = ANIMATED_ICON_MAP[icon];
                const active =
                  key === "flights" ? activeSection === "search" : key === "deals" ? activeSection === "deals" : comingSoon === label;
                const className = `${NAV_BTN} ${active ? NAV_ACTIVE : NAV_IDLE}`;
                const inner = (
                  <>
                    <Icon size={20} className="shrink-0 text-current" />
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
              className="group hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2.5 text-white/90 transition hover:border-white/40 hover:bg-white/10 2xl:inline-flex"
            >
              <AnimSupport size={20} className="shrink-0 text-current" />
              <span className="leading-tight text-left">
                <span className="block text-[13px] font-semibold">{t("nav.support")}</span>
                <span className="block text-[11px] font-bold tracking-wide text-white">{t("nav.support_247")}</span>
              </span>
            </button>
            <ThemeToggle />
            <div className="hidden items-center xl:flex">
              <SettingsSwitcher variant="dark" />
            </div>
            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:inline-flex"
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
                className="group hidden items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-accent-foreground)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:inline-flex"
              >
                <AnimLogin size={18} className="shrink-0 text-current" />
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
