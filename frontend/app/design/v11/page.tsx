/**
 * Вариант 11 — «Календарь цен».
 *
 * Идея: перевернуть порядок. Обычно сначала выбирают дату, потом видят цену.
 * Здесь главный экран — месяц целиком с ценой в каждом дне, и человек
 * выбирает не дату, а сумму. Дата — следствие.
 */
const PRICES = [
  0, 0, 14200, 13100, 12940, 15600, 16800,
  13582, 12705, 12940, 13110, 14400, 17200, 18100,
  12705, 13582, 13110, 12940, 14900, 16400, 17800,
  11980, 12300, 12705, 13400, 15100, 16900, 17400,
  12940, 13110, 0, 0, 0, 0, 0,
];
const WD = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MIN = Math.min(...PRICES.filter(Boolean));
const MAX = Math.max(...PRICES.filter(Boolean));

function tone(p: number) {
  if (!p) return "transparent";
  const t = (p - MIN) / (MAX - MIN); // 0 — дёшево, 1 — дорого
  return `hsl(${(1 - t) * 130} 62% ${94 - t * 12}%)`;
}

export default function DesignV11() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <span className="text-[19px] font-bold tracking-tight text-slate-900">Aviator</span>
          <button className="rounded-lg border border-slate-300 px-4 py-1.5 text-[14px] font-medium">Войти</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1080px] px-8 py-12">
        <h1 className="text-[40px] font-bold leading-tight tracking-tight text-slate-900">
          Сначала цена, потом дата
        </h1>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-slate-500">
          Весь месяц сразу: видно, где дешевле, и можно подвинуть поездку на день-два ради экономии.
        </p>

        {/* Маршрут — компактной строкой, он тут второстепенен */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {["Москва", "Стамбул"].map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-300">→</span>}
              <span className="rounded-lg bg-slate-100 px-4 py-2 text-[15px] font-semibold text-slate-900">{c}</span>
            </span>
          ))}
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-[15px] text-slate-500">1 пассажир</span>
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-[15px] text-slate-500">туда-обратно</span>
        </div>

        {/* Календарь */}
        <div className="mt-9 rounded-2xl border border-slate-200 p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-slate-900">Сентябрь 2026</h2>
            <div className="flex items-center gap-4 text-[13px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded" style={{ background: tone(MIN) }} /> дешевле
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded" style={{ background: tone(MAX) }} /> дороже
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {WD.map((d) => (
              <div key={d} className="pb-1 text-center text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                {d}
              </div>
            ))}

            {PRICES.map((p, i) => {
              const day = i - 1;
              const cheapest = p === MIN;
              return (
                <div
                  key={i}
                  className={`rounded-xl px-2 py-3 text-center transition ${
                    p ? "cursor-pointer hover:ring-2 hover:ring-slate-900" : ""
                  } ${cheapest ? "ring-2 ring-emerald-500" : ""}`}
                  style={{ background: tone(p) }}
                >
                  {p ? (
                    <>
                      <div className="text-[13px] font-medium text-slate-500">{day}</div>
                      <div className="mt-0.5 text-[15px] font-bold tabular-nums text-slate-900">
                        {(p / 1000).toFixed(1).replace(".", ",")}к
                      </div>
                      {cheapest && (
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">min</div>
                      )}
                    </>
                  ) : (
                    <div className="h-[42px]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
            <div className="text-[15px] text-slate-600">
              Самый дешёвый день — <span className="font-bold text-slate-900">22 сентября</span>, {MIN.toLocaleString("ru-RU")} ₽.
              Это на <span className="font-bold text-emerald-600">6 120 ₽</span> дешевле, чем 20-го.
            </div>
            <button className="rounded-xl bg-slate-900 px-7 py-3 text-[15px] font-bold text-white transition hover:bg-slate-700">
              Показать рейсы на 22 сентября
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Гибкие даты", "±3 дня к поиску — обычно экономит 15–20%"],
            ["Следить за ценой", "Напишем, когда месяц подешевеет"],
            ["Соседние аэропорты", "Проверим все узлы города"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-200 px-5 py-4">
              <div className="text-[15px] font-bold text-slate-900">{t}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-slate-500">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
