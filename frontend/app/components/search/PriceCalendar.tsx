"use client";

import { useEffect, useState } from "react";
import { useSettings } from "../../context/settings";

const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toYYYYMM(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function dayLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

interface Props {
  selected: string;
  onSelect: (d: string) => void;
  selectedPrice?: number;
  origin?: string;
  destination?: string;
}

export default function PriceCalendar({ selected, onSelect, selectedPrice, origin, destination }: Props) {
  const { format } = useSettings();
  const [anchor, setAnchor] = useState(selected);
  const [apiPrices, setApiPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => setAnchor(selected), [selected]);

  // Загружаем цены при смене месяца или маршрута
  useEffect(() => {
    if (!origin || !destination) return;
    const base = parseISO(anchor);
    const month = toYYYYMM(base);

    setLoading(true);
    fetch(`/api/calendar-prices?origin=${origin}&destination=${destination}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.prices) setApiPrices((prev) => ({ ...prev, ...data.prices }));
      })
      .catch(() => { /* тихий фоллбэк на мок */ })
      .finally(() => setLoading(false));
  }, [anchor, origin, destination]);

  const base = parseISO(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(base, i - 3));

  function priceFor(d: Date): number | null {
    const iso = toISO(d);
    if (iso === selected && selectedPrice) return selectedPrice;
    return apiPrices[iso] ?? null;
  }

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

      <div className={`flex flex-1 gap-1 transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
        {days.map((d) => {
          const iso = toISO(d);
          const isSel = iso === selected;
          const price = priceFor(d);
          const cheap = price !== null && price < 10000;
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
              <div className="text-[11px] text-[var(--color-text-muted)]">{dayLabel(d)}</div>
              {price !== null ? (
                <div className={`text-[13px] font-semibold ${cheap ? "text-green-600" : "text-red-500"}`}>
                  {format(price)}
                </div>
              ) : (
                <div className="text-[13px] font-semibold text-[var(--color-text-muted)] opacity-50">—</div>
              )}
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
