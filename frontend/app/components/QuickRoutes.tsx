"use client";

import { useSettings } from "../context/settings";
import { IconPlane } from "./icons";

export interface QuickRouteDestination {
  city: string;
  country: string;
  iata: string;
}

interface Props {
  originCity: string;
  originIata: string;
  destinations: QuickRouteDestination[];
  /** null = реальной цены нет (см. PopularDirectionsPanel) — не выдумываем. */
  prices: Record<string, number | null>;
  onSelect: (city: string, iata: string, country: string) => void;
}

// Рабочие шорткаты маршрутов под формой поиска — не декоративные чипы: клик
// заполняет Откуда/Куда и синхронизирует глобус (тот же state, что у формы).
export default function QuickRoutes({ originCity, originIata, destinations, prices, onSelect }: Props) {
  const { format } = useSettings();
  const items = destinations.filter((d) => d.iata !== originIata);
  if (items.length === 0) return null;

  return (
    <div className="flex w-full flex-wrap gap-2 px-1" title={`Быстрые маршруты из ${originCity}`}>
      {items.map((d) => {
        const price = prices[d.iata];
        return (
          <button
            key={d.iata}
            type="button"
            onClick={() => onSelect(d.city, d.iata, d.country)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-white/15"
          >
            <span className="font-mono text-[12px] font-semibold">{originIata}</span>
            <IconPlane size={11} className="rotate-90 opacity-70" />
            <span className="font-mono text-[12px] font-semibold">{d.iata}</span>
            <span className="opacity-50">·</span>
            <span className="text-[12px] font-medium text-[#8CF5C4]">
              {price != null ? `от ${format(price)}` : "уточняется"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
