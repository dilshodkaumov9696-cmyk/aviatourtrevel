"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  mode: "single" | "range";
  departDate: string;
  returnDate: string;
  onDepartChange: (d: string) => void;
  onReturnChange: (d: string) => void;
  initialField?: "depart" | "return";
  onClose: () => void;
  originIata?: string;
  destinationIata?: string;
  /** Растянуть панель по ширине поля. Только для сложного маршрута — обычный поиск не меняет. */
  matchField?: boolean;
}

const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];
const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  while (m > 11) { m -= 12; y++; }
  while (m < 0) { m += 12; y--; }
  return { year: y, month: m };
}
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function firstWeekday(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function fmtShort(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

// Price heatmap: дешевле — зеленее, дороже — краснее. Полупрозрачный оверлей,
// поэтому не требует отдельной палитры под тёмную тему.
function priceHeatColor(price: number, min: number, max: number): string {
  const t = max > min ? (price - min) / (max - min) : 0;
  const hue = 120 - 120 * Math.max(0, Math.min(1, t));
  return `hsla(${hue}, 75%, 45%, ${0.28 - 0.1 * t})`;
}

type DayState = "past" | "normal" | "single" | "start" | "end" | "between";

interface MonthProps {
  year: number;
  month: number;
  today: string;
  departDate: string;
  effectiveEnd: string;
  isRange: boolean;
  onDayClick: (d: string) => void;
  onDayHover: (d: string) => void;
  className?: string;
  prices?: Record<string, number>;
  priceRange?: { min: number; max: number };
  roomy?: boolean;
}

function MonthGrid({
  year, month, today, departDate, effectiveEnd, isRange,
  onDayClick, onDayHover, className = "", prices, priceRange, roomy = false,
}: MonthProps) {
  const offset = firstWeekday(year, month);
  const count = daysInMonth(year, month);
  const hasRange = isRange && !!departDate && !!effectiveEnd && departDate < effectiveEnd;

  function classify(d: string): DayState {
    if (d < today) return "past";
    if (hasRange) {
      if (d === departDate) return "start";
      if (d === effectiveEnd) return "end";
      if (d > departDate && d < effectiveEnd) return "between";
      return "normal";
    }
    return d === departDate ? "single" : "normal";
  }

  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: count }, (_, i) => dateStr(year, month, i + 1)),
  ];

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div className="mb-3 text-center text-[15px] font-semibold text-[var(--color-text)]">
        {MONTHS_RU[month]} {year}
      </div>
      <div className="grid grid-cols-7">
        {DAYS_RU.map((d) => (
          <div key={d} className="flex h-9 items-center justify-center text-[12px] font-medium text-[var(--color-text-muted)]">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className={roomy ? "h-14" : "h-12"} />;
          const state = classify(d);
          const day = parseInt(d.split("-")[2]);
          const isToday = d === today;

          const btn =
            state === "past"
              ? "text-[var(--color-text-muted)] opacity-40 cursor-default"
              : state === "start" || state === "end" || state === "single"
              ? "bg-[var(--color-primary)] text-white font-semibold cursor-pointer"
              : state === "between"
              ? "text-[var(--color-primary)] font-medium cursor-pointer hover:bg-[var(--color-primary)] hover:text-white"
              : `text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-soft)] ${isToday ? "font-bold text-[var(--color-primary)]" : ""}`;

          const price = prices?.[d];
          const heat = price && priceRange && state === "normal" ? priceHeatColor(price, priceRange.min, priceRange.max) : undefined;

          return (
            <div key={d} className={`relative flex items-center justify-center ${roomy ? "h-14" : "h-12"}`}>
              {state === "between" && <span className="absolute inset-y-1 inset-x-0 bg-[var(--color-primary-light)]" />}
              {state === "start" && <span className="absolute inset-y-1 left-1/2 right-0 bg-[var(--color-primary-light)]" />}
              {state === "end" && <span className="absolute inset-y-1 left-0 right-1/2 bg-[var(--color-primary-light)]" />}
              {heat && <span className={`absolute rounded-full ${roomy ? "h-11 w-11" : "h-10 w-10"}`} style={{ backgroundColor: heat }} />}

              <button
                type="button"
                disabled={state === "past"}
                onClick={() => state !== "past" && onDayClick(d)}
                onMouseEnter={() => state !== "past" && onDayHover(d)}
                title={price ? `~${price.toLocaleString("ru-RU")} ₽` : undefined}
                className={`relative z-10 flex items-center justify-center rounded-full text-[15px] transition-colors ${roomy ? "h-12 w-12" : "h-11 w-11"} ${btn}`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({
  mode, departDate, returnDate,
  onDepartChange, onReturnChange,
  initialField = "depart",
  onClose,
  originIata,
  destinationIata,
  matchField = false,
}: Props) {
  const isRange = mode === "range";
  const now = new Date();
  const [leftYear, setLeftYear] = useState(now.getFullYear());
  const [leftMonth, setLeftMonth] = useState(now.getMonth());
  const [selectingReturn, setSelectingReturn] = useState(isRange && initialField === "return" && !!departDate);
  const [hovered, setHovered] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const fetchedMonths = useRef(new Set<string>());

  const today = todayStr();
  const right = addMonths(leftYear, leftMonth, 1);
  const atCurrentMonth = leftYear === now.getFullYear() && leftMonth === now.getMonth();

  // Price heatmap: подтягиваем цены Aviasales по датам для видимых месяцев.
  // Кэшируем по месяцу, чтобы не дёргать API повторно при листании туда-обратно.
  useEffect(() => {
    if (!originIata || !destinationIata) return;
    const months = isRange ? [[leftYear, leftMonth], [right.year, right.month]] : [[leftYear, leftMonth]];

    for (const [y, m] of months) {
      const monthStr = `${y}-${String(m + 1).padStart(2, "0")}`;
      const key = `${originIata}-${destinationIata}-${monthStr}`;
      if (fetchedMonths.current.has(key)) continue;
      fetchedMonths.current.add(key);

      fetch(`/api/calendar-prices?origin=${originIata}&destination=${destinationIata}&month=${monthStr}`)
        .then((r) => r.json())
        .then((data: { prices?: Record<string, number> }) => {
          if (data.prices && Object.keys(data.prices).length > 0) {
            setPrices((cur) => ({ ...cur, ...data.prices }));
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originIata, destinationIata, leftYear, leftMonth, isRange]);

  const priceRange = useMemo(() => {
    const values = Object.values(prices);
    if (values.length === 0) return undefined;
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [prices]);

  const effectiveEnd =
    isRange && selectingReturn && hovered && hovered > departDate ? hovered : returnDate;

  function prev() {
    if (atCurrentMonth) return;
    const p = addMonths(leftYear, leftMonth, -1);
    setLeftYear(p.year);
    setLeftMonth(p.month);
  }
  function next() {
    const n = addMonths(leftYear, leftMonth, 1);
    setLeftYear(n.year);
    setLeftMonth(n.month);
  }

  function handleDayClick(d: string) {
    if (!isRange) {
      onDepartChange(d);
      onClose();
      return;
    }
    if (!selectingReturn) {
      onDepartChange(d);
      onReturnChange("");
      setSelectingReturn(true);
      setHovered("");
    } else if (d <= departDate) {
      onDepartChange(d);
      onReturnChange("");
      setHovered("");
    } else {
      onReturnChange(d);
      onClose();
    }
  }

  function chooseOneWay() {
    onReturnChange("");
    onClose();
  }
  function reset() {
    onDepartChange("");
    onReturnChange("");
    setSelectingReturn(false);
    setHovered("");
  }

  const common = {
    today,
    departDate,
    effectiveEnd,
    isRange,
    onDayClick: handleDayClick,
    onDayHover: setHovered,
    prices,
    priceRange,
  };

  return (
    <div className={
      matchField
        ? "animate-fade-in-down w-full min-w-0 select-none overflow-visible rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xl"
        : "animate-fade-in-down w-full max-w-full min-w-0 select-none overflow-x-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-2xl sm:p-4 md:w-auto md:max-w-none md:overflow-visible md:p-5"
    }>
      {/* Шапка */}
      {isRange ? (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectingReturn(false)}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition text-left ${
              !selectingReturn
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-wide opacity-70">Туда</span>
            {departDate ? fmtShort(departDate) : "выберите"}
          </button>
          <button
            type="button"
            onClick={() => { if (departDate) setSelectingReturn(true); }}
            disabled={!departDate}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition text-left disabled:opacity-40 disabled:cursor-not-allowed ${
              selectingReturn
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-wide opacity-70">Обратно</span>
            {returnDate ? fmtShort(returnDate) : "выберите"}
          </button>
        </div>
      ) : (
        <div className="text-sm font-semibold text-[var(--color-text)] mb-4 px-1">Когда летим?</div>
      )}

      {/* Навигация */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={prev}
          disabled={atCurrentMonth}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-25"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)]"
        >
          ›
        </button>
      </div>

      {/* Месяцы */}
      <div className="flex w-full min-w-0 justify-center gap-4 md:gap-8" onMouseLeave={() => setHovered("")}>
        <MonthGrid year={leftYear} month={leftMonth} {...common} roomy={matchField} className={matchField ? "w-full min-w-0" : "min-w-0 flex-1 md:w-[20.5rem] md:flex-none"} />
        {isRange && (
          <MonthGrid year={right.year} month={right.month} {...common} className={matchField ? "hidden" : "hidden md:block md:w-[20.5rem]"} />
        )}
      </div>

      {/* Подвал */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        <span className="text-xs text-[var(--color-text-muted)]">
          {isRange
            ? selectingReturn ? "Выберите дату возврата" : "Выберите дату вылета"
            : "Выберите дату вылета"}
        </span>
        {isRange && departDate && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={chooseOneWay}
              className="min-h-10 rounded-lg border border-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
            >
              В одну сторону
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
