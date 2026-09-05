"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ANIMATED_NAV_ICONS } from "../../components/animatedIcons";

export default function AnimatedIconsPreviewPage() {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      // re-trigger class by toggling briefly
      setPlaying(false);
      window.setTimeout(() => setPlaying(true), 40);
    }, 2200);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <main className="min-h-screen bg-[#071428] px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E8B84A]">Превью · уже в шапке</p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Анимированные иконки Aviator</h1>
            <p className="mt-3 max-w-2xl text-white/70">
              Набор подключён в SiteHeader и MobileMenu. Наведите на карточку или смотрите автоповтор —
              те же движения срабатывают при наведении на пункты меню в шапке.
            </p>
          </div>
          <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
            ← На главную
          </Link>
        </div>

        {/* Имитация шапки */}
        <div className="mb-10 overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#06101f] to-[#0a1c38] p-4">
          <div className="flex w-max items-center gap-2">
            <span className="mr-2 font-heading text-lg font-bold">Aviator</span>
            {ANIMATED_NAV_ICONS.filter((i) => !["support", "login", "sun"].includes(i.key)).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`ai-preview group inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-medium ring-1 ring-inset ring-white/15 ${
                  key === "flights" ? "bg-white/16 text-white" : "bg-white/[0.04] text-white/80 hover:bg-white/12"
                } ${playing ? "is-playing" : ""}`}
              >
                <Icon size={18} className="text-white" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ANIMATED_NAV_ICONS.map(({ key, label, motion, Icon }) => (
            <button
              key={key}
              type="button"
              className={`ai-preview rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-[#E8B84A]/40 hover:bg-white/[0.07] ${
                playing ? "is-playing" : ""
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a1c38] ring-1 ring-white/15">
                <Icon size={30} className="text-white" />
              </div>
              <div className="text-lg font-semibold">{label}</div>
              <div className="mt-1 text-sm text-white/55">{motion}</div>
              <div className="mt-3 font-mono text-[11px] text-[#E8B84A]/80">{key}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
