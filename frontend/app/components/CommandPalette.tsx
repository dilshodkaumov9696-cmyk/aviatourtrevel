"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Airport, loadAirports, rankAirports, getPopularAirports } from "../data/airports";
import { IconPin, IconPlane, IconSearch } from "./icons";

// Дата по умолчанию для быстрого поиска — через 7 дней.
function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [all, setAll] = useState<Airport[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Глобальные горячие клавиши: Cmd/Ctrl+K — открыть, Esc — закрыть.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      loadAirports().then(setAll).catch(() => {});
      setQuery("");
      setHighlighted(0);
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 30);
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const results = useMemo<Airport[]>(() => {
    if (query.trim().length < 1) return getPopularAirports(7);
    return rankAirports(all, query, 7);
  }, [query, all]);

  useEffect(() => setHighlighted(0), [query]);

  function go(a: Airport) {
    const params = new URLSearchParams({
      fromCity: "Москва", fromIata: "MOW",
      toCity: a.city, toIata: a.iata,
      date: defaultDate(), adults: "1", children: "0", infants: "0", cabin: "economy",
    });
    setOpen(false);
    router.push(`/search?${params.toString()}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlighted]) go(results[highlighted]);
    }
  }

  if (!open) return null;

  const showingPopular = query.trim().length < 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="animate-scale-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
        {/* Строка ввода */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
          <IconSearch size={20} className="shrink-0 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Куда летим? Город или аэропорт…"
            className="w-full bg-transparent text-[16px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="hidden shrink-0 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] sm:block">
            ESC
          </kbd>
        </div>

        {/* Результаты */}
        <div className="max-h-[52vh] overflow-auto p-2">
          <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            {showingPopular ? "Популярные направления" : "Результаты"}
          </div>
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">Ничего не найдено</div>
          ) : (
            <ul>
              {results.map((a, i) => {
                const isCity = a.name === a.city || a.name === "Все аэропорты";
                const active = i === highlighted;
                return (
                  <li
                    key={a.iata}
                    onMouseDown={() => go(a)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                      active ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-bg-soft)]"
                    }`}
                  >
                    {isCity ? (
                      <IconPin size={18} className="shrink-0 text-[var(--color-primary)]" />
                    ) : (
                      <IconPlane size={16} className="shrink-0 rotate-45 text-[var(--color-text-muted)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-[var(--color-text)]">{a.city}</div>
                      <div className="truncate text-[13px] text-[var(--color-text-muted)]">
                        {isCity ? a.country : `${a.name} · ${a.country}`}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-[var(--color-bg-soft)] px-2 py-1 text-[11px] font-bold tracking-wide text-[var(--color-text-muted)]">
                      {a.iata}
                    </span>
                    {active && (
                      <kbd className="hidden shrink-0 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)] sm:flex">
                        ↵
                      </kbd>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Подвал-подсказка */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-[11px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5">↓</kbd>
            навигация
          </span>
          <span className="flex items-center gap-1.5">
            от Москвы · вылет через неделю
          </span>
        </div>
      </div>
    </div>
  );
}
