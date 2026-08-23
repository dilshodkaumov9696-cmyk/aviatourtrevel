/**
 * Вариант 13 — «Журнальный разворот».
 *
 * Идея: главная — не лендинг, а полоса travel-издания. Крупная антиква,
 * буквица, колонки разной ширины, подписи на полях. Поиск встроен в текст
 * как врезка, а не висит баннером. Продаём не цену, а желание поехать.
 */
export default function DesignV13() {
  return (
    <div className="min-h-screen bg-[#FBFAF7] text-[#1C1A17]">
      <header className="border-b border-[#1C1A17]/12">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-8 py-5">
          <span className="font-serif text-[26px] italic tracking-tight">Aviator</span>
          <nav className="hidden gap-8 font-serif text-[15px] text-[#1C1A17]/55 md:flex">
            {["Направления", "Истории", "Практика", "О нас"].map((n) => (
              <span key={n} className="cursor-pointer hover:text-[#1C1A17]">
                {n}
              </span>
            ))}
          </nav>
          <span className="font-serif text-[15px] italic">Войти</span>
        </div>
      </header>

      <article className="mx-auto max-w-[1120px] px-8 py-14">
        <div className="mb-3 flex items-center gap-3 font-sans text-[11px] uppercase tracking-[0.22em] text-[#B0472F]">
          <span className="h-px w-10 bg-[#B0472F]" />
          Выпуск 14 · Сентябрь
        </div>

        <h1 className="max-w-4xl font-serif text-[68px] leading-[0.98] tracking-[-0.02em]">
          Стамбул за <span className="italic">три часа</span> и тринадцать тысяч
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.55fr_1fr]">
          {/* Основная колонка */}
          <div>
            <div className="h-[300px] rounded-sm" style={{ background: "linear-gradient(150deg,#C9A227 0%,#B0472F 48%,#3E4A3D 100%)" }} />
            <p className="mt-3 font-sans text-[12px] text-[#1C1A17]/45">
              Босфор на рассвете — лучший вид, который можно купить за цену такси до аэропорта.
            </p>

            <p className="mt-8 font-serif text-[19px] leading-[1.62]">
              <span className="float-left mr-3 mt-1 font-serif text-[76px] leading-[0.72] text-[#B0472F]">С</span>
              амый недооценённый способ увидеть другую страну — лететь туда посреди недели. Вторник и среда
              стабильно дешевле выходных на четверть, а осенью разница доходит до трети. Мы посчитали цены на
              сентябрь и нашли окно, в котором билет туда-обратно стоит меньше, чем ужин на двоих в центре Москвы.
            </p>

            <p className="mt-5 font-serif text-[19px] leading-[1.62] text-[#1C1A17]/85">
              Прямой рейс идёт три часа сорок пять минут. Это меньше, чем поезд до Петербурга, — и на другом
              конце вас ждёт не Невский, а Галатский мост с рыбаками и запахом жареной скумбрии.
            </p>

            <div className="my-9 border-y border-[#1C1A17]/12 py-6">
              <p className="font-serif text-[26px] italic leading-snug text-[#B0472F]">
                «Разница между 20 и 22 сентября — шесть тысяч рублей. Это две ночи в отеле».
              </p>
            </div>

            <p className="font-serif text-[19px] leading-[1.62] text-[#1C1A17]/85">
              Ниже — сегодняшние цены. Они живые: мы обновляем их каждые полчаса и подскажем, когда станет
              дешевле, если сегодня покупать не хочется.
            </p>
          </div>

          {/* Боковая колонка: поиск как врезка */}
          <aside>
            <div className="border-t-2 border-[#1C1A17] pt-5">
              <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#1C1A17]/45">
                Проверить цену
              </div>

              <div className="mt-5 space-y-4">
                {[
                  ["Откуда", "Москва"],
                  ["Куда", "Стамбул"],
                  ["Когда", "15 — 22 сентября"],
                  ["Кто", "1 взрослый"],
                ].map(([l, v]) => (
                  <div key={l} className="border-b border-[#1C1A17]/15 pb-3">
                    <div className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#1C1A17]/40">{l}</div>
                    <div className="mt-1 font-serif text-[22px]">{v}</div>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full bg-[#1C1A17] py-4 font-sans text-[12px] uppercase tracking-[0.2em] text-[#FBFAF7] transition hover:bg-[#B0472F]">
                Смотреть рейсы
              </button>
            </div>

            <div className="mt-10 border-t border-[#1C1A17]/12 pt-5">
              <div className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#1C1A17]/45">
                Ещё в номере
              </div>
              {[
                ["Ереван", "Коньяк, Арарат и 11 350 ₽"],
                ["Дубай", "Зачем лететь туда осенью"],
                ["Алматы", "Горы в часе от города"],
              ].map(([c, t], i) => (
                <div key={c} className={`cursor-pointer py-4 ${i > 0 ? "border-t border-[#1C1A17]/10" : ""}`}>
                  <div className="font-serif text-[21px] group-hover:text-[#B0472F]">{c}</div>
                  <div className="mt-0.5 font-sans text-[13px] text-[#1C1A17]/50">{t}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
