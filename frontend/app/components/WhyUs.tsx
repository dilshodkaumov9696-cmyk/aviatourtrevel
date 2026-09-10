"use client";

import { useInViewAnimation } from "../hooks/useInViewAnimation";

const svg = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
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
  { icon: <IconTag />, title: "Лучшая цена", text: "Сравниваем предложения и показываем честную стоимость." },
  { icon: <IconCheck />, title: "Без скрытых сборов", text: "Итоговая цена без доплат на последнем шаге." },
];

export default function WhyUs() {
  const { ref, isInView } = useInViewAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`py-10 transition-all duration-700 sm:py-14 ${
        isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-[var(--color-text)] dark:bg-white/10">
                {it.icon}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-[var(--color-text)]">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
