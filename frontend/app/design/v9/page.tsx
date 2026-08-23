/**
 * Вариант 9 — «Посадочный талон».
 *
 * Идея: форма поиска не карточка, а сам посадочный талон — с корешком,
 * перфорацией, штрихкодом и моноширинными полями, как на настоящем
 * бланке. Поиск превращается в узнаваемый предмет, а не в набор инпутов.
 */
const Field = ({ l, v, s }: { l: string; v: string; s?: boolean }) => (
  <div className={s ? "" : "flex-1"}>
    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8578]">{l}</div>
    <div className="mt-1 font-mono text-[18px] font-bold tracking-tight text-[#1A1814]">{v}</div>
  </div>
);

export default function DesignV9() {
  return (
    <div className="min-h-screen bg-[#E8E4DA] py-10">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="mb-8 flex items-baseline justify-between">
          <span className="font-mono text-[15px] font-bold tracking-[0.3em] text-[#1A1814]">AVIATOR</span>
          <span className="font-mono text-[11px] tracking-[0.15em] text-[#8A8578]">
            ПОИСК АВИАБИЛЕТОВ · 480 НАПРАВЛЕНИЙ
          </span>
        </div>

        {/* Талон */}
        <div className="relative flex flex-col overflow-hidden rounded-[3px] bg-[#FAF8F3] shadow-[0_2px_0_rgba(0,0,0,0.08),0_20px_50px_rgba(26,24,20,0.14)] lg:flex-row">
          {/* Основная часть */}
          <div className="flex-1 p-9">
            <div className="flex items-start justify-between border-b-2 border-dashed border-[#D6D0C2] pb-6">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8578]">Пассажир</div>
                <div className="mt-1 font-mono text-[15px] font-bold tracking-tight text-[#1A1814]">
                  1 ВЗРОСЛЫЙ · ЭКОНОМ
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A8578]">Класс</div>
                <div className="mt-1 font-mono text-[15px] font-bold text-[#C1462E]">Y</div>
              </div>
            </div>

            {/* Маршрут крупно */}
            <div className="flex items-center gap-6 py-8">
              <div>
                <div className="font-mono text-[54px] font-black leading-none tracking-[-0.04em] text-[#1A1814]">
                  MOW
                </div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#8A8578]">Москва</div>
              </div>

              <div className="flex flex-1 items-center gap-2">
                <span className="h-px flex-1 bg-[#D6D0C2]" />
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M2 12h14l-3-4h2.5l5 4-5 4H13l3-4H2z" fill="#C1462E" />
                </svg>
                <span className="h-px flex-1 bg-[#D6D0C2]" />
              </div>

              <div className="text-right">
                <div className="font-mono text-[54px] font-black leading-none tracking-[-0.04em] text-[#1A1814]">
                  IST
                </div>
                <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#8A8578]">Стамбул</div>
              </div>
            </div>

            <div className="flex gap-8 border-t-2 border-dashed border-[#D6D0C2] pt-6">
              <Field l="Вылет" v="15 СЕН" />
              <Field l="Обратно" v="22 СЕН" />
              <Field l="В пути" v="03:45" />
              <Field l="Рейс" v="TK 414" />
            </div>

            {/* Штрихкод */}
            <div className="mt-8 flex h-11 items-end gap-[2px]">
              {Array.from({ length: 68 }).map((_, i) => (
                <span
                  key={i}
                  className="bg-[#1A1814]"
                  style={{ width: i % 4 === 0 ? 3 : 1.5, height: `${55 + ((i * 37) % 45)}%` }}
                />
              ))}
            </div>
          </div>

          {/* Перфорация */}
          <div className="relative hidden w-px bg-[#D6D0C2] lg:block">
            <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#E8E4DA]" />
            <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[#E8E4DA]" />
          </div>

          {/* Корешок */}
          <div className="flex w-full flex-col justify-between bg-[#1A1814] p-9 text-[#FAF8F3] lg:w-[280px]">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Цена от</div>
              <div className="mt-2 font-mono text-[38px] font-black leading-none tracking-tight">13 582</div>
              <div className="mt-1 font-mono text-[13px] text-white/50">рублей</div>

              <div className="mt-7 space-y-2.5 font-mono text-[11px] text-white/55">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>ПЕРЕСАДКИ</span>
                  <span className="text-white">НЕТ</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>БАГАЖ</span>
                  <span className="text-white">23 КГ</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>ВОЗВРАТ</span>
                  <span className="text-white">ДА</span>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full rounded-[2px] bg-[#C1462E] py-4 font-mono text-[12px] font-bold uppercase tracking-[0.18em] transition hover:bg-[#A63A24]">
              Найти рейсы
            </button>
          </div>
        </div>

        {/* Другие талоны — компактной строкой */}
        <div className="mt-10">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8A8578]">
            Дешевле на соседних датах
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["13 СЕН", "12 940", "TK"],
              ["14 СЕН", "13 110", "TK"],
              ["16 СЕН", "12 705", "PC"],
            ].map(([d, p, a]) => (
              <div
                key={d}
                className="flex cursor-pointer items-center justify-between rounded-[3px] bg-[#FAF8F3] px-5 py-4 transition hover:bg-white"
              >
                <span className="font-mono text-[13px] font-bold text-[#1A1814]">{d}</span>
                <span className="font-mono text-[10px] text-[#8A8578]">{a}</span>
                <span className="font-mono text-[15px] font-black text-[#C1462E]">{p} ₽</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
