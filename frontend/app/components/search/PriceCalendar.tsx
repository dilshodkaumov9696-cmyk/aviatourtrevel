"use client";

import { useEffect, useState } from "react";

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function label(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}
// Детерминированная мок-цена по дате (позже заменим на API)
function priceFor(d: Date): number {
  const seed = (d.getDate() * 7 + d.getMonth() * 13) % 23;
  const base = 3300 + seed * 130; // 3300..~6160
  return seed % 4 === 0 ? base * 3 : base; // каждый 4-й день — дороже
}

export default function PriceCalendar({ selected, onSelect, selectedPrice }: { selected: string; onSelect: (d: string) => void; selectedPrice?: number }) {
  const [anchor, setAnchor] = useState(selected);
  useEffect(() => setAnchor(selected), [selected]);

  const base = parseISO(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(base, i - 3));

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
      <button
        type="button"
        aria-label="Раньше"
        onClick={() => setAnchor(toISO(addDays(base, -7)))}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
      >
        ‹
      </button>

      <div className="flex flex-1 gap-1">
        {days.map((d) => {
          const iso = toISO(d);
          const isSel = iso === selected;
          const price = isSel && selectedPrice ? selectedPrice : priceFor(d);
          const cheap = price < 10000;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`flex-1 rounded-lg border px-1 py-1.5 text-center transition ${
                isSel
                  ? "border-green-500 bg-[var(--color-bg-soft)]"
                  : "border-transparent hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              <div className="text-[11px] text-[var(--color-text-muted)]">{label(d)}</div>
              <div className={`text-[13px] font-semibold ${cheap ? "text-green-600" : "text-red-500"}`}>
                {price.toLocaleString("ru-RU")} ₽
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Позже"
        onClick={() => setAnchor(toISO(addDays(base, 7)))}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
      >
        ›
      </button>
    </div>
  );
}
