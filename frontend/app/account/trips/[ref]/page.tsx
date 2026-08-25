"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cabinetData, type CabinetOrderDetail, type SupportKind } from "../../../lib/api";
import { useAuth } from "../../../context/auth";

const money = (v: number, c: string) => `${Math.round(v).toLocaleString("ru-RU")} ${c === "RUB" ? "₽" : c}`;
const date = (d: string) => d.split("-").reverse().join(".");
const time = (iso?: string | null) => (iso ? iso.slice(11, 16) : "");

const SUPPORT_KINDS: { value: SupportKind; label: string }[] = [
  { value: "question", label: "Вопрос по заявке" },
  { value: "refund", label: "Возврат билета" },
  { value: "exchange", label: "Обмен билета" },
];

export default function TripPage() {
  const { ref: orderRef } = useParams<{ ref: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<CabinetOrderDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!user) return;
    cabinetData<CabinetOrderDetail>(`/orders/${orderRef}`)
      .then(setOrder)
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Не удалось загрузить поездку"))
      .finally(() => setLoaded(true));
  }, [user, orderRef]);

  if (authLoading) return <p className="p-10 text-center text-[var(--color-text-muted)]">Загружаем…</p>;

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--color-bg-soft)] px-4 py-16">
        <section className="mx-auto max-w-xl rounded-2xl bg-[var(--color-surface)] p-8 text-center">
          <h2 className="text-xl font-bold">Войдите в личный кабинет</h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Чтобы увидеть детали поездки, нужно войти.</p>
          <Link href="/account" className="mt-5 inline-block rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">
            В кабинет
          </Link>
        </section>
      </main>
    );
  }

  async function resend() {
    setResending(true);
    setResendError("");
    setNotice("");
    try {
      await cabinetData(`/orders/${orderRef}/resend`, { method: "POST" });
      setNotice("Квитанция отправлена на вашу почту");
    } catch (e) {
      setResendError(e instanceof Error ? e.message : "Не удалось отправить письмо");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] px-4 py-8 text-[var(--color-text)]">
      <div className="mx-auto max-w-2xl">
        <Link href="/account" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
          ← Мои поездки
        </Link>

        {!loaded ? (
          <p className="mt-6 text-sm text-[var(--color-text-muted)]">Загрузка…</p>
        ) : loadError || !order ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-6 text-center text-sm text-red-700">{loadError || "Поездка не найдена"}</div>
        ) : (
          <>
            <section className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{order.origin} → {order.destination}</h1>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {date(order.depart_date)}{order.return_date ? ` — ${date(order.return_date)}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                  {order.status_label}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Field label="Рейс" value={`${order.airline ?? "Уточняется"}${order.flight_number ? " · " + order.flight_number : ""}`} />
                <Field label="Вылет" value={time(order.depart_at) || "—"} />
                <Field label="Прилёт" value={time(order.arrive_at) || "—"} />
                <Field label="Тариф" value={order.tariff} />
                {order.seat && <Field label="Место" value={order.seat} />}
                {order.pnr && <Field label="PNR" value={order.pnr} />}
                <Field label="Оплата" value={order.paid_at ? `Оплачено ${date(order.paid_at.slice(0, 10))}` : "Не оплачено"} />
                {order.ticket_numbers && <Field label="Номер билета" value={order.ticket_numbers} />}
              </dl>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <span className="font-mono text-xs text-[var(--color-text-muted)]">{order.ref}</span>
                <b className="text-lg">{money(order.total_amount, order.currency)}</b>
              </div>

              {order.passengers.length > 0 && (
                <div className="mt-5 border-t border-[var(--color-border)] pt-5">
                  <h2 className="text-sm font-bold">Пассажиры</h2>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--color-text-muted)]">
                    {order.passengers.map((p, i) => (
                      <li key={i}>{p.name} · {p.citizenship} · документ {p.document}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resend}
                disabled={resending}
                className="mt-5 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] disabled:opacity-60"
              >
                {resending ? "Отправляем…" : "Отправить квитанцию на почту"}
              </button>
              {notice && <p className="mt-3 text-sm text-green-600">{notice}</p>}
              {resendError && <p className="mt-3 text-sm text-red-600">{resendError}</p>}
            </section>

            <SupportForm orderRef={order.ref} />
          </>
        )}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function SupportForm({ orderRef }: { orderRef: string }) {
  const [kind, setKind] = useState<SupportKind>("question");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await cabinetData(`/orders/${orderRef}/support`, { method: "POST", body: JSON.stringify({ kind, message }) });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить обращение");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="text-lg font-bold">Обращение по заявке</h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Возврат, обмен или вопрос — ответим на вашу почту.</p>

      {sent ? (
        <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          Обращение отправлено. Мы ответим на вашу почту в ближайшее время.{" "}
          <button onClick={() => setSent(false)} className="font-semibold underline">
            Написать ещё
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SupportKind)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-2.5 text-sm"
          >
            {SUPPORT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
          <textarea
            required
            minLength={8}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Опишите ситуацию…"
            rows={4}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-2.5 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={sending} className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {sending ? "Отправляем…" : "Отправить"}
          </button>
        </form>
      )}
    </section>
  );
}
