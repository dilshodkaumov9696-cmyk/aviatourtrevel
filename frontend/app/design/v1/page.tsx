/**
 * Вариант 1 — «Плотный утилитарный».
 *
 * Инструмент, а не витрина. Никакого героя во весь экран: поиск стоит сразу
 * под шапкой, чтобы до него не надо было доходить. Много данных на единицу
 * площади, спокойная палитра, один акцентный цвет на действие.
 *
 * Страница-превью для выбора направления. Удалить вместе с app/design.
 */
const ROUTES = [
  { from: "Москва", to: "Стамбул", price: "13 582", airline: "Turkish Airlines", direct: true },
  { from: "Москва", to: "Дубай", price: "18 240", airline: "flydubai", direct: true },
  { from: "Душанбе", to: "Москва", price: "9 900", airline: "Somon Air", direct: true },
  { from: "Москва", to: "Ереван", price: "11 350", airline: "Аэрофлот", direct: true },
  { from: "Ташкент", to: "Стамбул", price: "16 700", airline: "Uzbekistan", direct: false },
  { from: "Москва", to: "Алматы", price: "14 120", airline: "Air Astana", direct: true },
];

const CELL = "flex h-14 items-center gap-2.5 px-4 text-[15px] text-slate-900";

export default function DesignV1() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Шапка — тонкая, без излишеств */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-[1200px] items-center gap-8 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2E6BFF] text-[13px] font-bold text-white">
              A
            </div>
            <span className="text-[17px] font-semibold tracking-tight">Aviator</span>
          </div>
          <nav className="hidden gap-6 text-[14px] text-slate-600 md:flex">
            {["Авиабилеты", "Отели", "Направления", "Помощь"].map((n, i) => (
              <span key={n} className={i === 0 ? "font-medium text-slate-900" : "cursor-pointer hover:text-slate-900"}>
                {n}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-[14px]">
            <span className="text-slate-500">RU · ₽</span>
            <button className="rounded-md border border-slate-300 px-3.5 py-1.5 font-medium hover:border-slate-400">
              Войти
            </button>
          </div>
        </div>
      </header>

      {/* Поиск — сразу, без прокрутки */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-6 py-7">
          <h1 className="mb-4 text-[22px] font-semibold tracking-tight">Авиабилеты</h1>

          <div className="flex flex-col divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-300 bg-white lg:flex-row lg:divide-x lg:divide-y-0">
            <div className={`${CELL} flex-1`}>
              <span className="text-slate-400">Откуда</span>
              <span className="font-medium">Москва</span>
              <span className="text-[12px] text-slate-400">MOW</span>
            </div>
            <div className={`${CELL} flex-1`}>
              <span className="text-slate-400">Куда</span>
              <span className="font-medium">Стамбул</span>
              <span className="text-[12px] text-slate-400">IST</span>
            </div>
            <div className={`${CELL} lg:w-40`}>
              <span className="font-medium">15 сен</span>
            </div>
            <div className={`${CELL} lg:w-40`}>
              <span className="text-slate-400">Обратно</span>
            </div>
            <div className={`${CELL} lg:w-48`}>
              <span className="font-medium">1 пассажир</span>
              <span className="text-slate-400">эконом</span>
            </div>
            <button className="h-14 shrink-0 bg-[#2E6BFF] px-9 text-[15px] font-semibold text-white transition hover:bg-[#1E4FD1]">
              Найти
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-600">
            {["Только прямые", "Добавить отель", "Сложный маршрут", "Билеты со скидкой"].map((f) => (
              <label key={f} className="flex cursor-pointer items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-[3px] border border-slate-400" />
                {f}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Таблица направлений — плотно, данными вперёд */}
      <section className="mx-auto max-w-[1200px] px-6 py-9">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[17px] font-semibold">Дешёвые билеты на ближайший месяц</h2>
          <span className="cursor-pointer text-[14px] text-[#2E6BFF]">Все направления →</span>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          {ROUTES.map((r, i) => (
            <div
              key={`${r.from}-${r.to}`}
              className={`flex items-center gap-4 px-4 py-3 text-[14px] hover:bg-slate-50 ${
                i > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div className="w-52 font-medium">
                {r.from} → {r.to}
              </div>
              <div className="w-44 text-slate-600">{r.airline}</div>
              <div className="w-24">
                {r.direct ? (
                  <span className="text-[12px] text-emerald-600">прямой</span>
                ) : (
                  <span className="text-[12px] text-slate-400">1 пересадка</span>
                )}
              </div>
              <div className="ml-auto font-semibold tabular-nums">{r.price} ₽</div>
              <button className="rounded-md border border-slate-300 px-3 py-1 text-[13px] font-medium hover:border-[#2E6BFF] hover:text-[#2E6BFF]">
                Выбрать
              </button>
            </div>
          ))}
        </div>

        <div className="mt-9 grid gap-6 border-t border-slate-200 pt-7 text-[14px] sm:grid-cols-3">
          {[
            ["120 000 рейсов в день", "Сравниваем цены авиакомпаний и агентств"],
            ["Без скрытых комиссий", "Цена в выдаче — итоговая цена"],
            ["Поддержка 24/7", "Отвечаем в чате в среднем за 3 минуты"],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="font-semibold">{t}</div>
              <div className="mt-1 text-slate-600">{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
