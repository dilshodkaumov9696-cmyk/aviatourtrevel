"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then(() => setApiStatus("ok"))
      .catch(() => setApiStatus("error"));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-[var(--color-primary)]">Aviator</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
            <a href="#" className="hover:text-[var(--color-primary)]">Авиабилеты</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Направления</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Акции</a>
            <a href="#" className="hover:text-[var(--color-primary)]">Помощь</a>
          </nav>
          <button className="rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative flex flex-col items-center justify-center px-6 py-24 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
        }}
      >
        <div className="mx-auto max-w-4xl text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Найдите дешёвые авиабилеты
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            Сравниваем сотни авиакомпаний и агентств за секунды
          </p>

          {/* Search form (placeholder) */}
          <div className="mt-10 rounded-2xl bg-white p-4 md:p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Откуда"
                className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] outline-none"
              />
              <input
                type="text"
                placeholder="Куда"
                className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] outline-none"
              />
              <input
                type="text"
                placeholder="Дата вылета"
                className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] outline-none"
              />
              <button className="rounded-lg bg-[var(--color-accent)] px-6 py-3 font-bold text-white hover:bg-[var(--color-accent-dark)] transition">
                Найти билеты
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "💰", title: "Лучшая цена", text: "Сравниваем сотни источников за один поиск" },
            { icon: "🕐", title: "Поддержка 24/7", text: "Поможем с бронированием в любое время" },
            { icon: "🛡️", title: "Безопасно", text: "Защищённая оплата и проверенные партнёры" },
          ].map((a) => (
            <div key={a.title} className="text-center">
              <div className="text-5xl mb-3">{a.icon}</div>
              <h3 className="text-xl font-bold text-[var(--color-primary)]">{a.title}</h3>
              <p className="mt-2 text-[var(--color-text-muted)]">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dev status */}
      <section className="bg-[var(--color-bg-soft)] py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--color-border)] px-4 py-2 text-sm">
            <span>Backend API:</span>
            {apiStatus === "loading" && <span className="text-[var(--color-text-muted)]">проверка…</span>}
            {apiStatus === "ok" && <span className="text-green-600 font-medium">● работает</span>}
            {apiStatus === "error" && <span className="text-red-600 font-medium">● недоступен</span>}
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Этап 0 — каркас проекта. Следующий шаг: реальный поиск через провайдер.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-primary-dark)] text-white/80 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">© 2026 Aviator. Сайт продажи авиабилетов.</div>
          <div className="text-xs text-white/50">aviator_web v0.1.0 · dev</div>
        </div>
      </footer>
    </div>
  );
}
