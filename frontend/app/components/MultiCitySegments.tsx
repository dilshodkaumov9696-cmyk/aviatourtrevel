"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./AirportInput";
import DateRangePicker from "./DateRangePicker";
import { IconPlane, IconPin, IconCalendar, IconSwap } from "./icons";
import { Airport } from "../data/airports";

export interface MultiSegment {
  id: number;
  from: Airport | null;
  to: Airport | null;
  date: string;
}

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

// Ячейка сегмента: рамку и фон даёт контейнер-бар, поля стыкуются вплотную
// и разделяются 1px-дивайдерами — как в основной форме поиска на главной.
const box =
  "relative flex min-h-[60px] w-full items-center gap-2.5 px-4 py-2 transition-colors duration-200 hover:bg-[var(--color-surface)] focus-within:bg-[var(--color-surface)]";

interface Props {
  segments: MultiSegment[];
  errors: Record<string, string>;
  onUpdate: (id: number, patch: Partial<MultiSegment>) => void;
  onSwap: (id: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export default function MultiCitySegments({
  segments, errors, onUpdate, onSwap, onAdd, onRemove,
}: Props) {
  const [openDateId, setOpenDateId] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpenDateId(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="px-4 pt-1 pb-2 flex flex-col gap-2">
      {segments.map((seg, idx) => (
        <div key={seg.id} className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Номер */}
          <div className="hidden md:flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
            {idx + 1}
          </div>

          {/* Единый бар сегмента: Откуда | Куда | Когда — без зазоров */}
          <div className="flex min-w-0 flex-1 flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] md:flex-row md:divide-x md:divide-y-0">
          {/* Маршрут */}
          <div className="relative flex flex-col divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0 flex-1 min-w-0">
            <div className={`flex-1 min-w-0 ${box} rounded-t-2xl sm:rounded-tr-none md:rounded-bl-2xl ${errors[`from${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
              <IconPlane className="text-[var(--color-primary)] shrink-0" />
              <AirportInput
                airport={seg.from}
                onChange={(a) => onUpdate(seg.id, { from: a })}
                label="Откуда"
                placeholder={errors[`from${seg.id}`] || "Город"}
                excludeIata={seg.to?.iata}
              />
            </div>

            <button
              type="button"
              onClick={() => onSwap(seg.id)}
              title="Поменять местами"
              className="absolute z-10 top-1/2 -translate-y-1/2 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary-light)] transition"
            >
              <IconSwap size={15} className="rotate-90 sm:rotate-0" />
            </button>

            <div className={`flex-1 min-w-0 ${box} sm:rounded-tr-2xl md:rounded-tr-none ${errors[`to${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
              <IconPin className="text-[var(--color-primary)] shrink-0" />
              <AirportInput
                airport={seg.to}
                onChange={(a) => onUpdate(seg.id, { to: a })}
                label="Куда"
                placeholder={errors[`to${seg.id}`] || "Город"}
                excludeIata={seg.from?.iata}
              />
            </div>
          </div>

          {/* Дата */}
          <div ref={openDateId === seg.id ? popupRef : null} className="relative flex shrink-0 md:w-44">
            <div
              className={`${box} cursor-pointer rounded-bl-2xl rounded-br-2xl md:rounded-bl-none md:rounded-tr-2xl ${errors[`date${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}
              onClick={() => setOpenDateId(openDateId === seg.id ? null : seg.id)}
            >
              <IconCalendar className={`shrink-0 ${seg.date ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--color-text-muted)]">Когда</div>
                <div className={`text-[15px] ${seg.date ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                  {seg.date ? fmtDate(seg.date) : "Дата"}
                </div>
              </div>
            </div>

            {openDateId === seg.id && (
              <div className="absolute top-full right-0 md:left-0 mt-2 z-50">
                <DateRangePicker
                  mode="single"
                  departDate={seg.date}
                  returnDate=""
                  onDepartChange={(d) => onUpdate(seg.id, { date: d })}
                  onReturnChange={() => {}}
                  onClose={() => setOpenDateId(null)}
                />
              </div>
            )}
          </div>
          </div>

          {/* Удалить */}
          <button
            type="button"
            onClick={() => onRemove(seg.id)}
            disabled={segments.length <= 2}
            title="Удалить перелёт"
            className="self-end md:self-auto w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 disabled:opacity-25 disabled:cursor-not-allowed transition"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Добавить перелёт */}
      <button
        type="button"
        onClick={onAdd}
        disabled={segments.length >= 6}
        className="mt-1 self-start inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <span className="text-lg leading-none">+</span>
        Добавить перелёт {segments.length >= 6 && "(максимум 6)"}
      </button>
    </div>
  );
}
