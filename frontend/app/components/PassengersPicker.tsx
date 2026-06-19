"use client";

import { useEffect, useRef, useState } from "react";
import { IconUser } from "./icons";

export type CabinClass = "economy" | "business" | "first";

export interface Passengers {
  adults: number;
  children: number;
  infants: number;
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
  const total = p.adults + p.children + p.infants;
  const word = total === 1 ? "пассажир" : total < 5 ? "пассажира" : "пассажиров";
  return `${total} ${word}, ${CABIN_LABELS[cabin]}`;
}

export function passengersCountLabel(p: Passengers): string {
  const total = p.adults + p.children + p.infants;
  const word = total === 1 ? "пассажир" : total < 5 ? "пассажира" : "пассажиров";
  return `${total} ${word}`;
}

const PAX_ROWS: { key: keyof Passengers; label: string; sub: string }[] = [
  { key: "adults", label: "Взрослые", sub: "от 12 лет" },
  { key: "children", label: "Дети", sub: "2–11 лет" },
  { key: "infants", label: "Младенцы", sub: "до 2 лет, без места" },
];

interface Props {
  passengers: Passengers;
  cabin: CabinClass;
  onPassengers: (p: Passengers) => void;
  onCabin: (c: CabinClass) => void;
  align?: "left" | "right";
  className?: string;
}

export default function PassengersPicker({
  passengers, cabin, onPassengers, onCabin,
  align = "right", className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function change(key: keyof Passengers, delta: number) {
    const next = { ...passengers, [key]: Math.max(0, passengers[key] + delta) };
    if (next.adults < 1) next.adults = 1;
    if (next.infants > next.adults) next.infants = next.adults;
    onPassengers(next);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className="flex items-center gap-2.5 min-h-[52px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-1.5 cursor-pointer hover:border-[var(--color-primary)] transition"
        onClick={() => setOpen((v) => !v)}
      >
        <IconUser className="text-[var(--color-primary)] shrink-0" />
        <div className="min-w-0 flex-1 overflow-hidden leading-tight">
          <div className="truncate text-[11px] text-[var(--color-text-muted)]">{CABIN_FULL_LABELS[cabin]}</div>
          <div className="truncate text-[14px] font-semibold text-[var(--color-text)]">{passengersCountLabel(passengers)}</div>
        </div>
        <span className="shrink-0 text-[var(--color-text-muted)] text-xs">{open ? "▴" : "▾"}</span>
      </div>

      {open && (
        <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} mt-2 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl p-4 w-72`}>
          {PAX_ROWS.map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
              <div>
                <div className="text-sm font-medium text-[var(--color-text)]">{label}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => change(key, -1)}
                  disabled={key === "adults" ? passengers[key] <= 1 : passengers[key] <= 0}
                  className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition text-xl leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-[var(--color-text)]">{passengers[key]}</span>
                <button
                  type="button"
                  onClick={() => change(key, 1)}
                  className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:border-[var(--color-primary)] transition text-xl leading-none"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <div className="text-xs text-[var(--color-text-muted)] mb-2">Класс</div>
            <div className="flex gap-2">
              {(["economy", "business", "first"] as CabinClass[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCabin(c)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                    cabin === c
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {CABIN_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-lg bg-[var(--color-primary)] text-white py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] transition"
          >
            Готово
          </button>
        </div>
      )}
    </div>
  );
}
