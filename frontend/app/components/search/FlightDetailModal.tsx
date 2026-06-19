"use client";

import { useEffect } from "react";
import { Flight, Route, buildItinerary, formatDuration, dateShort, stopsLabel } from "../../data/flights";
import { useSettings } from "../../context/settings";

interface Props {
  flight: Flight;
  route: Route;
  dateISO: string;
  paxCount: number;
  onClose: () => void;
}

function IconTakeoff({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" className={className} aria-hidden>
      <path d="M2.5 19h19v2h-19zM22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.48c.81-.23 1.28-1.05 1.07-1.84z" />
    </svg>
  );
}

function IconLanding({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" className={className} aria-hidden>
      <path d="M2.5 19h19v2h-19zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L9.6 1.92v8.28L4.54 8.65l-.95-2.37-1.45-.39v5.16l1.6.43 5.94 1.79z" />
    </svg>
  );
}

export default function FlightDetailModal({ flight: f, route, dateISO, paxCount, onClose }: Props) {
  const { format, t, lang } = useSettings();
  const { segments, layovers } = buildItinerary(f, route);
  const total = f.pricePerPax * paxCount;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const stopsText = lang === "ru" ? stopsLabel(f.stops) : `${f.stops} ${t("card.stops_word")}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  const bookParams = new URLSearchParams({
    flightId: f.id,
    airlineCode: f.airlineCode, airlineName: f.airlineName,
    flightNumber: f.flightNumber, aircraft: f.aircraft,
    fromCity: route.fromCity, fromIata: route.fromIata,
    toCity: route.toCity, toIata: route.toIata,
    departTime: f.departTime, arriveTime: f.arriveTime,
    durationMin: String(f.durationMin), stops: String(f.stops),
    dateLabel: dateShort(dateISO), pricePerPax: String(f.pricePerPax),
    paxCount: String(paxCount), total: String(total), baggageLabel: f.baggageLabel,
  });

  const baggageText = f.tariff.baggageKg ? `${t("modal.baggage")}: ${f.tariff.baggageKg} кг` : t("modal.no_baggage");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-[var(--color-surface)] shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--color-text)] sm:text-xl">
              {route.fromCity} <span className="text-[var(--color-text-muted)]">→</span> {route.toCity}
            </h2>
            <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              {first.departTime} {dateShort(dateISO, first.departDayOffset)} — {last.arriveTime} {dateShort(dateISO, last.arriveDayOffset)} · {formatDuration(f.durationMin)}
              {f.stops > 0 && ` · ${stopsText}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
          >
            ×
          </button>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {segments.map((seg, i) => (
            <div key={i}>
              {/* Сегмент */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://images.kiwi.com/airlines/64/${seg.airlineCode}.png`}
                    alt={seg.airlineName}
                    width={32} height={32}
                    className="h-8 w-8 shrink-0 rounded-full object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
                  />
                  <div>
                    <div className="font-semibold text-[var(--color-text)]">{seg.airlineName}</div>
                    <div className="text-[12px] text-[var(--color-text-muted)]">Рейс {seg.flightNumber} · {seg.aircraft}</div>
                  </div>
                </div>
                <div className="text-[12px] leading-relaxed text-[var(--color-text-muted)] sm:text-right">
                  <div>{t("common.economy")} ({f.fareClass})</div>
                  <div>{f.seatsLeft} {t("modal.seats")}</div>
                  <div>{t("modal.hand")}: {f.tariff.handKg} кг</div>
                  <div>{baggageText}</div>
                </div>
              </div>

              {/* Таймлайн сегмента */}
              <div className="mt-4 flex gap-3.5">
                <div className="flex w-5 flex-col items-center pt-1">
                  <IconTakeoff className="text-[var(--color-primary)]" />
                  <div className="my-1.5 w-px flex-1 bg-[var(--color-border)]" />
                  <IconLanding className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <div className="w-12 shrink-0">
                      <div className="text-lg font-bold text-[var(--color-text)]">{seg.departTime}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-text)]">{seg.fromCity}</div>
                      <div className="text-[12px] text-[var(--color-text-muted)]">{seg.fromAirport} ({seg.fromIata})</div>
                    </div>
                    <div className="ml-auto shrink-0 text-[12px] text-[var(--color-text-muted)]">{dateShort(dateISO, seg.departDayOffset)}</div>
                  </div>

                  <div className="my-3 pl-[3.75rem] text-[12px] font-medium text-[var(--color-primary)]">
                    {formatDuration(seg.durationMin)}
                  </div>

                  <div className="flex items-baseline gap-3">
                    <div className="w-12 shrink-0">
                      <div className="text-lg font-bold text-[var(--color-text)]">{seg.arriveTime}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-text)]">{seg.toCity}</div>
                      <div className="text-[12px] text-[var(--color-text-muted)]">{seg.toAirport} ({seg.toIata})</div>
                    </div>
                    <div className="ml-auto shrink-0 text-[12px] text-[var(--color-text-muted)]">{dateShort(dateISO, seg.arriveDayOffset)}</div>
                  </div>
                </div>
              </div>

              {/* Блок пересадки */}
              {i < segments.length - 1 && layovers[i] && (
                <div className="my-4 flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/40">
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <div className="text-[13px] text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">{formatDuration(layovers[i].durationMin)}</span>
                    {` · ${t("modal.transfer_in")} `}{layovers[i].city}
                    {layovers[i].smart && <span className="ml-1 font-medium">· {t("modal.smart")}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Местное время */}
          <div className="mt-4 rounded-xl bg-[var(--color-bg-soft)] px-4 py-2.5 text-[12px] text-[var(--color-text-muted)]">
            {t("modal.local_time")}
          </div>

          {/* Возврат / Обмен */}
          <div className="mt-4 flex justify-end gap-6 text-[13px]">
            <div>
              <span className="text-[var(--color-text-muted)]">{t("modal.refund")}: </span>
              <span className={`font-medium ${f.tariff.refundable ? "text-green-600" : "text-red-500"}`}>
                {f.tariff.refundable ? (f.tariff.changeFee ? t("modal.yes_fee") : t("modal.yes")) : t("modal.no")}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">{t("modal.exchange")}: </span>
              <span className={`font-medium ${f.tariff.changeable ? "text-green-600" : "text-red-500"}`}>
                {f.tariff.changeable ? t("modal.yes") : t("modal.no")}
              </span>
            </div>
          </div>
        </div>

        {/* Футер с ценой */}
        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div>
            <div className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">{format(total)}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{t("card.per_all")}</div>
          </div>
          <a
            href={`/book?${bookParams.toString()}`}
            className="rounded-xl bg-green-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700 sm:px-10 sm:text-base"
          >
            {t("card.select")} · {format(total)}
          </a>
        </div>
      </div>
    </div>
  );
}
