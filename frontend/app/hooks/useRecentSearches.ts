"use client";

import { useCallback, useEffect, useState } from "react";

export interface RecentSearch {
  fromCity: string;
  fromIata: string;
  toCity: string;
  toIata: string;
  date: string;
  returnDate?: string;
  adults: number;
  ts: number;
}

const KEY = "aviatour:recent-searches";
const MAX = 6;

function read(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const add = useCallback((entry: Omit<RecentSearch, "ts">) => {
    const next = [
      { ...entry, ts: Date.now() },
      ...read().filter((s) => !(s.fromIata === entry.fromIata && s.toIata === entry.toIata)),
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
  }, []);

  return { items, add };
}
