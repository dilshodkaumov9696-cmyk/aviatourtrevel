/**
 * Вариант 14 — «Один вопрос за раз».
 *
 * Идея: убрать форму совсем. Экран задаёт один вопрос, человек отвечает,
 * идёт дальше. Сверху — прогресс. Так снимается страх «много полей»
 * и хорошо ложится на телефон.
 */
const STEPS = ["Откуда", "Куда", "Когда", "Кто"];
const CURRENT = 2;

export default function DesignV14() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F7F5FF]">
      {/* Прогресс */}
      <div className="mx-auto w-full max-w-[760px] px-8 pt-9">
        <div className="flex items-center justify-between">
          <span className="text-[17px] font-bold tracking-tight text-[#2A1F5E]">Aviator</span>
          <span className="text-[14px] text-[#2A1F5E]/45">
            Шаг {CURRENT + 1} из {STEPS.length}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition ${
                  i < CURRENT ? "bg-[#6B4EFF]" : i === CURRENT ? "bg-[#6B4EFF]" : "bg-[#6B4EFF]/15"
                }`}
              />
              <div
                className={`mt-2 text-[12px] font-medium ${
                  i <= CURRENT ? "text-[#6B4EFF]" : "text-[#2A1F5E]/30"
                }`}
              >
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Вопрос */}
      <div className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-[760px] px-8 pb-20">
          <div className="mb-2 flex items-center gap-2 text-[15px] text-[#2A1F5E]/50">
            <span className="rounded-full bg-white px-3 py-1 font-medium text-[#6B4EFF]">Москва</span>
            <span>→</span>
            <span className="rounded-full bg-white px-3 py-1 font-medium text-[#6B4EFF]">Стамбул</span>
          </div>

          <h1 className="text-[46px] font-bold leading-[1.1] tracking-tight text-[#2A1F5E]">
            Когда летим?
          </h1>
          <p className="mt-3 text-[17px] text-[#2A1F5E]/50">
            Можно указать примерно — покажем соседние дни и подскажем, где дешевле.
          </p>

          {/* Ответы крупными кнопками */}
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {[
              { t: "15 — 22 сентября", s: "как искали в прошлый раз", price: "13 582 ₽", hot: true },
              { t: "Гибкие даты", s: "±3 дня, покажем самый дешёвый", price: "от 11 980 ₽" },
              { t: "Весь сентябрь", s: "сравним все дни месяца", price: "от 11 980 ₽" },
              { t: "Выбрать в календаре", s: "точные даты", price: "" },
            ].map((o) => (
              <button
                key={o.t}
                className={`rounded-2xl border-2 bg-white px-6 py-5 text-left transition hover:-translate-y-0.5 ${
                  o.hot ? "border-[#6B4EFF] shadow-[0_8px_24px_rgba(107,78,255,0.18)]" : "border-transparent hover:border-[#6B4EFF]/35"
                }`}
              >
                <div className="text-[19px] font-bold text-[#2A1F5E]">{o.t}</div>
                <div className="mt-0.5 text-[14px] text-[#2A1F5E]/45">{o.s}</div>
                {o.price && <div className="mt-3 text-[16px] font-bold text-[#6B4EFF]">{o.price}</div>}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button className="text-[15px] font-medium text-[#2A1F5E]/45 hover:text-[#2A1F5E]">← Назад</button>
            <button className="rounded-2xl bg-[#6B4EFF] px-9 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#5A3EE8]">
              Дальше
            </button>
            <span className="text-[13px] text-[#2A1F5E]/35">или нажмите Enter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
