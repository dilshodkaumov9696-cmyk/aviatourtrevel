"use client";

export interface FilterState {
  stopsMax: number | null; // null = любое
  priceMax: number;
  baggageOnly: boolean;
  airlines: Set<string>; // выбранные коды
}

interface Props {
  state: FilterState;
  set: (patch: Partial<FilterState>) => void;
  priceBounds: [number, number];
  airlineList: { code: string; name: string }[];
}

const STOPS_OPTS: { v: number | null; label: string }[] = [
  { v: null, label: "Все варианты" },
  { v: 0, label: "Без пересадок" },
  { v: 1, label: "До 1 пересадки" },
  { v: 2, label: "До 2 пересадок" },
];

export default function FiltersPanel({ state, set, priceBounds, airlineList }: Props) {
  const [min, max] = priceBounds;

  function toggleAirline(code: string) {
    const next = new Set(state.airlines);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    set({ airlines: next });
  }

  return (
    <div className="text-sm">
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

      <FGroup title="Багаж">
        <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[var(--color-text-muted)]">
          <input
            type="checkbox"
            checked={state.baggageOnly}
            onChange={(e) => set({ baggageOnly: e.target.checked })}
            className="accent-[var(--color-primary)]"
          />
          Только с багажом
        </label>
      </FGroup>

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
