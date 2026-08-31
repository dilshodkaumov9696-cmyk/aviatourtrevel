"use client";

import { FormEvent, useEffect, useState } from "react";
import { listManagerOrders, listManagerSupport, resendOrderEmail, updateManagerSupportStatus, type AdminSupportTicket, type OrderSummary, type SupportStatus } from "../lib/api";
import { useAuth } from "../context/auth";

const SUPPORT_LABEL: Record<SupportStatus, string> = { open: "Открыто", in_progress: "В работе", closed: "Закрыто" };
const SUPPORT_KIND_LABEL: Record<string, string> = { question: "Вопрос", refund: "Возврат", exchange: "Обмен" };

export default function AdminPage() {
  const { user } = useAuth();
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [replies, setReplies] = useState<Record<number, string>>({});

  async function fetchQueue(managerKey: string) {
    setLoading(true); setError("");
    try {
      const [o, t] = await Promise.all([listManagerOrders(managerKey), listManagerSupport(managerKey)]);
      setOrders(o); setTickets(t);
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка доступа"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (user?.isStaff) void fetchQueue("");
  }, [user?.isStaff]);

  async function load(event: FormEvent) {
    event.preventDefault();
    await fetchQueue(key);
  }
  async function setTicketStatus(id: number, status: SupportStatus) {
    try {
      const updated = await updateManagerSupportStatus(id, status, key, replies[id]);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); }
  }
  return <main className="min-h-screen bg-[var(--color-bg-soft)] px-5 py-10 text-[var(--color-text)]"><div className="mx-auto max-w-5xl">
    <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)]">
    <h1 className="font-heading text-3xl font-bold">Панель оператора</h1><p className="mt-2 text-sm text-[var(--color-text-muted)]">Заявки и обращения. Сотрудник (is_staff) входит по сессии; иначе нужен ключ оператора.</p>
    <form onSubmit={load} className="mt-6 flex flex-col gap-2 sm:flex-row"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ключ оператора (необязательно, если вы сотрудник)" className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:border-[var(--color-primary)]"/><button className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-foreground)]">{loading ? "Загрузка…" : "Открыть"}</button></form>
    </div>
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}{notice && <p className="mt-4 text-sm text-green-600">{notice}</p>}
    {orders.length > 0 && <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"><div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--color-border)] px-5 py-3 text-xs font-bold uppercase text-[var(--color-text-muted)]"><span>{orders.length} заявок</span><span>Действие</span></div>{orders.map((order) => <div key={order.ref} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--color-border)] px-5 py-4 last:border-0"><div><div className="font-semibold">{order.ref} · {order.origin} → {order.destination}</div><div className="mt-1 text-xs text-[var(--color-text-muted)]">{order.statusLabel} · {order.paxCount} пассажир(а) · {Math.round(order.totalAmount).toLocaleString("ru-RU")} {order.currency}</div></div><button onClick={async () => { try { await resendOrderEmail(order.ref, key); setNotice(`Подтверждение ${order.ref} отправлено повторно`); } catch (e) { setError(e instanceof Error ? e.message : "Ошибка"); } }} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:border-[var(--color-primary)]">Email</button></div>)}</div>}

    {tickets.length > 0 && <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-5 py-3 text-xs font-bold uppercase text-[var(--color-text-muted)]">{tickets.length} обращений в поддержку</div>
      {tickets.map((t) => <div key={t.id} className="border-b border-[var(--color-border)] px-5 py-4 last:border-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold">{SUPPORT_KIND_LABEL[t.kind] ?? t.kind} · {t.order_ref} · {t.user_email}</span>
          <select value={t.status} onChange={(e) => setTicketStatus(t.id, e.target.value as SupportStatus)} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-2 py-1.5 text-xs font-semibold">
            {(Object.keys(SUPPORT_LABEL) as SupportStatus[]).map((s) => <option key={s} value={s}>{SUPPORT_LABEL[s]}</option>)}
          </select>
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.message}</p>
        {t.operator_reply && <p className="mt-2 text-sm">Ответ: {t.operator_reply}</p>}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={replies[t.id] ?? ""} onChange={(e) => setReplies((prev) => ({ ...prev, [t.id]: e.target.value }))} placeholder="Ответ клиенту" className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3 py-2 text-sm"/>
          <button type="button" onClick={() => setTicketStatus(t.id, t.status)} className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white">Отправить ответ</button>
        </div>
      </div>)}
    </div>}
  </div></main>;
}
