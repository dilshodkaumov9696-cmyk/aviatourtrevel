/**
 * Вариант 15 — «Табло вылетов».
 *
 * Идея: механическое табло аэропорта — янтарные буквы на чёрном, разделённые
 * створки знаков, моноширинный шрифт. Поиск оформлен как строка ввода табло.
 * Сильная отраслевая ассоциация, ни на кого не похоже.
 */
const FLIGHTS = [
  ["TK 414", "СТАМБУЛ", "14:35", "B12", "ПО РАСПИСАНИЮ", "13 582"],
  ["FZ 918", "ДУБАЙ", "16:20", "C04", "ПОСАДКА", "18 240"],
  ["SZ 202", "МОСКВА", "18:05", "A21", "ПО РАСПИСАНИЮ", "9 900"],
  ["SU 1866", "ЕРЕВАН", "19:40", "D08", "ЗАДЕРЖАН", "11 350"],
  ["HY 605", "СТАМБУЛ", "21:15", "B03", "ПО РАСПИСАНИЮ", "16 700"],
];

/** Знак-створка: имитация механического табло. */
const Flap = ({ ch }: { ch: string }) => (
  <span className="relative mx-[1px] inline-flex h-[30px] w-[21px] items-center justify-center rounded-[2px] bg-[#141210] font-mono text-[17px] font-bold text-[#FFB000]">
    {ch}
    <span className="absolute left-0 right-0 top-1/2 h-px bg-black/55" />
  </span>
);

const Word = ({ text }: { text: string }) => (
  <span className="inline-flex">
    {text.split("").map((c, i) => (
      <Flap key={i} ch={c} />
    ))}
  </span>
);

export default function DesignV15() {
  return (
    <div className="min-h-screen bg-[#0A0908] py-9">
      <div className="mx-auto max-w-[1160px] px-7">
        <div className="mb-7 flex items-center justify-between">
          <span className="font-mono text-[15px] font-bold tracking-[0.34em] text-[#FFB000]">AVIATOR</span>
          <span className="font-mono text-[12px] tracking-[0.2em] text-[#FFB000]/40">
            14 АВГ 2026 · 22:41 MSK
          </span>
        </div>

        {/* Строка поиска в стиле табло */}
        <div className="rounded-md border border-[#241F19] bg-[#0F0D0B] p-6">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.26em] text-[#FFB000]/45">
            Направление вылета
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
            <div>
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFB000]/35">Откуда</div>
              <Word text="MOW" />
            </div>
            <div>
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFB000]/35">Куда</div>
              <Word text="IST" />
            </div>
            <div>
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFB000]/35">Дата</div>
              <Word text="15SEP" />
            </div>
            <div>
              <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FFB000]/35">Пасс.</div>
              <Word text="01" />
            </div>

            <button className="ml-auto self-end rounded-[3px] bg-[#FFB000] px-9 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.2em] text-[#0A0908] transition hover:bg-[#FFC740]">
              Поиск
            </button>
          </div>
        </div>

        {/* Табло */}
        <div className="mt-6 overflow-hidden rounded-md border border-[#241F19] bg-[#0F0D0B]">
          <div className="grid grid-cols-[96px_1fr_78px_66px_1fr_104px] gap-4 border-b border-[#241F19] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FFB000]/40">
            <span>Рейс</span>
            <span>Направление</span>
            <span>Время</span>
            <span>Выход</span>
            <span>Статус</span>
            <span className="text-right">Цена</span>
          </div>

          {FLIGHTS.map((f) => (
            <div
              key={f[0]}
              className="grid cursor-pointer grid-cols-[96px_1fr_78px_66px_1fr_104px] items-center gap-4 border-b border-[#1A1713] px-6 py-4 font-mono text-[15px] text-[#FFB000] transition last:border-0 hover:bg-[#151210]"
            >
              <span className="tracking-tight">{f[0]}</span>
              <span className="font-bold tracking-[0.06em]">{f[1]}</span>
              <span>{f[2]}</span>
              <span className="text-[#FFB000]/55">{f[3]}</span>
              <span
                className={`text-[12px] tracking-[0.08em] ${
                  f[4] === "ЗАДЕРЖАН" ? "text-[#FF5C3B]" : f[4] === "ПОСАДКА" ? "text-[#4ADE80]" : "text-[#FFB000]/55"
                }`}
              >
                {f[4]}
              </span>
              <span className="text-right font-bold">{f[5]} ₽</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-[#FFB000]/30">
          <span>ЦЕНЫ ОБНОВЛЯЮТСЯ КАЖДЫЕ 30 МИНУТ</span>
          <span>СТР. 1 / 12</span>
        </div>
      </div>
    </div>
  );
}
