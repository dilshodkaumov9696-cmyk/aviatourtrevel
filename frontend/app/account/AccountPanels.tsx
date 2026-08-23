"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { listOrders, type OrderSummary } from "../lib/api";
import { useRecentSearches } from "../hooks/useRecentSearches";

// Пока авторизации нет, заявки находятся по адресу почты. Запоминаем его,
// чтобы не вводить заново при каждом заходе.
const EMAIL_KEY = "aviator:account-email";

const STATUS_TONE: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  awaiting_payment: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  issued: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function fmtMoney(v: number, currency: string) {
  return `${Math.round(v).toLocaleString("ru-RU")} ${currency === "RUB" ? "₽" : currency}`;
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${m}.${y}`;
}

export function MyOrders() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (mail: string) => {
    setLoading(true);
    setError("");
    try {
      setOrders(await listOrders(mail));
      localStorage.setItem(EMAIL_KEY, mail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить заявки");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Заходили раньше — сразу показываем заявки, не заставляя вводить почту.
  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      void load(saved);
    }
  }, [load]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) void load(email);
        }}
        className="mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Почта, указанная при оформлении"
          className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
        />
        <button
          type="submit"
          disabled={loading || !email}
          className="shrink-0 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Ищем…" : "Показать"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {orders?.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="text-4xl">🎫</span>
          <div>
            <div className="text-sm font-semibold text-[var(--color-text)]">Заявок по этой почте нет</div>
            <div className="mt-1 max-w-xs text-xs text-[var(--color-text-muted)]">
              Проверьте адрес — заявка ищется по той почте, которую вы указали при оформлении.
            </div>
          </div>
          <Link
            href="/#search"
            className="inline-block rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Найти рейс
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.ref}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-[var(--color-text)]">{o.ref}</span>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    STATUS_TONE[o.status] ?? "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {o.statusLabel}
                </span>
              </div>

              <div className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {o.origin} → {o.destination}
                {o.flightNumber && (
                  <span className="ml-2 font-normal text-[var(--color-text-muted)]">{o.flightNumber}</span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
                <span>
                  {fmtDate(o.departDate)}
                  {o.returnDate ? ` — ${fmtDate(o.returnDate)}` : ""}
                </span>
                <span>
                  {o.paxCount} {o.paxCount === 1 ? "пассажир" : o.paxCount < 5 ? "пассажира" : "пассажиров"}
                </span>
                <span>{o.tariff}</span>
                {o.seat && <span>место {o.seat}</span>}
              </div>

              <div className="mt-2 text-base font-bold text-[var(--color-text)]">
                {fmtMoney(o.totalAmount, o.currency)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SearchHistory() {
  const { items } = useRecentSearches();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="text-4xl">🔍</span>
        <div>
          <div className="text-sm font-semibold text-[var(--color-text)]">История пуста</div>
          <div className="mt-1 max-w-xs text-xs text-[var(--color-text-muted)]">
            Маршруты, которые вы искали, будут отображаться здесь.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((s, i) => (
        <li key={`${s.fromIata}-${s.toIata}-${i}`}>
          <Link
            href={`/search?fromCity=${encodeURIComponent(s.fromCity)}&fromIata=${s.fromIata}&toCity=${encodeURIComponent(s.toCity)}&toIata=${s.toIata}&date=${s.date}${s.returnDate ? `&returnDate=${s.returnDate}` : ""}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 transition hover:border-[var(--color-primary)]"
          >
            <span className="min-w-0 truncate text-sm font-medium text-[var(--color-text)]">
              {s.fromCity} → {s.toCity}
            </span>
            <span className="shrink-0 text-xs text-[var(--color-text-muted)]">{fmtDate(s.date)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
