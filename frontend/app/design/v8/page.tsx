/**
 * Вариант 8 — «Разделённый экран».
 *
 * Асимметрия вместо привычной центральной оси: слева на плотном цвете —
 * заголовок и форма, справа во всю высоту — визуальная половина с ценами.
 * Форма видна сразу, при этом остаётся образ путешествия.
 *
 * Страница-превью. Удалить вместе с app/design.
 */
const FIELD = "border-b border-white/15 px-1 pb-3 pt-4";

export default function DesignV8() {
  return (
    <div className="min-h-screen bg-[#12100E] lg:grid lg:h-screen lg:grid-cols-[minmax(0,560px)_1fr] lg:overflow-hidden">
      {/* Левая половина — действие */}
      <div className="flex flex-col justify-between bg-[#12100E] px-10 py-10 text-white lg:px-14">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#FF5A1F] text-[14px] font-bold">
            A
          </div>
          <span className="text-[17px] font-semibold tracking-[0.16em]">AVIATOR</span>
        </div>

        <div className="py-10">
          <h1 className="text-[46px] font-semibold leading-[1.06] tracking-tight">
            Куда летим
            <br />
            в этот раз?
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/45">
            Один запрос — сотни авиакомпаний. Честная цена без комиссии сверху.
          </p>

          <div className="mt-9">
            {[
              ["Откуда", "Москва · MOW"],
              ["Куда", "Стамбул · IST"],
              ["Даты", "15 — 22 сентября"],
              ["Пассажиры", "1 взрослый, эконом"],
            ].map(([l, v]) => (
              <div key={l} className={FIELD}>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/35">{l}</div>
                <div className="mt-1 text-[19px] font-medium">{v}</div>
              </div>
            ))}

            <button className="mt-7 w-full rounded-sm bg-[#FF5A1F] py-4 text-[15px] font-bold uppercase tracking-[0.12em] transition hover:bg-[#E84A12]">
              Найти билеты
            </button>
          </div>
        </div>

        <div className="flex gap-8 text-[12px] text-white/35">
          <span>120 000 рейсов в день</span>
          <span>480 городов</span>
          <span>0% комиссии</span>
        </div>
      </div>

      {/* Правая половина — образ и цены */}
      <div
        className="relative min-h-[520px] overflow-hidden"
        style={{
          background:
            "radial-gradient(90% 70% at 20% 10%, #2B4A6F 0%, transparent 60%)," +
            "radial-gradient(80% 80% at 85% 30%, #7A3B1F 0%, transparent 62%)," +
            "linear-gradient(160deg, #1B2836 0%, #12100E 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
             style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 64px)" }} />

        <div className="relative flex h-full flex-col justify-end gap-3 p-10 lg:p-14">
          <div className="mb-2 text-[12px] uppercase tracking-[0.2em] text-white/40">Сейчас дешевеет</div>

          {[
            ["Стамбул", "Турция", "13 582", "−12%"],
            ["Ереван", "Армения", "11 350", "−9%"],
            ["Дубай", "ОАЭ", "18 240", "−6%"],
          ].map(([city, country, price, delta]) => (
            <div
              key={city}
              className="flex cursor-pointer items-center justify-between border-b border-white/10 py-4 text-white transition hover:border-[#FF5A1F]"
            >
              <div>
                <div className="text-[24px] font-medium tracking-tight">{city}</div>
                <div className="text-[13px] text-white/40">{country}</div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-[13px] text-[#FF5A1F]">{delta}</span>
                <span className="text-[22px] font-medium tabular-nums">{price} ₽</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
