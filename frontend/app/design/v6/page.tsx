/**
 * Вариант 6 — «Тёмный терминал».
 *
 * Профессиональный инструмент, а не витрина: тёмный интерфейс, моноширинные
 * числа, график динамики цены, неоновый акцент. Ставка на тех, кто ловит
 * дешёвый билет и следит за ценой, а не покупает в первый заход.
 *
 * Страница-превью. Удалить вместе с app/design.
 */
const SPARK = [62, 58, 64, 49, 52, 41, 45, 38, 34, 40, 31, 28];
const ROWS = [
  { route: "MOW → IST", airline: "TK", price: "13 582", delta: "−12.4%", down: true, dur: "3:45" },
  { route: "MOW → DXB", airline: "FZ", price: "18 240", delta: "−6.1%", down: true, dur: "5:20" },
  { route: "DYU → MOW", airline: "SZ", price: "9 900", delta: "+3.8%", down: false, dur: "4:10" },
  { route: "MOW → EVN", airline: "SU", price: "11 350", delta: "−9.2%", down: true, dur: "2:55" },
  { route: "TAS → IST", airline: "HY", price: "16 700", delta: "+1.5%", down: false, dur: "6:30" },
];

export default function DesignV6() {
  const max = Math.max(...SPARK);
  const pts = SPARK.map((v, i) => `${(i / (SPARK.length - 1)) * 100},${40 - (v / max) * 34}`).join(" ");

  return (
    <div className="min-h-screen bg-[#0A0E14] text-[#C9D4E0]">
      <header className="border-b border-[#1C2530]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#00E5A0] font-mono text-[13px] font-bold text-[#0A0E14]">
              A
            </div>
            <span className="font-mono text-[15px] font-bold tracking-tight text-white">aviator</span>
            <span className="rounded border border-[#1C2530] px-1.5 py-0.5 font-mono text-[10px] text-[#5B6B7D]">
              LIVE
            </span>
          </div>
          <nav className="hidden gap-6 font-mono text-[12px] text-[#5B6B7D] md:flex">
            {["поиск", "подписки", "график", "api"].map((n, i) => (
              <span key={n} className={i === 0 ? "text-[#00E5A0]" : "cursor-pointer hover:text-white"}>
                /{n}
              </span>
            ))}
          </nav>
          <button className="rounded border border-[#00E5A0]/40 px-3 py-1 font-mono text-[12px] text-[#00E5A0] hover:bg-[#00E5A0]/10">
            войти
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Поиск */}
          <div className="rounded-lg border border-[#1C2530] bg-[#0E141C] p-5">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[#5B6B7D]">
              параметры поиска
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                ["origin", "MOW"],
                ["dest", "IST"],
                ["depart", "2026-09-15"],
                ["return", "2026-09-22"],
              ].map(([k, v]) => (
                <div key={k} className="rounded border border-[#1C2530] bg-[#0A0E14] px-3 py-2.5">
                  <div className="font-mono text-[10px] text-[#5B6B7D]">{k}</div>
                  <div className="font-mono text-[16px] text-white">{v}</div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded bg-[#00E5A0] py-3 font-mono text-[14px] font-bold text-[#0A0E14] transition hover:brightness-110">
              выполнить поиск →
            </button>
          </div>

          {/* График динамики */}
          <div className="rounded-lg border border-[#1C2530] bg-[#0E141C] p-5">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#5B6B7D]">
              MOW → IST · 12 недель
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[30px] font-bold text-white">13 582 ₽</span>
              <span className="font-mono text-[13px] text-[#00E5A0]">−12.4%</span>
            </div>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-3 h-24 w-full">
              <polyline points={pts} fill="none" stroke="#00E5A0" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[#5B6B7D]">
              <span>июн</span>
              <span>июл</span>
              <span>авг</span>
            </div>
            <div className="mt-3 rounded border border-[#00E5A0]/25 bg-[#00E5A0]/[0.07] px-3 py-2 font-mono text-[11px] text-[#00E5A0]">
              цена ниже медианы — хороший момент для покупки
            </div>
          </div>
        </div>

        {/* Таблица */}
        <div className="mt-5 overflow-hidden rounded-lg border border-[#1C2530] bg-[#0E141C]">
          <div className="grid grid-cols-[1.2fr_60px_90px_86px_1fr_84px] gap-3 border-b border-[#1C2530] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#5B6B7D]">
            <span>маршрут</span>
            <span>а/к</span>
            <span className="text-right">цена</span>
            <span className="text-right">за 30д</span>
            <span className="text-right">в пути</span>
            <span />
          </div>
          {ROWS.map((r) => (
            <div
              key={r.route}
              className="grid grid-cols-[1.2fr_60px_90px_86px_1fr_84px] items-center gap-3 border-b border-[#141C25] px-5 py-3 font-mono text-[13px] last:border-0 hover:bg-[#111A24]"
            >
              <span className="text-white">{r.route}</span>
              <span className="text-[#5B6B7D]">{r.airline}</span>
              <span className="text-right font-bold text-white">{r.price}</span>
              <span className={`text-right ${r.down ? "text-[#00E5A0]" : "text-[#FF5C5C]"}`}>{r.delta}</span>
              <span className="text-right text-[#5B6B7D]">{r.dur}</span>
              <button className="rounded border border-[#1C2530] py-1 text-[11px] text-[#C9D4E0] hover:border-[#00E5A0] hover:text-[#00E5A0]">
                следить
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
