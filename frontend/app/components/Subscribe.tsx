"use client";

import { useState } from "react";

function AppleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-1.72-.92-2.83-.9-1.46.02-2.8.85-3.55 2.16-1.51 2.62-.39 6.5 1.08 8.63.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.69.7 2.83.68 1.17-.02 1.91-1.06 2.62-2.11.83-1.2 1.17-2.37 1.19-2.43-.03-.01-2.28-.88-2.31-3.48z" />
      <path d="M14.69 4.5c.6-.73 1-1.74.89-2.75-.86.03-1.9.57-2.52 1.3-.55.64-1.04 1.67-.91 2.65.96.07 1.94-.49 2.54-1.2z" />
    </svg>
  );
}

function GooglePlayLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.6 2.3c-.4.2-.6.6-.6 1.1v17.2c0 .5.2.9.6 1.1l9.6-9.7L3.6 2.3z" fill="#00C3FF" />
      <path d="M16.8 8.4 13.2 12l3.6 3.6 4.4-2.5c.8-.5.8-1.7 0-2.2l-4.4-2.5z" fill="#FFCE00" />
      <path d="M13.2 12 3.6 21.7c.4.3 1 .3 1.5 0l11.7-6.6L13.2 12z" fill="#FF3B44" />
      <path d="M5.1 2.3c-.5-.3-1.1-.3-1.5 0L13.2 12l3.6-3.6L5.1 2.3z" fill="#00D26A" />
    </svg>
  );
}

function StoreBadge({ logo, top, bottom }: { logo: React.ReactNode; top: string; bottom: string }) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/15 transition hover:bg-black/80"
    >
      <span className="text-white">{logo}</span>
      <span className="flex flex-col text-left leading-tight text-white">
        <span className="text-[10px] text-white/70">{top}</span>
        <span className="-mt-0.5 text-[15px] font-semibold">{bottom}</span>
      </span>
    </a>
  );
}

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      setError("Проверьте адрес электронной почты");
      return;
    }
    setError("");
    setDone(true);
  }

  return (
    <section className="bg-[var(--color-bg)] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="grid overflow-hidden rounded-3xl shadow-xl md:grid-cols-2"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)" }}
        >
          {/* Подписка */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white md:text-3xl">Подписка на рассылку</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
              Если Вы хотите получать новости сайта и спецпредложения на почтовый ящик, укажите его здесь.
              Рассылка происходит раз в сутки при наличии новых публикаций на сайте.
            </p>

            {done ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3.5 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                <div>
                  <div className="font-semibold">Спасибо! Вы подписаны.</div>
                  <div className="text-sm text-white/75">{email}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6" noValidate>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Введите адрес электронной почты"
                    aria-label="Адрес электронной почты"
                    className={`min-w-0 flex-1 rounded-xl border bg-white/10 px-4 py-3 text-white placeholder-white/60 outline-none transition focus:bg-white/15 ${
                      error ? "border-amber-300" : "border-white/25 focus:border-white"
                    }`}
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-6 py-3 font-semibold text-[var(--color-primary)] transition hover:bg-white/90"
                  >
                    Подписаться
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-amber-200">{error}</p>}
                <p className="mt-2 text-xs text-white/55">
                  Нажимая «Подписаться», вы соглашаетесь с политикой конфиденциальности.
                </p>
              </form>
            )}
          </div>

          {/* Приложение */}
          <div className="flex flex-col justify-center gap-5 border-t border-white/15 bg-black/10 p-8 md:border-l md:border-t-0 md:p-12">
            <div>
              <h3 className="text-xl font-bold text-white">Установите приложение</h3>
              <p className="mt-2 text-sm text-white/75">
                Бронируйте билеты и следите за ценами прямо со смартфона.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <StoreBadge logo={<AppleLogo />} top="Загрузите в" bottom="App Store" />
              <StoreBadge logo={<GooglePlayLogo />} top="Доступно в" bottom="Google Play" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
