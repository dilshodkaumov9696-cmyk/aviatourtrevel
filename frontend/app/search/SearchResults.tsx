"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getFlights, AIRLINES, Flight } from "../data/flights";
import FlightCard from "../components/search/FlightCard";
import PriceCalendar from "../components/search/PriceCalendar";
import FiltersPanel, { FilterState } from "../components/search/FiltersPanel";
import { IconPlane, IconPin, IconCalendar, IconUser, IconSwap } from "../components/icons";

const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const CABIN: Record<string, string> = { economy: "эконом", premium: "комфорт", business: "бизнес", first: "первый" };

type Sort = "best" | "price" | "duration";
const SORT_LABEL: Record<Sort, string> = { best: "Сначала лучшие", price: "Сначала дешевле", duration: "Сначала быстрые" };
const SORT_CYCLE: Sort[] = ["best", "price", "duration"];

function dateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${d} ${MONTHS_GEN[m - 1]}, ${WD[dt.getDay()]}`;
}

export default function SearchResults() {
  const sp = useSearchParams();
  const fromCity = sp.get("fromCity") || "Москва";
  const fromIata = sp.get("fromIata") || "MOW";
  const toCity = sp.get("toCity") || "Стамбул";
  const toIata = sp.get("toIata") || "IST";
  const adults = Number(sp.get("adults") || 1);
  const children = Number(sp.get("children") || 0);
  const cabin = sp.get("cabin") || "economy";
  const paxCount = Math.max(1, adults + children);

  const flights = useMemo(() => getFlights(), []);
  const totalOf = (f: Flight) => f.pricePerPax * paxCount;
  const priceBounds = useMemo<[number, number]>(() => {
    const totals = flights.map(totalOf);
    return [Math.min(...totals), Math.max(...totals)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, paxCount]);

  const [date, setDate] = useState(sp.get("date") || "2026-06-28");
  const [sort, setSort] = useState<Sort>("best");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stopsMax: null,
    priceMax: priceBounds[1],
    baggageOnly: false,
    airlines: new Set(AIRLINES.map((a) => a.code)),
  });
  const setF = (patch: Partial<FilterState>) => setFilters((s) => ({ ...s, ...patch }));

  function reset() {
    setSort("best");
    setFilters({ stopsMax: null, priceMax: priceBounds[1], baggageOnly: false, airlines: new Set(AIRLINES.map((a) => a.code)) });
  }

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [drawerOpen]);

  const results = useMemo(() => {
    let list = flights.filter((f) => {
      if (filters.stopsMax !== null && f.stops > filters.stopsMax) return false;
      if (totalOf(f) > filters.priceMax) return false;
      if (filters.baggageOnly && !f.hasBaggage) return false;
      if (!filters.airlines.has(f.airlineCode)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price") return totalOf(a) - totalOf(b);
      if (sort === "duration") return a.durationMin - b.durationMin;
      const score = (f: Flight) => totalOf(f) + f.stops * 4000 + f.durationMin * 8;
      return score(a) - score(b);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, filters, sort, paxCount]);

  const dLabel = dateLabel(date);
  const dShort = `${Number(date.split("-")[2])} ${MONTHS_GEN[Number(date.split("-")[1]) - 1]}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      {/* Хедер с поиском */}
      <header
        className="sticky top-0 z-30 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[var(--color-primary)]">A</div>
              <span className="hidden text-lg font-bold lg:block">Aviator</span>
            </a>

            {/* Поисковая панель (пилюли). Клик — редактирование на главной. */}
            <a href="/" className="flex flex-1 flex-wrap items-center gap-2" title="Изменить поиск">
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm text-[#1A2B3A]">
                <IconPlane size={15} className="text-[var(--color-primary)]" />
                {fromCity} <span className="text-[11px] text-slate-400">{fromIata}</span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary)]">
                <IconSwap size={13} />
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm text-[#1A2B3A]">
                <IconPin size={15} className="text-[var(--color-primary)]" />
                {toCity} <span className="text-[11px] text-slate-400">{toIata}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm text-[#1A2B3A]">
                <IconCalendar size={15} className="text-[var(--color-primary)]" />
                {dShort}
              </span>
              <span className="hidden items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm text-[#1A2B3A] sm:flex">
                <IconUser size={15} className="text-[var(--color-primary)]" />
                {paxCount} пас., {CABIN[cabin] || "эконом"}
              </span>
            </a>

            <a
              href="/"
              className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              Изменить
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <PriceCalendar selected={date} onSelect={setDate} selectedPrice={priceBounds[0]} />

        {/* Чипсы */}
        <div className="my-4 flex flex-wrap items-center gap-2">
          <Chip onClick={() => setSort(SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length])}>
            {SORT_LABEL[sort]} <span className="text-xs">▾</span>
          </Chip>
          <Chip active={filters.stopsMax === 0} onClick={() => setF({ stopsMax: filters.stopsMax === 0 ? null : 0 })}>
            Без пересадок
          </Chip>
          <Chip active={filters.baggageOnly} onClick={() => setF({ baggageOnly: !filters.baggageOnly })}>
            С багажом
          </Chip>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-text)] lg:hidden"
          >
            Фильтры
          </button>
        </div>

        <div className="flex gap-5">
          {/* Сайдбар (десктоп) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1">
              <FiltersPanel state={filters} set={setF} priceBounds={priceBounds} airlineList={AIRLINES} />
            </div>
          </aside>

          {/* Результаты */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 text-sm text-[var(--color-text-muted)]">
              Найдено <span className="font-semibold text-[var(--color-text)]">{results.length}</span> {plural(results.length)}
            </div>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((f) => (
                  <FlightCard key={f.id} flight={f} fromCity={fromCity} fromIata={fromIata} toCity={toCity} toIata={toIata} dateLabel={dLabel} paxCount={paxCount} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center">
                <div className="text-lg font-semibold text-[var(--color-text)]">Ничего не нашлось</div>
                <div className="mt-1 text-sm text-[var(--color-text-muted)]">Попробуйте смягчить фильтры</div>
                <button onClick={reset} className="mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобильная шторка фильтров */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="animate-slide-in-right absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <span className="text-lg font-bold text-[var(--color-text)]">Фильтры</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Закрыть" className="text-2xl leading-none text-[var(--color-text-muted)]">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FiltersPanel state={filters} set={setF} priceBounds={priceBounds} airlineList={AIRLINES} />
            </div>
            <div className="border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Показать {results.length} {plural(results.length)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? "border-green-600 bg-green-600 text-white"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function plural(n: number): string {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return "рейс";
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return "рейса";
  return "рейсов";
}
