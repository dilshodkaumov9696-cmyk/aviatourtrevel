/**
 * Вариант 12 — «Командная строка».
 *
 * Идея: вместо пяти полей — одна строка, куда пишут как человеку:
 * «Москва Стамбул 15 сен туда-обратно». Интерфейс в духе Raycast и Linear:
 * клавиатура, подсказки, ноль лишнего. Экран почти пустой.
 */
const SUGGESTIONS = [
  { icon: "→", main: "Москва → Стамбул", sub: "15 сен — 22 сен · 1 пассажир", price: "13 582 ₽", active: true },
  { icon: "→", main: "Москва → Стамбул", sub: "гибкие даты ±3 дня", price: "от 11 980 ₽" },
  { icon: "★", main: "Следить за ценой", sub: "уведомим, когда станет дешевле 12 000 ₽" },
  { icon: "◷", main: "Москва → Дубай", sub: "недавний поиск · 3 дня назад", price: "18 240 ₽" },
];

export default function DesignV12() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0D0D0F] text-[#E4E4E7]">
      <div className="flex items-center justify-between px-8 py-6">
        <span className="text-[15px] font-medium tracking-tight text-white/80">Aviator</span>
        <div className="flex items-center gap-5 text-[13px] text-white/30">
          <span>Подписки</span>
          <span>История</span>
          <span className="rounded-md border border-white/12 px-2.5 py-1 font-mono text-[11px]">⌘K</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-32">
        <div className="w-full max-w-[680px]">
          <h1 className="mb-9 text-center text-[15px] text-white/35">
            Напишите маршрут словами — разберём сами
          </h1>

          {/* Строка ввода */}
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#141417] shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 px-6 py-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white/25">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="flex-1 text-[19px] tracking-tight">
                <span className="text-white">Москва Стамбул 15 сен</span>
                <span className="ml-0.5 inline-block h-[22px] w-[2px] translate-y-[3px] bg-[#7C6BFF]" />
              </div>
              <span className="rounded-md border border-white/12 px-2 py-0.5 font-mono text-[11px] text-white/30">
                ↵
              </span>
            </div>

            <div className="border-t border-white/[0.07]">
              <div className="px-6 py-2 text-[10px] uppercase tracking-[0.16em] text-white/25">Варианты</div>
              {SUGGESTIONS.map((s, i) => (
                <div
                  key={i}
                  className={`flex cursor-pointer items-center gap-4 px-6 py-3.5 transition ${
                    s.active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[14px] ${
                      s.active ? "bg-[#7C6BFF] text-white" : "bg-white/[0.06] text-white/40"
                    }`}
                  >
                    {s.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] text-white">{s.main}</div>
                    <div className="truncate text-[13px] text-white/35">{s.sub}</div>
                  </div>
                  {s.price && <span className="shrink-0 text-[15px] font-medium text-white/70">{s.price}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Подсказки клавиш */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-2 font-mono text-[11px] text-white/25">
            {[
              ["↑↓", "выбрать"],
              ["↵", "найти"],
              ["⌘↵", "следить за ценой"],
              ["⎋", "очистить"],
            ].map(([k, l]) => (
              <span key={k} className="flex items-center gap-2">
                <span className="rounded border border-white/12 px-1.5 py-0.5">{k}</span>
                {l}
              </span>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-2">
            {["Москва → Ереван", "Душанбе → Москва", "Ташкент → Стамбул"].map((r) => (
              <span
                key={r}
                className="cursor-pointer rounded-full border border-white/10 px-4 py-1.5 text-[13px] text-white/40 transition hover:border-white/25 hover:text-white/70"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
