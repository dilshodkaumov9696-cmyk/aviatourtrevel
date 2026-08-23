"use client";

import { useInViewAnimation } from "../hooks/useInViewAnimation";

const svg = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const IconShield = () => (
  <svg {...svg}>
    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4.5" />
  </svg>
);
const IconSupport = () => (
  <svg {...svg}>
    <path d="M4 12a8 8 0 0 1 16 0" />
    <rect x="2.5" y="12" width="4.5" height="7" rx="2" />
    <rect x="17" y="12" width="4.5" height="7" rx="2" />
    <path d="M20 19a3.5 3.5 0 0 1-3.5 3H13" />
  </svg>
);
const IconTag = () => (
  <svg {...svg}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H11a2 2 0 0 1 1.4.6l8 8a2 2 0 0 1 0 2.8l-6 6a2 2 0 0 1-2.8 0l-8-8A2 2 0 0 1 3 11V4.5z" />
    <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
const IconCheck = () => (
  <svg {...svg}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </svg>
);

const ITEMS = [
  { icon: <IconShield />, title: "Безопасная оплата", text: "Платежи защищены, данные карты под надёжным шифрованием." },
  { icon: <IconSupport />, title: "Поддержка 24/7", text: "Помогаем в любое время — до, во время и после поездки." },
  { icon: <IconTag />, title: "Лучшая цена", text: "" },
  { icon: <IconCheck />, title: "Без скрытых сборов", text: "Честная итоговая стоимость — без доплат на последнем шаге." },
];

export default function WhyUs() {
  const { ref, isInView } = useInViewAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`py-16 transition-all duration-700 ${
        isInView ? "opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Почему выбирают нас</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">Надёжный сервис для поиска и покупки авиабилетов</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                {it.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
