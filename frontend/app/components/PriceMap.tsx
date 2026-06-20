"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "../context/settings";

interface Dest {
  city: string;
  iata: string;
  country: string;
  lat: number;
  lon: number;
  price: number; // мок-цена от Москвы, ₽
  dx: number; // смещение подписи от точки, px
  dy: number;
}

// Москва — точка отправления (origin).
const ORIGIN = { city: "Москва", iata: "MOW", lat: 55.75, lon: 37.62 };

// dx/dy разводят подписи в плотном кластере (Турция / Средняя Азия).
const DESTS: Dest[] = [
  { city: "Стамбул", iata: "IST", country: "Турция", lat: 41.0, lon: 28.97, price: 12500, dx: -64, dy: -16 },
  { city: "Анталья", iata: "AYT", country: "Турция", lat: 36.9, lon: 30.8, price: 13700, dx: -60, dy: 18 },
  { city: "Дубай", iata: "DXB", country: "ОАЭ", lat: 25.25, lon: 55.36, price: 18900, dx: 6, dy: 34 },
  { city: "Ташкент", iata: "TAS", country: "Узбекистан", lat: 41.3, lon: 69.24, price: 14200, dx: 52, dy: -26 },
  { city: "Душанбе", iata: "DYU", country: "Таджикистан", lat: 38.55, lon: 68.8, price: 9800, dx: 58, dy: 4 },
  { city: "Худжанд", iata: "LBD", country: "Таджикистан", lat: 40.28, lon: 69.7, price: 9200, dx: 60, dy: 34 },
  { city: "Самарканд", iata: "SKD", country: "Узбекистан", lat: 39.65, lon: 66.97, price: 13100, dx: -56, dy: 40 },
  { city: "Алматы", iata: "ALA", country: "Казахстан", lat: 43.35, lon: 77.0, price: 16400, dx: 46, dy: -6 },
  { city: "Лондон", iata: "LON", country: "Великобритания", lat: 51.5, lon: -0.12, price: 22600, dx: -70, dy: -6 },
  { city: "Бангкок", iata: "BKK", country: "Таиланд", lat: 13.75, lon: 100.5, price: 31200, dx: 16, dy: 22 },
];

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function PriceMap({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { format } = useSettings();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const cheapest = Math.min(...DESTS.map((d) => d.price));

  function go(d: Dest) {
    const params = new URLSearchParams({
      fromCity: ORIGIN.city, fromIata: ORIGIN.iata,
      toCity: d.city, toIata: d.iata,
      date: defaultDate(), adults: "1", children: "0", infants: "0", cabin: "economy",
    });
    onClose();
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="animate-scale-in relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Шапка */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <div className="text-lg font-bold text-[var(--color-text)]">Цены на карте</div>
            <div className="text-xs text-[var(--color-text-muted)]">
              из <span className="font-semibold text-[var(--color-primary)]">Москвы</span> · нажмите на город, чтобы найти билеты
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
          >
            ×
          </button>
        </div>

        {/* Направления с ценами — сетка карточек */}
        <div className="overflow-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...DESTS].sort((a, b) => a.price - b.price).map((d) => {
              const isCheap = d.price === cheapest;
              return (
                <button
                  key={d.iata}
                  onClick={() => go(d)}
                  title={`${d.city} · ${d.country}`}
                  className={`group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                    isCheap
                      ? "border-green-600 bg-green-50 dark:bg-green-950/20"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-[var(--color-text)]">{d.city}</span>
                    <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">{d.iata}</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{d.country}</span>
                  <span className={`mt-1 text-lg font-bold ${isCheap ? "text-green-600" : "text-[var(--color-primary)]"}`}>
                    {format(d.price)}
                  </span>
                  {isCheap && <span className="text-[11px] font-semibold text-green-600">самый дешёвый</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Подвал */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)] px-5 py-3 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600" /> самый дешёвый маршрут
          </span>
          <span>Цены ориентировочные, в одну сторону</span>
        </div>
      </div>
    </div>
  );
}
