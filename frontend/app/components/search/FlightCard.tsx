"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flight, formatDuration, stopsLabel, BadgeTone } from "../../data/flights";
import { IconPlane } from "../icons";
import FlightDetailModal from "./FlightDetailModal";
import AnimatedNumber from "../AnimatedNumber";
import { useSettings } from "../../context/settings";

const TONE_CLASS: Record<BadgeTone, string> = {
  deal: "badge-deal",
  time: "badge-info",
  morning: "badge-info",
  exclusive: "badge-success",
  cheap: "badge-success",
  muted: "badge-muted",
};

interface Props {
  flight: Flight;
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  dateLabel: string;
  dateISO: string;
  paxCount: number;
  onSelect?: () => void;
  isSelected?: boolean;
  isBest?: boolean;
}

export default function FlightCard({ flight: f, fromCity, fromIata, toCity, toIata, dateLabel, dateISO, paxCount, onSelect, isSelected, isBest }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const [baggageAdded, setBaggageAdded] = useState(false);
  const { format, t, lang } = useSettings();
  const router = useRouter();
  const priceRef = useRef<HTMLSpanElement>(null);

  const baggageLabelDefault = "Ручная кладь включена";
  const baggageLabelParam = baggageAdded
    ? f.tariff.baggageKg
      ? `Багаж ${f.tariff.baggageKg} кг`
      : f.baggageLabel || "Багаж"
    : baggageLabelDefault;

  const baggageChip = (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${baggageAdded || f.hasBaggage ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"}`}>
      {f.hasBaggage ? (f.tariff.baggageKg ? `Багаж ${f.tariff.baggageKg} кг` : f.baggageLabel || "Багаж") : baggageAdded ? baggageLabelParam : baggageLabelDefault}
    </span>
  );

  // Возвратность тарифа — раньше была видна только в модалке деталей,
  // а это как раз то, что нужно для сравнения тарифов между карточками.
  const refundChip = (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${
        f.tariff.refundable
          ? "bg-[var(--color-accent)]/15 text-[#0F7A4C] dark:bg-[var(--color-accent)]/20 dark:text-[#2FD98A]"
          : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
      }`}
    >
      {f.tariff.refundable ? "Возврат разрешён" : "Невозвратный"}
    </span>
  );

  // Переключатель "Добавить багаж" — как на референсе: подпись + тумблер вкл/выкл,
  // а не отдельная кнопка-пилюля.
  const addBaggageToggle = !f.hasBaggage && (
    <label className="inline-flex w-fit cursor-pointer items-center gap-2">
      <span className="text-[12px] text-[var(--color-text-muted)]">Добавить багаж</span>
      <button
        type="button"
        role="switch"
        aria-checked={baggageAdded}
        aria-label="Добавить багаж"
        onClick={() => setBaggageAdded((v) => !v)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          baggageAdded ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            baggageAdded ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );

  // Переход к бронированию с View Transition: цена «перетекает» на новую страницу.
  function bookWithTransition(e: React.MouseEvent) {
    e.preventDefault();
    const href = `/book?${bookParams.toString()}`;
    const startVT = (document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } }).startViewTransition;
    if (!startVT) { router.push(href); return; }
    if (priceRef.current) priceRef.current.style.viewTransitionName = "flight-price";
    const transition = startVT.call(document, () =>
      new Promise<void>((resolve) => {
        router.push(href);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    );
    transition.finished.finally(() => {
      if (priceRef.current) priceRef.current.style.viewTransitionName = "";
    });
  }
  const direct = f.stops === 0;
  const stopsText = direct
    ? t("card.direct")
    : lang === "ru" ? stopsLabel(f.stops) : `${f.stops} ${t("card.stops_word")}`;
  const airlineDisplayName =
    f.airlineName && f.airlineName !== f.airlineCode
      ? f.airlineName
      : `Авиакомпания ${f.airlineCode}`;

  const baggageExtra = baggageAdded ? 250000 : 0;
  const total = (f.pricePerPax + baggageExtra) * paxCount;

  const bookParams = new URLSearchParams({
    flightId: f.id,
    airlineCode: f.airlineCode, airlineName: f.airlineName,
    flightNumber: f.flightNumber, aircraft: f.aircraft,
    fromCity, fromIata, toCity, toIata,
    departTime: f.departTime, arriveTime: f.arriveTime,
    durationMin: String(f.durationMin), stops: String(f.stops),
    dateLabel, dateISO, pricePerPax: String(f.pricePerPax + baggageExtra),
    paxCount: String(paxCount), total: String(total), baggageLabel: baggageLabelParam,
    ...(f.bookingUrl ? { bookingUrl: f.bookingUrl } : {}),
  });

  // Клик по маршруту: открывает детали, либо (для пересадок без своих данных) уводит на Aviasales.
  function openDetailsOrAviasales() {
    if (f.stops > 0 && f.bookingUrl && !f.stopCities?.length) {
      window.open(f.bookingUrl, "_blank", "noopener,noreferrer");
    } else {
      setShowDetail(true);
    }
  }

  // Общий стиль CTA — теперь во всю ширину нижней панели действий.
  const ctaBase = "flex flex-1 items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-semibold text-white transition";

  return (
    <>
      <article
        className={`overflow-hidden rounded-2xl border transition hover:shadow-lg ${
          isSelected
            ? "border-green-500 bg-green-50/50 ring-1 ring-green-500/40 dark:bg-green-950/20"
            : isBest
            ? "border-[var(--color-accent-dark)] bg-[var(--color-surface)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
        }`}
      >
        {/* Плашка авиакомпании */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] ring-1 ring-[var(--color-border)]">
              <img
                src={`https://images.kiwi.com/airlines/64/${f.airlineCode}.png`}
                alt={airlineDisplayName}
                width={20}
                height={20}
                className="h-5 w-5 rounded object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
              />
            </span>
            <span className="truncate text-sm font-semibold text-[var(--color-text)]">{airlineDisplayName}</span>
            <span className="hidden shrink-0 text-[12px] text-[var(--color-text-muted)] sm:inline">· {f.flightNumber}</span>
            {f.bookingUrl && (
              <span className="shrink-0 rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[11px] font-medium text-[#0F7A4C] dark:bg-[var(--color-accent)]/20 dark:text-[#2FD98A]">
                Aviasales
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {isBest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F7A4C] dark:bg-[var(--color-accent)]/20 dark:text-[#2FD98A]">
                ★ Лучший выбор
              </span>
            )}
            {f.badges.length > 0 && (
              <div className="hidden items-center gap-1.5 sm:flex">
                {f.badges.slice(0, isBest ? 1 : 2).map((b) => (
                  <span key={b.label} className={`rounded-full px-2 py-0.5 text-[11px] ${TONE_CLASS[b.tone]}`}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Тело: дата, маршрут, условия тарифа, цена — в одну строку на десктопе */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6">
          {/* Маршрут — клик открывает детали или Aviasales (для пересадок без данных) */}
          <div
            role="button"
            tabIndex={0}
            onClick={openDetailsOrAviasales}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetailsOrAviasales();
              }
            }}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <div className="mb-2 text-[11px] font-medium text-[var(--color-text-muted)]">{dateLabel}</div>
            <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 sm:gap-5">
              {/* Вылет */}
              <div className="min-w-0">
                <div className="font-mono text-2xl font-bold leading-none text-[var(--color-text)] sm:text-[26px]">{f.departTime}</div>
                <div className="mt-2 inline-flex items-center rounded-md bg-[var(--color-bg-soft)] px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">{fromIata}</div>
                <div className="mt-1 truncate text-[12px] text-[var(--color-text-muted)]">{fromCity}</div>
              </div>

              {/* Линия маршрута */}
              <div className="min-w-0 px-1 pt-1 text-center">
                <div className="mb-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">{formatDuration(f.durationMin)}</div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-border)]" />
                  <div className="h-px flex-1 border-t border-dashed border-[var(--color-border)]" />
                  <IconPlane size={15} className="shrink-0 rotate-90 text-[var(--color-primary)]" />
                  <div className="h-px flex-1 border-t border-dashed border-[var(--color-border)]" />
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-border)]" />
                </div>
                <div className={`mt-1.5 truncate text-[12px] font-semibold ${direct ? "text-green-600" : "text-amber-600"}`}>
                  {stopsText}{f.stopLabel ? ` · ${f.stopLabel}` : ""}
                </div>
              </div>

              {/* Прилёт */}
              <div className="min-w-0 text-right">
                <div className="font-mono text-2xl font-bold leading-none text-[var(--color-text)] sm:text-[26px]">
                  {f.arriveTime}
                  {f.arriveDayOffset > 0 && <sup className="ml-0.5 text-[11px] font-semibold text-amber-600">+{f.arriveDayOffset}</sup>}
                </div>
                <div className="mt-2 inline-flex items-center rounded-md bg-[var(--color-bg-soft)] px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-[var(--color-text-muted)]">{toIata}</div>
                <div className="mt-1 truncate text-[12px] text-[var(--color-text-muted)]">{toCity}</div>
              </div>
            </div>
          </div>

          {/* Условия тарифа: багаж + возврат + переключатель "Добавить багаж" */}
          <div className="flex flex-row flex-wrap items-center gap-1.5 text-[12px] lg:w-44 lg:shrink-0 lg:flex-col lg:items-start lg:border-l lg:border-[var(--color-border)] lg:pl-6" onClick={(e) => e.stopPropagation()}>
            {baggageChip}
            {refundChip}
            {addBaggageToggle}
          </div>

          {/* Цена */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4 lg:w-40 lg:shrink-0 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <span ref={priceRef} className="inline-block">
              <AnimatedNumber value={total} format={format} className="font-mono text-2xl font-bold leading-none text-[var(--color-text)]" />
            </span>
            <div className="text-[11px] text-[var(--color-text-muted)] lg:mt-1">{t("card.per_all")}</div>
          </div>
        </div>

        {/* Нижняя панель действий: детали + выбрать */}
        <div className="flex items-center gap-3 border-t border-[var(--color-border)] p-4 sm:px-5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="hidden shrink-0 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:inline-flex sm:items-center"
          >
            {t("card.details")}
          </button>
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className={`${ctaBase} ${isSelected ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]! hover:bg-[var(--color-accent-dark)]" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"}`}
            >
              {isSelected ? "✓ Выбран" : t("card.select")}
            </button>
          ) : f.bookingUrl ? (
            <a
              href={f.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ctaBase} bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]`}
            >
              {t("card.select")}
            </a>
          ) : (
            <a
              href={`/book?${bookParams.toString()}`}
              onClick={bookWithTransition}
              className={`${ctaBase} bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]`}
            >
              {t("card.select")}
            </a>
          )}
        </div>
      </article>

      {showDetail && (
        <FlightDetailModal
          flight={f}
          route={{ fromCity, fromIata, toCity, toIata }}
          dateISO={dateISO}
          paxCount={paxCount}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
