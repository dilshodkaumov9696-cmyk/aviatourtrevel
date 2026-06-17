"use client";

import { useEffect, useRef, useState } from "react";
import { Airport, loadAirports, rankAirports } from "../data/airports";

interface Props {
  airport: Airport | null;
  onChange: (airport: Airport | null) => void;
  label: string;
  placeholder: string;
  error?: string;
  excludeIata?: string;
}

export default function AirportInput({ airport, onChange, label, placeholder, error, excludeIata }: Props) {
  const [query, setQuery] = useState(airport?.city ?? "");
  const [all, setAll] = useState<Airport[]>([]);
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false); // не переоткрывать список сразу после выбора

  // Загружаем полную базу один раз (кеш на уровне модуля)
  useEffect(() => {
    loadAirports().then(setAll).catch(() => {});
  }, []);

  // Sync when airport changes externally (swap / выбор) — без переоткрытия списка
  useEffect(() => {
    justSelectedRef.current = true;
    setQuery(airport?.city ?? "");
  }, [airport]);

  // Filter airports as user types
  useEffect(() => {
    // Только что выбрали аэропорт — не переоткрывать выпадашку из-за смены query
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      setResults([]);
      setOpen(false);
      return;
    }
    if (query.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    const filtered = rankAirports(all, query, 7, excludeIata);
    setResults(filtered);
    setOpen(filtered.length > 0);
    setHighlighted(0);
  }, [query, all, excludeIata]);

  // Close on outside click, reset to last valid value
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(airport?.city ?? "");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [airport]);

  function select(a: Airport) {
    justSelectedRef.current = true;
    setQuery(a.city);
    setResults([]);
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
      if (results[highlighted]) select(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(airport?.city ?? "");
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setQuery("");
    onChange(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={ref} className="relative min-w-0">
      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) onChange(null);
          }}
          onKeyDown={handleKey}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-sm leading-none"
        />
        {airport && (
          <span className="flex-shrink-0 text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-1.5 py-0.5 rounded">
            {airport.iata}
          </span>
        )}
        {query && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition text-xs leading-none"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>
      {error && (
        <span className="block text-xs text-red-500 mt-0.5">{error}</span>
      )}

      {open && (
        <ul className="absolute top-full left-0 mt-2 z-50 bg-white border border-[var(--color-border)] rounded-xl shadow-2xl py-1 min-w-[280px] max-h-[340px] overflow-auto">
          {results.map((a, i) => (
            <li
              key={a.iata}
              onMouseDown={() => select(a)}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition ${
                i === highlighted
                  ? "bg-[var(--color-primary-light)]"
                  : "hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              <span className="w-9 flex-shrink-0 text-sm font-bold text-[var(--color-primary)]">
                {a.iata}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--color-text)] truncate">
                  {a.city}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] truncate">
                  {a.name} · {a.country}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
