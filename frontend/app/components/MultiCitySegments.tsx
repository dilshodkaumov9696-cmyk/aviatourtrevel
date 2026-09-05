"use client";

import { useEffect, useRef, useState } from "react";
import AirportInput from "./AirportInput";
import DateRangePicker from "./DateRangePicker";
import { IconPlane, IconPin, IconCalendar, IconSwap, IconClose, IconPlus } from "./icons";
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

const box =
  "relative flex min-h-[52px] w-full min-w-0 items-center gap-2.5 px-3.5 py-1.5 transition-colors duration-200 hover:bg-[var(--color-surface)] focus-within:bg-[var(--color-surface)] sm:px-4";

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
    <div className="flex min-w-0 flex-col gap-2.5 px-4 py-3 sm:px-5">
      {segments.map((seg, idx) => (
        <div key={seg.id} className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-stretch gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full bg-[var(--color-primary-light)] text-[11px] font-bold text-[var(--color-primary)] sm:h-7 sm:w-7 sm:text-xs">
            {idx + 1}
          </div>

          <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm transition-shadow duration-200 hover:shadow-md md:flex-row md:divide-x md:divide-y-0">
          <div className="relative flex min-w-0 flex-1 flex-col divide-y divide-[var(--color-border)] sm:flex-row sm:divide-x sm:divide-y-0">
            <div className={`min-w-0 flex-1 ${box} ${errors[`from${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
              <IconPlane className="shrink-0 text-[var(--color-primary)]" />
              <AirportInput
                airport={seg.from}
                onChange={(a) => onUpdate(seg.id, { from: a })}
                placeholder={errors[`from${seg.id}`] || "Город вылета"}
                excludeIata={seg.to?.iata}
              />
            </div>

            <button
              type="button"
              onClick={() => onSwap(seg.id)}
              title="Поменять местами"
              className="absolute z-10 top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] sm:right-auto sm:left-1/2 sm:-translate-x-1/2"
            >
              <IconSwap size={14} className="rotate-90 sm:rotate-0" />
            </button>

            <div className={`min-w-0 flex-1 ${box} ${errors[`to${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}>
              <IconPin className="shrink-0 text-[var(--color-primary)]" />
              <AirportInput
                airport={seg.to}
                onChange={(a) => onUpdate(seg.id, { to: a })}
                placeholder={errors[`to${seg.id}`] || "Город прилёта"}
                excludeIata={seg.from?.iata}
              />
            </div>
          </div>

          <div
            ref={openDateId === seg.id ? popupRef : null}
            className="relative flex min-w-0 shrink-0 md:w-44"
          >
            <div
              className={`${box} cursor-pointer ${errors[`date${seg.id}`] ? "z-10 ring-1 ring-inset ring-red-400" : ""}`}
              onClick={() => setOpenDateId(openDateId === seg.id ? null : seg.id)}
            >
              <IconCalendar size={22} className={`shrink-0 ${seg.date ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
              <div className={`min-w-0 truncate text-[15px] ${seg.date ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
                {seg.date ? fmtDate(seg.date) : errors[`date${seg.id}`] || "Дата вылета"}
              </div>
            </div>

            {/* Компактный однослойный календарь, привязанный к самому полю даты — не
                растягивается на всю строку сегмента и не занимает весь экран (тот же
                размер, что на обычном поиске). Даты раньше предыдущего перелёта недоступны. */}
            {openDateId === seg.id && (
              <div className="fixed inset-0 z-[240] flex items-end justify-center p-3 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:block md:p-0">
                <button type="button" aria-label="Close" className="absolute inset-0 bg-black/45 md:hidden" onClick={() => setOpenDateId(null)} />
                <div className="relative z-10 w-full max-w-[calc(100vw-1.5rem)] md:max-w-none">
                  <DateRangePicker
                    mode="single"
                    departDate={seg.date}
                    returnDate=""
                    onDepartChange={(d) => onUpdate(seg.id, { date: d })}
                    onReturnChange={() => {}}
                    onClose={() => setOpenDateId(null)}
                    originIata={seg.from?.iata}
                    destinationIata={seg.to?.iata}
                    minDate={idx > 0 ? segments[idx - 1]?.date || undefined : undefined}
                  />
                </div>
              </div>
            )}
          </div>
          </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(seg.id)}
            disabled={segments.length <= 2}
            title="Удалить перелёт"
            className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full text-[var(--color-text-muted)] transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-25 dark:hover:bg-red-950/40"
          >
            <IconClose size={16} />
          </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        disabled={segments.length >= 6}
        className="mt-1 inline-flex items-center gap-2 self-start rounded-xl bg-[var(--color-primary-light)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-sm ring-1 ring-inset ring-[var(--color-primary)]/15 transition hover:bg-[var(--color-primary)] hover:text-white hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--color-primary-light)] disabled:hover:text-[var(--color-primary)] disabled:active:scale-100 sm:ml-9"
      >
        <IconPlus size={15} />
        Добавить перелёт {segments.length >= 6 && "(максимум 6)"}
      </button>
    </div>
  );
}
