"use client";

import { useState } from "react";
import { Flight, formatDuration, stopsLabel, BadgeTone } from "../../data/flights";
import { IconPlane } from "../icons";

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
  paxCount: number;
}

function RouteSVG({ fromIata, toIata, stops }: { fromIata: string; toIata: string; stops: number }) {
  const W = 260, H = 60;
  const midX = W / 2;
  const arcH = stops > 0 ? 40 : 28;
  const path = `M 20 ${H - 10} Q ${midX} ${H - 10 - arcH} ${W - 20} ${H - 10}`;
  const stopDots = stops > 0
    ? Array.from({ length: stops }, (_, i) => {
        const t = (i + 1) / (stops + 1);
        const x = 20 + t * (W - 40);
        const y = (H - 10) - arcH * Math.sin(Math.PI * t);
        return { x, y };
      })
    : [];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px]" aria-hidden>
      <path d={path} fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx={20} cy={H - 10} r={4} fill="var(--color-primary)" />
      <circle cx={W - 20} cy={H - 10} r={4} fill="var(--color-primary)" />
      {stopDots.map((dot, i) => (
        <circle key={i} cx={dot.x} cy={dot.y} r={3} fill="#f59e0b" />
      ))}
      <text x={20} y={H} fontSize={9} fill="var(--color-text-muted)" textAnchor="middle">{fromIata}</text>
      <text x={W - 20} y={H} fontSize={9} fill="var(--color-text-muted)" textAnchor="middle">{toIata}</text>
      <g transform={`translate(${midX - 7}, ${H - 10 - arcH - 7})`}>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
        </svg>
      </g>
    </svg>
  );
}

function TariffRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className={`text-xs font-medium ${ok === true ? "text-green-600" : ok === false ? "text-red-500" : "text-[var(--color-text)]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function FlightCard({ flight: f, fromCity, fromIata, toCity, toIata, dateLabel, paxCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const total = f.pricePerPax * paxCount;
  const direct = f.stops === 0;

  const bookParams = new URLSearchParams({
    flightId: f.id,
    airlineCode: f.airlineCode,
    airlineName: f.airlineName,
    flightNumber: f.flightNumber,
    aircraft: f.aircraft,
    fromCity, fromIata,
    toCity, toIata,
    departTime: f.departTime,
    arriveTime: f.arriveTime,
    durationMin: String(f.durationMin),
    stops: String(f.stops),
    dateLabel,
    pricePerPax: String(f.pricePerPax),
    paxCount: String(paxCount),
    total: String(total),
    baggageLabel: f.baggageLabel,
  });

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:shadow-md">
      {/* Основная строка */}
      <div
        className="flex cursor-pointer flex-col gap-4 p-4 sm:flex-row sm:p-5"
        onClick={() => setExpanded((v) => !v)}
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
                {stopsLabel(f.stops)}{f.stopLabel ? ` · ${f.stopLabel}` : ""}
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

          <div className="mt-3 text-xs text-[var(--color-text-muted)]">
            {dateLabel} · {fromCity} ({fromIata}) → {toCity} ({toIata})
          </div>
        </div>

        {/* Правая часть: цена + кнопка */}
        <div className="flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-3 sm:block sm:w-44 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-right">
          <div>
            <div className="text-xl font-bold text-[var(--color-text)]">{total.toLocaleString("ru-RU")} ₽</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">за всех пассажиров</div>
            <div className={`mt-1.5 text-xs ${f.hasBaggage ? "text-green-600" : "text-[var(--color-text-muted)]"}`}>
              {f.hasBaggage ? "✓ " : ""}{f.baggageLabel}
            </div>
          </div>
          <div className="sm:mt-3" onClick={(e) => e.stopPropagation()}>
            <a
              href={`/book?${bookParams.toString()}`}
              className="block rounded-xl bg-green-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-700 sm:w-full"
            >
              Выбрать
            </a>
          </div>
        </div>
      </div>

      {/* Развёрнутая секция */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Маршрут SVG */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-[11px] font-medium text-[var(--color-text-muted)]">Маршрут</div>
              <RouteSVG fromIata={fromIata} toIata={toIata} stops={f.stops} />
              {f.stopCities && f.stopCities.length > 0 && (
                <div className="text-[11px] text-amber-600">
                  Пересадка: {f.stopLabel}
                </div>
              )}
            </div>

            {/* Вертикальный разделитель */}
            <div className="hidden w-px bg-[var(--color-border)] sm:block" />
            <div className="h-px bg-[var(--color-border)] sm:hidden" />

            {/* Условия тарифа */}
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[var(--color-text)]">Условия тарифа</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">{f.aircraft}</div>
              </div>
              <div className="divide-y divide-[var(--color-border)]">
                <TariffRow
                  label="Ручная кладь"
                  value={`${f.tariff.handKg} кг включено`}
                  ok={true}
                />
                <TariffRow
                  label="Багаж"
                  value={f.tariff.baggageKg ? `${f.tariff.baggageKg} кг включено` : "Не включён (+доплата)"}
                  ok={f.tariff.baggageKg !== null}
                />
                <TariffRow
                  label="Возврат"
                  value={f.tariff.refundable ? "Возможен" : "Невозможен"}
                  ok={f.tariff.refundable}
                />
                <TariffRow
                  label="Обмен"
                  value={
                    !f.tariff.changeable
                      ? "Невозможен"
                      : f.tariff.changeFee
                      ? `Платный · ${f.tariff.changeFee.toLocaleString("ru-RU")} ₽`
                      : "Бесплатно"
                  }
                  ok={f.tariff.changeable}
                />
              </div>
            </div>

            {/* Вертикальный разделитель */}
            <div className="hidden w-px bg-[var(--color-border)] sm:block" />
            <div className="h-px bg-[var(--color-border)] sm:hidden" />

            {/* Детали рейса */}
            <div className="min-w-[140px]">
              <div className="mb-2 text-[13px] font-semibold text-[var(--color-text)]">Детали рейса</div>
              <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
                <div><span className="font-medium text-[var(--color-text)]">Рейс:</span> {f.flightNumber}</div>
                <div><span className="font-medium text-[var(--color-text)]">Самолёт:</span> {f.aircraft}</div>
                <div><span className="font-medium text-[var(--color-text)]">Вылет:</span> {f.departTime} ({fromIata})</div>
                <div><span className="font-medium text-[var(--color-text)]">Прилёт:</span> {f.arriveTime} ({toIata})</div>
                <div><span className="font-medium text-[var(--color-text)]">В пути:</span> {formatDuration(f.durationMin)}</div>
              </div>
              <a
                href={`/book?${bookParams.toString()}`}
                className="mt-4 block rounded-xl bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Забронировать
              </a>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
