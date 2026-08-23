/**
 * Вариант 5 — «Швейцарская типографика».
 *
 * Ноль скруглений, ноль теней, ноль градиентов. Работают только шрифт,
 * линейки и сетка. Чёрное на белом, единственный акцент — красный.
 * Числа моноширинные. Выглядит как печатное расписание, а не как сайт.
 *
 * Страница-превью. Удалить вместе с app/design.
 */
const ROWS = [
  ["01", "МОСКВА", "СТАМБУЛ", "MOW/IST", "15.09", "03:45", "13 582"],
  ["02", "МОСКВА", "ДУБАЙ", "MOW/DXB", "16.09", "05:20", "18 240"],
  ["03", "ДУШАНБЕ", "МОСКВА", "DYU/MOW", "17.09", "04:10", "9 900"],
  ["04", "МОСКВА", "ЕРЕВАН", "MOW/EVN", "18.09", "02:55", "11 350"],
  ["05", "ТАШКЕНТ", "СТАМБУЛ", "TAS/IST", "19.09", "06:30", "16 700"],
];

export default function DesignV5() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b-2 border-black">
        <div className="mx-auto flex max-w-[1240px] items-baseline justify-between px-8 py-5">
          <span className="text-[24px] font-black uppercase tracking-[-0.03em]">Aviator</span>
          <nav className="hidden gap-8 text-[12px] font-bold uppercase tracking-[0.12em] md:flex">
            {["Билеты", "Направления", "Журнал", "Контакты"].map((n) => (
              <span key={n} className="cursor-pointer border-b-2 border-transparent hover:border-black">
                {n}
              </span>
            ))}
          </nav>
          <span className="text-[12px] font-bold uppercase tracking-[0.12em]">Вход</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-8">
        <div className="grid gap-8 border-b border-black py-14 md:grid-cols-[1.4fr_1fr]">
          <h1 className="text-[76px] font-black uppercase leading-[0.88] tracking-[-0.045em]">
            Билеты
            <br />
            без
            <br />
            <span className="text-[#E4002B]">наценки</span>
          </h1>
          <div className="flex flex-col justify-end gap-5">
            <p className="max-w-sm text-[15px] leading-relaxed">
              Мы показываем ту же цену, что и авиакомпания. Сравниваем 120 000 рейсов ежедневно и не берём
              комиссию за бронирование.
            </p>
            <div className="flex gap-8 border-t border-black pt-5 font-mono text-[13px]">
              <div>
                <div className="text-[26px] font-bold">120K</div>
                <div className="uppercase tracking-wide">рейсов/день</div>
              </div>
              <div>
                <div className="text-[26px] font-bold">480</div>
                <div className="uppercase tracking-wide">городов</div>
              </div>
              <div>
                <div className="text-[26px] font-bold">0%</div>
                <div className="uppercase tracking-wide">комиссия</div>
              </div>
            </div>
          </div>
        </div>

        {/* Поиск — строгая сетка, поля разделены линейками */}
        <div className="grid border-b-2 border-black md:grid-cols-[1fr_1fr_auto_auto_auto]">
          {[
            ["Откуда", "МОСКВА"],
            ["Куда", "СТАМБУЛ"],
            ["Туда", "15.09"],
            ["Обратно", "22.09"],
          ].map(([l, v], i) => (
            <div key={l} className={`px-5 py-5 ${i > 0 ? "md:border-l md:border-black" : ""}`}>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">{l}</div>
              <div className="text-[19px] font-bold tracking-tight">{v}</div>
            </div>
          ))}
          <button className="bg-black px-12 py-5 text-[13px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#E4002B]">
            Искать
          </button>
        </div>

        {/* Таблица — как печатное табло */}
        <div className="py-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.18em]">Ближайшие вылеты</h2>
            <span className="font-mono text-[12px] text-black/45">обновлено 14.08 · 22:41</span>
          </div>

          <div className="grid grid-cols-[38px_1fr_1fr_92px_58px_58px_90px] gap-3 border-b border-black pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-black/45">
            <span>№</span>
            <span>Откуда</span>
            <span>Куда</span>
            <span>Код</span>
            <span>Дата</span>
            <span>В пути</span>
            <span className="text-right">Цена</span>
          </div>

          {ROWS.map((r) => (
            <div
              key={r[0]}
              className="grid cursor-pointer grid-cols-[38px_1fr_1fr_92px_58px_58px_90px] items-center gap-3 border-b border-black/15 py-3.5 text-[14px] hover:bg-black hover:text-white"
            >
              <span className="font-mono text-black/40">{r[0]}</span>
              <span className="font-bold tracking-tight">{r[1]}</span>
              <span className="font-bold tracking-tight">{r[2]}</span>
              <span className="font-mono text-[12px]">{r[3]}</span>
              <span className="font-mono text-[12px]">{r[4]}</span>
              <span className="font-mono text-[12px]">{r[5]}</span>
              <span className="text-right font-mono font-bold">{r[6]} ₽</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
