/**
 * Вариант 4 — «Карточный маркетплейс».
 *
 * Логика витрины скидок: тёплая палитра, крупная жёлтая кнопка, бейджи
 * выгоды и срочности, всё разложено по карточкам. Давит не эстетикой,
 * а предложением — «успей купить дешевле».
 *
 * Страница-превью. Удалить вместе с app/design.
 */
const DEALS = [
  { city: "Стамбул", country: "Турция", price: "13 582", old: "19 400", badge: "−30%", left: "3 места" },
  { city: "Дубай", country: "ОАЭ", price: "18 240", old: "24 900", badge: "−27%", left: "7 мест" },
  { city: "Ереван", country: "Армения", price: "11 350", old: "15 100", badge: "−25%", left: "2 места" },
  { city: "Алматы", country: "Казахстан", price: "14 120", old: "17 800", badge: "−21%", left: "5 мест" },
];

export default function DesignV4() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="bg-[#003580] text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFB700] text-[15px] font-black text-[#003580]">
              A
            </div>
            <span className="text-[20px] font-bold">Aviator</span>
          </div>
          <div className="flex items-center gap-3 text-[14px]">
            <span className="hidden sm:inline">₽ RUB</span>
            <button className="rounded-lg border border-white/40 px-4 py-1.5 font-semibold hover:bg-white/10">
              Регистрация
            </button>
            <button className="rounded-lg bg-white px-4 py-1.5 font-semibold text-[#003580]">Войти</button>
          </div>
        </div>

        <div className="mx-auto max-w-[1180px] px-6 pb-10 pt-4">
          <h1 className="text-[34px] font-black leading-tight">Найдите билет дешевле</h1>
          <p className="mt-2 text-[16px] text-white/75">Сравниваем 120 000 рейсов в день. Комиссии нет.</p>
        </div>
      </header>

      {/* Форма — жёлтая рамка, вылезает на границу шапки */}
      <div className="mx-auto -mt-6 max-w-[1180px] px-6">
        <div className="rounded-xl border-[3px] border-[#FFB700] bg-white p-1.5 shadow-lg">
          <div className="flex flex-col gap-1.5 lg:flex-row">
            {[
              ["Откуда", "Москва"],
              ["Куда", "Стамбул"],
              ["Даты", "15 — 22 сен"],
              ["Пассажиры", "1 взрослый"],
            ].map(([l, v]) => (
              <div key={l} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{l}</div>
                <div className="text-[15px] font-bold text-slate-900">{v}</div>
              </div>
            ))}
            <button className="rounded-lg bg-[#0071C2] px-10 py-3 text-[17px] font-bold text-white transition hover:bg-[#005999]">
              Найти
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-md bg-[#E61E4D] px-2.5 py-1 text-[12px] font-black uppercase tracking-wide text-white">
            Горящие
          </span>
          <h2 className="text-[22px] font-bold text-slate-900">Предложения недели</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEALS.map((d) => (
            <div
              key={d.city}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-xl"
            >
              <div className="relative h-32 bg-gradient-to-br from-[#FFD166] to-[#F4845F]">
                <span className="absolute left-3 top-3 rounded-md bg-[#E61E4D] px-2 py-0.5 text-[12px] font-black text-white">
                  {d.badge}
                </span>
              </div>
              <div className="p-4">
                <div className="text-[17px] font-bold text-slate-900">{d.city}</div>
                <div className="text-[13px] text-slate-500">{d.country}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[22px] font-black text-slate-900">{d.price} ₽</span>
                  <span className="text-[14px] text-slate-400 line-through">{d.old}</span>
                </div>
                <div className="mt-1 text-[12px] font-semibold text-[#E61E4D]">Осталось {d.left}</div>
                <button className="mt-3 w-full rounded-lg bg-[#FFB700] py-2.5 text-[15px] font-bold text-[#003580] transition hover:brightness-105">
                  Смотреть
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["🏷️", "Лучшая цена", "Нашли дешевле — вернём разницу"],
            ["🔒", "Безопасная оплата", "Данные карты не хранятся"],
            ["💬", "Поддержка 24/7", "Ответим за 3 минуты"],
          ].map(([e, t, d]) => (
            <div key={t} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-[22px]">{e}</span>
              <div>
                <div className="text-[15px] font-bold text-slate-900">{t}</div>
                <div className="text-[13px] text-slate-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
