"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./AirportInput";
import DateRangePicker from "./DateRangePicker";
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
    <div className="px-3 py-3 flex flex-col gap-2">
      {segments.map((seg, idx) => (
        <div
          key={seg.id}
          className="flex flex-col md:flex-row md:items-center gap-1 rounded-xl border border-[var(--color-border)] md:border-0 p-2 md:p-0"
        >
          {/* Номер сегмента */}
          <div className="hidden md:flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-bold text-[var(--color-primary)]">
            {idx + 1}
          </div>

          {/* Откуда */}
          <div className={`flex-1 min-w-0 px-3 py-2 rounded-xl ${errors[`from${seg.id}`] ? "bg-red-50" : "hover:bg-[var(--color-bg-soft)]"}`}>
            <AirportInput
              airport={seg.from}
              onChange={(a) => onUpdate(seg.id, { from: a })}
              label="Откуда"
              placeholder={errors[`from${seg.id}`] || "Город или аэропорт"}
            />
          </div>

          {/* Свап */}
          <button
            type="button"
            onClick={() => onSwap(seg.id)}
            title="Поменять местами"
            className="hidden md:flex self-center w-8 h-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
          >
            ⇄
          </button>

          {/* Куда */}
          <div className={`flex-1 min-w-0 px-3 py-2 rounded-xl ${errors[`to${seg.id}`] ? "bg-red-50" : "hover:bg-[var(--color-bg-soft)]"}`}>
            <AirportInput
              airport={seg.to}
              onChange={(a) => onUpdate(seg.id, { to: a })}
              label="Куда"
              placeholder={errors[`to${seg.id}`] || "Город или аэропорт"}
            />
          </div>

          {/* Дата */}
          <div ref={openDateId === seg.id ? popupRef : null} className="relative md:w-40 shrink-0">
            <div
              className={`px-3 py-2 rounded-xl cursor-pointer ${errors[`date${seg.id}`] ? "bg-red-50" : "hover:bg-[var(--color-bg-soft)]"}`}
              onClick={() => setOpenDateId(openDateId === seg.id ? null : seg.id)}
            >
              <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                {errors[`date${seg.id}`]
                  ? <span className="text-red-500">{errors[`date${seg.id}`]}</span>
                  : "Когда"}
              </div>
              <div className={`text-sm ${seg.date ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                {seg.date ? fmtDate(seg.date) : "Дата"}
              </div>
            </div>

            {openDateId === seg.id && (
              <div className="absolute top-full right-0 md:left-0 mt-2 z-50">
                <DateRangePicker
                  tripType="one-way"
                  departDate={seg.date}
                  returnDate=""
                  onDepartChange={(d) => onUpdate(seg.id, { date: d })}
                  onReturnChange={() => {}}
                  onClose={() => setOpenDateId(null)}
                />
              </div>
            )}
          </div>

          {/* Удалить */}
          <button
            type="button"
            onClick={() => onRemove(seg.id)}
            disabled={segments.length <= 2}
            title="Удалить перелёт"
            className="self-center w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 disabled:opacity-25 disabled:cursor-not-allowed transition"
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
        className="self-start inline-flex items-center gap-2 mt-1 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <span className="text-lg leading-none">+</span>
        Добавить перелёт {segments.length >= 6 && "(максимум 6)"}
      </button>
    </div>
  );
}
