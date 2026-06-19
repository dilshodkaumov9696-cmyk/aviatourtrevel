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

// Калибровка под World_map_-_low_resolution.svg (950×620). Линейная проекция
// lon/lat → %, коэффициенты подобраны по сетке меридианов/параллелей.
const LON_A = 0.34, LON_B = 46.5;
const LAT_A = -0.52, LAT_B = 59;
function project(lat: number, lon: number) {
  return { x: LON_A * lon + LON_B, y: LAT_A * lat + LAT_B };
}

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
  const origin = project(ORIGIN.lat, ORIGIN.lon);

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

        {/* Карта */}
        <div className="overflow-auto bg-[var(--color-primary-light)]/40 p-3 sm:p-6">
          <div
            className="relative mx-auto w-full"
            style={{ aspectRatio: "950 / 620", maxWidth: 980 }}
          >
            {/* Подложка-карта */}
            <div
              className="absolute inset-0 opacity-60 dark:opacity-30"
              style={{
                backgroundImage: "url(/world-map.svg)",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Дуги от Москвы к городам */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              {DESTS.map((d) => {
                const p = project(d.lat, d.lon);
                const mx = (origin.x + p.x) / 2;
                const my = Math.min(origin.y, p.y) - 6;
                return (
                  <path
                    key={d.iata}
                    d={`M ${origin.x} ${origin.y} Q ${mx} ${my} ${p.x} ${p.y}`}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    opacity="0.35"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {/* Точка-отправление Москва */}
            <div
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
            >
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-60" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-[var(--color-primary)] shadow" />
              </span>
              <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-primary)] px-2 py-0.5 text-[11px] font-bold text-white shadow">
                Москва
              </span>
            </div>

            {/* Города-пузыри с ценами (точка ровно на координате, подпись со смещением) */}
            {DESTS.map((d) => {
              const p = project(d.lat, d.lon);
              const isCheap = d.price === cheapest;
              return (
                <button
                  key={d.iata}
                  onClick={() => go(d)}
                  className="group absolute z-30 hover:z-40"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  title={`${d.city} · ${d.country}`}
                >
                  {/* Точка — точно на координате города */}
                  <span
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow transition group-hover:scale-125 ${
                      isCheap ? "h-3.5 w-3.5 bg-green-600" : "h-3 w-3 bg-[var(--color-primary)]"
                    }`}
                  />
                  {/* Подпись со смещением, чтобы не перекрывать соседей */}
                  <span
                    className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold shadow-md transition group-hover:scale-105 ${
                      isCheap
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] group-hover:border-[var(--color-primary)]"
                    }`}
                    style={{ left: d.dx, top: d.dy }}
                  >
                    {d.city} <span className={isCheap ? "text-white" : "text-[var(--color-primary)]"}>{format(d.price)}</span>
                  </span>
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
