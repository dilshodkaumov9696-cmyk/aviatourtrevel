/**
 * Вариант 10 — «Карта решает».
 *
 * Идея: не «куда» вводят текстом, а выбирают на карте. Главный экран —
 * стилизованная карта с ценовыми пинами; поиск сводится к «откуда»,
 * дальше человек тыкает в точку. Для тех, кто ещё не решил, куда лететь.
 */
const PINS = [
  { x: 52, y: 41, city: "Стамбул", price: "13 582", hot: true },
  { x: 63, y: 52, city: "Дубай", price: "18 240" },
  { x: 57, y: 44, city: "Ереван", price: "11 350" },
  { x: 70, y: 40, city: "Ташкент", price: "15 800" },
  { x: 44, y: 33, city: "Прага", price: "21 400" },
  { x: 38, y: 46, city: "Барселона", price: "24 900" },
  { x: 72, y: 47, city: "Дели", price: "26 100" },
  { x: 47, y: 30, city: "Берлин", price: "22 300" },
];

export default function DesignV10() {
  return (
    <div className="min-h-screen bg-[#0E1B2A] text-white">
      <div className="mx-auto max-w-[1320px] px-8 py-7">
        <div className="flex items-center justify-between">
          <span className="text-[19px] font-semibold tracking-tight">Aviator</span>
          <nav className="hidden gap-7 text-[14px] text-white/50 md:flex">
            {["Карта", "Подписки", "Журнал"].map((n, i) => (
              <span key={n} className={i === 0 ? "text-white" : "cursor-pointer hover:text-white"}>
                {n}
              </span>
            ))}
          </nav>
          <button className="rounded-full bg-white/10 px-5 py-2 text-[14px] hover:bg-white/20">Войти</button>
        </div>

        <div className="mt-9 grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Левая колонка: только «откуда» и бюджет */}
          <div>
            <h1 className="text-[38px] font-semibold leading-[1.1] tracking-tight">
              Ещё не решили,
              <br />
              куда лететь?
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/45">
              Укажите город вылета и бюджет — покажем на карте всё, что в него укладывается.
            </p>

            <div className="mt-7 space-y-3">
              <div className="rounded-xl border border-white/12 bg-white/[0.05] px-5 py-3.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/35">Откуда</div>
                <div className="mt-0.5 text-[19px] font-medium">Москва</div>
              </div>

              <div className="rounded-xl border border-white/12 bg-white/[0.05] px-5 py-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">Бюджет</span>
                  <span className="text-[13px] text-[#4ADE80]">до 20 000 ₽</span>
                </div>
                <div className="relative mt-3 h-1 rounded-full bg-white/15">
                  <div className="absolute left-0 top-0 h-1 w-[62%] rounded-full bg-[#4ADE80]" />
                  <div className="absolute left-[62%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0E1B2A] bg-[#4ADE80]" />
                </div>
              </div>

              <div className="rounded-xl border border-white/12 bg-white/[0.05] px-5 py-3.5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/35">Когда</div>
                <div className="mt-0.5 text-[19px] font-medium">Сентябрь · гибко</div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              {PINS.filter((p) => p.hot || Number(p.price.replace(/\s/g, "")) < 20000).map((p) => (
                <div
                  key={p.city}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-white/[0.06]"
                >
                  <span className="text-[15px]">{p.city}</span>
                  <span className="text-[15px] font-medium text-[#4ADE80]">{p.price} ₽</span>
                </div>
              ))}
            </div>
          </div>

          {/* Карта */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A1522]">
            <svg viewBox="0 0 100 62" className="h-full min-h-[520px] w-full">
              {/* сетка меридианов */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="62" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.15" />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.15" />
              ))}

              {/* условные материки */}
              <g fill="#16283C">
                <path d="M20 22 L34 16 L46 20 L50 30 L44 38 L32 40 L22 34 Z" />
                <path d="M50 18 L72 14 L84 22 L80 34 L66 40 L54 34 Z" />
                <path d="M40 42 L52 44 L54 56 L44 58 L36 50 Z" />
                <path d="M76 40 L88 42 L90 52 L80 54 Z" />
              </g>

              {/* дуга маршрута до самого дешёвого */}
              <path d="M47 33 Q50 26 52 41" stroke="#4ADE80" strokeWidth="0.3" fill="none" strokeDasharray="1.2 1" />

              {PINS.map((p) => (
                <g key={p.city} className="cursor-pointer">
                  <circle cx={p.x} cy={p.y} r={p.hot ? 1.5 : 1} fill={p.hot ? "#4ADE80" : "#7DA2C4"} />
                  {p.hot && <circle cx={p.x} cy={p.y} r="3.2" fill="none" stroke="#4ADE80" strokeWidth="0.25" opacity="0.5" />}
                </g>
              ))}
            </svg>

            {/* Ценники поверх карты */}
            {PINS.map((p) => (
              <div
                key={p.city}
                className={`absolute -translate-x-1/2 -translate-y-[190%] cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium shadow-lg transition hover:scale-105 ${
                  p.hot ? "bg-[#4ADE80] text-[#0A1522]" : "bg-white/90 text-[#0A1522]"
                }`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                {p.price} ₽
              </div>
            ))}

            <div className="absolute bottom-4 left-4 rounded-lg bg-black/50 px-3.5 py-2 text-[12px] text-white/60 backdrop-blur">
              8 направлений в бюджете · нажмите точку
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
