"use client";

import { useEffect, useRef } from "react";
import {
  Flight, Route, buildItinerary, formatDuration, dateShort, stopsLabel,
  baggageShortLabel, carryOnShortLabel, serviceLevelLabel, dimensionsSummary,
} from "../../data/flights";
import { useSettings } from "../../context/settings";
import { ANNA_PIN_FLIGHT, type PinnedFlight } from "../../lib/chatRoute";
import AirlineLogo from "./AirlineLogo";
import {
  IconSuitcase, IconBackpack, IconUndo, IconSwap, IconSeat, IconMeal,
  IconPriority, IconLounge, IconPlane, IconCheckin, IconClock,
} from "../icons";

interface Props {
  flight: Flight;
  route: Route;
  dateISO: string;
  paxCount: number;
  adults?: number;
  childrenCount?: number;
  infants?: number;
  infantsSeat?: number;
  cabin?: string;
  onClose: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

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

// Одна строка в блоке "Условия тарифа": иконка + подпись слева, значение (+доп. строка) справа.
function ConditionRow({ icon, label, value, sub, tone = "neutral" }: { icon: React.ReactNode; label: string; value: string; sub?: string; tone?: "neutral" | "positive" | "negative" }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
        <span aria-hidden className="opacity-70">{icon}</span>{label}
      </div>
      <div className="text-right">
        <div className={`text-[13px] font-medium ${tone === "positive" ? "text-green-600" : tone === "negative" ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>{value}</div>
        {sub && <div className="text-[11px] text-[var(--color-text-muted)]">{sub}</div>}
      </div>
    </div>
  );
}

export default function FlightDetailModal({
  flight: f, route, dateISO, paxCount, adults = paxCount, childrenCount: numChildren = 0, infants = 0, infantsSeat = 0, cabin = "economy",
  onClose, onSelect, isSelected,
}: Props) {
  const { format, t, lang } = useSettings();
  const { segments, layovers, estimated } = buildItinerary(f, route);
  const total = f.pricePerPax * paxCount;
  const stopsText = lang === "ru" ? stopsLabel(f.stops) : `${f.stops} ${t("card.stops_word")}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Фокус-ловушка + возврат фокуса на элемент, который открыл модалку.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus?.();
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
    dateLabel: dateShort(dateISO), dateISO, pricePerPax: String(f.pricePerPax),
    paxCount: String(paxCount), total: String(total), baggageLabel: baggageShortLabel(f.fare.baggage),
    adults: String(adults), children: String(numChildren), infants: String(infants),
    infantsSeat: String(infantsSeat),
    cabin,
    ...(f.bookingUrl ? { bookingUrl: f.bookingUrl } : {}),
  });
  const bookHref = `/book?${bookParams.toString()}`;

  useEffect(() => {
    const detail: PinnedFlight = {
      airlineName: f.airlineName || f.airlineCode,
      flightNumber: f.flightNumber,
      fromIata: route.fromIata,
      toIata: route.toIata,
      dateISO,
      departTime: f.departTime,
      pricePerPax: f.pricePerPax,
      bookHref,
      baggageLabel: baggageShortLabel(f.fare.baggage),
    };
    window.dispatchEvent(new CustomEvent(ANNA_PIN_FLIGHT, { detail }));
  }, [bookHref, f.airlineName, f.airlineCode, f.flightNumber, f.departTime, f.pricePerPax, f.fare.baggage, route.fromIata, route.toIata, dateISO]);

  const fareBrand = f.fare.brandName ?? "Эконом";
  const refundValue = f.fare.refund.allowed === "unknown" ? "Уточняется" : f.fare.refund.allowed === "yes" ? "Разрешён" : "Не разрешён";
  const refundSub = f.fare.refund.allowed === "yes" ? (f.fare.refund.penalty ? `Штраф: ${format(f.fare.refund.penalty)}` : "Бесплатно") : undefined;
  const exchangeValue = f.fare.exchange.allowed === "unknown" ? "Уточняется" : f.fare.exchange.allowed === "yes" ? "Разрешён" : "Не разрешён";
  const exchangeSub = f.fare.exchange.allowed === "yes" ? (f.fare.exchange.penalty ? `Штраф: ${format(f.fare.exchange.penalty)}` : "Бесплатно") : undefined;

  return (
    <div
      // z-[70]: выше плавающего ChatWidget (z-[60]) — открытая модалка должна
      // всегда перекрывать его, иначе кнопка "Выбрать" частично блокируется виджетом чата.
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${route.fromCity} → ${route.toCity}`}
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
              {f.departTime} {dateShort(dateISO)} — {f.arriveTime} {dateShort(dateISO, f.arriveDayOffset)} · {formatDuration(f.durationMin)}
              {f.stops > 0 && ` · ${stopsText}`}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)]"
          >
            ×
          </button>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">

          {/* Авиакомпания + тариф — единый блок независимо от числа сегментов */}
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)]">
              <AirlineLogo code={f.airlineCode} name={f.airlineName} size={36} className="rounded-full" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[var(--color-text)]">{f.airlineName}</div>
              <div className="text-[12px] text-[var(--color-text-muted)]">Рейс {f.flightNumber}{f.aircraft ? ` · ${f.aircraft}` : ""}</div>
            </div>
            <div className="shrink-0 text-right text-[12px] text-[var(--color-text-muted)]">{fareBrand}</div>
          </div>

          {estimated ? (
            /* ── API-рейс с пересадками: аэропорт пересадки неизвестен ── */
            <>
              {/* Таймлайн: один от вылета до прилёта */}
              <div className="flex gap-4">
                <div className="flex w-5 flex-col items-center pt-1">
                  <IconTakeoff className="text-[var(--color-primary)]" />
                  <div className="my-2 w-px flex-1 border-l-2 border-dashed border-[var(--color-border)]" />
                  <IconLanding className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 pb-1">
                  {/* Вылет */}
                  <div className="flex items-baseline gap-3">
                    <div className="w-12 shrink-0 text-lg font-bold text-[var(--color-text)]">{f.departTime}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--color-text)]">{route.fromCity}</div>
                      <div className="text-[12px] text-[var(--color-text-muted)]">Аэропорт ({route.fromIata})</div>
                    </div>
                    <div className="shrink-0 text-[12px] text-[var(--color-text-muted)]">{dateShort(dateISO, 0)}</div>
                  </div>

                  {/* Продолжительность + пересадки */}
                  <div className="my-4 pl-[3.75rem]">
                    <div className="text-[13px] font-semibold text-[var(--color-primary)]">{formatDuration(f.durationMin)}</div>
                    <div className="mt-0.5 text-[12px] font-medium text-amber-600">
                      {f.stops === 1 ? "1 пересадка" : `${f.stops} пересадки`}
                    </div>
                  </div>

                  {/* Прилёт */}
                  <div className="flex items-baseline gap-3">
                    <div className="w-12 shrink-0 text-lg font-bold text-[var(--color-text)]">
                      {f.arriveTime}
                      {f.arriveDayOffset > 0 && <sup className="ml-0.5 text-[11px] font-semibold text-amber-600">+{f.arriveDayOffset}</sup>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-[var(--color-text)]">{route.toCity}</div>
                      <div className="text-[12px] text-[var(--color-text-muted)]">Аэропорт ({route.toIata})</div>
                    </div>
                    <div className="shrink-0 text-[12px] text-[var(--color-text-muted)]">{dateShort(dateISO, f.arriveDayOffset)}</div>
                  </div>
                </div>
              </div>

              {/* Заметка: маршрут пересадки на Aviasales */}
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 text-[12px] text-[var(--color-text-muted)]">
                <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                Полная схема маршрута с аэропортами пересадки доступна на Aviasales при оформлении билета.
              </div>
            </>

          ) : (
            /* ── Рейс с полными данными о сегментах ── */
            <>
              {segments.map((seg, i) => (
                <div key={i}>
                  {segments.length > 1 && (
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
                      <AirlineLogo code={seg.airlineCode} name={seg.airlineName} size={16} className="rounded" />
                      <span className="font-medium text-[var(--color-text)]">{seg.airlineName}</span>
                      <span>· Рейс {seg.flightNumber}{seg.aircraft ? ` · ${seg.aircraft}` : ""}</span>
                    </div>
                  )}

                  <div className="flex gap-3.5">
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
                          <div className="text-[12px] text-[var(--color-text-muted)]">{seg.fromAirport}{seg.fromIata ? ` (${seg.fromIata})` : ""}</div>
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
                          <div className="text-[12px] text-[var(--color-text-muted)]">{seg.toAirport}{seg.toIata ? ` (${seg.toIata})` : ""}</div>
                        </div>
                        <div className="ml-auto shrink-0 text-[12px] text-[var(--color-text-muted)]">{dateShort(dateISO, seg.arriveDayOffset)}</div>
                      </div>
                    </div>
                  </div>

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
            </>
          )}

          {/* Условия тарифа — единый блок для обеих веток (оценённой и посегментной) */}
          <div className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
            <div className="mb-1 text-[11px] font-bold tracking-wide text-[var(--color-text-muted)] uppercase">Условия тарифа</div>
            <div className="divide-y divide-[var(--color-border)]">
              <ConditionRow icon={<IconSuitcase size={15} />} label="Багаж" value={baggageShortLabel(f.fare.baggage)} sub={dimensionsSummary(f.fare.baggage.dimensionsCm, f.fare.baggage.maxTotalLinearCm)} />
              <ConditionRow icon={<IconBackpack size={15} />} label="Ручная кладь" value={carryOnShortLabel(f.fare.carryOn)} sub={dimensionsSummary(f.fare.carryOn.dimensionsCm, null)} />
              <ConditionRow icon={<IconUndo size={15} />} label="Возврат" value={refundValue} sub={refundSub} tone={f.fare.refund.allowed === "yes" ? "positive" : f.fare.refund.allowed === "no" ? "negative" : "neutral"} />
              <ConditionRow icon={<IconSwap size={15} />} label="Обмен" value={exchangeValue} sub={exchangeSub} tone={f.fare.exchange.allowed === "yes" ? "positive" : f.fare.exchange.allowed === "no" ? "negative" : "neutral"} />
              <ConditionRow icon={<IconSeat size={15} />} label="Выбор места" value={serviceLevelLabel(f.fare.seatSelection)} />
              <ConditionRow icon={<IconMeal size={15} />} label="Питание" value={serviceLevelLabel(f.fare.meal)} />
              <ConditionRow icon={<IconPriority size={15} />} label="Приоритетная посадка" value={serviceLevelLabel(f.fare.priorityBoarding)} />
              <ConditionRow icon={<IconLounge size={15} />} label="Доступ в лаунж" value={serviceLevelLabel(f.fare.lounge)} />
              <ConditionRow icon={<IconPlane size={15} />} label="Начисление миль" value={serviceLevelLabel(f.fare.mileageAccrual)} />
              <ConditionRow icon={<IconCheckin size={15} />} label="Онлайн-регистрация" value={serviceLevelLabel(f.fare.onlineCheckin)} />
              <ConditionRow icon={<IconClock size={15} />} label="No-show" value={f.fare.noShow ?? "Не указано поставщиком"} />
            </div>
          </div>

          {/* Местное время */}
          <div className="mt-4 rounded-xl bg-[var(--color-bg-soft)] px-4 py-2.5 text-[12px] text-[var(--color-text-muted)]">
            {t("modal.local_time")}
          </div>
        </div>

        {/* Футер с ценой */}
        <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div>
            <div className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">{format(total)}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{t("card.per_all")}</div>
          </div>
          {onSelect ? (
            // Тот же выбор ноги туда/обратно, что и кнопка "Выбрать" на карточке —
            // логика не дублируется, просто переиспользуется тот же колбэк.
            <button
              type="button"
              onClick={() => { onSelect(); onClose(); }}
              className={`rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition sm:px-10 sm:text-base ${isSelected ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"}`}
            >
              {isSelected ? "✓ Выбран" : `${t("card.select")} · ${format(total)}`}
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href={bookHref}
                className="rounded-xl bg-green-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700 sm:px-10 sm:text-base"
              >
                Оформить у нас · {format(total)}
              </a>
              {f.bookingUrl && (
                <a
                  href={f.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] sm:px-8"
                >
                  Купить на Aviasales
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
