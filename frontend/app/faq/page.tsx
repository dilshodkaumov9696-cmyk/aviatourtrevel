"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

const categories = [
  {
    title: "Бронирование",
    items: [
      { q: "Как забронировать билет?", a: "Укажите города вылета и прилёта, даты и количество пассажиров в форме поиска. Выберите подходящий рейс из результатов, заполните данные пассажира и оплатите. Электронный билет поступит на почту в течение нескольких минут." },
      { q: "Можно ли изменить данные после бронирования?", a: "Да, данные пассажира можно изменить до вылета рейса. Обращайтесь в службу поддержки — мы поможем скорректировать ФИО, паспортные данные или даты. Некоторые изменения могут потребовать доплаты." },
      { q: "Что делать, если не пришло подтверждение?", a: "Проверьте папку «Спам». Если письма нет, свяжитесь со службой поддержки — мы повторно отправим подтверждение и электронный билет. Всегда сохраняйте код бронирования." },
      { q: "Сколько пассажиров можно указать в одном заказе?", a: "В одном бронировании можно указать до 9 пассажиров. Для групповых бронирований от 10 человек действуют специальные тарифы — обратитесь в поддержку." },
    ],
  },
  {
    title: "Возврат билетов",
    items: [
      { q: "Как вернуть билет?", a: "Зайдите в раздел «Мои бронирования», выберите нужный билет и нажмите «Вернуть». Возврат доступен в зависимости от тарифа: возвратные билеты возвращаются полностью, невозвратные — с удержанием сбора." },
      { q: "Сколько времени занимает возврат средств?", a: "Деньги возвращаются на карту в течение 3–10 рабочих дней. Срок зависит от банка-эмитента. Статус возврата можно отслеживать в личном кабинете." },
      { q: "Можно ли вернуть невозвратный билет?", a: "Возврат невозвратных билетов возможен только в особых случаях: болезнь, смерть близкого родственника, отмена рейса авиакомпанией. Необходимо предоставить подтверждающие документы." },
      { q: "Что такое вынужденный возврат?", a: "Вынужденный возврат — это возврат без штрафов, если рейс отменён, существенно задержан или изменён авиакомпанией. В этом случае возвращается полная стоимость билета." },
    ],
  },
  {
    title: "Багаж",
    items: [
      { q: "Сколько багажа можно провезти?", a: "Нормы зависят от тарифа и авиакомпании. Эконом-класс: обычно 1 место до 23 кг + ручная кладь 5–10 кг. Бизнес-класс: 2 места до 32 кг. Точные нормы указаны при бронировании и в разделе «Правила провоза багажа»." },
      { q: "Что нельзя брать в ручную кладь?", a: "Жидкости объёмом более 100 мл, острые предметы, легковоспламеняющиеся вещества, аэрозоли. Подробный список запрещённых предметов и правила провоза — на странице «Правила провоза багажа»." },
      { q: "Сколько стоит перевес багажа?", a: "Перевес оплачивается дополнительно — от 1500 ₽ за каждый лишний килограмм. Дополнительное место багажа можно оформить заранее онлайн со скидкой. Актуальные цены — при оформлении бронирования." },
    ],
  },
];

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState(0);

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <main className="min-h-screen bg-[var(--color-bg-soft)] text-[var(--color-text)]">
      <SiteHeader />
      <div className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Поддержка
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Частые вопросы</h1>
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          Ответы на популярные вопросы о бронировании, возврате и багаже
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((c, i) => (
            <button
              key={c.title}
              onClick={() => { setActiveCat(i); setOpenId(null); }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                activeCat === i
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {categories[activeCat].items.map((item, i) => {
            const id = `${activeCat}-${i}`;
            const isOpen = openId === id;
            return (
              <div key={id} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <button
                  onClick={() => toggle(id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-base font-semibold text-[var(--color-text)]">{item.q}</span>
                  <ChevronDown className={`shrink-0 text-[var(--color-primary)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="mb-4 h-px bg-[var(--color-border)]" />
                    <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">Не нашли ответ на свой вопрос?</p>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
          >
            Связаться с поддержкой
          </Link>
        </div>
      </div>
      </div>
    </main>
  );
}
