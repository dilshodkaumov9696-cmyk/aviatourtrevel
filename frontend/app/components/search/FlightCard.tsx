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
}

export default function FlightCard({ flight: f, fromCity, fromIata, toCity, toIata, dateLabel, dateISO, paxCount, onSelect, isSelected }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const { format, t, lang } = useSettings();
  const router = useRouter();
  const priceRef = useRef<HTMLSpanElement>(null);

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
  const total = f.pricePerPax * paxCount;
  const direct = f.stops === 0;
  const stopsText = direct
    ? t("card.direct")
    : lang === "ru" ? stopsLabel(f.stops) : `${f.stops} ${t("card.stops_word")}`;

  const bookParams = new URLSearchParams({
    flightId: f.id,
    airlineCode: f.airlineCode, airlineName: f.airlineName,
    flightNumber: f.flightNumber, aircraft: f.aircraft,
    fromCity, fromIata, toCity, toIata,
    departTime: f.departTime, arriveTime: f.arriveTime,
    durationMin: String(f.durationMin), stops: String(f.stops),
    dateLabel, pricePerPax: String(f.pricePerPax),
    paxCount: String(paxCount), total: String(total), baggageLabel: f.baggageLabel,
  });

  return (
    <>
      <article
        className={`flex cursor-pointer flex-col gap-4 rounded-2xl border p-4 transition hover:shadow-md sm:flex-row sm:p-5 ${
          isSelected
            ? "border-green-500 bg-green-50/60 dark:bg-green-950/20"
            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]"
        }`}
        onClick={() => setShowDetail(true)}
      >
        {/* Левая часть */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <img
              src={`https://images.kiwi.com/airlines/64/${f.airlineCode}.png`}
              alt={f.airlineName}
              width={22} height={22}
              className="h-[22px] w-[22px] shrink-0 rounded object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            />
            <span className="mr-1 text-[13px] text-[var(--color-text-muted)]">{f.airlineName}</span>
            <span className="text-[11px] text-[var(--color-text-muted)]">{f.flightNumber}</span>
            {f.badges.map((b) => (
              <span key={b.label} className={`rounded-md px-2 py-0.5 text-[11px] ${TONE_CLASS[b.tone]}`}>
                {b.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-text)]">{f.departTime}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{fromIata}</div>
            </div>

            <div className="min-w-0 flex-1 text-center">
              <div className="mb-1 text-[11px] text-[var(--color-text-muted)]">{formatDuration(f.durationMin)}</div>
              <div className="flex items-center gap-1">
                <div className="h-0.5 flex-1 rounded bg-[var(--color-border)]" />
                {direct ? (
                  <IconPlane size={14} className="rotate-90 text-[var(--color-primary)]" />
                ) : (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: f.stops }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    ))}
                  </div>
                )}
                <div className="h-0.5 flex-1 rounded bg-[var(--color-border)]" />
              </div>
              <div className={`mt-1 text-[11px] ${direct ? "text-green-600" : "text-amber-600"}`}>
                {stopsText}{f.stopLabel ? ` · ${f.stopLabel}` : ""}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-[var(--color-text)]">
                {f.arriveTime}
                {f.arriveDayOffset > 0 && <sup className="ml-0.5 text-[11px] font-medium text-amber-600">+{f.arriveDayOffset}</sup>}
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">{toIata}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>{dateLabel} · {fromCity} ({fromIata}) → {toCity} ({toIata})</span>
            <span className="text-[var(--color-primary)]">· {t("card.details")} ▾</span>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-3 sm:block sm:w-44 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-right">
          <div>
            <span ref={priceRef} className="inline-block">
              <AnimatedNumber value={total} format={format} className="text-xl font-bold text-[var(--color-text)]" />
            </span>
            <div className="text-[11px] text-[var(--color-text-muted)]">{t("card.per_all")}</div>
            <div className={`mt-1.5 text-xs ${f.hasBaggage ? "text-green-600" : "text-[var(--color-text-muted)]"}`}>
              {f.hasBaggage ? "✓ " : ""}{f.baggageLabel}
            </div>
          </div>
          <div className="sm:mt-3" onClick={(e) => e.stopPropagation()}>
            {onSelect ? (
              <button
                type="button"
                onClick={onSelect}
                className={`block w-full rounded-xl px-6 py-2.5 text-center text-sm font-semibold text-white transition sm:w-full ${
                  isSelected ? "bg-green-700 hover:bg-green-800" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSelected ? "✓ Выбран" : t("card.select")}
              </button>
            ) : (
              <a
                href={`/book?${bookParams.toString()}`}
                onClick={bookWithTransition}
                className="block rounded-xl bg-green-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-700 sm:w-full"
              >
                {t("card.select")}
              </a>
            )}
          </div>
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
