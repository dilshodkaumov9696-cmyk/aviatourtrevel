"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings, CURRENCIES, LANGS, Currency, Lang } from "../context/settings";

function CheckMark() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export default function SettingsSwitcher({
  variant = "light",
  align = "right",
}: {
  variant?: "light" | "dark";
  align?: "left" | "right";
}) {
  const { currency, setCurrency, lang, setLang, ready } = useSettings();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"lang" | "currency">("lang");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!ready) {
    return <div className="h-9 w-[92px]" aria-hidden />;
  }

  const curLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const curCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const btnCls =
    variant === "dark"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
      : "border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] hover:border-[var(--color-primary)]";

  return (
    <div ref={ref} className="relative">
      {/* Триггер */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${btnCls}`}
      >
        <span className="text-base leading-none">{curLang.flag}</span>
        <span>{curLang.short}</span>
        <span className="opacity-40">·</span>
        <span>{curCurrency.symbol}</span>
        <span className={`text-[10px] transition ${open ? "rotate-180" : ""} opacity-70`}>▾</span>
      </button>

      {/* Объединённый бокс */}
      {open && (
        <div
          className={`absolute z-[260] mt-2 w-[260px] rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-2xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Вкладки */}
          <div className="mb-2 flex rounded-2xl bg-[var(--color-bg-soft)] p-1">
            <button
              type="button"
              onClick={() => setTab("lang")}
              className={`flex-1 rounded-xl py-2 text-[15px] font-bold transition ${
                tab === "lang"
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Язык
            </button>
            <button
              type="button"
              onClick={() => setTab("currency")}
              className={`flex-1 rounded-xl py-2 text-[15px] font-bold transition ${
                tab === "currency"
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              Валюта
            </button>
          </div>

          {/* Список опций */}
          <div className="space-y-1">
            {tab === "lang"
              ? LANGS.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code as Lang)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        active ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-bg-soft)]"
                      }`}
                    >
                      <span className="text-xl leading-none">{l.flag}</span>
                      <span className="flex-1 text-[15px] font-medium text-[var(--color-text)]">{l.label}</span>
                      {active && <CheckMark />}
                    </button>
                  );
                })
              : CURRENCIES.map((c) => {
                  const active = c.code === currency;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrency(c.code as Currency)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        active ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-bg-soft)]"
                      }`}
                    >
                      <span className="text-xl leading-none">{c.flag}</span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[15px] font-medium text-[var(--color-text)]">{c.name}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{c.symbol} {c.code}</span>
                      </span>
                      {active && <CheckMark />}
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}
