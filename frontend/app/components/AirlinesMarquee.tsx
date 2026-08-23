"use client";

import { useEffect, useRef, useState } from "react";

// Системы бронирования / агенты — наши партнёрские системы.
// Логотипа в публичных CDN нет, поэтому грузим из локального файла /public/partners/*.svg
// (кинь файл туда → подхватится), а пока показываем брендовый бейдж с буквой.
const PARTNERS = [
  { name: "Sirena", logo: "/partners/sirena.svg", letter: "S", color: "#1F6FB2" },
  { name: "Mixvel", logo: "/partners/mixvel.svg", letter: "M", color: "#16B0A6" },
  { name: "ТКП", logo: "/partners/tkp.svg", letter: "Т", color: "#1B6CB0" },
  { name: "City Travel", logo: "/partners/citytravel.svg", letter: "C", color: "#F26722" },
];

// Авиакомпании СНГ и Азии — логотипы Kiwi CDN по IATA-коду
const AIRLINES = [
  // СНГ
  { name: "Aeroflot", code: "SU" },
  { name: "S7 Airlines", code: "S7" },
  { name: "Pobeda", code: "DP" },
  { name: "Ural Airlines", code: "U6" },
  { name: "Rossiya", code: "FV" },
  { name: "Aurora", code: "HZ" },
  { name: "UTair", code: "UT" },
  { name: "Nordwind", code: "N4" },
  { name: "Red Wings", code: "WZ" },
  { name: "Smartavia", code: "5N" },
  { name: "Azimuth", code: "A4" },
  { name: "Yamal", code: "YC" },
  { name: "IrAero", code: "IO" },
  { name: "NordStar", code: "Y7" },
  { name: "Uzbekistan Airways", code: "HY" },
  { name: "Belavia", code: "B2" },
  { name: "Air Astana", code: "KC" },
  { name: "SCAT", code: "DV" },
  { name: "Qazaq Air", code: "IQ" },
  { name: "Azerbaijan Airlines", code: "J2" },
  { name: "Armenia", code: "RM" },
  { name: "Georgian Airways", code: "A9" },
  { name: "Turkmenistan Airlines", code: "T5" },
  { name: "Somon Air", code: "SZ" },
  { name: "Avia Traffic", code: "YK" },
  { name: "Air Manas", code: "ZM" },
  { name: "Air Moldova", code: "9U" },
  // Азия / Ближний Восток
  { name: "Turkish Airlines", code: "TK" },
  { name: "Pegasus", code: "PC" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Emirates", code: "EK" },
  { name: "flydubai", code: "FZ" },
  { name: "Air Arabia", code: "G9" },
  { name: "Etihad Airways", code: "EY" },
  { name: "Saudia", code: "SV" },
  { name: "Oman Air", code: "WY" },
  { name: "Gulf Air", code: "GF" },
  { name: "Kuwait Airways", code: "KU" },
  { name: "China Southern", code: "CZ" },
  { name: "China Eastern", code: "MU" },
  { name: "Air China", code: "CA" },
  { name: "Hainan Airlines", code: "HU" },
  { name: "Cathay Pacific", code: "CX" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Thai Airways", code: "TG" },
  { name: "AirAsia", code: "AK" },
  { name: "Korean Air", code: "KE" },
  { name: "Asiana Airlines", code: "OZ" },
  { name: "Japan Airlines", code: "JL" },
  { name: "ANA", code: "NH" },
  { name: "IndiGo", code: "6E" },
  { name: "Air India", code: "AI" },
  { name: "Vietnam Airlines", code: "VN" },
  { name: "Garuda Indonesia", code: "GA" },
  { name: "Malaysia Airlines", code: "MH" },
  { name: "Hong Kong Airlines", code: "HX" },
  { name: "SriLankan Airlines", code: "UL" },
  { name: "Philippine Airlines", code: "PR" },
];

type Item = { name: string; logo: string; letter?: string; color?: string };

const ITEMS: Item[] = [
  ...PARTNERS,
  ...AIRLINES.map((a) => ({
    name: a.name,
    logo: `https://images.kiwi.com/airlines/64/${a.code}.png`,
  })),
];

function Chip({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Картинка может упасть (404) ещё до гидратации — тогда onError не сработает.
  // Проверяем состояние после монтирования: complete + naturalWidth 0 = ошибка.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  // Если логотип не загрузился и есть монограма — показываем брендовый бейдж
  const showMonogram = failed && item.letter && item.color;

  return (
    <div className="flex h-12 shrink-0 items-center gap-2.5 px-7">
      {showMonogram ? (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white"
          style={{ background: item.color }}
          aria-hidden
        >
          {item.letter}
        </span>
      ) : (
        <img
          ref={imgRef}
          src={item.logo}
          alt={item.name}
          width={36}
          height={36}
          className={`h-9 w-9 shrink-0 rounded-md object-contain ${failed ? "hidden" : ""}`}
          onError={() => setFailed(true)}
        />
      )}
      <span className="whitespace-nowrap text-sm font-medium text-[var(--color-text)]">
        {item.name}
      </span>
    </div>
  );
}

export default function AirlinesMarquee() {
  // Дублируем для бесшовного цикла (translateX -50%)
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section className="bg-[var(--color-bg)] py-12 overflow-hidden">
      <div className="mb-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Наши партнёры
        </p>
      </div>

      <div className="relative">
        {/* Fade по краям */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{ background: "linear-gradient(to right, var(--color-bg), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{ background: "linear-gradient(to left, var(--color-bg), transparent)" }}
        />

        {/* Бегущая строка — хейрлайны-разделители вместо контейнеров-коробок */}
        <div
          className="animate-marquee flex divide-x divide-[var(--color-border)]"
          style={{ width: "max-content" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.animationPlayState = "running";
          }}
        >
          {doubled.map((item, i) => (
            <Chip key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
