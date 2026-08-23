/**
 * Вариант 18 — «Иллюминатор».
 *
 * Идея: экран как вид из окна самолёта — круглая маска, слоистое небо,
 * крыло на переднем плане. Форма поиска лежит поверх на матовой панели.
 * Кинематографично и с ясной отраслевой метафорой.
 */
export default function DesignV18() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#081726]">
      {/* Небо слоями */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#081726 0%,#123049 32%,#3B5E77 58%,#C97B4E 82%,#E8A567 100%)",
        }}
      />
      {/* Облачные полосы */}
      {[68, 74, 80, 86].map((t, i) => (
        <div
          key={t}
          className="absolute left-0 right-0"
          style={{
            top: `${t}%`,
            height: `${5 + i * 2}%`,
            background: `rgba(255,225,195,${0.05 + i * 0.035})`,
            filter: "blur(22px)",
          }}
        />
      ))}

      <div className="relative mx-auto max-w-[1200px] px-8 py-8">
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-medium tracking-[0.2em] text-white/90">AVIATOR</span>
          <button className="rounded-full border border-white/25 px-5 py-2 text-[14px] text-white/80 backdrop-blur-sm hover:bg-white/10">
            Войти
          </button>
        </div>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_460px]">
          {/* Иллюминатор */}
          <div className="relative mx-auto aspect-square w-full max-w-[540px]">
            <div className="absolute inset-0 rounded-full bg-[#0B1B2B]/60 blur-2xl" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-[14px] border-[#D7DBDF] shadow-[inset_0_0_60px_rgba(0,0,0,0.55),0_30px_80px_rgba(0,0,0,0.45)]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg,#0B2038 0%,#1D4463 40%,#8A6A63 70%,#E8A567 100%)",
                }}
              />
              {/* Солнце у горизонта */}
              <div className="absolute bottom-[22%] left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FFD9A0] blur-[2px]" />
              {/* Горизонт */}
              <div className="absolute bottom-[30%] left-0 right-0 h-px bg-white/25" />
              {/* Крыло */}
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
                <path d="M-10 168 L128 120 L196 128 L200 152 L120 176 L-10 196 Z" fill="#B9C0C6" />
                <path d="M-10 196 L120 176 L196 152 L200 168 L118 190 L-10 210 Z" fill="#8E979E" />
              </svg>
              {/* Блик стекла */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(115deg,rgba(255,255,255,0.16) 0%,transparent 42%)" }}
              />
            </div>
          </div>

          {/* Панель поиска */}
          <div className="rounded-3xl border border-white/15 bg-white/[0.09] p-8 backdrop-blur-2xl">
            <h1 className="text-[38px] font-light leading-[1.12] tracking-tight text-white">
              Место у окна
              <br />
              <span className="font-semibold">уже ждёт</span>
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">
              480 городов, живые цены, никакой комиссии сверху.
            </p>

            <div className="mt-7 space-y-2.5">
              {[
                ["Откуда", "Москва · MOW"],
                ["Куда", "Стамбул · IST"],
                ["Даты", "15 — 22 сентября"],
                ["Пассажиры", "1 взрослый, эконом"],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="cursor-pointer rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-3 transition hover:bg-white/[0.13]"
                >
                  <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">{l}</div>
                  <div className="mt-0.5 text-[17px] text-white">{v}</div>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full rounded-2xl bg-[#E8A567] py-4 text-[16px] font-semibold text-[#081726] transition hover:bg-[#F2B67C]">
              Найти билеты
            </button>

            <div className="mt-5 flex items-center justify-between text-[13px] text-white/40">
              <span>Лучшая цена сегодня</span>
              <span className="text-[17px] font-semibold text-white">13 582 ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
