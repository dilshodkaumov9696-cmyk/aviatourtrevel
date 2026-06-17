"use client";

import { useState } from "react";

interface Props {
  tripType: "one-way" | "round-trip";
  departDate: string;
  returnDate: string;
  onDepartChange: (d: string) => void;
  onReturnChange: (d: string) => void;
  initialField?: "depart" | "return";
  onClose: () => void;
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
  return d === 0 ? 6 : d - 1; // Пн=0 … Вс=6
}
function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function fmtShort(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

type DayState = "past" | "normal" | "single" | "start" | "end" | "between";

interface MonthProps {
  year: number;
  month: number;
  today: string;
  departDate: string;
  effectiveEnd: string;
  tripType: "one-way" | "round-trip";
  onDayClick: (d: string) => void;
  onDayHover: (d: string) => void;
  className?: string;
}

function MonthGrid({
  year, month, today, departDate, effectiveEnd, tripType,
  onDayClick, onDayHover, className = "",
}: MonthProps) {
  const offset = firstWeekday(year, month);
  const count = daysInMonth(year, month);
  const hasRange = tripType === "round-trip" && !!departDate && !!effectiveEnd && departDate < effectiveEnd;

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
    <div className={`w-[280px] ${className}`}>
      <div className="text-center text-sm font-semibold text-[var(--color-text)] mb-3">
        {MONTHS_RU[month]} {year}
      </div>
      <div className="grid grid-cols-7">
        {DAYS_RU.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center text-[11px] font-medium text-[var(--color-text-muted)]">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="h-10" />;
          const state = classify(d);
          const day = parseInt(d.split("-")[2]);
          const isToday = d === today;

          const btn =
            state === "past"
              ? "text-gray-300 cursor-default"
              : state === "start" || state === "end" || state === "single"
              ? "bg-[var(--color-primary)] text-white font-semibold cursor-pointer"
              : state === "between"
              ? "text-[var(--color-primary)] font-medium cursor-pointer hover:bg-[var(--color-primary)] hover:text-white"
              : `text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-soft)] ${isToday ? "font-bold text-[var(--color-primary)]" : ""}`;

          return (
            <div key={d} className="relative h-10 flex items-center justify-center">
              {/* подложка диапазона */}
              {state === "between" && <span className="absolute inset-y-1 inset-x-0 bg-[var(--color-primary-light)]" />}
              {state === "start" && <span className="absolute inset-y-1 left-1/2 right-0 bg-[var(--color-primary-light)]" />}
              {state === "end" && <span className="absolute inset-y-1 left-0 right-1/2 bg-[var(--color-primary-light)]" />}

              <button
                type="button"
                disabled={state === "past"}
                onClick={() => state !== "past" && onDayClick(d)}
                onMouseEnter={() => state !== "past" && onDayHover(d)}
                className={`relative z-10 w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors ${btn}`}
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
  tripType, departDate, returnDate,
  onDepartChange, onReturnChange,
  initialField = "depart",
  onClose,
}: Props) {
  const now = new Date();
  const [leftYear, setLeftYear] = useState(now.getFullYear());
  const [leftMonth, setLeftMonth] = useState(now.getMonth());
  const [selectingReturn, setSelectingReturn] = useState(initialField === "return" && !!departDate);
  const [hovered, setHovered] = useState("");

  const today = todayStr();
  const right = addMonths(leftYear, leftMonth, 1);
  const atCurrentMonth = leftYear === now.getFullYear() && leftMonth === now.getMonth();

  const effectiveEnd =
    tripType === "round-trip" && selectingReturn && hovered && hovered > departDate
      ? hovered
      : returnDate;

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
    if (tripType === "one-way") {
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
    tripType,
    onDayClick: handleDayClick,
    onDayHover: setHovered,
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-2xl p-4 md:p-5 select-none w-[316px] md:w-auto">
      {/* Шапка: вкладки туда/обратно или заголовок */}
      {tripType === "round-trip" ? (
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
        <div className="text-sm font-semibold text-[var(--color-text)] mb-4 px-1">
          Когда летим?
        </div>
      )}

      {/* Навигация */}
      <div className="flex items-center justify-between mb-1">
        <button
          type="button"
          onClick={prev}
          disabled={atCurrentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] transition text-xl disabled:opacity-25 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-primary)] transition text-xl"
        >
          ›
        </button>
      </div>

      {/* Месяцы */}
      <div
        className="flex gap-6 justify-center"
        onMouseLeave={() => setHovered("")}
      >
        <MonthGrid year={leftYear} month={leftMonth} {...common} />
        {tripType === "round-trip" && (
          <MonthGrid year={right.year} month={right.month} {...common} className="hidden md:block" />
        )}
      </div>

      {/* Подвал */}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <span className="text-xs text-[var(--color-text-muted)]">
          {tripType === "round-trip"
            ? selectingReturn ? "Выберите дату возврата" : "Выберите дату вылета"
            : "Выберите дату вылета"}
        </span>
        {tripType === "round-trip" && departDate && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}
