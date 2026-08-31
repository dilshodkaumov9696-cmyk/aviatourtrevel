"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/settings";
import { IconMinus, IconPlus, IconUser } from "./icons";

export type CabinClass = "economy" | "business" | "first";

const MAX_TOTAL_PAX = 9;

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
  infantsSeat: number;
}

export const EMPTY_PASSENGERS: Passengers = { adults: 1, children: 0, infants: 0, infantsSeat: 0 };

export function passengersTotal(p: Passengers): number {
  return p.adults + p.children + p.infants + p.infantsSeat;
}

/** Места в салоне: младенец без места не занимает кресло. */
export function passengersSeatCount(p: Passengers): number {
  return p.adults + p.children + p.infantsSeat;
}

/** Параметры, которые понимает текущий поиск (младенец с местом = детский тариф). */
export function passengersForSearch(p: Passengers): { adults: number; children: number; infants: number } {
  return {
    adults: p.adults,
    children: p.children + p.infantsSeat,
    infants: p.infants,
  };
}

export const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Эконом",
  business: "Бизнес",
  first: "Первый",
};

export const CABIN_FULL_LABELS: Record<CabinClass, string> = {
  economy: "Эконом-класс",
  business: "Бизнес-класс",
  first: "Первый класс",
};

export function passengersLabel(p: Passengers, cabin: CabinClass): string {
  const total = passengersTotal(p);
  const word = total === 1 ? "пассажир" : total < 5 ? "пассажира" : "пассажиров";
  return `${total} ${word}, ${CABIN_LABELS[cabin]}`;
}

export function passengersCountLabel(p: Passengers): string {
  const total = passengersTotal(p);
  const word = total === 1 ? "пассажир" : total < 5 ? "пассажира" : "пассажиров";
  return `${total} ${word}`;
}

interface Props {
  passengers: Passengers;
  cabin: CabinClass;
  onPassengers: (p: Passengers) => void;
  onCabin: (c: CabinClass) => void;
  align?: "left" | "right";
  className?: string;
  variant?: "standalone" | "bar";
}

export default function PassengersPicker({
  passengers, cabin, onPassengers, onCabin,
  align = "right", className = "", variant = "standalone",
}: Props) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  const total = passengersTotal(passengers);

  const rows: { key: keyof Passengers; label: string; sub: string }[] = [
    { key: "adults", label: t("pax.adults"), sub: t("pax.adults_sub") },
    { key: "children", label: t("pax.children"), sub: t("pax.children_sub") },
    { key: "infants", label: t("pax.infants"), sub: t("pax.infants_sub") },
    { key: "infantsSeat", label: t("pax.infants_seat"), sub: t("pax.infants_seat_sub") },
  ];

  const cabinLabels: Record<CabinClass, string> = {
    economy: t("pax.economy"),
    business: t("pax.business"),
    first: t("pax.first"),
  };
  const cabinFull: Record<CabinClass, string> = {
    economy: t("pax.economy_full"),
    business: t("pax.business_full"),
    first: t("pax.first_full"),
  };

  function canIncrement(key: keyof Passengers): boolean {
    if (total >= MAX_TOTAL_PAX) return false;
    if (key === "infants" && passengers.infants >= passengers.adults) return false;
    return true;
  }

  function flashBlocked(msg: string) {
    setBlockedMsg(msg);
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    blockedTimer.current = setTimeout(() => setBlockedMsg(null), 3000);
  }

  function change(key: keyof Passengers, delta: number) {
    if (delta > 0) {
      if (total >= MAX_TOTAL_PAX) {
        flashBlocked(t("pax.max_total").replace("{n}", String(MAX_TOTAL_PAX)));
        return;
      }
      if (key === "infants" && passengers.infants >= passengers.adults) {
        flashBlocked(
          passengers.adults === 1 ? t("pax.infant_cap_one") : t("pax.infant_cap").replace("{n}", String(passengers.adults)),
        );
        return;
      }
    }
    const next: Passengers = { ...passengers, [key]: Math.max(0, passengers[key] + delta) };
    if (next.adults < 1) next.adults = 1;
    if (next.infants > next.adults) next.infants = next.adults;
    onPassengers(next);
    setBlockedMsg(null);
  }

  function reset() {
    onPassengers({ ...EMPTY_PASSENGERS });
    onCabin("economy");
    setBlockedMsg(null);
  }

  function countWord(p: Passengers): string {
    const n = passengersTotal(p);
    if (t("pax.word_one") !== "pax.word_one") {
      if (n === 1) return `${n} ${t("pax.word_one")}`;
      if (n > 1 && n < 5) return `${n} ${t("pax.word_few")}`;
      return `${n} ${t("pax.word_many")}`;
    }
    return passengersCountLabel(p);
  }

  return (
    <div ref={ref} className={`relative z-[60] flex isolate ${className}`}>
      <div
        className={
          variant === "bar"
            ? "flex h-full w-full min-h-[64px] items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-[var(--color-surface)] sm:min-h-[76px] sm:px-5 xl:min-h-[84px] xl:px-6"
            : "flex w-full items-center gap-2.5 min-h-[52px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-1.5 cursor-pointer hover:border-[var(--color-primary)] transition"
        }
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <IconUser size={22} className="text-[var(--color-primary)] shrink-0" />
        <div className="min-w-0 flex-1 overflow-hidden leading-tight">
          <div className="truncate text-[11px] font-medium text-[var(--color-text-muted)]">{cabinFull[cabin]}</div>
          <div className="truncate text-[15px] font-semibold text-[var(--color-text)]">{countWord(passengers)}</div>
        </div>
        <span className="shrink-0 text-[var(--color-text-muted)] text-xs" aria-hidden>{open ? "▴" : "▾"}</span>
      </div>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close"
            className="fixed inset-0 z-[239] bg-black/45 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={t("form.passengers")}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-x-3 bottom-3 z-[240] max-h-[min(88dvh,36rem)] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_24px_60px_rgba(10,27,56,0.22)] md:absolute md:inset-x-auto md:bottom-auto md:top-full md:mt-2 md:max-h-none md:w-[min(20.5rem,calc(100vw-1.5rem))] md:overflow-visible ${
              align === "right" ? "md:right-0 md:left-auto" : "md:left-0 md:right-auto"
            }`}
          >
          {rows.map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">{label}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`− ${label}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    change(key, -1);
                  }}
                  disabled={key === "adults" ? passengers[key] <= 1 : passengers[key] <= 0}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <IconMinus size={16} />
                </button>
                <span className="w-6 text-center text-base font-semibold tabular-nums text-[var(--color-text)]">{passengers[key]}</span>
                <button
                  type="button"
                  aria-label={`+ ${label}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    change(key, 1);
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    canIncrement(key)
                      ? "border-[var(--color-border)] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-40"
                  }`}
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>
          ))}

          {blockedMsg && (
            <div className="animate-fade-in-down mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {blockedMsg}
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">{t("pax.class")}</div>
            <div className="flex gap-2">
              {(["economy", "business", "first"] as CabinClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCabin(c);
                  }}
                  className={`min-h-11 flex-1 rounded-lg px-1 text-xs font-semibold border transition ${
                    cabin === c
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {cabinLabels[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={total === 1 && cabin === "economy"}
              title={t("pax.reset")}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("pax.reset")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent-foreground)] transition hover:brightness-105"
            >
              {t("pax.done")}
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
