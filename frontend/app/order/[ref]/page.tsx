"use client";

import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { getOrder, type OrderSummary } from "../../lib/api";

export default function OrderStatusPage() {
  const params = useParams<{ ref: string }>();
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { setOrder(await getOrder(params.ref, email)); }
    catch (e) { setOrder(null); setError(e instanceof Error ? e.message : "Не удалось загрузить заявку"); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-16 text-[var(--color-text)]">
    <section className="mx-auto max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm sm:p-9">
      <p className="text-sm font-semibold text-[var(--color-primary)]">СТАТУС ЗАЯВКИ</p>
      <h1 className="mt-2 text-3xl font-bold">{params.ref}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Для защиты данных подтвердите почту, указанную при оформлении.</p>
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2.5 outline-none focus:border-[var(--color-primary)]" />
        <button disabled={loading} className="rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-60">{loading ? "…" : "Проверить"}</button>
      </form>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {order && <div className="mt-6 rounded-2xl bg-[var(--color-bg-soft)] p-5">
        <div className="flex items-center justify-between gap-3"><span className="font-semibold">{order.origin} → {order.destination}</span><span className="rounded-lg bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">{order.statusLabel}</span></div>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">Вылет: {order.departDate.split("-").reverse().join(".")} · {order.paxCount} пассажир(а)</p>
        <p className="mt-2 text-lg font-bold">{Math.round(order.totalAmount).toLocaleString("ru-RU")} {order.currency === "RUB" ? "₽" : order.currency}</p>
      </div>}
      <Link href="/account" className="mt-6 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline">Все мои заявки →</Link>
    </section>
  </main>;
}
