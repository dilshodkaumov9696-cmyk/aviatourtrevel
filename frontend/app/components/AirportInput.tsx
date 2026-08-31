"use client";

import { useEffect, useRef, useState } from "react";
import { Airport, AirportSearchResult, loadAirports, searchAirports, getPopularAirports } from "../data/airports";
import { IconPin, IconPlane } from "./icons";

interface Props {
  airport: Airport | null;
  onChange: (airport: Airport | null) => void;
  label?: string;
  placeholder: string;
  excludeIata?: string;
  onQueryChange?: (query: string) => void;
}

export default function AirportInput({ airport, onChange, label = "", placeholder, excludeIata, onQueryChange }: Props) {
  const [query, setQuery] = useState(airport?.city ?? "");
  const [all, setAll] = useState<Airport[]>([]);
  const [results, setResults] = useState<AirportSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [typedHint, setTypedHint] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAirports().then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(airport?.city ?? "");
  }, [airport]);

  // Показываем популярные направления, когда поле в фокусе, но ещё ничего не введено
  // (или введён ровно тот город, что уже выбран — т.е. пользователь просто кликнул по полю).
  const showingPopular = focused && query.trim().length < 1;

  useEffect(() => {
    if (!focused) {
      setTypedHint("");
      setResults([]);
      setOpen(false);
      return;
    }
    if (query.trim().length < 1) {
      const popular = getPopularAirports(8, excludeIata);
      setResults(popular.map((airport) => ({ airport, kind: "city", child: false })));
      setOpen(popular.length > 0);
      setHighlighted(-1);
      return;
    }
    const filtered = searchAirports(all, query, 12, excludeIata);
    setResults(filtered);
    setOpen(true);
    setHighlighted(0);
  }, [query, all, excludeIata, focused]);

  function getTypedHint(label: string, placeholder: string) {
    return placeholder || label || "City";
  }

  useEffect(() => {
    if (!label || !focused || query.trim().length > 0 || airport) {
      setTypedHint("");
      return;
    }

    const hint = getTypedHint(label, placeholder);
    setTypedHint("");
    let index = 0;
    const timer = window.setInterval(() => {
      setTypedHint(hint.slice(0, index + 1));
      index += 1;
      if (index >= hint.length) {
        window.clearInterval(timer);
      }
    }, 95);

    return () => window.clearInterval(timer);
  }, [focused, query, airport, placeholder, label]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setFocused(false);
        setOpen(false);
        setQuery(airport?.city ?? "");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [airport]);

  function select(a: Airport) {
    setFocused(false);
    setQuery(a.city);
    setOpen(false);
    onChange(a);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlighted]) select(results[highlighted].airport);
    } else if (e.key === "Escape") {
      setFocused(false);
      setOpen(false);
      setQuery(airport?.city ?? "");
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setQuery("");
    onChange(null);
    setOpen(false);
    setFocused(true);
    inputRef.current?.focus();
  }

  return (
    <div ref={ref} className="min-w-0 flex-1">
      {label ? (
        <label className="mb-0.5 block text-xs font-semibold text-[var(--color-text-muted)]">
          {label}
        </label>
      ) : null}
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setFocused(true);
            setQuery(e.target.value);
            onQueryChange?.(e.target.value);
            if (!e.target.value) onChange(null);
          }}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          placeholder={typedHint ? "" : placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal text-[15px] font-medium leading-tight outline-none focus:outline-none focus-visible:outline-none"
        />
        {airport && (
          <span className="flex-shrink-0 font-mono text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-1.5 py-0.5 rounded">
            {airport.iata}
          </span>
        )}
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition text-xs leading-none outline-none focus:outline-none focus-visible:outline-none"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>

      {typedHint && (
        <div className="mt-1 h-5 text-sm font-medium text-emerald-600 transition-all duration-200 dark:text-emerald-400">
          {typedHint}
        </div>
      )}

      {open && (
        <div className="absolute left-0 top-full z-[240] mt-2 w-full max-w-[min(420px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
          {showingPopular && (
            <div className="px-4 pb-1 pt-3 text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Популярные направления
            </div>
          )}
          <ul className="max-h-[380px] overflow-auto p-1.5">
            {results.map(({ airport: a, kind, child }, i) => {
              const isCity = showingPopular || kind === "city" || a.name === "Все аэропорты";
              const active = i === highlighted;
              return (
                <li
                  key={a.iata}
                  onMouseDown={() => select(a)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${child ? "ml-4 border-l-2 border-[var(--color-border)]" : ""} ${
                    active ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-bg-soft)]"
                  }`}
                >
                  {isCity ? (
                    <IconPin size={18} className="shrink-0 text-[var(--color-primary)]" />
                  ) : (
                    <IconPlane size={16} className="shrink-0 rotate-45 text-[var(--color-text-muted)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-[var(--color-text)]">
                      {isCity && !showingPopular ? `${a.city} — все аэропорты` : a.city}
                    </div>
                    <div className="truncate text-[13px] text-[var(--color-text-muted)]">
                      {showingPopular ? a.country : isCity ? a.country : `${a.name} · ${a.country}`}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-bold tracking-wide ${
                      isCity
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {a.iata}
                  </span>
                </li>
              );
            })}
            {!showingPopular && results.length === 0 && (
              <li className="px-4 py-5 text-sm text-[var(--color-text-muted)]">
                Ничего не найдено. Попробуйте город, страну, аэропорт или IATA-код.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
