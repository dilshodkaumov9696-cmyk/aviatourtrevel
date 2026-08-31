"use client";

import { useInViewAnimation } from "../hooks/useInViewAnimation";

const REVIEWS = [
  {
    name: "Алишер Каримов",
    city: "Ташкент",
    rating: 5,
    text: "Нашёл билет Ташкент → Стамбул на 40% дешевле чем на других сайтах. Оформил за 5 минут, всё пришло на почту.",
    initials: "АК",
    color: "#1E5C80",
  },
  {
    name: "Наталья Сидорова",
    city: "Москва",
    rating: 5,
    text: "Пользуюсь уже 2 года. Всегда нахожу лучшие цены. Интерфейс удобный, не нужно никуда звонить.",
    initials: "НС",
    color: "#2E7BAD",
  },
  {
    name: "Баходир Юсупов",
    city: "Душанбе",
    rating: 5,
    text: "Летали семьёй в Дубай. Сравнил 20+ авиакомпаний — здесь нашли самый выгодный вариант с багажом.",
    initials: "БЮ",
    color: "#15425C",
  },
  {
    name: "Айгуль Бекова",
    city: "Алматы",
    rating: 4,
    text: "Очень удобно что сразу видно прямые и стыковочные рейсы. Поддержка ответила быстро когда был вопрос.",
    initials: "АБ",
    color: "#1E5C80",
  },
  {
    name: "Тигран Арутюнян",
    city: "Ереван",
    rating: 5,
    text: "Купил билеты Ереван → Москва в 3 часа ночи — всё сработало мгновенно. Отличный сервис!",
    initials: "ТА",
    color: "#2E7BAD",
  },
  {
    name: "Лейла Гасанова",
    city: "Баку",
    rating: 5,
    text: "Горящий билет нашла за 30 минут до конца акции. Сэкономила почти 15 000 рублей. Спасибо!",
    initials: "ЛГ",
    color: "#15425C",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= count ? "#FFD700" : "none"}
          stroke={i <= count ? "#FFD700" : "var(--color-border)"} strokeWidth="1.5" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { ref, isInView } = useInViewAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`bg-[var(--color-bg-soft)] py-16 transition-all duration-700 ${
        isInView ? "opacity-100" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)]">Истории путешественников</h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Иллюстративные истории. Это не верифицированные отзывы клиентов.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col gap-4 transition hover:shadow-md hover:border-[var(--color-primary)]"
            >
              {/* Stars */}
              <Stars count={r.rating} />

              {/* Text */}
              <p className="flex-1 text-[var(--color-text)] text-sm leading-relaxed">
                «{r.text}»
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: r.color }}
                >
                  {r.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">{r.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{r.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
