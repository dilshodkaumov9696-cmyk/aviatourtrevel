/**
 * Вариант 7 — «Мягкий пастельный».
 *
 * Дружелюбный потребительский интерфейс: пастельные заливки, крупные
 * скругления, округлая типографика, никакой агрессии и срочности.
 * Ощущение лёгкости вместо давления скидками.
 *
 * Страница-превью. Удалить вместе с app/design.
 */
const PILL = "flex-1 rounded-2xl bg-white px-5 py-3.5";

export default function DesignV7() {
  return (
    <div className="min-h-screen bg-[#FDF7F2]">
      <header className="mx-auto flex max-w-[1140px] items-center justify-between px-7 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6C5CE7] text-[16px] font-bold text-white">
            A
          </div>
          <span className="text-[21px] font-bold tracking-tight text-[#2D3436]">Aviator</span>
        </div>
        <nav className="hidden gap-7 text-[15px] font-medium text-[#636E72] md:flex">
          {["Билеты", "Отели", "Идеи", "Помощь"].map((n) => (
            <span key={n} className="cursor-pointer hover:text-[#6C5CE7]">
              {n}
            </span>
          ))}
        </nav>
        <button className="rounded-2xl bg-[#2D3436] px-5 py-2.5 text-[15px] font-semibold text-white">
          Войти
        </button>
      </header>

      <section className="mx-auto max-w-[1140px] px-7">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#A8E6CF] via-[#DCEDC1] to-[#FFD3B6] px-10 py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/35" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-[#6C5CE7]/12" />

          <div className="relative max-w-2xl">
            <span className="inline-block rounded-full bg-white/70 px-4 py-1.5 text-[13px] font-semibold text-[#2D3436]">
              ✈️ 480 городов по всему миру
            </span>
            <h1 className="mt-5 text-[50px] font-bold leading-[1.08] tracking-tight text-[#2D3436]">
              Путешествие
              <br />
              начинается с улыбки
            </h1>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[#2D3436]/65">
              Находим удобные рейсы по честной цене. Без мелкого шрифта и сюрпризов на оплате.
            </p>
          </div>

          {/* Форма — белые пилюли на пастели */}
          <div className="relative mt-10 rounded-[26px] bg-white/45 p-2 backdrop-blur-sm">
            <div className="flex flex-col gap-2 lg:flex-row">
              {[
                ["Откуда", "Москва"],
                ["Куда", "Стамбул"],
                ["Когда", "15 — 22 сен"],
                ["Кто", "1 взрослый"],
              ].map(([l, v]) => (
                <div key={l} className={PILL}>
                  <div className="text-[12px] font-medium text-[#636E72]">{l}</div>
                  <div className="text-[16px] font-bold text-[#2D3436]">{v}</div>
                </div>
              ))}
              <button className="rounded-2xl bg-[#6C5CE7] px-9 py-3.5 text-[16px] font-bold text-white transition hover:bg-[#5A4BD1]">
                Поехали
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 py-12 md:grid-cols-3">
          {[
            { city: "Стамбул", price: "13 582", from: "#A8E6CF", to: "#DCEDC1", emoji: "🕌" },
            { city: "Дубай", price: "18 240", from: "#FFD3B6", to: "#FFAAA5", emoji: "🏙️" },
            { city: "Ереван", price: "11 350", from: "#D5CFFF", to: "#A8E6CF", emoji: "⛰️" },
          ].map((d) => (
            <div key={d.city} className="cursor-pointer rounded-[28px] bg-white p-3 transition hover:-translate-y-1">
              <div
                className="flex h-44 items-center justify-center rounded-[22px] text-[56px]"
                style={{ background: `linear-gradient(140deg, ${d.from}, ${d.to})` }}
              >
                {d.emoji}
              </div>
              <div className="flex items-end justify-between px-3 py-4">
                <div>
                  <div className="text-[19px] font-bold text-[#2D3436]">{d.city}</div>
                  <div className="text-[13px] text-[#636E72]">прямой рейс</div>
                </div>
                <div className="text-[19px] font-bold text-[#6C5CE7]">{d.price} ₽</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
