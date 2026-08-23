/**
 * Вариант 17 — «Плакат 1960-х».
 *
 * Идея: эстетика туристических плакатов золотого века авиации — плотные
 * заливки, геометрия, ограниченная палитра, крупный гротеск вразрядку.
 * Поиск встроен в плакат как типографский блок.
 */
export default function DesignV17() {
  return (
    <div className="min-h-screen bg-[#EFE7D6]">
      <div className="mx-auto max-w-[1180px] px-8 py-8">
        <div className="mb-7 flex items-center justify-between border-b-2 border-[#1F3A5F] pb-4">
          <span className="text-[19px] font-black uppercase tracking-[0.3em] text-[#1F3A5F]">Aviator</span>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[#1F3A5F]/55">Воздушные линии</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* Плакат */}
          <div className="relative overflow-hidden bg-[#1F3A5F]" style={{ minHeight: 560 }}>
            {/* Солнце */}
            <div className="absolute right-16 top-16 h-40 w-40 rounded-full bg-[#E8A33D]" />
            {/* Горы */}
            <svg viewBox="0 0 400 300" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none">
              <path d="M0 300 L0 210 L70 140 L120 190 L190 110 L260 185 L330 130 L400 195 L400 300 Z" fill="#2E5C4D" />
              <path d="M0 300 L0 250 L90 200 L170 245 L250 195 L340 240 L400 215 L400 300 Z" fill="#1B3D33" />
            </svg>
            {/* Самолёт */}
            <svg viewBox="0 0 24 24" className="absolute left-14 top-24 h-14 w-14 -rotate-12" fill="#EFE7D6">
              <path d="M2 12h14l-3-4h2.5l5 4-5 4H13l3-4H2z" />
            </svg>
            {/* Инверсионный след */}
            <div className="absolute left-8 top-[122px] h-[3px] w-40 bg-[#EFE7D6]/35" />

            <div className="absolute bottom-10 left-10 right-10">
              <div className="text-[13px] uppercase tracking-[0.4em] text-[#E8A33D]">Направление месяца</div>
              <div className="mt-3 text-[76px] font-black uppercase leading-[0.86] tracking-[-0.02em] text-[#EFE7D6]">
                Стамбул
              </div>
              <div className="mt-4 flex items-end justify-between border-t-2 border-[#EFE7D6]/25 pt-4">
                <span className="text-[15px] uppercase tracking-[0.2em] text-[#EFE7D6]/70">
                  Прямой рейс · 3 ч 45 мин
                </span>
                <span className="text-[34px] font-black text-[#E8A33D]">13 582 ₽</span>
              </div>
            </div>
          </div>

          {/* Билетная касса */}
          <aside className="flex flex-col justify-between bg-[#C1462E] p-9 text-[#EFE7D6]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#EFE7D6]/60">Заказ билета</div>

              <div className="mt-7 space-y-5">
                {[
                  ["Пункт вылета", "МОСКВА"],
                  ["Пункт назначения", "СТАМБУЛ"],
                  ["Дата отправления", "15 СЕНТЯБРЯ"],
                  ["Дата возвращения", "22 СЕНТЯБРЯ"],
                  ["Число мест", "ОДНО"],
                ].map(([l, v]) => (
                  <div key={l} className="border-b border-[#EFE7D6]/25 pb-2.5">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#EFE7D6]/55">{l}</div>
                    <div className="mt-1 text-[21px] font-black uppercase tracking-tight">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-9 w-full bg-[#EFE7D6] py-5 text-[14px] font-black uppercase tracking-[0.26em] text-[#C1462E] transition hover:bg-white">
              Заказать
            </button>
          </aside>
        </div>

        {/* Полоса направлений */}
        <div className="mt-8 grid gap-0 sm:grid-cols-4">
          {[
            ["ЕРЕВАН", "11 350", "#2E5C4D"],
            ["ДУБАЙ", "18 240", "#E8A33D"],
            ["АЛМАТЫ", "14 120", "#1F3A5F"],
            ["ТАШКЕНТ", "15 800", "#C1462E"],
          ].map(([city, price, color]) => (
            <div
              key={city}
              className="cursor-pointer px-6 py-7 text-[#EFE7D6] transition hover:brightness-110"
              style={{ background: color }}
            >
              <div className="text-[19px] font-black uppercase tracking-tight">{city}</div>
              <div className="mt-1 text-[13px] uppercase tracking-[0.18em] opacity-70">от {price} ₽</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
