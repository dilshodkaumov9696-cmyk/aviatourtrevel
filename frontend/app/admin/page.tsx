"use client";

import { FormEvent, useState } from "react";
import { listManagerOrders, resendOrderEmail, type OrderSummary } from "../lib/api";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  async function load(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); try { setOrders(await listManagerOrders(key)); } catch (e) { setError(e instanceof Error ? e.message : "Ошибка доступа"); } finally { setLoading(false); } }
  return <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-12 text-[var(--color-text)]"><div className="mx-auto max-w-5xl">
    <h1 className="text-3xl font-bold">Панель оператора</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">Заявки и повторная отправка подтверждений. Ключ не сохраняется в браузере.</p>
    <form onSubmit={load} className="mt-6 flex gap-2"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ключ оператора" required className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-primary)]"/><button className="rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white">{loading ? "Загрузка…" : "Открыть"}</button></form>
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}{notice && <p className="mt-4 text-sm text-green-600">{notice}</p>}
    {orders.length > 0 && <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"><div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--color-border)] px-5 py-3 text-xs font-bold uppercase text-[var(--color-text-muted)]"><span>{orders.length} заявок</span><span>Действие</span></div>{orders.map((order) => <div key={order.ref} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--color-border)] px-5 py-4 last:border-0"><div><div className="font-semibold">{order.ref} · {order.origin} → {order.destination}</div><div className="mt-1 text-xs text-[var(--color-text-muted)]">{order.statusLabel} · {order.paxCount} пассажир(а) · {Math.round(order.totalAmount).toLocaleString("ru-RU")} {order.currency}</div></div><button onClick={async () => { try { await resendOrderEmail(order.ref, key); setNotice(`Подтверждение ${order.ref} отправлено повторно`); } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); } }} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:border-[var(--color-primary)]">Email</button></div>)}</div>}
  </div></main>;
}
