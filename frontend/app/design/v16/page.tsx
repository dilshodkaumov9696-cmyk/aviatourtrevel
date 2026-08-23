/**
 * Вариант 16 — «Бенто».
 *
 * Идея: не линейная страница, а панель из плиток разного размера. Поиск,
 * график цены, подписка, карта, погода и совет живут рядом как модули.
 * Человек видит всё состояние маршрута одним взглядом.
 */
const Tile = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-3xl border border-black/[0.06] bg-white p-6 ${className}`}>{children}</div>
);

const SPARK = [58, 61, 55, 49, 52, 44, 47, 39, 36, 41, 33, 29];

export default function DesignV16() {
  const max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * 100},${36 - (v / max) * 30}`).join(" ");

  return (
    <div className="min-h-screen bg-[#F2F1EE] p-5 sm:p-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[19px] font-semibold tracking-tight">Aviator</span>
          <button className="rounded-full bg-black px-5 py-2 text-[14px] font-medium text-white">Войти</button>
        </div>

        <div className="grid auto-rows-[minmax(0,auto)] gap-4 lg:grid-cols-4">
          {/* Поиск — самая крупная плитка */}
          <Tile className="lg:col-span-2 lg:row-span-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/35">Маршрут</div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-[44px] font-semibold leading-none tracking-tight">MOW</span>
              <span className="text-[22px] text-black/25">→</span>
              <span className="text-[44px] font-semibold leading-none tracking-tight">IST</span>
            </div>
            <div className="mt-1.5 text-[15px] text-black/45">Москва — Стамбул · прямой, 3 ч 45 мин</div>

            <div className="mt-7 space-y-2.5">
              {[
                ["Даты", "15 — 22 сентября"],
                ["Пассажиры", "1 взрослый, эконом"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between rounded-2xl bg-[#F7F6F4] px-5 py-3.5">
                  <span className="text-[14px] text-black/40">{l}</span>
                  <span className="text-[16px] font-medium">{v}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-2xl bg-black py-4 text-[16px] font-semibold text-white transition hover:bg-black/85">
              Найти билеты
            </button>
          </Tile>

          {/* Цена сейчас */}
          <Tile className="lg:col-span-2 bg-gradient-to-br from-[#1B1B1B] to-[#333] text-white">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">Лучшая цена сейчас</div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-[46px] font-semibold leading-none tracking-tight">13 582 ₽</div>
                <div className="mt-2 text-[14px] text-white/45">Turkish Airlines · TK 414</div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-medium text-[#7CE495]">−12.4%</div>
                <div className="text-[13px] text-white/35">за 30 дней</div>
              </div>
            </div>
          </Tile>

          {/* График */}
          <Tile>
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/35">Динамика</div>
            <svg viewBox="0 0 100 36" preserveAspectRatio="none" className="mt-4 h-20 w-full">
              <polyline points={pts} fill="none" stroke="#1B1B1B" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-2 text-[13px] text-black/40">Ниже медианы — можно брать</div>
          </Tile>

          {/* Подписка */}
          <Tile className="bg-[#DFF36B]">
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/40">Следить за ценой</div>
            <div className="mt-3 text-[21px] font-semibold leading-tight">
              Напишем, когда станет дешевле 12 000 ₽
            </div>
            <button className="mt-5 rounded-full bg-black px-5 py-2.5 text-[14px] font-medium text-white">
              Подписаться
            </button>
          </Tile>

          {/* Соседние даты */}
          <Tile className="lg:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/35">Соседние даты</div>
            <div className="mt-4 flex items-end gap-2">
              {[
                ["13", 62], ["14", 68], ["15", 74], ["16", 58],
                ["17", 80], ["18", 90], ["19", 96], ["20", 70],
                ["21", 54], ["22", 44],
              ].map(([d, h], i) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-lg ${i === 9 ? "bg-black" : "bg-black/10"}`}
                    style={{ height: (h as number) }}
                  />
                  <span className={`text-[12px] ${i === 9 ? "font-semibold" : "text-black/35"}`}>{d}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[13px] text-black/40">22 сентября дешевле на 6 120 ₽</div>
          </Tile>

          {/* Погода */}
          <Tile>
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/35">Стамбул в сентябре</div>
            <div className="mt-3 text-[40px] font-semibold leading-none">+26°</div>
            <div className="mt-2 text-[14px] text-black/45">Ясно, вода +24°. Лучший месяц для поездки.</div>
          </Tile>

          {/* Виза */}
          <Tile>
            <div className="text-[11px] uppercase tracking-[0.16em] text-black/35">Документы</div>
            <div className="mt-3 text-[21px] font-semibold leading-tight">Виза не нужна</div>
            <div className="mt-2 text-[14px] text-black/45">До 60 дней по загранпаспорту</div>
          </Tile>
        </div>
      </div>
    </div>
  );
}
