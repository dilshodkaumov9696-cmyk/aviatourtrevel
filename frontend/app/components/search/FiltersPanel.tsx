"use client";

export interface FilterState {
  stopsMax: number | null;
  priceMax: number;
  baggageOnly: boolean;
  isNight: boolean;
  fastestOnly: boolean;
  airlines: Set<string>;
  departAirports: Set<string>;
  arriveAirports: Set<string>;
}

interface Props {
  state: FilterState;
  set: (patch: Partial<FilterState>) => void;
  priceBounds: [number, number];
  airlineList: { code: string; name: string }[];
  departAirportList: { iata: string; name: string }[];
  arriveAirportList: { iata: string; name: string }[];
}

const STOPS_OPTS: { v: number | null; label: string }[] = [
  { v: null, label: "Все варианты" },
  { v: 0, label: "Без пересадок" },
  { v: 1, label: "До 1 пересадки" },
  { v: 2, label: "До 2 пересадок" },
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

export default function FiltersPanel({ state, set, priceBounds, airlineList, departAirportList = [], arriveAirportList = [] }: Props) {
  const [min, max] = priceBounds;

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

  return (
    <div className="text-sm">
      {/* Быстрые тогглы */}
      <FGroup title="Параметры рейса">
        <Toggle checked={state.isNight} onChange={(v) => set({ isNight: v })} label="Ночной рейс" />
        <Toggle checked={state.fastestOnly} onChange={(v) => set({ fastestOnly: v })} label="Самый быстрый" />
        <label className="flex cursor-pointer items-center justify-between py-1.5">
          <span className="text-sm text-[var(--color-text-muted)]">Только с багажом</span>
          <button
            type="button"
            role="switch"
            aria-checked={state.baggageOnly}
            onClick={() => set({ baggageOnly: !state.baggageOnly })}
            className={`relative h-5 w-9 rounded-full transition-colors ${state.baggageOnly ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${state.baggageOnly ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </label>
      </FGroup>

      {/* Пересадки */}
      <FGroup title="Пересадки">
        {STOPS_OPTS.map((o) => (
          <label key={String(o.v)} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
            <input
              type="radio"
              name="stops"
              checked={state.stopsMax === o.v}
              onChange={() => set({ stopsMax: o.v })}
              className="accent-[var(--color-primary)]"
            />
            {o.label}
          </label>
        ))}
      </FGroup>

      {/* Цена */}
      <FGroup title="Цена">
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
          <span>до</span>
          <span className="font-semibold text-[var(--color-text)]">{state.priceMax.toLocaleString("ru-RU")} ₽</span>
        </div>
      </FGroup>

      {/* Аэропорты вылета */}
      {departAirportList.length > 1 && (
        <FGroup title="Аэропорт вылета">
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
        <FGroup title="Аэропорт прилёта">
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
      <FGroup title="Авиакомпании" last>
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
