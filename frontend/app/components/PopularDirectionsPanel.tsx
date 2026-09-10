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
    <div className="relative z-[20] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[var(--color-text)]">
      <div className="flex items-center gap-2 px-1.5 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        <span className="nav-icon nav-icon--drop inline-flex shrink-0 items-center justify-center">
          <IconPin size={15} className="nav-icon__img text-[var(--color-primary)]" />
        </span>
        {t("popular.title")}
      </div>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {routes.map((d) => {
          const key = `${d.fromIata}-${d.toIata}`;
          const price = prices[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(d)}
              className="group flex min-h-11 items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition hover:bg-[var(--color-bg-soft)]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {d.fromCity}
                  <span className="mx-1 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  {d.toCity}
                </span>
                <span className="block truncate font-mono text-[11px] text-[var(--color-text-muted)]">
                  {d.fromIata} · {d.toIata}
                </span>
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[var(--color-primary)]">
                {price != null ? `${t("filters.price_from")} ${format(price)}` : t("popular.price_tba")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
