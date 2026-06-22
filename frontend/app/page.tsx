"use client";

import { useEffect, useRef, useState } from "react";
import { buildAviasalesUrl } from "./lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInViewAnimation } from "./hooks/useInViewAnimation";
import AirportInput from "./components/AirportInput";
import DateRangePicker from "./components/DateRangePicker";
import MultiCitySegments, { MultiSegment } from "./components/MultiCitySegments";
import PassengersPicker, { Passengers, CabinClass, passengersLabel } from "./components/PassengersPicker";
import { IconPlane, IconPin, IconCalendar, IconSearch, IconSwap, IconRoute, IconHotel, IconTour, IconSim, IconShield, IconTrain, IconCar } from "./components/icons";
import FlightMap from "./components/FlightMap";
import ThemeToggle from "./components/ThemeToggle";
import AuthModal from "./components/AuthModal";
import SettingsSwitcher from "./components/SettingsSwitcher";
import MobileMenu from "./components/MobileMenu";
import Footer from "./components/Footer";
import Counters from "./components/Counters";
import WhyUs from "./components/WhyUs";
import DirectionsCarousel from "./components/DirectionsCarousel";
import AirlinesMarquee from "./components/AirlinesMarquee";
import Reviews from "./components/Reviews";
import Subscribe from "./components/Subscribe";
import { Airport, POPULAR_AIRPORTS } from "./data/airports";

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

function fmtDate(d: string): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(day)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

const boxBase =
  "flex items-center gap-2.5 min-h-[52px] rounded-xl border bg-[var(--color-bg-soft)] px-3.5 py-1.5 transition-all duration-200 cursor-pointer hover:border-[var(--color-primary)]";

// Категории услуг над формой поиска (как на Aviasales). Активна — «Авиабилеты».
const CATEGORIES = [
  { label: "Авиабилеты", icon: IconPlane, active: true },
  { label: "Отели", icon: IconHotel, active: false },
  { label: "Туры", icon: IconTour, active: false },
  { label: "E-SIM", icon: IconSim, active: false },
  { label: "Страхование", icon: IconShield, active: false },
  { label: "Билеты на поезд", icon: IconTrain, active: false },
  { label: "Трансферы", icon: IconCar, active: false },
];

// Фото города по ключевому слову (временно — позже заменим на свои/лицензионные)
const cityPhoto = (kw: string, lock: number) =>
  `https://loremflickr.com/640/480/${kw}?lock=${lock}`;

// Английские ключевые слова для фото-стоков (русские названия города/IATA → keyword).
const CITY_KEYWORDS: Record<string, string> = {
  DYU: "dushanbe", LBD: "khujand", IST: "istanbul,city", DXB: "dubai,skyline",
  TAS: "tashkent", ALA: "almaty", SKD: "samarkand", MOW: "moscow,kremlin",
  SVO: "moscow", DME: "moscow", VKO: "moscow", GYD: "baku", OVB: "novosibirsk",
  MSQ: "minsk", ESB: "ankara", SAW: "istanbul", BKK: "bangkok", AYT: "antalya",
  NHA: "nhatrang,beach", PEK: "beijing", DEL: "delhi", DPS: "bali",
};
// Большое фото города для hero-фона (по выбранному назначению).
const cityHeroPhoto = (iata: string, city: string) => {
  const kw = CITY_KEYWORDS[iata] ?? `${city},city`;
  return `https://loremflickr.com/1600/900/${encodeURIComponent(kw)}?lock=${
    iata.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  }`;
};
// Если loremflickr не ответит — подменяем на гарантированное фото
function photoFallback(e: React.SyntheticEvent<HTMLImageElement>, seed: string) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = `https://picsum.photos/seed/${seed}/640/480`;
}

function futureDateISO(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

function searchHref(
  toCity: string,
  toIata: string,
  date = futureDateISO(14),
  fromCity = "Москва",
  fromIata = "MOW",
): string {
  const params = new URLSearchParams({
    fromCity,
    fromIata,
    toCity,
    toIata,
    date,
    adults: "1",
    children: "0",
    infants: "0",
    cabin: "economy",
  });
  return `/search?${params.toString()}`;
}

const ORIGIN_DEALS = {
  MOW: {
    city: "Москва",
    iata: "MOW",
    items: [
      { city: "Стамбул", country: "Турция", iata: "IST", price: "4 500", x: "58%", y: "44%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "9 900", x: "68%", y: "58%" },
      { city: "Анталья", country: "Турция", iata: "AYT", price: "6 200", x: "56%", y: "51%" },
      { city: "Алматы", country: "Казахстан", iata: "ALA", price: "7 300", x: "78%", y: "48%" },
    ],
  },
  DYU: {
    city: "Душанбе",
    iata: "DYU",
    items: [
      { city: "Москва", country: "Россия", iata: "MOW", price: "8 900", x: "48%", y: "34%" },
      { city: "Стамбул", country: "Турция", iata: "IST", price: "12 400", x: "55%", y: "45%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "10 700", x: "66%", y: "59%" },
      { city: "Алматы", country: "Казахстан", iata: "ALA", price: "5 600", x: "76%", y: "47%" },
    ],
  },
  TAS: {
    city: "Ташкент",
    iata: "TAS",
    items: [
      { city: "Москва", country: "Россия", iata: "MOW", price: "7 800", x: "48%", y: "34%" },
      { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "11 900", x: "66%", y: "59%" },
      { city: "Стамбул", country: "Турция", iata: "IST", price: "13 200", x: "55%", y: "45%" },
      { city: "Бангкок", country: "Таиланд", iata: "BKK", price: "25 400", x: "86%", y: "66%" },
    ],
  },
} as const;

export default function Home() {
  const router = useRouter();
  // Режим формы: обычный (туда + опц. обратно) или сложный маршрут
  const [mode, setMode] = useState<"simple" | "multi">("simple");

  // Простой маршрут
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destAirport, setDestAirport] = useState<Airport | null>(null);
  const [heroBackgroundImage, setHeroBackgroundImage] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Анимация взлёта кнопки «Найти» перед переходом к результатам
  const [searching, setSearching] = useState(false);

  // Интерактивная карта цен

  // Hero-фон под выбранный/набираемый город назначения
  const [typedDest, setTypedDest] = useState("");
  const heroCity: Airport | null =
    destAirport ??
    (typedDest.trim().length >= 3
      ? POPULAR_AIRPORTS.find((a) =>
          a.city.toLowerCase().startsWith(typedDest.trim().toLowerCase()),
        ) ?? null
      : null);

  // Пассажиры / класс
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [passengers, setPassengers] = useState<Passengers>({ adults: 1, children: 0, infants: 0 });

  // Сложный маршрут
  const [segments, setSegments] = useState<MultiSegment[]>([
    { id: 1, from: null, to: null, date: "" },
    { id: 2, from: null, to: null, date: "" },
  ]);
  const segIdRef = useRef(3);

  // Календарь
  const [datepickerOpen, setDatepickerOpen] = useState(false);
  const [datepickerField, setDatepickerField] = useState<"depart" | "return">("depart");
  const datepickerRef = useRef<HTMLDivElement>(null);

  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Модалка авторизации
  const [authOpen, setAuthOpen] = useState(false);
  const [localOrigin, setLocalOrigin] = useState<keyof typeof ORIGIN_DEALS>("MOW");

  // Sticky header на скролле
  const [isScrolled, setIsScrolled] = useState(false);

  // Анимации при скролле для основных секций
  const { ref: advantagesRef, isInView: advInView } = useInViewAnimation();
  const { ref: directionsRef, isInView: dirInView } = useInViewAnimation();
  const { ref: dealsRef, isInView: dealsInView } = useInViewAnimation();
  const { ref: helpRef, isInView: helpInView } = useInViewAnimation();
  const localDeals = ORIGIN_DEALS[localOrigin];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datepickerRef.current && !datepickerRef.current.contains(e.target as Node)) {
        setDatepickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openDatePicker(field: "depart" | "return") {
    setDatepickerField(field);
    setDatepickerOpen(true);
  }

  function swap() {
    setOriginAirport(destAirport);
    setDestAirport(originAirport);
  }

  // Смена фона hero при выборе города назначения
  useEffect(() => {
    if (destAirport) {
      const bgUrl = cityHeroPhoto(destAirport.iata, destAirport.city);
      setHeroBackgroundImage(bgUrl);
    }
  }, [destAirport]);

  // --- Сложный маршрут ---
  function updateSegment(id: number, patch: Partial<MultiSegment>) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)));
    setErrors((p) => {
      const next = { ...p };
      Object.keys(patch).forEach((k) => delete next[`${k}${id}`]);
      return next;
    });
  }
  function swapSegment(id: number) {
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, from: seg.to, to: seg.from } : seg)));
  }
  function addSegment() {
    setSegments((s) => (s.length >= 6 ? s : [...s, { id: segIdRef.current++, from: null, to: null, date: "" }]));
  }
  function removeSegment(id: number) {
    setSegments((s) => (s.length <= 2 ? s : s.filter((seg) => seg.id !== id)));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (mode === "multi") {
      segments.forEach((seg) => {
        if (!seg.from) e[`from${seg.id}`] = "Укажите город";
        if (!seg.to) e[`to${seg.id}`] = "Укажите город";
        if (!seg.date) e[`date${seg.id}`] = "Дата";
      });
    } else {
      if (!originAirport) e.origin = "Укажите город вылета";
      if (!destAirport) e.destination = "Укажите город прилёта";
      if (!departDate) e.departDate = "Укажите дату";
      // дата возврата — опциональна (нет = в одну сторону)
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "multi") {
      // Сложный маршрут → открываем первый сегмент на Aviasales
      const first = segments[0];
      if (first?.from && first?.to && first?.date) {
        const url = buildAviasalesUrl({
          origin: first.from.iata,
          destination: first.to.iata,
          departDate: first.date,
          adults: passengers.adults,
        });
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    const params = new URLSearchParams({
      fromCity: originAirport!.city,
      fromIata: originAirport!.iata,
      toCity: destAirport!.city,
      toIata: destAirport!.iata,
      date: departDate,
      adults: String(passengers.adults),
      children: String(passengers.children),
      infants: String(passengers.infants),
      cabin,
    });
    if (returnDate) params.set("returnDate", returnDate);

    // Открываем полный поиск Aviasales с маркером
    const aviasalesUrl = buildAviasalesUrl({
      origin: originAirport!.iata,
      destination: destAirport!.iata,
      departDate,
      returnDate: returnDate || undefined,
      adults: passengers.adults,
    });
    window.open(aviasalesUrl, "_blank", "noopener,noreferrer");

    setSearching(true);
    setTimeout(() => router.push(`/search?${params.toString()}`), 620);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-[var(--color-surface)] transition-all duration-200 ${isScrolled ? "border-b border-[var(--color-border)] shadow-md" : "border-b border-[var(--color-border)]"}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-200 ${isScrolled ? "py-2" : "py-4"}`}>
          <a href="#search" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-[var(--color-primary)]">Aviator</span>
          </a>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
            <a href="#search" className="transition-colors hover:text-[var(--color-primary)]">Авиабилеты</a>
            <a href="#directions" className="transition-colors hover:text-[var(--color-primary)]">Направления</a>
            <a href="#deals" className="transition-colors hover:text-[var(--color-primary)]">Акции</a>
            <a href="#help" className="transition-colors hover:text-[var(--color-primary)]">Помощь</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <div className="hidden items-center lg:flex">
              <SettingsSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="ml-1 hidden rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)] lg:inline-block"
            >
              Войти
            </button>
            <MobileMenu onLogin={() => setAuthOpen(true)} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="search"
        className="relative flex flex-col items-center justify-center px-4 py-20 text-white transition-all duration-1000"
        style={{
          backgroundAttachment: "fixed",
          background: heroBackgroundImage
            ? `linear-gradient(135deg, rgba(30, 92, 128, 0.7) 0%, rgba(21, 66, 92, 0.7) 100%), url('${heroBackgroundImage}')`
            : "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Фон под выбранный город */}
        <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
          {heroCity && (
            <img
              key={heroCity.iata}
              src={cityHeroPhoto(heroCity.iata, heroCity.city)}
              alt=""
              onError={(e) => photoFallback(e, heroCity.iata)}
              className="hero-fade absolute inset-0 h-full w-full object-cover"
            />
          )}
          {/* Затемнение для читаемости текста */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: heroCity ? 1 : 0,
              background:
                "linear-gradient(135deg, rgba(15,40,55,0.80) 0%, rgba(10,26,36,0.88) 100%)",
            }}
          />
        </div>
        {!heroCity && <FlightMap />}

        <div className="relative z-10 mx-auto max-w-3xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-sm">
            {heroCity ? (
              <>Летим в {heroCity.city}<span className="text-[var(--color-accent)]">?</span></>
            ) : (
              <>Найдите дешёвые авиабилеты</>
            )}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80">
            {heroCity
              ? "Лучшие цены на этот маршрут — сравниваем за секунды"
              : "Сравниваем сотни авиакомпаний и агентств за секунды"}
          </p>
        </div>

        {/* Категории услуг */}
        <div className="relative z-10 w-full max-w-[1440px] mt-7 flex flex-nowrap justify-start overflow-x-auto scrollbar-hide gap-2 px-4 sm:flex-wrap sm:justify-center">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  c.active
                    ? "bg-white text-[var(--color-primary-dark)] shadow-md"
                    : "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 hover:-translate-y-0.5"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Search card */}
        <form
          onSubmit={handleSearch}
          noValidate
          className="relative z-10 mx-auto w-full max-w-[1440px] mt-4 rounded-2xl bg-[var(--color-surface)]/85 backdrop-blur-xl shadow-2xl text-left overflow-visible border border-white/30 dark:border-white/10"
        >
            {/* Верхняя строка: переключатель сложного маршрута */}
            <div className="px-5 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMode(mode === "multi" ? "simple" : "multi")}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  mode === "multi"
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]"
                }`}
                title="Перелёты с пересадками в нескольких городах"
              >
                <IconRoute size={16} />
                {mode === "multi" ? "Обычный поиск" : "Сложный маршрут"}
              </button>
            </div>

            {/* --- Обычный поиск (карточки-боксы, одна строка) --- */}
            {mode === "simple" && (
              <div className="px-4 pb-4 flex flex-col xl:flex-row gap-2">
                {/* Маршрут: Откуда + Куда со свапом */}
                <div className="relative flex flex-col sm:flex-row gap-2 xl:flex-[3] min-w-0">
                  <div className={`relative flex-1 min-w-0 ${boxBase} ${errors.origin ? "border-red-400" : "border-[var(--color-border)]"} focus-within:border-[var(--color-primary)]`}>
                    <IconPlane className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={originAirport}
                      onChange={(a) => {
                        setOriginAirport(a);
                        setErrors((p) => ({ ...p, origin: "" }));
                      }}
                      label=""
                      placeholder={errors.origin || "Откуда"}
                      excludeIata={destAirport?.iata}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={swap}
                    title="Поменять местами"
                    className="absolute z-10 top-1/2 -translate-y-1/2 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary-light)] hover:shadow-md transition"
                  >
                    <IconSwap size={15} className="rotate-90 sm:rotate-0 hover:rotate-180 transition-transform duration-300" />
                  </button>

                  <div className={`relative flex-1 min-w-0 ${boxBase} ${errors.destination ? "border-red-400" : "border-[var(--color-border)]"} focus-within:border-[var(--color-primary)]`}>
                    <IconPin className="text-[var(--color-primary)] shrink-0" />
                    <AirportInput
                      airport={destAirport}
                      onChange={(a) => {
                        setDestAirport(a);
                        if (a) setTypedDest("");
                        setErrors((p) => ({ ...p, destination: "" }));
                      }}
                      onQueryChange={setTypedDest}
                      label=""
                      placeholder={errors.destination || "Куда"}
                      excludeIata={originAirport?.iata}
                    />
                  </div>
                </div>

                {/* Даты */}
                <div ref={datepickerRef} className="relative flex gap-2 xl:flex-[2] min-w-0">
                  {/* Туда */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} cursor-pointer hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:outline-none ${errors.departDate ? "border-red-400" : "border-[var(--color-border)]"}`}
                    onClick={() => openDatePicker("depart")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className={`text-[15px] truncate ${departDate ? "text-[var(--color-text)] font-medium" : errors.departDate ? "text-red-500 font-medium" : "text-[var(--color-text-muted)]"}`}>
                        {departDate ? fmtDate(departDate) : errors.departDate ? errors.departDate : "Дата вылета"}
                      </div>
                    </div>
                    <IconCalendar className="text-[var(--color-primary)] shrink-0" />
                  </div>

                  {/* Обратно */}
                  <div
                    className={`flex-1 min-w-0 ${boxBase} border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)]`}
                    onClick={() => openDatePicker("return")}
                  >
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className={`text-[15px] truncate ${returnDate ? "text-[var(--color-text)] font-medium" : "text-[var(--color-text-muted)]"}`}>
                          {returnDate ? fmtDate(returnDate) : "Обратно"}
                        </span>
                        {returnDate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReturnDate("");
                            }}
                            title="Убрать обратный билет"
                            className="ml-1 shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs leading-none"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <IconCalendar className={`shrink-0 ${returnDate ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} />
                  </div>

                  {datepickerOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <DateRangePicker
                        mode="range"
                        departDate={departDate}
                        returnDate={returnDate}
                        onDepartChange={(d) => {
                          setDepartDate(d);
                          setErrors((p) => ({ ...p, departDate: "" }));
                        }}
                        onReturnChange={(d) => setReturnDate(d)}
                        initialField={datepickerField}
                        onClose={() => setDatepickerOpen(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Пассажиры */}
                <PassengersPicker
                  passengers={passengers}
                  cabin={cabin}
                  onPassengers={setPassengers}
                  onCabin={setCabin}
                  align="right"
                  className="xl:flex-1 min-w-0"
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={searching}
                  className="relative w-full xl:w-auto flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gradient-to-r from-green-400 to-green-600 px-8 font-bold text-white hover:from-green-600 hover:to-green-400 bg-[length:200%_100%] hover:bg-right transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-md whitespace-nowrap disabled:cursor-default"
                >
                  {searching ? (
                    <>
                      <IconPlane size={18} className="plane-takeoff" />
                      Взлетаем…
                    </>
                  ) : (
                    <>
                      <IconSearch size={18} />
                      Найти билеты
                    </>
                  )}
                </button>
              </div>
            )}

            {/* --- Сложный маршрут --- */}
            {mode === "multi" && (
              <>
                <MultiCitySegments
                  segments={segments}
                  errors={errors}
                  onUpdate={updateSegment}
                  onSwap={swapSegment}
                  onAdd={addSegment}
                  onRemove={removeSegment}
                />
                <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 px-4 pb-4">
                  <PassengersPicker
                    passengers={passengers}
                    cabin={cabin}
                    onPassengers={setPassengers}
                    onCabin={setCabin}
                    align="left"
                    className="md:w-64"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-gradient-to-r from-green-400 to-green-600 px-8 font-bold text-white hover:from-green-600 hover:to-green-400 bg-[length:200%_100%] hover:bg-right transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-md whitespace-nowrap"
                  >
                    <IconSearch size={18} />
                    Найти билеты
                  </button>
                </div>
              </>
            )}
          </form>
      </section>

      {/* Counters — статистика */}
      <Counters />

      {/* Почему выбирают нас */}
      <WhyUs />

      {/* Карусель направлений */}
      <DirectionsCarousel />

      {/* Карта направлений */}
      <section className="bg-[var(--color-bg)] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Карта направлений</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">Выберите город вылета и смотрите, куда выгодно лететь сейчас</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(ORIGIN_DEALS).map((origin) => (
                <button
                  key={origin.iata}
                  type="button"
                  onClick={() => setLocalOrigin(origin.iata as keyof typeof ORIGIN_DEALS)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    localOrigin === origin.iata
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {origin.city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "url('/world-map.svg')", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div className="absolute left-[42%] top-[42%] z-10 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                {localDeals.city}
              </div>
              {localDeals.items.map((deal) => (
                <Link
                  key={deal.iata}
                  href={searchHref(deal.city, deal.iata, futureDateISO(14), localDeals.city, localDeals.iata)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-xs font-bold text-[#1A2B3A] shadow-lg transition hover:-translate-y-[55%] hover:bg-[var(--color-accent)]"
                  style={{ left: deal.x, top: deal.y }}
                >
                  {deal.city}
                  <span className="ml-2 text-[var(--color-primary)]">от {deal.price} ₽</span>
                </Link>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Популярно из города {localDeals.city}</h3>
              <div className="space-y-3">
                {localDeals.items.map((deal) => (
                  <Link
                    key={deal.iata}
                    href={searchHref(deal.city, deal.iata, futureDateISO(14), localDeals.city, localDeals.iata)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 transition hover:border-[var(--color-primary)]"
                  >
                    <span>
                      <span className="block text-sm font-bold text-[var(--color-text)]">{localDeals.city} → {deal.city}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{deal.country} · {deal.iata}</span>
                    </span>
                    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[#3A2E00]">
                      от {deal.price} ₽
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные направления — иммерсивные плитки с фото */}
      <section id="directions" ref={directionsRef as any} className={`bg-[var(--color-bg-soft)] py-16 transition-all duration-700 ${dirInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Популярные направления</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Куда летают чаще всего — выбирайте и ищите билеты</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { city: "Стамбул", country: "Турция", iata: "IST", price: "4 500", kw: "istanbul,city", lock: 11 },
              { city: "Дубай", country: "ОАЭ", iata: "DXB", price: "9 900", kw: "dubai,skyline", lock: 12 },
              { city: "Анталья", country: "Турция", iata: "AYT", price: "6 200", kw: "antalya,beach", lock: 13 },
              { city: "Ереван", country: "Армения", iata: "EVN", price: "3 800", kw: "yerevan,armenia", lock: 14 },
              { city: "Тбилиси", country: "Грузия", iata: "TBS", price: "4 100", kw: "tbilisi,city", lock: 15 },
              { city: "Бангкок", country: "Таиланд", iata: "BKK", price: "28 500", kw: "bangkok,temple", lock: 16 },
              { city: "Алматы", country: "Казахстан", iata: "ALA", price: "7 300", kw: "almaty,mountains", lock: 17 },
              { city: "Сочи", country: "Россия", iata: "AER", price: "3 200", kw: "sochi,sea", lock: 18 },
            ].map((d) => (
              <Link
                key={d.city}
                href={searchHref(d.city, d.iata)}
                className="group relative block h-72 overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <img
                  src={cityPhoto(d.kw, d.lock)}
                  alt={d.city}
                  onError={(e) => photoFallback(e, d.kw)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <span className="absolute right-3 top-3 rounded-lg bg-white/20 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {d.iata}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="text-xs text-white/80">Москва →</div>
                  <div className="text-2xl font-bold">{d.city}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-white/85">{d.country}</span>
                    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-bold text-[#3A2E00]">
                      от {d.price} ₽
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Горящие предложения — карточки рейсов со скидками */}
      <section id="deals" ref={dealsRef as any} className={`bg-[var(--color-bg)] py-16 transition-all duration-700 ${dealsInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">🔥 Горящие предложения</h2>
              <p className="mt-2 text-[var(--color-text-muted)]">Лучшие цены на ближайшие даты — успейте забронировать</p>
            </div>
            <a href="#search" className="hidden text-sm font-semibold text-[var(--color-primary)] hover:underline sm:block">
              Смотреть все →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { route: "Москва — Стамбул", city: "Стамбул", iata: "IST", disc: "−45%", time: "09:50 — 14:15", dur: "5ч 25м", stops: "прямой", days: "Пн · Ср · Сб", price: "4 500", kw: "istanbul,city", lock: 21 },
              { route: "Москва — Дубай", city: "Дубай", iata: "DXB", disc: "−30%", time: "22:30 — 04:05", dur: "5ч 35м", stops: "прямой", days: "Ежедневно", price: "9 900", kw: "dubai,skyline", lock: 22 },
              { route: "Москва — Анталья", city: "Анталья", iata: "AYT", disc: "−52%", time: "08:15 — 12:40", dur: "4ч 25м", stops: "прямой", days: "Вт · Чт · Сб", price: "6 200", kw: "antalya,beach", lock: 23 },
            ].map((d) => (
              <div key={d.route} className="overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-md transition hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={cityPhoto(d.kw, d.lock)}
                    alt={d.route}
                    onError={(e) => photoFallback(e, d.kw)}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                    🔥 Скидка {d.disc}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-[var(--color-text)]">{d.route}</div>
                    <div className="text-lg font-bold text-[var(--color-primary)]">{d.price} ₽</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                    <span>{d.time}</span>
                    <span>{d.dur} · {d.stops}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{d.days}</div>
                  <div className="mt-4 flex gap-2">
                    <Link href={searchHref(d.city, d.iata)} className="flex-1 rounded-lg border border-[var(--color-border)] py-2 text-center text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)]">
                      О городе
                    </Link>
                    <Link href={searchHref(d.city, d.iata)} className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-center text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]">
                      Выбрать
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы клиентов */}
      <Reviews />

      {/* Помощь */}
      <section id="help" ref={helpRef as any} className={`bg-[var(--color-bg-soft)] py-16 transition-all duration-700 ${helpInView ? "opacity-100" : "opacity-0 translate-y-10"}`}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">Помощь и поддержка</h2>
            <p className="mt-2 text-[var(--color-text-muted)]">Ответы на частые вопросы</p>
          </div>
          <div className="space-y-3">
            {[
              { q: "Как вернуть или обменять билет?", a: "Откройте раздел «Мои заказы», выберите нужный билет и нажмите «Вернуть» или «Обменять». Условия зависят от тарифа авиакомпании." },
              { q: "Что входит в багаж и ручную кладь?", a: "Нормы провоза зависят от тарифа и авиакомпании. Точные лимиты по весу и габаритам показываются на этапе выбора билета." },
              { q: "Как пройти онлайн-регистрацию?", a: "Регистрация открывается за 24–48 часов до вылета. Ссылка придёт на email, либо зарегистрируйтесь на сайте авиакомпании по номеру брони." },
              { q: "Можно ли выбрать место заранее?", a: "Да, для большинства рейсов место можно выбрать при оформлении или позже в личном кабинете. На части тарифов услуга платная." },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 transition hover:border-[var(--color-primary)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-[var(--color-text)]">
                  {f.q}
                  <span className="ml-4 text-xl text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[var(--color-primary)] px-6 py-5 text-white sm:flex-row">
            <div>
              <div className="font-bold">Не нашли ответ?</div>
              <div className="text-sm text-white/80">Поддержка на связи круглосуточно</div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-white/90"
            >
              Написать в поддержку
            </button>
          </div>
        </div>
      </section>

      {/* Подписка на рассылку + приложение */}
      <Subscribe />

      {/* Бегущая строка партнёров — перед футером */}
      <AirlinesMarquee />

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
