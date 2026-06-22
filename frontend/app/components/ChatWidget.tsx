"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  from: "agent" | "user";
  text: string;
  time: string;
}

const QUICK_REPLIES = [
  "Как забронировать билет?",
  "Возврат и обмен",
  "Нормы багажа",
  "Способы оплаты",
];

const AUTO_REPLIES: Record<string, string> = {
  "Как забронировать билет?":
    "Выберите рейс в результатах поиска, нажмите «Выбрать», заполните данные пассажира и оплатите картой или через СБП. Билет придёт на email 🙂",
  "Возврат и обмен":
    "Условия зависят от тарифа. На странице оформления есть блок «Сравнение тарифов» — там видно, возвратный билет или нет.",
  "Нормы багажа":
    "У каждого рейса указано: ручная кладь и багаж. Тарифы Standard и Comfort включают багаж 20–23 кг.",
  "Способы оплаты":
    "Принимаем Visa, Mastercard, МИР, UnionPay, а также СБП и рассрочку через ЮKassa.",
};

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "agent",
      text: "Здравствуйте! Меня зовут Анна, я консультант Aviator. Чем могу помочь? ✈️",
      time: nowTime(),
    },
  ]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(false);
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, typing]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  function reply(question: string) {
    const answer =
      AUTO_REPLIES[question] ??
      "Спасибо за вопрос! Сейчас уточню детали и вернусь к вам. А пока вы можете выбрать рейс на главной странице.";
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "agent", text: answer, time: nowTime() }]);
      if (!open) setUnread(true);
    }, 1100);
  }

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "user", text: t, time: nowTime() }]);
    setInput("");
    reply(t);
  }

  return (
    <>
      {/* Окно чата */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
          {/* Шапка */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white"
            style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">А</div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-primary)] bg-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">Анна · консультант</div>
              <div className="flex items-center gap-1 text-[11px] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> онлайн, ответит за минуту
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
              className="text-xl leading-none text-white/80 transition hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Лента сообщений */}
          <div ref={bodyRef} className="flex max-h-[46vh] min-h-[220px] flex-col gap-2.5 overflow-y-auto bg-[var(--color-bg-soft)] p-3.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                    m.from === "user"
                      ? "rounded-br-sm bg-[var(--color-primary)] text-white"
                      : "rounded-bl-sm bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1 text-[10px] ${m.from === "user" ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-[var(--color-surface)] px-3.5 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-text-muted)] [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-text-muted)] [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-text-muted)]" />
                  </div>
                </div>
              </div>
            )}

            {/* Быстрые ответы — только в начале */}
            {messages.length <= 1 && !typing && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-[var(--color-primary)] bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ввод */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-2.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите сообщение…"
              className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
            />
            <button
              type="submit"
              aria-label="Отправить"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-40"
              disabled={!input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Кнопка-пузырь */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Чат с консультантом"
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {/* Зелёный индикатор «онлайн» */}
            <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
            {unread && (
              <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                1
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
