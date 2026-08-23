/**
 * Вариант 3 — «Текущий, причёсанный».
 *
 * Бренд остаётся: синий, салатовый акцент, глобус. Меняется дисциплина:
 *  — единая шкала скруглений 8 / 12 / 16 / 24, а не нынешний разнобой,
 *    где rounded-lg (19.2px) больше, чем rounded-xl (12px);
 *  — все органы управления одной высоты 56px;
 *  — заголовок стоит НАД глобусом, а не поверх карточек, — читаемость;
 *  — ритм отступов кратен 8.
 *
 * Страница-превью для выбора направления. Удалить вместе с app/design.
 */
const R = { sm: "8px", md: "12px", lg: "16px", xl: "24px" };
const CELL = "flex h-14 flex-1 items-center gap-2.5 px-4 text-[15px]";

export default function DesignV3() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center border-2 border-[#2FD98A] bg-[#2E6BFF] font-bold text-white"
              style={{ borderRadius: R.md }}
            >
              A
            </div>
            <span className="text-[19px] font-bold tracking-tight text-slate-900">Aviator</span>
          </div>
          <nav className="hidden gap-8 text-[14px] font-medium text-slate-600 lg:flex">
            {["Авиабилеты", "Направления", "Акции", "Помощь"].map((n, i) => (
              <span key={n} className={i === 0 ? "text-[#2E6BFF]" : "cursor-pointer hover:text-slate-900"}>
                {n}
              </span>
            ))}
          </nav>
          <button
            className="h-10 bg-[#2FD98A] px-5 text-[14px] font-bold text-slate-900"
            style={{ borderRadius: R.md }}
          >
            Войти
          </button>
        </div>
      </header>

      {/* Герой: заголовок над глобусом, а не на нём */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #2E6BFF 0%, #1E4FD1 100%)" }}
      >
        <div className="relative mx-auto max-w-[1280px] px-8 pb-10 pt-16 text-center">
          <span
            className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm"
            style={{ borderRadius: R.xl }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#2FD98A]" />
            Находим выгодный маршрут за минуту
          </span>

          <h1 className="mx-auto mt-6 max-w-4xl text-[52px] font-bold leading-[1.08] tracking-tight text-white">
            Проверьте цены и летите выгоднее
          </h1>

          {/* Глобус — фоном под формой, не под заголовком */}
          <div className="relative mt-10">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle at 35% 30%, #8FB8FF 0%, #1E4FD1 60%, transparent 72%)" }}
            />

            <div className="relative mb-6 flex flex-wrap justify-center gap-2">
              {["Авиабилеты", "Отели", "Туры", "e-SIM", "Страхование", "Трансферы"].map((c, i) => (
                <button
                  key={c}
                  className={`h-9 px-4 text-[13px] font-semibold transition ${
                    i === 0 ? "bg-white text-[#1E4FD1]" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                  style={{ borderRadius: R.xl }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Форма: единый бар, все ячейки 56px, скругление 16 */}
            <div
              className="relative overflow-hidden border border-slate-200 bg-white shadow-[0_16px_48px_rgba(11,29,42,0.18)]"
              style={{ borderRadius: R.lg }}
            >
              <div className="flex flex-col divide-y divide-slate-200 text-left lg:flex-row lg:divide-x lg:divide-y-0">
                <div className={CELL}>
                  <span className="text-slate-400">Откуда</span>
                  <span className="font-semibold text-slate-900">Москва</span>
                </div>
                <div className={CELL}>
                  <span className="text-slate-400">Куда</span>
                  <span className="font-semibold text-slate-900">Стамбул</span>
                </div>
                <div className={`${CELL} lg:max-w-[168px]`}>
                  <span className="font-semibold text-slate-900">15 сен</span>
                </div>
                <div className={`${CELL} lg:max-w-[168px]`}>
                  <span className="text-slate-400">Обратно</span>
                </div>
                <div className={`${CELL} lg:max-w-[200px]`}>
                  <span className="font-semibold text-slate-900">1 пассажир</span>
                </div>
                <button className="h-14 shrink-0 bg-[#2FD98A] px-10 text-[15px] font-bold text-slate-900 transition hover:brightness-105">
                  Найти билеты
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Показатели — на том же синем, ритм кратен 8 */}
        <div className="relative mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-8 pb-14 pt-6 text-center md:grid-cols-4">
          {[
            ["120k+", "рейсов в день"],
            ["480", "городов мира"],
            ["2.5M+", "клиентов"],
            ["850M", "сэкономлено, ₽"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-[34px] font-bold text-white">{v}</div>
              <div className="mt-1 text-[13px] text-white/60">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Направления — карточки одной сетки */}
      <section className="mx-auto max-w-[1280px] px-8 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Популярные направления</h2>
          <span className="cursor-pointer text-[14px] font-semibold text-[#2E6BFF]">Все направления →</span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Стамбул", "Турция", "13 582"],
            ["Дубай", "ОАЭ", "18 240"],
            ["Ереван", "Армения", "11 350"],
          ].map(([city, country, price]) => (
            <div
              key={city}
              className="cursor-pointer overflow-hidden border border-slate-200 transition hover:border-[#2E6BFF] hover:shadow-lg"
              style={{ borderRadius: R.lg }}
            >
              <div className="h-40" style={{ background: "linear-gradient(140deg, #8FB8FF, #2E6BFF)" }} />
              <div className="flex items-end justify-between p-5">
                <div>
                  <div className="text-[18px] font-bold text-slate-900">{city}</div>
                  <div className="mt-0.5 text-[13px] text-slate-500">{country}</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-slate-400">от</div>
                  <div className="text-[18px] font-bold text-[#2E6BFF]">{price} ₽</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
