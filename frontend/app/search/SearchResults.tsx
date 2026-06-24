"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flight, getFlights } from "../data/flights";
import { searchFlights, buildAviasalesUrl } from "../lib/api";
import FlightCard from "../components/search/FlightCard";
import FlightCardSkeleton from "../components/search/FlightCardSkeleton";
import FlightLoader from "../components/search/FlightLoader";
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
  const { t, format } = useSettings();
  const sp = useSearchParams();
  const fromCity = sp.get("fromCity") || "Москва";
  const fromIata = sp.get("fromIata") || "MOW";
  const toCity = sp.get("toCity") || "Стамбул";
  const toIata = sp.get("toIata") || "IST";
  const adults = Number(sp.get("adults") || 1);
  const children = Number(sp.get("children") || 0);
  const paxCount = Math.max(1, adults + children);
  const urlReturnDate = sp.get("returnDate") || "";

  const isRoundTrip = Boolean(urlReturnDate);

  /* Туда-обратно: фаза и выбранные рейсы */
  const [phase, setPhase] = useState<"outbound" | "return">("outbound");
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const returnBarRef = useRef<HTMLDivElement>(null);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const totalOf = (f: Flight) => f.pricePerPax * paxCount;

  const priceBounds = useMemo<[number, number]>(() => {
    if (flights.length === 0) return [0, 100000];
    const totals = flights.map(totalOf);
    return [Math.min(...totals), Math.max(...totals)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, paxCount]);

  const minDuration = useMemo(() => flights.length ? Math.min(...flights.map((f) => f.durationMin)) : 0, [flights]);
  const maxDuration = useMemo(() => flights.length ? Math.max(...flights.map((f) => f.durationMin)) : 1440, [flights]);

  const departAirportList = HUB_AIRPORTS[fromIata] ?? [{ iata: fromIata, name: fromCity }];
  const arriveAirportList = HUB_AIRPORTS[toIata] ?? [{ iata: toIata, name: toCity }];

  function futureDateISO(days: number) {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
  const [date, setDate] = useState(sp.get("date") || futureDateISO(14));
  const [returnDate, setReturnDate] = useState(urlReturnDate || futureDateISO(21));
  const [sort, setSort] = useState<Sort>("best");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [priceAlertEmail, setPriceAlertEmail] = useState("");
  const [priceTarget, setPriceTarget] = useState("5000");
  const [priceAlertSaved, setPriceAlertSaved] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stopsMax: null,
    priceMin: 0,
    priceMax: 100000,
    durationMax: 1440,
    baggageMode: "all",
    timePeriods: new Set(),
    fastestOnly: false,
    airlines: new Set(),
    departAirports: new Set(departAirportList.map((a) => a.iata)),
    arriveAirports: new Set(arriveAirportList.map((a) => a.iata)),
  });
  const setF = (patch: Partial<FilterState>) => setFilters((s) => ({ ...s, ...patch }));

  const airlineList = useMemo(
    () => Array.from(new Map(flights.map((f) => [f.airlineCode, f.airlineName])).entries())
      .map(([code, name]) => ({ code, name })),
    [flights],
  );

  function reset() { resetFilters(flights); }

  function resetFilters(newFlights: Flight[]) {
    const totals = newFlights.map((f) => f.pricePerPax * paxCount);
    const newMin = newFlights.length ? Math.min(...totals) : 0;
    const newMax = newFlights.length ? Math.max(...totals) : 100000;
    const newDurMax = newFlights.length ? Math.max(...newFlights.map((f) => f.durationMin)) : 1440;
    setSort("best");
    setFilters({
      stopsMax: null,
      priceMin: newMin,
      priceMax: newMax,
      durationMax: newDurMax,
      baggageMode: "all",
      timePeriods: new Set(),
      fastestOnly: false,
      airlines: new Set(newFlights.map((f) => f.airlineCode)),
      departAirports: new Set(departAirportList.map((a) => a.iata)),
      arriveAirports: new Set(arriveAirportList.map((a) => a.iata)),
    });
  }

  useEffect(() => {
    let cancelled = false;
    const fallbackFlights = () => getFlights(
      departAirportList.map((a) => a.iata),
      arriveAirportList.map((a) => a.iata),
    );
    setIsLoading(true);
    setApiError(null);
    setDataNotice(null);
    searchFlights({
      origin: fromIata,
      destination: toIata,
      departDate: date,
      returnDate: isRoundTrip ? returnDate : undefined,
      adults,
    }).then((result) => {
      if (cancelled) return;
      const nextFlights = result.length ? result : fallbackFlights();
      setFlights(nextFlights);
      resetFilters(nextFlights);
      if (result.length === 0) {
        setDataNotice("В кэше Travelpayouts пока нет цен по этому маршруту, показываем демо-рейсы для проверки интерфейса.");
      }
      setIsLoading(false);
    }).catch((err) => {
      if (cancelled) return;
      const nextFlights = fallbackFlights();
      setFlights(nextFlights);
      resetFilters(nextFlights);
      setApiError(String(err));
      setDataNotice("API сейчас недоступен, поэтому показываем демо-рейсы. Кнопка Aviasales всё равно откроет полный поиск.");
      setIsLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromIata, toIata, date, returnDate, adults]);

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

  /* Обработчики выбора рейсов в режиме туда-обратно */
  const handleSelectOutbound = (f: Flight) => {
    setOutboundFlight(f);
    setPhase("return");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectReturn = (f: Flight) => {
    setReturnFlight(f);
    setTimeout(() => returnBarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const handleBookBoth = () => {
    if (!outboundFlight || !returnFlight) return;
    const url = outboundFlight.bookingUrl || buildAviasalesUrl({
      origin: fromIata,
      destination: toIata,
      departDate: date,
      returnDate,
      adults,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /* Текущая дата/маршрут в зависимости от фазы */
  const activeDate = phase === "return" ? returnDate : date;
  const activeFromIata = phase === "return" ? toIata : fromIata;
  const activeToIata = phase === "return" ? fromIata : toIata;

  const dLabel = dateLabel(date);
  const dShort = `${Number(date.split("-")[2])} ${MONTHS_GEN[Number(date.split("-")[1]) - 1]}`;
  const rShort = urlReturnDate ? `${Number(returnDate.split("-")[2])} ${MONTHS_GEN[Number(returnDate.split("-")[1]) - 1]}` : "";
  const combinedTotal = outboundFlight && returnFlight
    ? (outboundFlight.pricePerPax + returnFlight.pricePerPax) * paxCount
    : 0;

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
                {dShort}{rShort ? ` — ${rShort}` : ""}
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
        {/* Баннер туда-обратно */}
        {isRoundTrip && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {/* Шаги */}
            <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
              {/* Туда */}
              <button
                type="button"
                onClick={() => { setPhase("outbound"); setReturnFlight(null); }}
                className={`flex flex-col items-start p-4 text-left transition ${
                  phase === "outbound"
                    ? "bg-[var(--color-primary-light)]"
                    : outboundFlight
                    ? "bg-green-50 dark:bg-green-950/20"
                    : ""
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      outboundFlight ? "bg-green-600" : phase === "outbound" ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}>
                      {outboundFlight ? "✓" : "1"}
                    </span>
                    <span className={`text-sm font-semibold ${phase === "outbound" ? "text-[var(--color-primary)]" : outboundFlight ? "text-green-700 dark:text-green-400" : "text-[var(--color-text-muted)]"}`}>
                      Туда
                    </span>
                  </div>
                  {outboundFlight && (
                    <span className="text-[11px] text-green-600 dark:text-green-400">Изменить</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {fromCity} → {toCity} · {dShort}
                </div>
                {outboundFlight && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${outboundFlight.airlineCode}.png`}
                      width={16} height={16}
                      className="h-4 w-4 rounded object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                      alt=""
                    />
                    <span className="text-xs font-medium text-[var(--color-text)]">
                      {outboundFlight.departTime}–{outboundFlight.arriveTime} · {format(totalOf(outboundFlight))}
                    </span>
                  </div>
                )}
              </button>

              {/* Обратно */}
              <div className={`flex flex-col items-start p-4 ${
                phase === "return"
                  ? "bg-[var(--color-primary-light)]"
                  : returnFlight
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "opacity-60"
              }`}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                      returnFlight ? "bg-green-600" : phase === "return" ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}>
                      {returnFlight ? "✓" : "2"}
                    </span>
                    <span className={`text-sm font-semibold ${phase === "return" ? "text-[var(--color-primary)]" : returnFlight ? "text-green-700 dark:text-green-400" : "text-[var(--color-text-muted)]"}`}>
                      Обратно
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {toCity} → {fromCity} · {rShort}
                </div>
                {returnFlight && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <img
                      src={`https://images.kiwi.com/airlines/64/${returnFlight.airlineCode}.png`}
                      width={16} height={16}
                      className="h-4 w-4 rounded object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                      alt=""
                    />
                    <span className="text-xs font-medium text-[var(--color-text)]">
                      {returnFlight.departTime}–{returnFlight.arriveTime} · {format(totalOf(returnFlight))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Подсказка текущей фазы */}
            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2">
              <div className="flex items-center gap-2 text-sm">
                {phase === "outbound" ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    <span className="font-medium text-[var(--color-primary)]">Выберите рейс туда</span>
                    <span className="text-[var(--color-text-muted)]">— {fromCity} → {toCity}, {dShort}</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">Выберите рейс обратно</span>
                    <span className="text-[var(--color-text-muted)]">— {toCity} → {fromCity}, {rShort}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <PriceCalendar
          selected={activeDate}
          onSelect={phase === "return" ? setReturnDate : setDate}
          selectedPrice={priceBounds[0]}
          origin={activeFromIata}
          destination={activeToIata}
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
                airlineList={airlineList}
                departAirportList={departAirportList}
                arriveAirportList={arriveAirportList}
              />
            </div>
          </aside>

          {/* Результаты */}
          <div className="min-w-0 flex-1">
            {/* Заголовок с маршрутом (туда-обратно) */}
            {isRoundTrip && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <IconPlane size={15} className={phase === "return" ? "rotate-180 text-green-600" : "text-[var(--color-primary)]"} />
                <span className="text-sm font-semibold text-[var(--color-text)]">
                  {phase === "outbound" ? `${fromCity} → ${toCity}` : `${toCity} → ${fromCity}`}
                </span>
                <span className="text-[var(--color-text-muted)]">·</span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {phase === "outbound" ? dateLabel(date) : dateLabel(returnDate)}
                </span>
              </div>
            )}

            {/* CTA — полный поиск на Aviasales */}
            <a
              href={buildAviasalesUrl({
                origin: phase === "return" ? toIata : fromIata,
                destination: phase === "return" ? fromIata : toIata,
                departDate: phase === "return" ? returnDate : date,
                returnDate: (!isRoundTrip || phase === "return") ? undefined : returnDate,
                adults,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-[#FF6D00] px-5 py-3.5 text-white shadow-md transition hover:bg-[#e65c00] hover:shadow-lg"
            >
              <div>
                <div className="text-[13px] font-semibold opacity-90">Показываем лучшие цены из кэша</div>
                <div className="text-[15px] font-bold">Смотреть все рейсы на Aviasales →</div>
              </div>
              <img src="https://pics.avs.io/180/30/aviasales_logo_white.svg" alt="Aviasales" className="h-5 shrink-0 opacity-90" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </a>

            {!isLoading && (
              <div className="mb-3 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <span>
                  {t("search.found")}{" "}
                  <span className="font-semibold text-[var(--color-text)]">{results.length}</span>
                  {results.length !== flights.length && (
                    <span className="text-[var(--color-text-muted)]"> из {flights.length}</span>
                  )}
                  {" "}{plural(results.length)}
                </span>
                {results.length !== flights.length && (
                  <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-[11px] font-medium text-white">
                    фильтры активны
                  </span>
                )}
                <span className="ml-auto opacity-60 text-xs">кэш Aviasales</span>
              </div>
            )}
            {apiError && !isLoading && (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                Не удалось получить рейсы: {apiError}
              </div>
            )}
            {dataNotice && !isLoading && (
              <div className="mb-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]">
                {dataNotice}
              </div>
            )}
            {isLoading ? (
              <div className="space-y-3">
                <FlightLoader
                  fromCity={phase === "return" ? toCity : fromCity}
                  fromIata={phase === "return" ? toIata : fromIata}
                  toCity={phase === "return" ? fromCity : toCity}
                  toIata={phase === "return" ? fromIata : toIata}
                />
                {Array.from({ length: 3 }).map((_, i) => (
                  <FlightCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {results.map((f) => {
                  const isOut = f.id === outboundFlight?.id;
                  const isRet = f.id === returnFlight?.id;
                  return (
                    <FlightCard
                      key={f.id}
                      flight={f}
                      fromCity={phase === "return" ? toCity : fromCity}
                      fromIata={phase === "return" ? toIata : fromIata}
                      toCity={phase === "return" ? fromCity : toCity}
                      toIata={phase === "return" ? fromIata : toIata}
                      dateLabel={phase === "return" ? dateLabel(returnDate) : dLabel}
                      dateISO={phase === "return" ? returnDate : date}
                      paxCount={paxCount}
                      onSelect={isRoundTrip ? (
                        phase === "outbound"
                          ? () => handleSelectOutbound(f)
                          : () => handleSelectReturn(f)
                      ) : undefined}
                      isSelected={isRoundTrip && (phase === "outbound" ? isOut : isRet)}
                    />
                  );
                })}
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
                airlineList={airlineList}
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

      {/* Нижняя полоса: итого за оба рейса */}
      {isRoundTrip && outboundFlight && returnFlight && (
        <div
          ref={returnBarRef}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        >
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-xs text-[var(--color-text-muted)]">Итого за оба рейса, {paxCount} пасс.</div>
                <div className="text-2xl font-bold text-[var(--color-text)]">{format(combinedTotal)}</div>
                <div className="flex gap-3 text-[11px] text-[var(--color-text-muted)]">
                  <span>
                    ↗ {outboundFlight.airlineName} {outboundFlight.departTime}–{outboundFlight.arriveTime} · {format(totalOf(outboundFlight))}
                  </span>
                  <span>·</span>
                  <span>
                    ↙ {returnFlight.airlineName} {returnFlight.departTime}–{returnFlight.arriveTime} · {format(totalOf(returnFlight))}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setReturnFlight(null); }}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-border)]"
                >
                  Изменить обратный
                </button>
                <button
                  type="button"
                  onClick={handleBookBoth}
                  className="flex-1 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 sm:flex-initial"
                >
                  Оформить оба рейса →
                </button>
              </div>
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
