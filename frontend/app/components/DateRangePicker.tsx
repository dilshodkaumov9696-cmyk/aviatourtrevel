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
const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
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
  return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface MonthProps {
  year: number;
  month: number;
  today: string;
  departDate: string;
  returnDate: string;
  hovered: string;
  selectingReturn: boolean;
  tripType: "one-way" | "round-trip";
  onDayClick: (d: string) => void;
  onDayHover: (d: string) => void;
  onDayLeave: () => void;
}

function MonthGrid({
  year, month, today,
  departDate, returnDate, hovered,
  selectingReturn, tripType,
  onDayClick, onDayHover, onDayLeave,
}: MonthProps) {
  const offset = firstWeekday(year, month);
  const count = daysInMonth(year, month);

  const rangeEnd = tripType === "round-trip" && selectingReturn && hovered
    ? hovered
    : returnDate;

  function classify(d: string): "past" | "depart" | "return" | "in-range" | "hover-end" | "normal" {
    if (d < today) return "past";
    if (d === departDate) return "depart";
    if (d === returnDate) return "return";
    if (tripType === "round-trip" && selectingReturn && d === hovered && hovered > departDate)
      return "hover-end";
    if (
      departDate && rangeEnd && tripType === "round-trip" &&
      departDate < rangeEnd &&
      d > departDate && d < rangeEnd
    )
      return "in-range";
    return "normal";
  }

  const cells: (string | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: count }, (_, i) => dateStr(year, month, i + 1)),
  ];

  return (
    <div>
      <div className="text-center text-sm font-semibold text-[var(--color-text)] mb-3 px-2">
        {MONTHS_RU[month]} {year}
      </div>
      <div className="grid grid-cols-7">
        {DAYS_RU.map((d) => (
          <div key={d} className="h-8 flex items-center justify-center text-[11px] font-medium text-[var(--color-text-muted)]">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const cls = classify(d);
          const day = parseInt(d.split("-")[2]);

          const outerRange =
            cls === "in-range"
              ? "bg-[var(--color-primary-light)]"
              : cls === "depart" && (returnDate || (selectingReturn && hovered > d))
              ? "bg-gradient-to-r from-transparent via-transparent to-[var(--color-primary-light)]"
              : (cls === "return" || cls === "hover-end") && departDate < d
              ? "bg-gradient-to-l from-transparent via-transparent to-[var(--color-primary-light)]"
              : "";

          const btnCls =
            cls === "past"
              ? "text-gray-300 cursor-default"
              : cls === "depart" || cls === "return"
              ? "bg-[var(--color-primary)] text-white font-bold rounded-full cursor-pointer"
              : cls === "hover-end"
              ? "bg-[var(--color-secondary)] text-white font-bold rounded-full cursor-pointer"
              : cls === "in-range"
              ? "text-[var(--color-primary)] font-medium cursor-pointer hover:rounded-full hover:bg-[var(--color-primary)] hover:text-white"
              : "text-[var(--color-text)] cursor-pointer hover:bg-[var(--color-bg-soft)] rounded-full";

          return (
            <div key={d} className={`h-8 flex items-center justify-center ${outerRange}`}>
              <button
                type="button"
                disabled={cls === "past"}
                onClick={() => cls !== "past" && onDayClick(d)}
                onMouseEnter={() => cls !== "past" && onDayHover(d)}
                onMouseLeave={onDayLeave}
                className={`w-8 h-8 flex items-center justify-center text-sm transition-colors ${btnCls}`}
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
  const [selectingReturn, setSelectingReturn] = useState(
    initialField === "return" && !!departDate
  );
  const [hovered, setHovered] = useState("");

  const right = addMonths(leftYear, leftMonth, 1);

  function prev() {
    const p = addMonths(leftYear, leftMonth, -1);
    if (p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth())) return;
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
    } else {
      if (d <= departDate) {
        // Reset: picked date before depart → restart
        onDepartChange(d);
        onReturnChange("");
        setHovered("");
      } else {
        onReturnChange(d);
        onClose();
      }
    }
  }

  const today = todayStr();

  const commonProps = {
    today,
    departDate,
    returnDate,
    hovered,
    selectingReturn,
    tripType,
    onDayClick: handleDayClick,
    onDayHover: setHovered,
    onDayLeave: () => setHovered(""),
  };

  function fmtTab(d: string): string {
    if (!d) return "";
    const [, m, day] = d.split("-");
    const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
    return ` · ${parseInt(day)} ${months[parseInt(m) - 1]}`;
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-2xl shadow-2xl p-5 select-none">
      {/* Header tabs (round-trip only) */}
      {tripType === "round-trip" && (
        <div className="flex gap-1 mb-4 border-b border-[var(--color-border)] pb-3">
          <button
            type="button"
            onClick={() => setSelectingReturn(false)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              !selectingReturn
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
            }`}
          >
            Туда{fmtTab(departDate)}
          </button>
          <button
            type="button"
            onClick={() => { if (departDate) setSelectingReturn(true); }}
            disabled={!departDate}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
              selectingReturn
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)]"
            }`}
          >
            Обратно{fmtTab(returnDate)}
          </button>
        </div>
      )}

      {/* Navigation + calendars */}
      <div className="flex items-start gap-6">
        {/* Prev arrow */}
        <button
          type="button"
          onClick={prev}
          className="mt-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition text-lg flex-shrink-0"
        >
          ‹
        </button>

        {/* Left month */}
        <MonthGrid year={leftYear} month={leftMonth} {...commonProps} />

        {/* Right month (round-trip only) */}
        {tripType === "round-trip" && (
          <MonthGrid year={right.year} month={right.month} {...commonProps} />
        )}

        {/* Next arrow */}
        <button
          type="button"
          onClick={next}
          className="mt-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition text-lg flex-shrink-0"
        >
          ›
        </button>
      </div>

      {/* Hint */}
      <div className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
        {tripType === "round-trip"
          ? selectingReturn
            ? "Выберите дату возврата"
            : "Выберите дату вылета"
          : "Выберите дату вылета"}
      </div>
    </div>
  );
}
