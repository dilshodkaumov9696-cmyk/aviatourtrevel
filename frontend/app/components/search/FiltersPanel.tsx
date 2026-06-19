"use client";

import { useSettings } from "../../context/settings";
import { formatDuration } from "../../data/flights";

export type BaggageMode = "all" | "with" | "without";
export type TimePeriod = "morning" | "day" | "evening" | "night";

export interface FilterState {
  stopsMax: number | null;
  priceMin: number;
  priceMax: number;
  durationMax: number;
  baggageMode: BaggageMode;
  timePeriods: Set<TimePeriod>;
  fastestOnly: boolean;
  airlines: Set<string>;
  departAirports: Set<string>;
  arriveAirports: Set<string>;
}

interface Props {
  state: FilterState;
  set: (patch: Partial<FilterState>) => void;
  priceBounds: [number, number];
  durationBounds: [number, number];
  airlineList: { code: string; name: string }[];
  departAirportList: { iata: string; name: string }[];
  arriveAirportList: { iata: string; name: string }[];
}

const STOPS_OPTS: { v: number | null; key: string }[] = [
  { v: null, key: "filters.stops_all" },
  { v: 0, key: "filters.stops_0" },
  { v: 1, key: "filters.stops_1" },
  { v: 2, key: "filters.stops_2" },
];

const BAGGAGE_OPTS: { v: BaggageMode; key: string }[] = [
  { v: "all", key: "filters.baggage_all" },
  { v: "with", key: "filters.baggage_with" },
  { v: "without", key: "filters.baggage_without" },
];

const TIME_OPTS: { v: TimePeriod; key: string; range: string }[] = [
  { v: "morning", key: "filters.time_morning", range: "06:00-11:59" },
  { v: "day", key: "filters.time_day", range: "12:00-17:59" },
  { v: "evening", key: "filters.time_evening", range: "18:00-23:59" },
  { v: "night", key: "filters.time_night", range: "00:00-05:59" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </button>
    </label>
  );
}

export default function FiltersPanel({ state, set, priceBounds, durationBounds, airlineList, departAirportList = [], arriveAirportList = [] }: Props) {
  const { format, t } = useSettings();
  const [min, max] = priceBounds;
  const [, durationMax] = durationBounds;

  function toggleAirline(code: string) {
    const next = new Set(state.airlines);
    if (next.has(code)) next.delete(code); else next.add(code);
    set({ airlines: next });
  }

  function toggleAirport(iata: string, which: "depart" | "arrive") {
    const key = which === "depart" ? "departAirports" : "arriveAirports";
    const next = new Set(state[key]);
    if (next.has(iata)) next.delete(iata); else next.add(iata);
    set({ [key]: next } as Partial<FilterState>);
  }

  function toggleTime(period: TimePeriod) {
    const next = new Set(state.timePeriods);
    if (next.has(period)) next.delete(period); else next.add(period);
    set({ timePeriods: next });
  }

  return (
    <div className="text-sm">
      {/* Быстрые тогглы */}
      <FGroup title={t("filters.params")}>
        <Toggle checked={state.fastestOnly} onChange={(v) => set({ fastestOnly: v })} label={t("filters.fastest")} />
      </FGroup>

      {/* Багаж */}
      <FGroup title={t("filters.baggage")}>
        {BAGGAGE_OPTS.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
            <input
              type="radio"
              name="baggage"
              checked={state.baggageMode === o.v}
              onChange={() => set({ baggageMode: o.v })}
              className="accent-[var(--color-primary)]"
            />
            {t(o.key)}
          </label>
        ))}
      </FGroup>

      {/* Время вылета */}
      <FGroup title={t("filters.departure_time")}>
        {TIME_OPTS.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={state.timePeriods.has(o.v)}
              onChange={() => toggleTime(o.v)}
              className="accent-[var(--color-primary)]"
            />
            <span>{t(o.key)}</span>
            <span className="ml-auto text-[11px]">{o.range}</span>
          </label>
        ))}
      </FGroup>

      {/* Пересадки */}
      <FGroup title={t("filters.stops")}>
        {STOPS_OPTS.map((o) => (
          <label key={String(o.v)} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
            <input
              type="radio"
              name="stops"
              checked={state.stopsMax === o.v}
              onChange={() => set({ stopsMax: o.v })}
              className="accent-[var(--color-primary)]"
            />
            {t(o.key)}
          </label>
        ))}
      </FGroup>

      {/* Цена */}
      <FGroup title={t("filters.price")}>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-[var(--color-text-muted)]">
            {t("filters.price_from")}
            <input
              type="number"
              min={min}
              max={state.priceMax}
              step={100}
              value={state.priceMin}
              onChange={(e) => set({ priceMin: Math.min(Number(e.target.value), state.priceMax) })}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>
          <label className="text-xs text-[var(--color-text-muted)]">
            {t("filters.price_to")}
            <input
              type="number"
              min={state.priceMin}
              max={max}
              step={100}
              value={state.priceMax}
              onChange={(e) => set({ priceMax: Math.max(Number(e.target.value), state.priceMin) })}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={state.priceMax}
          onChange={(e) => set({ priceMax: Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>{format(state.priceMin)}</span>
          <span className="font-semibold text-[var(--color-text)]">{format(state.priceMax)}</span>
        </div>
      </FGroup>

      {/* Длительность */}
      <FGroup title={t("filters.duration")}>
        <input
          type="range"
          min={0}
          max={durationMax}
          step={15}
          value={state.durationMax}
          onChange={(e) => set({ durationMax: Number(e.target.value) })}
          className="w-full accent-[var(--color-primary)]"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>{t("filters.duration_to")}</span>
          <span className="font-semibold text-[var(--color-text)]">{formatDuration(state.durationMax)}</span>
        </div>
      </FGroup>

      {/* Аэропорты вылета */}
      {departAirportList.length > 1 && (
        <FGroup title={t("filters.airport_from")}>
          {departAirportList.map((a) => (
            <label key={a.iata} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={state.departAirports.has(a.iata)}
                onChange={() => toggleAirport(a.iata, "depart")}
                className="accent-[var(--color-primary)]"
              />
              <span>{a.name}</span>
              <span className="ml-auto text-[11px]">{a.iata}</span>
            </label>
          ))}
        </FGroup>
      )}

      {/* Аэропорты прилёта */}
      {arriveAirportList.length > 1 && (
        <FGroup title={t("filters.airport_to")}>
          {arriveAirportList.map((a) => (
            <label key={a.iata} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={state.arriveAirports.has(a.iata)}
                onChange={() => toggleAirport(a.iata, "arrive")}
                className="accent-[var(--color-primary)]"
              />
              <span>{a.name}</span>
              <span className="ml-auto text-[11px]">{a.iata}</span>
            </label>
          ))}
        </FGroup>
      )}

      {/* Авиакомпании */}
      <FGroup title={t("filters.airlines")} last>
        {airlineList.map((a) => (
          <label key={a.code} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
            <input
              type="checkbox"
              checked={state.airlines.has(a.code)}
              onChange={() => toggleAirline(a.code)}
              className="accent-[var(--color-primary)]"
            />
            {a.name}
          </label>
        ))}
      </FGroup>
    </div>
  );
}

function FGroup({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`py-3.5 ${last ? "" : "border-b border-[var(--color-border)]"}`}>
      <div className="mb-2 font-semibold text-[var(--color-text)]">{title}</div>
      {children}
    </div>
  );
}
