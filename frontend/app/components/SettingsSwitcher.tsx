"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings, CURRENCIES, LANGS, Currency, Lang } from "../context/settings";

function Dropdown({
  currentCode,
  currentLabel,
  options,
  onPick,
  variant,
  align,
}: {
  currentCode: string;
  currentLabel: string;
  options: { code: string; label: string }[];
  onPick: (code: string) => void;
  variant: "light" | "dark";
  align: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const btnCls =
    variant === "dark"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
      : "border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] hover:border-[var(--color-primary)]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-2 text-sm font-medium transition ${btnCls}`}
      >
        {currentLabel}
        <span className="text-[10px] opacity-70">▾</span>
      </button>
      {open && (
        <div className={`absolute z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg ${align === "right" ? "right-0" : "left-0"}`}>
          {options.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => { onPick(o.code); setOpen(false); }}
              className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition hover:bg-[var(--color-bg-soft)] ${
                o.code === currentCode
                  ? "font-semibold text-[var(--color-primary)]"
                  : "text-[var(--color-text)]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

  if (!ready) {
    return <div className="h-9 w-[120px]" aria-hidden />;
  }

  const curLabel = CURRENCIES.find((c) => c.code === currency)?.label ?? currency;
  const langShort = LANGS.find((l) => l.code === lang)?.short ?? "RU";

  return (
    <div className="flex items-center gap-1.5">
      <Dropdown
        currentCode={lang}
        currentLabel={langShort}
        options={LANGS.map((l) => ({ code: l.code, label: `${l.short} · ${l.label}` }))}
        onPick={(c) => setLang(c as Lang)}
        variant={variant}
        align={align}
      />
      <Dropdown
        currentCode={currency}
        currentLabel={curLabel}
        options={CURRENCIES.map((c) => ({ code: c.code, label: c.label }))}
        onPick={(c) => setCurrency(c as Currency)}
        variant={variant}
        align={align}
      />
    </div>
  );
}
