"use client";

import { useSettings } from "../context/settings";

export interface PopularDestination {
  city: string;
  country: string;
  iata: string;
}

interface Props {
  destinations: PopularDestination[];
  /** null = запрос не дал цену (реальный API пуст/ошибка) — показываем "Цена уточняется",
   *  ничего не выдумываем. Отсутствие ключа — ещё грузится, тоже "Цена уточняется". */
  prices: Record<string, number | null>;
  onSelect: (city: string, iata: string, country: string) => void;
}

export default function PopularDirectionsPanel({ destinations, prices, onSelect }: Props) {
  const { format } = useSettings();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
      <div className="px-1.5 pb-2 text-[11px] font-bold tracking-wide text-white/60 uppercase">
        Популярные направления
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {destinations.map((d) => {
          const price = prices[d.iata];
          return (
            <button
              key={d.iata}
              type="button"
              onClick={() => onSelect(d.city, d.iata, d.country)}
              className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/10"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-white">{d.city}</span>
                <span className="block truncate text-[11px] text-white/55">{d.country}</span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[#8CF5C4]">
                {price != null ? `от ${format(price)}` : "Цена уточняется"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
