"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getFlights, AIRLINES, Flight } from "../data/flights";
import FlightCard from "../components/search/FlightCard";
import PriceCalendar from "../components/search/PriceCalendar";
import FiltersPanel, { FilterState, TimePeriod } from "../components/search/FiltersPanel";
import { IconPlane, IconPin, IconCalendar, IconUser, IconSwap } from "../components/icons";
import SettingsSwitcher from "../components/SettingsSwitcher";
import { useSettings } from "../context/settings";

const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

type Sort = "best" | "price" | "duration" | "baggage";
const SORT_KEY: Record<Sort, string> = {
  best: "search.sort_best",
  price: "search.sort_price",
  duration: "search.sort_duration",
  baggage: "search.sort_baggage",
};
const SORT_CYCLE: Sort[] = ["best", "price", "duration", "baggage"];

const HUB_AIRPORTS: Record<string, { iata: string; name: string }[]> = {
  MOW: [
    { iata: "SVO", name: "Шереметьево" },
    { iata: "DME", name: "Домодедово" },
    { iata: "VKO", name: "Внуково" },
  ],
  IST: [
    { iata: "IST", name: "Стамбул Аэропорт" },
    { iata: "SAW", name: "Сабиха Гёкчен" },
  ],
};

function dateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${d} ${MONTHS_GEN[m - 1]}, ${WD[dt.getDay()]}`;
}

function getTimePeriod(time: string): TimePeriod {
  const hour = Number(time.split(":")[0]);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18) return "evening";
  return "night";
}

export default function SearchResults() {
  const { t } = useSettings();
  const sp = useSearchParams();
  const fromCity = sp.get("fromCity") || "Москва";
  const fromIata = sp.get("fromIata") || "MOW";
  const toCity = sp.get("toCity") || "Стамбул";
  const toIata = sp.get("toIata") || "IST";
  const adults = Number(sp.get("adults") || 1);
  const children = Number(sp.get("children") || 0);
  const paxCount = Math.max(1, adults + children);

  const flights = useMemo(() => getFlights(), []);
  const totalOf = (f: Flight) => f.pricePerPax * paxCount;

  const priceBounds = useMemo<[number, number]>(() => {
    const totals = flights.map(totalOf);
    return [Math.min(...totals), Math.max(...totals)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, paxCount]);

  const minDuration = useMemo(() => Math.min(...flights.map((f) => f.durationMin)), [flights]);
  const maxDuration = useMemo(() => Math.max(...flights.map((f) => f.durationMin)), [flights]);

  // Списки аэропортов (в реальном сценарии — несколько для хабов)
  const departAirportList = HUB_AIRPORTS[fromIata] ?? [{ iata: fromIata, name: fromCity }];
  const arriveAirportList = HUB_AIRPORTS[toIata] ?? [{ iata: toIata, name: toCity }];

  const [date, setDate] = useState(sp.get("date") || "2026-06-28");
  const [sort, setSort] = useState<Sort>("best");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceAlertEmail, setPriceAlertEmail] = useState("");
  const [priceTarget, setPriceTarget] = useState("5000");
  const [priceAlertSaved, setPriceAlertSaved] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stopsMax: null,
    priceMin: priceBounds[0],
    priceMax: priceBounds[1],
    durationMax: maxDuration,
    baggageMode: "all",
    timePeriods: new Set(),
    fastestOnly: false,
    airlines: new Set(AIRLINES.map((a) => a.code)),
    departAirports: new Set(departAirportList.map((a) => a.iata)),
    arriveAirports: new Set(arriveAirportList.map((a) => a.iata)),
  });
  const setF = (patch: Partial<FilterState>) => setFilters((s) => ({ ...s, ...patch }));

  function reset() {
    setSort("best");
    setFilters({
      stopsMax: null,
      priceMin: priceBounds[0],
      priceMax: priceBounds[1],
      durationMax: maxDuration,
      baggageMode: "all",
      timePeriods: new Set(),
      fastestOnly: false,
      airlines: new Set(AIRLINES.map((a) => a.code)),
      departAirports: new Set(departAirportList.map((a) => a.iata)),
      arriveAirports: new Set(arriveAirportList.map((a) => a.iata)),
    });
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
      if (totalOf(f) < filters.priceMin) return false;
      if (totalOf(f) > filters.priceMax) return false;
      if (f.durationMin > filters.durationMax) return false;
      if (filters.baggageMode === "with" && !f.hasBaggage) return false;
      if (filters.baggageMode === "without" && f.hasBaggage) return false;
      if (!filters.airlines.has(f.airlineCode)) return false;
      if (filters.timePeriods.size > 0 && !filters.timePeriods.has(getTimePeriod(f.departTime))) return false;
      if (filters.fastestOnly && f.durationMin !== minDuration) return false;
      if (departAirportList.length > 1 && f.departAirportIata && !filters.departAirports.has(f.departAirportIata)) return false;
      if (arriveAirportList.length > 1 && f.arriveAirportIata && !filters.arriveAirports.has(f.arriveAirportIata)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price") return totalOf(a) - totalOf(b);
      if (sort === "duration") return a.durationMin - b.durationMin;
      if (sort === "baggage") return Number(b.hasBaggage) - Number(a.hasBaggage) || totalOf(a) - totalOf(b);
      const score = (f: Flight) => totalOf(f) + f.stops * 4000 + f.durationMin * 8;
      return score(a) - score(b);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, filters, sort, paxCount, minDuration]);

  const dLabel = dateLabel(date);
  const dShort = `${Number(date.split("-")[2])} ${MONTHS_GEN[Number(date.split("-")[1]) - 1]}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      {/* Хедер */}
      <header
        className="sticky top-0 z-30 text-white"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-[var(--color-primary)]">A</div>
              <span className="hidden text-lg font-bold lg:block">Aviator</span>
            </Link>

            <Link href="/" className="flex flex-1 flex-wrap items-center gap-2" title="Изменить поиск">
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
                {paxCount} {t("common.passengers")}, {t("common.economy")}
              </span>
            </Link>

            <div className="hidden md:block">
              <SettingsSwitcher variant="dark" />
            </div>

            <Link
              href="/"
              className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              {t("common.change")}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <PriceCalendar
          selected={date}
          onSelect={setDate}
          selectedPrice={priceBounds[0]}
          origin={fromIata}
          destination={toIata}
        />

        <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[var(--color-text)]">Подписка на цену</div>
              <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Сообщим, когда {fromCity} → {toCity} станет дешевле указанной суммы.
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr_auto]">
              <input
                value={priceTarget}
                onChange={(e) => {
                  setPriceAlertSaved(false);
                  setPriceTarget(e.target.value);
                }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                inputMode="numeric"
              />
              <input
                value={priceAlertEmail}
                onChange={(e) => {
                  setPriceAlertSaved(false);
                  setPriceAlertEmail(e.target.value);
                }}
                placeholder="email@example.com"
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={() => setPriceAlertSaved(Boolean(priceAlertEmail && priceTarget))}
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Следить
              </button>
            </div>
          </div>
          {priceAlertSaved && (
            <div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              Готово: уведомим на {priceAlertEmail}, когда цена будет ниже {Number(priceTarget).toLocaleString("ru-RU")} ₽.
            </div>
          )}
        </div>

        {/* Чипсы быстрых фильтров */}
        <div className="my-4 flex flex-wrap items-center gap-2">
          <Chip onClick={() => setSort(SORT_CYCLE[(SORT_CYCLE.indexOf(sort) + 1) % SORT_CYCLE.length])}>
            {t(SORT_KEY[sort])} <span className="text-xs">▾</span>
          </Chip>
          <Chip active={filters.stopsMax === 0} onClick={() => setF({ stopsMax: filters.stopsMax === 0 ? null : 0 })}>
            {t("search.nonstop")}
          </Chip>
          <Chip active={filters.baggageMode === "with"} onClick={() => setF({ baggageMode: filters.baggageMode === "with" ? "all" : "with" })}>
            {t("search.baggage")}
          </Chip>
          <Chip active={filters.timePeriods.has("night")} onClick={() => {
            const next = new Set(filters.timePeriods);
            if (next.has("night")) next.delete("night"); else next.add("night");
            setF({ timePeriods: next });
          }}>
            {t("search.night")}
          </Chip>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]"
          >
            {t("search.reset")}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-text)] lg:hidden"
          >
            {t("search.filters")}
          </button>
        </div>

        <div className="flex gap-5">
          {/* Сайдбар (десктоп) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1">
              <FiltersPanel
                state={filters}
                set={setF}
                priceBounds={priceBounds}
                durationBounds={[minDuration, maxDuration]}
                airlineList={AIRLINES}
                departAirportList={departAirportList}
                arriveAirportList={arriveAirportList}
              />
            </div>
          </aside>

          {/* Результаты */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 text-sm text-[var(--color-text-muted)]">
              {t("search.found")} <span className="font-semibold text-[var(--color-text)]">{results.length}</span> {plural(results.length)}
            </div>
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((f) => (
                  <FlightCard
                    key={f.id}
                    flight={f}
                    fromCity={fromCity}
                    fromIata={fromIata}
                    toCity={toCity}
                    toIata={toIata}
                    dateLabel={dLabel}
                    dateISO={date}
                    paxCount={paxCount}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center">
                <div className="text-lg font-semibold text-[var(--color-text)]">{t("search.empty_title")}</div>
                <div className="mt-1 text-sm text-[var(--color-text-muted)]">{t("search.empty_sub")}</div>
                <button
                  onClick={reset}
                  className="mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
                >
                  {t("search.empty_reset")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Мобильная шторка */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="animate-slide-in-right absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <span className="text-lg font-bold text-[var(--color-text)]">{t("search.filters")}</span>
              <button onClick={() => setDrawerOpen(false)} aria-label="Закрыть" className="text-2xl leading-none text-[var(--color-text-muted)]">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FiltersPanel
                state={filters}
                set={setF}
                priceBounds={priceBounds}
                durationBounds={[minDuration, maxDuration]}
                airlineList={AIRLINES}
                departAirportList={departAirportList}
                arriveAirportList={arriveAirportList}
              />
            </div>
            <div className="border-t border-[var(--color-border)] p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                {t("search.show")} {results.length} {plural(results.length)}
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
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return "рейс";
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return "рейса";
  return "рейсов";
}
