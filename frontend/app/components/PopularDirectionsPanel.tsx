"use client";

import { useSettings } from "../context/settings";
import { IconPin } from "./icons";

export interface PopularRoute {
  fromCity: string;
  fromCountry: string;
  fromIata: string;
  toCity: string;
  toCountry: string;
  toIata: string;
}

interface Props {
  routes: readonly PopularRoute[];
  prices: Record<string, number | null>;
  onSelect: (route: PopularRoute) => void;
}

export default function PopularDirectionsPanel({ routes, prices, onSelect }: Props) {
  const { format, t } = useSettings();

  return (
    <div className="relative z-[20] rounded-2xl border border-white/12 bg-[var(--color-ink)]/55 p-3 text-white shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 px-1.5 py-1 text-[13px] font-bold uppercase tracking-wide">
        <IconPin size={16} className="text-[var(--color-accent)]" />
        {t("popular.title")}
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        {routes.map((d) => {
          const key = `${d.fromIata}-${d.toIata}`;
          const price = prices[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-white/10"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {d.fromCity} → {d.toCity}
                </span>
                <span className="block truncate font-mono text-[11px] text-white/55">
                  {d.fromIata} · {d.toIata}
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[#E8B84A]">
                {price != null ? `${t("filters.price_from")} ${format(price)}` : t("popular.price_tba")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
