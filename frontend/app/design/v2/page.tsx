/**
 * Вариант 2 — «Премиальный тревел».
 *
 * Не таблица цен, а обещание поездки. Глубокий фон, много воздуха, крупная
 * лёгкая типографика, приглушённая песочная гамма вместо яркого акцента.
 * Форма поиска — сдержанная стеклянная карточка, не кричит.
 *
 * Страница-превью для выбора направления. Удалить вместе с app/design.
 */
const FIELD = "flex h-[68px] flex-1 flex-col justify-center gap-1 px-6";
const LABEL = "text-[11px] uppercase tracking-[0.14em] text-white/45";
const VALUE = "text-[16px] font-light text-white";

export default function DesignV2() {
  return (
    <div className="min-h-screen bg-[#0B1D2A] text-white">
      {/* Фон: мягкий градиентный меш вместо фотографии */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 5%, rgba(232,220,200,0.16) 0%, transparent 55%)," +
              "radial-gradient(90% 70% at 90% 20%, rgba(93,141,176,0.30) 0%, transparent 60%)," +
              "radial-gradient(70% 60% at 60% 100%, rgba(198,160,110,0.16) 0%, transparent 65%)",
          }}
        />

        <header className="relative mx-auto flex max-w-[1180px] items-center justify-between px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DCC8]/50 text-[14px] font-light tracking-widest text-[#E8DCC8]">
              A
            </div>
            <span className="text-[19px] font-light tracking-[0.22em] text-[#E8DCC8]">AVIATOR</span>
          </div>
          <nav className="hidden gap-10 text-[13px] font-light tracking-[0.1em] text-white/60 md:flex">
            {["НАПРАВЛЕНИЯ", "ЖУРНАЛ", "О НАС", "КОНТАКТЫ"].map((n) => (
              <span key={n} className="cursor-pointer transition hover:text-[#E8DCC8]">
                {n}
              </span>
            ))}
          </nav>
          <button className="rounded-full border border-[#E8DCC8]/40 px-6 py-2 text-[13px] font-light tracking-[0.1em] text-[#E8DCC8] transition hover:bg-[#E8DCC8] hover:text-[#0B1D2A]">
            ВОЙТИ
          </button>
        </header>

        <div className="relative mx-auto max-w-[1180px] px-8 pb-24 pt-20">
          <p className="mb-7 text-[12px] font-light uppercase tracking-[0.3em] text-[#E8DCC8]/70">
            Поиск авиабилетов
          </p>
          <h1 className="max-w-3xl text-[64px] font-extralight leading-[1.05] tracking-[-0.02em]">
            Дорога начинается
            <br />
            <span className="text-[#E8DCC8]">задолго до взлёта</span>
          </h1>
          <p className="mt-7 max-w-lg text-[17px] font-light leading-relaxed text-white/55">
            Сравниваем сотни авиакомпаний и находим маршрут, который стоит вашего времени.
          </p>

          {/* Форма — сдержанная стеклянная карточка */}
          <div className="mt-14 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-xl">
            <div className="flex flex-col divide-y divide-white/10 lg:flex-row lg:divide-x lg:divide-y-0">
              <div className={FIELD}>
                <span className={LABEL}>Откуда</span>
                <span className={VALUE}>Москва</span>
              </div>
              <div className={FIELD}>
                <span className={LABEL}>Куда</span>
                <span className={VALUE}>Стамбул</span>
              </div>
              <div className={FIELD}>
                <span className={LABEL}>Даты</span>
                <span className={VALUE}>15 — 22 сентября</span>
              </div>
              <div className={FIELD}>
                <span className={LABEL}>Пассажиры</span>
                <span className={VALUE}>1 · эконом</span>
              </div>
              <button className="h-[68px] shrink-0 bg-[#E8DCC8] px-12 text-[13px] font-medium uppercase tracking-[0.16em] text-[#0B1D2A] transition hover:bg-white">
                Искать
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Направления — крупные карточки с воздухом */}
      <section className="mx-auto max-w-[1180px] px-8 pb-28">
        <div className="mb-12 flex items-end justify-between border-t border-white/10 pt-14">
          <h2 className="text-[34px] font-extralight tracking-tight">Куда сейчас летят</h2>
          <span className="cursor-pointer text-[13px] font-light tracking-[0.1em] text-[#E8DCC8]">
            ВСЕ НАПРАВЛЕНИЯ
          </span>
        </div>

        <div className="grid gap-7 md:grid-cols-3">
          {[
            { city: "Стамбул", country: "Турция", price: "13 582", tone: "rgba(198,160,110,0.22)" },
            { city: "Дубай", country: "ОАЭ", price: "18 240", tone: "rgba(93,141,176,0.26)" },
            { city: "Ереван", country: "Армения", price: "11 350", tone: "rgba(232,220,200,0.14)" },
          ].map((d) => (
            <div
              key={d.city}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition hover:border-[#E8DCC8]/40"
            >
              <div className="h-52" style={{ background: `linear-gradient(150deg, ${d.tone}, rgba(11,29,42,0.9))` }} />
              <div className="flex items-end justify-between px-6 py-6">
                <div>
                  <div className="text-[22px] font-light">{d.city}</div>
                  <div className="mt-1 text-[13px] font-light text-white/45">{d.country}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">от</div>
                  <div className="text-[19px] font-light text-[#E8DCC8]">{d.price} ₽</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
